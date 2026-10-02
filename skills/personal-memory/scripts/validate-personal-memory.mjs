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
if(!Array.isArray(fixture.conflicts)) fail("missing conflicts store");
if(!fixture.memory_pack_contract) fail("missing memory pack contract");
for(const fact of fixture.facts){
  for(const k of ["id","statement","attribution","source_ref","scope","memory_scope","evidence_status","temporal_type","temporal_status","observed_at","last_verified_at","updated_at","promotion_reason"]){
    if(!(k in fact)) fail(`fact missing ${k}`);
  }
  if(!["candidate","confirmed","verified"].includes(fact.evidence_status)) fail("invalid fact evidence status");
  if(!["stable","slow-changing","dynamic","version-bound","event-bound","external-current"].includes(fact.temporal_type)) fail("invalid fact temporal type");
  if(!["active","stale","needs-revalidation","superseded","archived"].includes(fact.temporal_status)) fail("invalid fact temporal status");
  if(!["project","user-global"].includes(fact.memory_scope)) fail("invalid fact memory scope");
  if(!["hot","warm","archive"].includes(fact.storage_tier)) fail("invalid fact storage tier");
  if(fact.memory_scope==="user-global"){
    if(fact.evidence_status!=="verified") fail("user-global fact must be verified");
    if(!fact.promotion_reason) fail("user-global fact requires promotion_reason");
    if(!fact.attribution || !fact.source_ref || !fact.updated_at) fail("user-global fact requires provenance and freshness");
  }
}
for(const pref of fixture.preferences){
  if(pref.status!=="confirmed"&&pref.status!=="superseded") fail("invalid preference status");
  if(!["user-global","project"].includes(pref.memory_scope)) fail("invalid preference memory scope");
  if(!["hot","warm","archive"].includes(pref.storage_tier)) fail("invalid preference storage tier");
}
for(const strategy of fixture.strategies){
  if(!["candidate","verified","superseded"].includes(strategy.status)) fail("invalid strategy status");
  if(!["user-global","project"].includes(strategy.memory_scope)) fail("invalid strategy memory scope");
  if(!["hot","warm","archive"].includes(strategy.storage_tier)) fail("invalid strategy storage tier");
  if(strategy.status!=="verified" && strategy.memory_scope==="user-global") fail("unverified strategy cannot be user-global");
}
for(const conflict of fixture.conflicts){
  if(!["fact","preference","strategy"].includes(conflict.memory_type)) fail("invalid conflict memory_type");
  if(!["unresolved","resolved","superseded"].includes(conflict.conflict_status)) fail("invalid conflict status");
  if(!Array.isArray(conflict.entry_ids) || conflict.entry_ids.length<2) fail("conflict requires at least two entries");
}
for(const factor of ["relevance","scope_match","freshness","evidence","action_usefulness"]){
  if(!fixture.memory_pack_contract.ranking_factors.includes(factor)) fail(`missing retrieval factor ${factor}`);
}
if(fixture.memory_pack_contract.conflict_coverage!==true) fail("conflict coverage must be true");
if(fixture.memory_pack_contract.minimal_sufficient!==true) fail("memory pack must be minimal sufficient");

const serialized=JSON.stringify(fixture);
if(/[A-Z]:\\|\/home\/|password|api[_-]?key|secret/i.test(serialized)) fail("fixture appears to contain sensitive data");

if(!skill.includes("Preference / Strategy 的跨项目复用是默认便利；Fact 的跨项目复用是受控晋升")) fail("scope constitution missing");
if(!skill.includes("Memory Freshness Constitution｜已批准 D-M1-C")) fail("freshness constitution missing");
if(!skill.includes("verify-on-use")) fail("verify-on-use rule missing");
if(!skill.includes("Memory Conflict Constitution｜已批准 D-M2-C")) fail("conflict constitution missing");
if(!skill.includes("Memory Portfolio Retrieval｜已批准 D-M3-C")) fail("portfolio retrieval constitution missing");
if(!skill.includes("Forgetting / Compaction Constitution｜已批准 D-M4-C")) fail("forgetting constitution missing");
console.log("PERSONAL_MEMORY_CONTRACT_OK");
