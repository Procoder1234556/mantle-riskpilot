#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { extract } from "tar";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const repoTarballUrl =
  "https://codeload.github.com/Procoder1234556/mantle-riskpilot/tar.gz/refs/heads/master";
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

async function downloadSource() {
  if (existsSync(join(packageRoot, "src", "main.tsx")) && existsSync(join(packageRoot, "api", "live-data.js"))) {
    return packageRoot;
  }

  const tempRoot = join(tmpdir(), `mantle-riskpilot-${Date.now()}`);
  mkdirSync(tempRoot, { recursive: true });

  const response = await fetch(repoTarballUrl, {
    headers: {
      accept: "application/x-gzip",
      "user-agent": "create-mantle-riskpilot",
    },
  });

  if (!response.ok) {
    throw new Error(`Could not download Mantle RiskPilot: ${response.status}`);
  }

  const archivePath = join(tempRoot, "source.tgz");
  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(archivePath, bytes);
  await extract({ cwd: tempRoot, file: archivePath });

  const sourceDir = readdirSync(tempRoot)
    .map((entry) => join(tempRoot, entry))
    .find((entry) => statSync(entry).isDirectory());

  if (!sourceDir) {
    throw new Error("Downloaded archive did not contain a project folder.");
  }

  return sourceDir;
}

function copyProject(sourceRoot) {
  mkdirSync(targetDir, { recursive: true });

  for (const entry of readdirSync(sourceRoot)) {
    if (skipNames.has(entry)) continue;

    const source = join(sourceRoot, entry);
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
}

try {
  const sourceRoot = await downloadSource();
  copyProject(sourceRoot);
  writeFileSync(
    join(targetDir, ".env.example"),
    "# Mantle RiskPilot does not require secrets for the public live-data MVP.\n",
  );
} catch (error) {
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }
  console.error(error instanceof Error ? error.message : "Failed to create Mantle RiskPilot.");
  process.exit(1);
}

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
