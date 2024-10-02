// use regex_automata::{DenseDFA, Regex};
use regex_automata::{dfa::{dense, regex::Regex}, Match};
use std::fs::File;
use std::io::Write;


fn main() {
    // let re = Regex::new(r"This email was meant for (@\w+)").unwrap();
    // let fwd_bytes = re.forward().to_u16().expect("Failed to convert forward DFA").to_bytes_native_endian().expect("Failed to convert forward DFA to bytes");
    // let rev_bytes = re.reverse().to_u16().expect("Failed to convert reverse DFA").to_bytes_native_endian().expect("Failed to convert reverse DFA to bytes");
    // let dfa = DFA::new(r"This email was meant for (@\w+)").unwrap();
    // let (buf, _) = dfa.to_bytes_native_endian();
    // let mut file = File::create("dfa_bytes.bin").unwrap();
    // file.write_all(&buf).unwrap();
    let re = Regex::new(r"This email was meant for (@\w+)").unwrap();
    let (fwd_bytes, fwd_pad) = re.forward().to_bytes_native_endian();
    let (rev_bytes, rev_pad) = re.reverse().to_bytes_native_endian();
    let mut file = File::create("dfa_fwd_bytes.bin").unwrap();
    file.write_all(&fwd_bytes[fwd_pad..]).unwrap();
    let mut file = File::create("dfa_rev_bytes.bin").unwrap();
    file.write_all(&rev_bytes[rev_pad..]).unwrap();

    // let mut file = File::create("dfa_rev_bytes.bin").unwrap();
    // file.write_all(&rev_bytes).unwrap();
}
