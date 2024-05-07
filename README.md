# Proof of Twitter: SP1
Prove ownership of a X (Twitter) account using an email from Twitter. Built on the SP1 zkVM from [Succinct](https://succinct.xyz/).
![alt text](screenshot.png)


## How it works
You can use a Password Reset email from Twitter to generate a ZK proof that you own the Twitter acocunt `@username`. Verifying other types emails are possible with SP1 - the password reset email was chosen because of it's simplicity and lack of user generated content.

## Running Locally
1. Clone and open repo
2. `cd ./backend/script`
3. `cargo run --script start.sh --release`
   
#### Prerequisites
- [`node.js`](https://nodejs.org/en)  
- [`yarn`](https://yarnpkg.com/getting-started/install)
- [`rust`](https://www.rust-lang.org/)
- [`sp1`](https://succinctlabs.github.io/sp1/getting-started/install.html)

#### Reccomended Specs
64GB+ of ram

#### Supported Platforms
macOS/Linux

**Note:** If you're running this on a remote server, you may have to forward ports `5173` (frontend) and `8000` (backend) when ssh'ing in.
- `ssh -L 5173:localhost:5173 -L 8000:localhost:8000 username@host_ip_address`

## Future Prospects
This project is a scrappy proof-of-concept to demonstrate what is possible with ZKPs. Under the hood, there are plenty of optimizations that could make proof generation even faster:
- **RSA Precompile:** Currently, email signatures are verified manually with rust's `rsa` libray.  Succinct has a precompile system of popular functions such as `sha256`, `ed25519`, and more. Precompiles speed up excecution by orders of magnitude. A RSA precompile would make proofs of email signatures far more efficient.
- **Regex pre-indexing:** The Regex queries search the entire email for labels such as the twitter handle and email sender (x.com). The indices of these labels could be pre-computed and passed into the program, saving many compute cycles that were just spent on searching.

## Examples
