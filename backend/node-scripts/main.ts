import {generateTwitterVerifierCircuitInputs} from "./generate-inputs"
import { verifyDKIMSignature, DKIMVerificationResult } from "@zk-email/helpers/dist/dkim/"
import fs from "fs"
import path from "path"
import crypto from 'crypto';

function verifyBodyHash(dkimResult: DKIMVerificationResult): boolean {
  const { body, bodyHash, format } = dkimResult;

  // Extract the canonicalization algorithm from the format
  const [, bodyCanonicalization] = format.split('/');

  // Apply the canonicalization algorithm to the body
  const canonicalizedBody = canonicalizeBody(body, bodyCanonicalization);

  // Calculate the SHA-256 hash of the canonicalized body
  const hash = crypto.createHash('sha256');
  hash.update(canonicalizedBody);
  const calculatedHash = hash.digest('base64');
  
  // Compare the calculated hash with the provided bodyHash
  return calculatedHash === bodyHash;
}

function verifySignature(dkimResult: DKIMVerificationResult): boolean {
  const { publicKey, signature, headers, bodyHash, algo } = dkimResult;

  // Canonicalize the headers
  const canonicalizedHeaders = canonicalizeHeaders(headers, dkimResult.format);

  // Convert the signature from base64 to a binary buffer
  const signatureBuffer = Buffer.from(signature, 'base64');

  // Create a verification object
  const verifier = crypto.createVerify("rsa-sha256");
  verifier.update(canonicalizedHeaders);

  // Verify the signature
  const verified = verifier.verify(publicKey, signatureBuffer);
  return verified;
}

function canonicalizeHeaders(headers: Buffer, format: string): string {
  const [headerCanonicalization] = format.split('/');

  switch (headerCanonicalization) {
    case 'simple':
      return headers.toString();
    case 'relaxed':
      const headerLines = headers.toString().split('\n');
      const canonicalizedLines = headerLines.map(line => {
        const [key, ...values] = line.split(':');
        const canonicalizedKey = key.trim().toLowerCase();
        const canonicalizedValue = values.join(':').replace(/\s+/g, ' ').trim();
        return `${canonicalizedKey}:${canonicalizedValue}`;
      });
      return canonicalizedLines.join('\r\n');
    default:
      throw new Error(`Unsupported header canonicalization algorithm: ${headerCanonicalization}`);
  }
}

function canonicalizeBody(body: Buffer, canonicalization: string): Buffer {
  switch (canonicalization) {
    case 'simple':
      // Remove all empty lines at the end of the message body
      const simpleBody = body.toString().replace(/(\r\n)*$/, '\r\n');
      return Buffer.from(simpleBody);
    case 'relaxed':
      const lines = body.toString().split('\n');
      const processedLines = lines.map(line => {
        // Remove all whitespace at the end of the line
        const trimmedLine = line.replace(/\s+$/, '');
        // Reduce all sequences of WSP within a line to a single SP character
        const reducedLine = trimmedLine.replace(/\s+/g, ' ');
        return reducedLine;
      });
      // Remove all empty lines at the end of the message body
      while (processedLines.length > 0 && processedLines[processedLines.length - 1].length === 0) {
        processedLines.pop();
      }
      // Add CRLF at the end if the body is non-empty
      if (processedLines.length > 0) {
        processedLines.push('');
      }
      const relaxedBody = processedLines.join('\r\n');
      return Buffer.from(relaxedBody);
    default:
      throw new Error(`Unsupported canonicalization algorithm: ${canonicalization}`);
  }
}

// https://github.com/GoogleChromeLabs/jsbi/issues/30
// monkey patch for serializing BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function main() {
    const rawEmail = fs.readFileSync(
        path.join(__dirname, "./email.eml"),
        "utf8"
      );
    const dkimResult = await verifyDKIMSignature(Buffer.from(rawEmail));
    console.log(`Body Hash Verified: ${verifyBodyHash(dkimResult)}`)
    console.log(`Signature Verified: ${verifySignature(dkimResult)}`)
    fs.writeFileSync("./input.json", JSON.stringify(dkimResult))
}

main()
  .then(() => {

  })
  .catch((error) => {
    console.error('Unhandled error:', error);
  });