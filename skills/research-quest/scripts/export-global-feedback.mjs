#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { assertFeedbackBundle, assertFeedbackSignal, assertObject, assertSourceBucket } from "./global-feedback-contract.mjs";

const args=process.argv.slice(2);
const get=(name,fallback=null)=>{
  const i=args.indexOf(name);
  return i>=0 ? args[i+1] : fallback;
};

const ledger=get("--ledger",".research-quest/experience-ledger.jsonl");
const output=get("--output",".research-quest/global-feedback-bundle.json");
const sourceFile=get("--source-id-file",".research-quest/source-id");

if(!fs.existsSync(ledger)){
  console.error(`ledger not found: ${ledger}`);
  process.exit(2);
}

const sourceExists=fs.existsSync(sourceFile);
const sourceBucket=sourceExists
  ? fs.readFileSync(sourceFile,"utf8").trim()
  : crypto.randomUUID();
assertSourceBucket(sourceBucket);

const events=fs.readFileSync(ledger,"utf8").split(/\r?\n/).flatMap((line,index)=>{
  if(!line.trim()) return [];
  try { return [JSON.parse(line)]; }
  catch { throw new Error(`global feedback validation failed: invalid JSON at ledger line ${index+1}`); }
});
const signals=[];
let skipped=0;

for(const event of events){
  assertObject(event,"ledger event");
  if(event.privacy_status!=="sanitized"){
    skipped++;
    continue;
  }
  // Coarse or absent keys remain local. A sanitized flag alone is not proof.
  if(event.pattern_key===undefined || event.pattern_key===null || event.pattern_key==="" ||
      (typeof event.pattern_key==="string" && event.pattern_key.startsWith("coarse:"))){
    skipped++;
    continue;
  }
  const signal={
    pattern_key:event.pattern_key,
    event_type:event.event_type,
    impact:event.impact,
    proposed_change_scope:event.proposed_change_scope
  };
  assertFeedbackSignal(signal);
  signals.push(signal);
}

const bundle={
  schema_version:"1.0",
  source_bucket:sourceBucket,
  created_at:new Date().toISOString(),
  signal_count:signals.length,
  skipped_count:skipped,
  signals
};

// Validate the complete projection before creating identifiers or overwriting output.
assertFeedbackBundle(bundle);
if(!sourceExists){
  fs.mkdirSync(path.dirname(sourceFile),{recursive:true});
  fs.writeFileSync(sourceFile,sourceBucket+"\n","utf8");
}
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(bundle,null,2)+"\n","utf8");
console.log(`global feedback bundle -> ${output}; exported=${signals.length}; skipped=${skipped}`);
