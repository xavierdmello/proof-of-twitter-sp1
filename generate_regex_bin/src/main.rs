use regex_automata::{dfa::{dense::DFA, regex::Regex}, Match};
use std::fs::File;
use std::io::Write;


// Generates binary representations of a regex DFA for matching email addresses (in generate_username) 
// and saves them into binary files.
fn main() {
    let re = Regex::new(r"This email was meant for (@\w+)").unwrap();
    let (fwd_bytes, fwd_pad) = re.forward().to_bytes_little_endian();
    let (rev_bytes, rev_pad) = re.reverse().to_bytes_little_endian();
    std::fs::write("dfa_fwd_bytes.bin", &fwd_bytes[fwd_pad..]).unwrap();
    std::fs::write("dfa_rev_bytes.bin", &rev_bytes[rev_pad..]).unwrap();
}
