#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(here, "../references/fixture-self-improvement.json");
const data = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

const allowedModes = new Set(["observe","propose","promote"]);
const allowedPrivacy = new Set(["sanitized","private-local-only"]);
const requiredEvent = [
  "id","event_type","symptom","evidence_summary","impact",
  "root_cause_candidate","lesson","do_not_repeat",
  "proposed_change_scope","privacy_status"
];

function fail(message) {
  console.error("self-improvement validation failed:", message);
  process.exit(1);
}

if (data.schema_version !== "1.0") fail("schema_version must be 1.0");
if (!allowedModes.has(data.mode)) fail("invalid mode");
if (!Array.isArray(data.events) || data.events.length < 1) fail("events must be non-empty");

const ids = new Set();
for (const event of data.events) {
  for (const key of requiredEvent) {
    if (!(key in event)) fail(`event missing ${key}`);
  }
  if (ids.has(event.id)) fail(`duplicate event id ${event.id}`);
  ids.add(event.id);
  if (!allowedPrivacy.has(event.privacy_status)) fail(`invalid privacy status for ${event.id}`);
  if (!Array.isArray(event.proposed_change_scope) || event.proposed_change_scope.length === 0) {
    fail(`missing proposed_change_scope for ${event.id}`);
  }
  if (event.privacy_status === "sanitized" && /[A-Z]:\\|\/home\/|token|password|secret/i.test(event.evidence_summary)) {
    fail(`sanitized event appears to contain sensitive/path-like content: ${event.id}`);
  }
}

if (!Array.isArray(data.candidate_mutations) || data.candidate_mutations.length < 1) {
  fail("candidate_mutations must be non-empty");
}

for (const mut of data.candidate_mutations) {
  if (!Array.isArray(mut.problem_event_ids) || mut.problem_event_ids.length === 0) {
    fail(`mutation ${mut.id} must cite events`);
  }
  for (const id of mut.problem_event_ids) {
    if (!ids.has(id)) fail(`mutation ${mut.id} cites unknown event ${id}`);
  }
  if (!Array.isArray(mut.evals) || mut.evals.length < 3) {
    fail(`mutation ${mut.id} needs at least 3 evals`);
  }
  if (!Array.isArray(mut.regression_risks) || mut.regression_risks.length < 1) {
    fail(`mutation ${mut.id} must declare regression risks`);
  }
  if (!["candidate","accepted","rejected","rolled-back"].includes(mut.promotion_status)) {
    fail(`invalid promotion_status for ${mut.id}`);
  }
}

console.log(`self-improvement fixture OK: ${data.events.length} events, ${data.candidate_mutations.length} mutation(s)`);
