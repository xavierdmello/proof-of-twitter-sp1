#![no_main]
sp1_zkvm::entrypoint!(main);
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use base64::prelude::*;
use rsa::{pkcs8::DecodePublicKey, RsaPublicKey, Pkcs1v15Sign};
use regex::Regex;

#[derive(Serialize, Deserialize, Debug)]
struct DKIM {
    public_key: String,
    signature: String,
    headers: String,
    body: String,
    body_hash: String,
    signing_domain: String,
    selector: String,
    algo: String,
    format: String,
    modulus_length: u32, // unused
}

pub fn main() {
    let dkim = sp1_zkvm::io::read::<DKIM>();
    let crypto_address = sp1_zkvm::io::read::<String>();

    let body_verified = verify_body(&dkim);
    let signature_verified = verify_signature(&dkim);
    let from_address_verified = verify_from_address(&dkim);
    let is_pw_reset_email = verify_pw_reset_email(&dkim);
    let twitter_username = get_twitter_username(&dkim); // blank string if no/invalid twitter username
    let twitter_proved = body_verified && signature_verified && from_address_verified && is_pw_reset_email && twitter_username.len() > 0;

    sp1_zkvm::io::commit(&body_verified);
    sp1_zkvm::io::commit(&signature_verified);
    sp1_zkvm::io::commit(&from_address_verified);
    sp1_zkvm::io::commit(&is_pw_reset_email);
    sp1_zkvm::io::commit(&twitter_username);
    sp1_zkvm::io::commit(&twitter_proved);
    sp1_zkvm::io::commit(&crypto_address);
}

fn verify_body(dkim: &DKIM) -> bool {

    // get sha256 hash of body
    let mut hasher = Sha256::new();
    hasher.update(dkim.body.as_bytes());
    let hash = hasher.finalize();

    // encode hash to base64
    let base64_hash = BASE64_STANDARD.encode(&hash);

    // compare computed body hash with signed body hash
    base64_hash == dkim.body_hash
}

fn verify_signature(dkim: &DKIM) -> bool {
    // signature scheme: rsa-sha256
    // 1. get sha256 hash of header
    let mut hasher = Sha256::new();
    hasher.update(dkim.headers.as_bytes());
    let hash = hasher.finalize();

    // 2. decode the public key from PEM format
    let public_key = RsaPublicKey::from_public_key_pem(&dkim.public_key).unwrap();

    // 3. decode the signature from base64 into binary
    let signature = BASE64_STANDARD.decode(&dkim.signature).unwrap();

    // 4. verify the signature
    // RSASSA-PKCS1-V1_5 magic padding bytes
    // https://crypto.stackexchange.com/questions/86385/initial-value-for-rsa-and-sha-256-signature-encoding
    let prefix: Box<[u8]> = Box::new([
        0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20
    ]);
    // SHA-256 produces hash output of 32 bytes
    let hash_len = Some(32);
    let padding = Pkcs1v15Sign {hash_len: hash_len, prefix: prefix};
    let result = public_key.verify(padding, &hash, &signature);
    result.is_ok()
}

fn verify_from_address(dkim: &DKIM) -> bool {
    // Get email address after from: in header
    let re = Regex::new(r"\r\nfrom:.*?<(.+?)>").unwrap();

    let mut match_count = 0;
    let mut email = String::new();

    for captures in re.captures_iter(dkim.headers.as_str()) {
        match_count += 1;
        if match_count > 1 {
            println!("Only one 'from' address is supported.");
            return false;
        }
        email = captures[1].to_string();
    }

    if match_count == 0 {
        println!("No match found for the 'from' field.");
        return false;
    }

    if !email.ends_with("@x.com") {
        println!("Email address is not from x.com.");
        return false;
    }
    
    true
}


fn verify_pw_reset_email(dkim: &DKIM) -> bool {
    // Verify the subject in the headers
    // "This email was meant for @username" in the body is already verified in the get_twitter_username fn.
    // These two methods are sufficient for verifying that the email is a password reset email.
    let subject_re = Regex::new(r"\r\nsubject:Password reset request").unwrap();
    if !subject_re.is_match(&dkim.headers) {
        return false;
    }

    true
}

fn get_twitter_username(dkim: &DKIM) -> String {
    let re = Regex::new(r"This email was meant for (@\w+)").unwrap();
    
    // If "This email was meant for @username" found.
    if let Some(captures) = re.captures(&dkim.body) {
        if let Some(username) = captures.get(1) {
            return username.as_str().to_string();
        }
    }
    
    // If no username found, return empty string.
    String::new()
}