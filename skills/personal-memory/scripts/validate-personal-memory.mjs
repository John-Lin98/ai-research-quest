#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"..");
const skill=fs.readFileSync(path.join(root,"SKILL.md"),"utf8");
const fixture=JSON.parse(fs.readFileSync(path.join(root,"references/fixture-memory-state.json"),"utf8"));

function fail(message){ console.error("personal-memory validation failed:",message); process.exit(1); }

for(const phrase of ["Fact","Preference","Strategy","Candidate → Confirmed → Verified","Personal Memory Write Gate"]){
  if(!skill.includes(phrase)) fail(`SKILL missing ${phrase}`);
}
if(fixture.schema_version!=="1.0") fail("wrong schema version");
if(!Array.isArray(fixture.facts)||!Array.isArray(fixture.preferences)||!Array.isArray(fixture.strategies)) fail("missing stores");
for(const fact of fixture.facts){
  for(const k of ["id","statement","attribution","source_ref","scope","memory_scope","evidence_status","updated_at","promotion_reason"]){
    if(!(k in fact)) fail(`fact missing ${k}`);
  }
  if(!["candidate","confirmed","verified"].includes(fact.evidence_status)) fail("invalid fact evidence status");
  if(!["project","user-global"].includes(fact.memory_scope)) fail("invalid fact memory scope");
  if(fact.memory_scope==="user-global"){
    if(fact.evidence_status!=="verified") fail("user-global fact must be verified");
    if(!fact.promotion_reason) fail("user-global fact requires promotion_reason");
    if(!fact.attribution || !fact.source_ref || !fact.updated_at) fail("user-global fact requires provenance and freshness");
  }
}
for(const pref of fixture.preferences){
  if(pref.status!=="confirmed"&&pref.status!=="superseded") fail("invalid preference status");
  if(!["user-global","project"].includes(pref.memory_scope)) fail("invalid preference memory scope");
}
for(const strategy of fixture.strategies){
  if(!["candidate","verified","superseded"].includes(strategy.status)) fail("invalid strategy status");
  if(!["user-global","project"].includes(strategy.memory_scope)) fail("invalid strategy memory scope");
  if(strategy.status!=="verified" && strategy.memory_scope==="user-global") fail("unverified strategy cannot be user-global");
}
const serialized=JSON.stringify(fixture);
if(/[A-Z]:\\|\/home\/|password|api[_-]?key|secret/i.test(serialized)) fail("fixture appears to contain sensitive data");

if(!skill.includes("Preference / Strategy 的跨项目复用是默认便利；Fact 的跨项目复用是受控晋升")) fail("scope constitution missing");
console.log("PERSONAL_MEMORY_CONTRACT_OK");
