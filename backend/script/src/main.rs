//! A simple script to generate and verify the proof of a given program.

use sp1_sdk::{ProverClient, SP1Stdin};

const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

// fn main() {
//     // Generate proof.
//     let mut stdin = SP1Stdin::new();
//     let n = 186u32;
//     stdin.write(&n);
//     let client = ProverClient::new();
//     let (pk, vk) = client.setup(ELF);
//     let mut proof = client.prove(&pk, stdin).expect("proving failed");
    
//     // Read output.
//     let a = proof.public_values.read::<u128>();
//     let b = proof.public_values.read::<u128>();
//     println!("a: {}", a);
//     println!("b: {}", b);

//     // Verify proof.
//     client.verify(&proof, &vk).expect("verification failed");

//     // Save proof.
//     proof
//         .save("proof-with-io.json")
//         .expect("saving proof failed");

//     println!("successfully generated and verified proof for the program!")

    
// }
use std::fs::File;
use std::io::Read;
use serde_json::Value;

fn load_and_convert_ascii_array(json: &Value, field_name: &str) -> String {
    // Get the specified array field from the JSON
    let ascii_array = json[field_name].as_array().expect(&format!("{} is not an array", field_name));

    // Convert ASCII integers (stored as strings) to characters and return as a string
    ascii_array
        .iter()
        .map(|value| value.as_str().unwrap().parse::<u8>().unwrap() as char)
        .collect()
}

fn main() {
    // Load the input.json file
    let mut file = File::open("input.json").expect("Failed to open file");
    let mut contents = String::new();
    file.read_to_string(&mut contents).expect("Failed to read file");

    // Parse the JSON content
    let json: Value = serde_json::from_str(&contents).expect("Failed to parse JSON");

    // Load and convert the "emailHeader" array
    // let email_header = load_and_convert_ascii_array(&json, "emailHeader");
    // println!("Email Header: {}", email_header);

    // Load and convert the "emailBody" array
    let email_body = load_and_convert_ascii_array(&json, "emailBody");
    println!("Email Body: {}", email_body);
}