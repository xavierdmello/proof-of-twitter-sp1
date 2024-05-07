# Proof of Twitter: SP1
Prove ownership of a X (Twitter) account using an email from Twitter. Built on the SP1 zkVM from [Succinct](https://succinct.xyz/).
![alt text](screenshot.png)


## How it works
You can use a Password Reset email from Twitter to generate a ZK proof that you own the Twitter acocunt `@username`. Verifying other types emails are possible with SP1 - the password reset email was chosen because of it's simplicity and lack of user generated content.

## Running Locally

#### Prerequisites
- [`node.js`](https://nodejs.org/en)  
- [`yarn`](https://yarnpkg.com/getting-started/install)
- [`rust`](https://www.rust-lang.org/)
- [`sp1`](https://succinctlabs.github.io/sp1/getting-started/install.html)

#### Reccomended Specs
64GB+ of ram

## Future Prospects
This project is a proof-of-concept to demonstrate what is possible with ZKPs. Under the hood, there are plenty of optimizations that could make proof generation even faster:
- **RSA Precompile:** Currently, email signatures are verified manually with rust's `rsa` libray.  Succinct has a precompile system of popular functions such as `sha256`, `ed25519`, and more. Precompiles speed up excecution by orders of magnitude. A RSA precompile would make proofs of email signatures far more efficient.
- **Regex pre-indexing:** The Regex queries search the entire email for labels such as the twitter handle and `from:` header (x.com). The indices of these labels could be pre-computed and passed into the program, saving many compute cycles that were just spent on searching.

## Examples
