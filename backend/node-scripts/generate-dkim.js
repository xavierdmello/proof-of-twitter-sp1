const { verifyDKIMSignature } = require("@zk-email/helpers/dist/dkim/");
const fs = require("fs");
const path = require("path");

// Parse raw email to circuit inputs and save that to ./dkim.json to be used by the main rust program.
async function generateDkim() {
  const rawEmail = fs.readFileSync(path.join(__dirname, "./email.eml"), "utf8");
  const dkimResult = await verifyDKIMSignature(rawEmail);
  fs.writeFileSync("./dkim.json", JSON.stringify(dkimResult));
}

generateDkim()
  .then(() => {})
  .catch((error) => {
    console.error("Unhandled error:", error);
  });
