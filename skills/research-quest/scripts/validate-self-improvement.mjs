#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(here, "../references/fixture-self-improvement.json");
const data = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

const allowedModes = new Set(["observe","propose","promote"]);
const allowedPrivacy = new Set(["sanitized","private-local-only"]);
const requiredEvent = [
  "id","event_type","pattern_key","symptom","evidence_summary","impact",
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
  if (!["personal","global"].includes(mut.evolution_scope)) fail(`invalid evolution_scope for ${mut.id}`);
  if (!["mutable","protected"].includes(mut.risk_class)) fail(`invalid risk_class for ${mut.id}`);
  if (mut.evolution_scope==="global" && Number(mut.cross_user_support||0) < 2) fail(`global mutation ${mut.id} needs cross-user support`);
  if (mut.evolution_scope==="personal") {
    const requiredGates=["truth","task_success","evidence_integrity","independent_judgment","protected_layer"];
    if (!Array.isArray(mut.objective_hard_gates)) fail(`personal mutation ${mut.id} missing objective_hard_gates`);
    for (const gate of requiredGates) {
      if (!mut.objective_hard_gates.includes(gate)) fail(`personal mutation ${mut.id} missing hard gate ${gate}`);
    }
    if (mut.personal_fit_can_override_hard_gates !== false) fail(`personal mutation ${mut.id} must forbid personal-fit override`);
    if (mut.promotion_logic !== "all_hard_gates_pass_and_personal_utility_improves") {
      fail(`personal mutation ${mut.id} has invalid promotion logic`);
    }
  }
  if (!["candidate","accepted","rejected","rolled-back"].includes(mut.promotion_status)) {
    fail(`invalid promotion_status for ${mut.id}`);
  }
}

console.log(`self-improvement fixture OK: ${data.events.length} events, ${data.candidate_mutations.length} mutation(s)`);


const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"research-quest-rsi-"));
const eventPath=path.join(tmp,"event.json");
const ledgerPath=path.join(tmp,"ledger.jsonl");
fs.writeFileSync(eventPath,JSON.stringify(data.events[0],null,2));
execFileSync(process.execPath,[path.resolve(here,"record-experience.mjs"),"--event",eventPath,"--ledger",ledgerPath],{stdio:"pipe"});
const summaryRaw=execFileSync(process.execPath,[path.resolve(here,"summarize-experience.mjs"),"--ledger",ledgerPath],{encoding:"utf8"});
const summary=JSON.parse(summaryRaw);
if(summary.events!==1) fail("experience ledger smoke test did not record exactly one event");
if(!Array.isArray(summary.groups) || summary.groups.length!==1) fail("experience summary smoke test failed");
const policyPath=path.join(tmp,"local-policy.md");
execFileSync(process.execPath,[path.resolve(here,"build-local-policy.mjs"),"--ledger",ledgerPath,"--output",policyPath],{stdio:"pipe"});
const policy=fs.readFileSync(policyPath,"utf8");
if(!policy.includes("Do not repeat") || !policy.includes(data.events[0].do_not_repeat)) fail("local adaptive policy smoke test failed");

const factualEvent={
  ...data.events[0],
  id:"evt-factual-write-gate",
  event_type:"unverified_claim",
  pattern_key:"memory.unverified_fact.write",
  policy_kind:"factual",
  lesson:"UNVERIFIED_FACT_MUST_NOT_APPEAR_IN_LOCAL_POLICY",
  do_not_repeat:"UNVERIFIED_FACT_MUST_NOT_APPEAR_AS_POLICY"
};
const factualPath=path.join(tmp,"factual-event.json");
fs.writeFileSync(factualPath,JSON.stringify(factualEvent,null,2));
execFileSync(process.execPath,[path.resolve(here,"record-experience.mjs"),"--event",factualPath,"--ledger",ledgerPath],{stdio:"pipe"});
execFileSync(process.execPath,[path.resolve(here,"build-local-policy.mjs"),"--ledger",ledgerPath,"--output",policyPath],{stdio:"pipe"});
const gatedPolicy=fs.readFileSync(policyPath,"utf8");
if(gatedPolicy.includes("UNVERIFIED_FACT_MUST_NOT_APPEAR")) fail("personal memory write gate failed");
if(!gatedPolicy.includes("skipped factual-state events: 1")) fail("factual skip count missing");
console.log("experience ledger + local policy + memory write gate smoke test OK");

const globalDir=path.join(tmp,"global");
fs.mkdirSync(globalDir,{recursive:true});
for(const source of ["user1","user2","user3"]){
  const sourceFile=path.join(tmp,`source-${source}.txt`);
  fs.writeFileSync(sourceFile,source+"\n");
  const bundlePath=path.join(globalDir,`${source}.json`);
  execFileSync(process.execPath,[
    path.resolve(here,"export-global-feedback.mjs"),
    "--ledger",ledgerPath,
    "--output",bundlePath,
    "--source-id-file",sourceFile
  ],{stdio:"pipe"});
}
const reportPath=path.join(tmp,"global-report.json");
execFileSync(process.execPath,[
  path.resolve(here,"aggregate-global-feedback.mjs"),
  "--dir",globalDir,
  "--min-sources","3",
  "--output",reportPath
],{stdio:"pipe"});
const report=JSON.parse(fs.readFileSync(reportPath,"utf8"));
if(report.candidate_count<1) fail("global common-pain gate smoke test failed");
const expectedPattern=data.events[0].pattern_key;
const pattern=report.patterns.find(x=>x.pattern_key===expectedPattern);
if(!pattern || pattern.distinct_sources!==3 || !pattern.global_candidate) fail("global distinct-source aggregation failed");
console.log("personal/global evolution smoke test OK");

fs.rmSync(tmp,{recursive:true,force:true});
