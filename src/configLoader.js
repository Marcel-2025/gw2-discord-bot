import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = path.join(__dirname, "..", "config.json");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

export default config;
