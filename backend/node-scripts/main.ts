import {generateTwitterVerifierCircuitInputs} from "./generate-inputs"
import fs from "fs"
import path from "path"

async function main() {
    const rawEmail = fs.readFileSync(
        path.join(__dirname, "./email.eml"),
        "utf8"
      );
    const result = await generateTwitterVerifierCircuitInputs(rawEmail, "0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5");
    fs.writeFileSync("./input.json", JSON.stringify(result))
}

main()
  .then(() => {

  })
  .catch((error) => {
    console.error('Unhandled error:', error);
  });