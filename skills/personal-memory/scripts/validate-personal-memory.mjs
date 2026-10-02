#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMemoryState } from "./memory-state-validator.mjs";
import { validateMemoryFixture } from "./memory-fixture-validator.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function fail(message) {
  console.error("personal-memory validation failed:", message);
  process.exit(1);
}

if (args.length !== 0 && (args.length !== 2 || args[0] !== "--state" || !args[1].trim())) {
  fail("usage: validate-personal-memory.mjs [--state path/to/state.json]");
}

const fixtureMode = args.length === 0;
const inputPath = fixtureMode ? path.join(root, "references/fixture-memory-state.json") : path.resolve(args[1]);
let state;
try {
  state = JSON.parse(fs.readFileSync(inputPath, "utf8"));
} catch {
  // Do not echo a supplied path or JSON contents, which may be personal data.
  fail("could not read a valid JSON state");
}
const errors = fixtureMode
  ? validateMemoryFixture(state, fs.readFileSync(path.join(root, "SKILL.md"), "utf8"))
  : validateMemoryState(state);
if (errors.length) fail(errors.join("; "));

console.log(fixtureMode ? "PERSONAL_MEMORY_CONTRACT_OK" : "PERSONAL_MEMORY_STATE_SHAPE_OK");
