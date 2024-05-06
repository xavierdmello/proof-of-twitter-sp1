const { verifyDKIMSignature } = require("@zk-email/helpers/dist/dkim/");
const fs = require("fs");
const path = require("path");

async function main() {
  const rawEmail = fs.readFileSync(path.join(__dirname, "./email.eml"), "utf8");
  const dkimResult = await verifyDKIMSignature(rawEmail);
  fs.writeFileSync("./dkim.json", JSON.stringify(dkimResult));
}

main()
    .then(() => {})
    .catch((error) => {
      console.error('Unhandled error:', error);
    });