//! A simple script to generate and verify the proof of a given program.

use sp1_sdk::{ProverClient, SP1Stdin, utils};
use serde::{Deserialize, Serialize};
use std::fs;

const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
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

fn main() {
    // utils::setup_logger();
    // Load JSON circuit inputs
    let input_json = fs::read_to_string("dkim.json").expect("failed to read dkim.json");
    let dkim: DKIM = serde_json::from_str(&input_json).expect("failed to parse dkim.json");
    let input_address = "0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5";

    // Generate proof.
    let mut stdin = SP1Stdin::new();
    stdin.write(&dkim);
    stdin.write(&input_address);
    let client = ProverClient::new();
    let (pk, vk) = client.setup(ELF);
    println!("Generating proof...");
    let mut proof = client.prove(&pk, stdin).expect("proving failed");
    println!("Proof finished generating");
    // Read output.
    let body_verified = proof.public_values.read::<bool>();
    let signature_verified = proof.public_values.read::<bool>();
    let dkim_verified = proof.public_values.read::<bool>();
    let verified_address = proof.public_values.read::<String>();
    println!("Email verified: {}", body_verified);
    println!("Email signature verified: {}", signature_verified);
    println!("DKIM verified: {}", dkim_verified);
    println!("Verified address: {}", verified_address);


    // Verify proof.
    client.verify(&proof, &vk).expect("verification failed");

    // Save proof.
    proof
        .save("proof-with-io.json")
        .expect("saving proof failed");

    println!("successfully generated and verified proof for the program!")


}
