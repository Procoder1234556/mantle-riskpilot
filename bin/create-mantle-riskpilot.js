#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const targetName = process.argv[2] ?? "mantle-riskpilot";
const targetDir = resolve(process.cwd(), targetName);
const skipNames = new Set([
  ".git",
  ".vercel",
  "dist",
  "node_modules",
  "tmp-mvp-check",
]);

function printHelp() {
  console.log(`
Create a local Mantle RiskPilot MVP copy.

Usage:
  npx github:Procoder1234556/mantle-riskpilot my-riskpilot

After setup:
  cd my-riskpilot
  npm install
  npm run dev
`);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
  console.error(`Target folder already exists and is not empty: ${targetDir}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

for (const entry of readdirSync(packageRoot)) {
  if (skipNames.has(entry)) continue;

  const source = join(packageRoot, entry);
  const destination = join(targetDir, entry);
  const stat = statSync(source);

  if (stat.isDirectory()) {
    cpSync(source, destination, {
      recursive: true,
      filter: (path) => ![...skipNames].some((name) => path.split(/[\\/]/).includes(name)),
    });
  } else {
    cpSync(source, destination);
  }
}

writeFileSync(
  join(targetDir, ".env.example"),
  "# Mantle RiskPilot does not require secrets for the public live-data MVP.\n",
);

console.log(`
Mantle RiskPilot created at:
  ${targetDir}

Next commands:
  cd ${targetName}
  npm install
  npm run dev

Deploy:
  npx vercel --prod
`);
