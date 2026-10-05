import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const prompt = createInterface({ input: stdin, output: stdout });
const secret = await prompt.question("Admin secret (32+ characters): ");
prompt.close();
if (secret.length < 32) {
  console.error("Secret must contain at least 32 characters.");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
console.log(`${salt}:${scryptSync(secret, salt, 64).toString("hex")}`);
