use sp1_sdk::{ProverClient, SP1Stdin, utils};
use serde::{Deserialize, Serialize};
use std::fs;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use http::StatusCode;
use serde_json::from_str;

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


#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[derive(Serialize, Deserialize, Debug)]
struct RequestBody {
    email: String,
    eth_address: String,
}
#[post("/prove")]
async fn prove(req_body: String) -> impl Responder {
    println!("{}", req_body);

    // Parse the request body JSON string into the RequestBody struct
    let request_data: RequestBody = serde_json::from_str(&req_body).expect("failed to parse request body");

    // Access the email and ethAddress fields from the parsed struct
    let email = request_data.email;
    let eth_address = request_data.eth_address;

    let dkim = generate_dkim(email);
    let proof_json = generate_proof(&dkim, eth_address);
    HttpResponse::build(StatusCode::OK).content_type("application/json").body(proof_json)
}

async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(hello)
            .service(prove)
            .route("/hey", web::get().to(manual_hello))
    })
        .bind(("127.0.0.1", 8000))?
        .run()
        .await
}
use serde_json;

fn generate_proof(dkim: &DKIM, eth_address: String) -> String {
    // Load JSON circuit inputs
    // let input_json = fs::read_to_string("dkim.json").expect("failed to read dkim.json");
    // let dkim: DKIM = serde_json::from_str(&input_json).expect("failed to parse dkim.json");
    // let input_address = "0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5";

    // Generate proof.
    let mut stdin = SP1Stdin::new();
    stdin.write(&dkim);
    stdin.write(&eth_address);

    let client = ProverClient::new();
    let (pk, vk) = client.setup(ELF);

    println!("Generating proof...");
    let mut proof = client.prove(&pk, stdin).expect("proving failed");
    println!("Proof finished generating");

    // Read output.
    let body_verified = proof.public_values.read::<bool>();
    let signature_verified = proof.public_values.read::<bool>();
    let from_address_verified = proof.public_values.read::<bool>();
    let is_pw_reset_email = proof.public_values.read::<bool>();
    let twitter_username = proof.public_values.read::<String>();
    let twitter_proven = proof.public_values.read::<bool>();
    let verified_address = proof.public_values.read::<String>();

    println!("Email verified: {}", body_verified);
    println!("Email signature verified: {}", signature_verified);
    println!("From address verified: {}", from_address_verified);
    println!("Email is password reset email: {}", is_pw_reset_email);
    println!("Twitter username: {}", twitter_username);
    println!("Associated crypto address (valid if twitter proven): {}", verified_address);
    println!("Twitter proven: {}", twitter_proven);

    // Verify proof.
    client.verify(&proof, &vk).expect("verification failed");

    // Serialize proof to JSON string.
    let proof_json = serde_json::to_string(&proof).expect("failed to serialize proof");

    println!("Successfully generated and verified proof for the program!");

    proof_json
}

fn generate_dkim(email: String) -> DKIM {
    
}

