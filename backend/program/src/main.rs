#![no_main]
sp1_zkvm::entrypoint!(main);
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use base64::prelude::*;
use rsa::{pkcs8::DecodePublicKey, RsaPublicKey, Pkcs1v15Sign};

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
    
    let body_verified = verify_body(&dkim);
    let signature_verified = verify_signature(&dkim);
    let dkim_verified = body_verified && signature_verified;

    sp1_zkvm::io::commit(&body_verified);
    sp1_zkvm::io::commit(&signature_verified);
    sp1_zkvm::io::commit(&dkim_verified);
    println!("commited everyithing");
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
    println!("verifying sig..");
    // RSASSA-PKCS1-V1_5 padding bytes
    // https://crypto.stackexchange.com/questions/86385/initial-value-for-rsa-and-sha-256-signature-encoding
    let prefix: Box<[u8]> = Box::new([
        0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20
    ]);
    // SHA-256 produces hash output of 32 bytes
    let hash_len = Some(32);
    let padding = Pkcs1v15Sign {hash_len: Some(32), prefix: prefix};
    println!("padding created..");
    let result = public_key.verify(padding, &hash, &signature);
    println!("result calculated..");
    println!("{}", result.is_ok());
    println!("result ok  printed..");
    result.is_ok()
}