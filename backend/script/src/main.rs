use sp1_sdk::{ProverClient, SP1ProofWithMetadata, SP1Stdin, SP1DefaultProof};
use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use actix_web::{post,get, web, App, HttpResponse, HttpServer, Responder, web::PayloadConfig};
use actix_cors::Cors;
use http::StatusCode;
use serde_json;
use std::process::Command;
use tokio::task;
use tokio::time::sleep;
use std::io::Error;


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

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ProveRequestBody {
    email: String,
    eth_address: String,
}

// Generate proof, save to a binary file, and returned to frontend
#[post("/prove")]
async fn prove(req_body: String) -> impl Responder {
    // Parse the request body JSON string into the RequestBody struct
    let request_data: ProveRequestBody = serde_json::from_str(&req_body).expect("failed to parse request body");

    // Access the email and ethAddress fields from the parsed struct
    let email = request_data.email;
    let eth_address = request_data.eth_address;

    match generate_dkim(email).await {
        Ok(dkim) => {
            // Generate proof (will be saved to proof-with-io.json)
            tokio::task::spawn_blocking(move || generate_proof(&dkim, eth_address))
                .await
                .expect("failed to generate proof");

            // Read the binary proof file
            let proof_file = tokio::fs::read("proof-with-io.json").await.expect("failed to read proof file");

            // Send the proof file as an attachment
            HttpResponse::build(StatusCode::OK)
                .content_type("application/json")
                .append_header(("Content-Disposition", "attachment; filename=\"proof-with-io.json\""))
                .body(proof_file)
        }
        Err(_) => {
            // Return an error response if generate_dkim failed
            HttpResponse::build(StatusCode::BAD_REQUEST)
                .body("Failed to parse email")
        }
    }
}


#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct VerificationResult {
    twitter_handle: String,
    eth_address: String,
    proof_valid: bool,
}
#[post("/verify")]
async fn verify(req_body: web::Bytes) -> impl Responder {
    // Save the proof data to input_proof_to_be_verified.json as binary
    let save_proof = web::block(move || {
        fs::write("input_proof_to_be_verified.json", &req_body).expect("failed to write input_proof_to_be_verified.json");
    });
    save_proof.await.expect("failed to save proof");
    
    // Call verify proof function
    let verification_result = tokio::task::spawn_blocking(move || verify_proof())
        .await
        .expect("failed to verify proof");


    // Return the verification result as JSON response
    HttpResponse::build(StatusCode::OK)
        .content_type("application/json")
        .json(verification_result)
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::permissive();
        App::new()
            .wrap(cors)
            .app_data(PayloadConfig::new(1024 * 1024 * 20)) // Set the payload size limit to 20MB
            .service(verify)
            .service(prove)
    })
        .bind(("127.0.0.1", 8000))?
        .run()
        .await
}

fn generate_proof(dkim: &DKIM, eth_address: String) {

    // Generate proof.
    let mut stdin = SP1Stdin::new();
    stdin.write(&dkim);
    stdin.write(&eth_address);
    let client = ProverClient::new();
    println!("Client made");
    let (pk, vk) = client.setup(ELF);
    println!("Client setup from ELF");
    println!("Generating proof...");
    let mut proof = client.prove(&pk, stdin).expect("proving failed");
    println!("Proof finished generating");

    // Read output.
    let twitter_username = proof.public_values.read::<String>();
    let verified_address = proof.public_values.read::<String>();
    let twitter_proven = proof.public_values.read::<bool>();


    println!("Twitter username: {}", twitter_username);
    println!("Associated crypto address (valid if twitter proven): {}", verified_address);
    println!("Twitter proven: {}", twitter_proven);

    // Verify proof.
    client.verify(&proof, &vk).expect("verification failed");

    // Save proof file to be sent to frontend.
    proof.save("proof-with-io.json").expect("saving proof failed");
    println!("Successfully generated and verified proof for the program!");
}

fn verify_proof() -> VerificationResult {
    let client = ProverClient::new();
    let (pk, vk) = client.setup(ELF);
    let mut proof = SP1ProofWithMetadata::load("input_proof_to_be_verified.json").unwrap();
    
    // Read output.
    let twitter_username = proof.public_values.read::<String>();
    let verified_address = proof.public_values.read::<String>();
    let twitter_proven = proof.public_values.read::<bool>();

    println!("Twitter username: {}", twitter_username);
    println!("Associated crypto address (valid if twitter proven): {}", verified_address);
    println!("Twitter proven: {}", twitter_proven);

    // Verify proof.
    if client.verify(&proof, &vk).is_ok() {
        println!("good");
        VerificationResult {
            twitter_handle: twitter_username,
            eth_address: verified_address,
            proof_valid: twitter_proven,
        }
    } else {
        println!("bad");
        VerificationResult {
            twitter_handle: String::new(),
            eth_address: String::new(),
            proof_valid: false,
        }
    }
}

async fn generate_dkim(email: String) -> Result<DKIM, String> {
    // Save email as email.eml in ../node-scripts/
    let write_email = web::block(move || {
        fs::write("../node-scripts/email.eml", email).expect("failed to write email.eml");
    });
    write_email.await.expect("failed to write email.eml");

    // Delete dkim.json if it already exists
    let delete_script = task::spawn_blocking(|| {
        let script_path = "../node-scripts/dkim.json";
        if fs::metadata(script_path).is_ok() {
            fs::remove_file(script_path).expect("failed to delete dkim.json");
        }
    });
    delete_script.await.expect("failed to delete generate-dkim.js");

    // Change the working directory to ../node-scripts and run generate-dkim.js
    let run_script = task::spawn_blocking(|| {
        Command::new("sh")
            .arg("-c")
            .arg("cd ../node-scripts && node generate-dkim.js")
            .spawn()
            .expect("failed to run generate-dkim.js")
            .wait()
            .expect("failed to wait for generate-dkim.js");
    });
    run_script.await.expect("failed to run generate-dkim.js");

    // Read dkim & convert to rust object
    let dkim_path = "../node-scripts/dkim.json";
    let dkim_json = match fs::read_to_string(dkim_path) {
        Ok(json) => json,
        Err(err) => return Err(format!("failed to read dkim.json: {}", err)),
    };
    let dkim: DKIM = match serde_json::from_str(&dkim_json) {
        Ok(dkim) => dkim,
        Err(err) => return Err(format!("failed to parse dkim.json: {}", err)),
    };

    // Return DKIM object
    Ok(dkim)
}