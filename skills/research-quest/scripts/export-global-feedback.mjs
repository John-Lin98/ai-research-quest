#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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

fs.mkdirSync(path.dirname(sourceFile),{recursive:true});
let sourceBucket;
if(fs.existsSync(sourceFile)){
  sourceBucket=fs.readFileSync(sourceFile,"utf8").trim();
}else{
  sourceBucket=crypto.randomUUID();
  fs.writeFileSync(sourceFile,sourceBucket+"\n","utf8");
}
if(!/^[a-zA-Z0-9._-]{3,80}$/.test(sourceBucket)){
  throw new Error("source bucket must be opaque and path/email free");
}

const events=fs.readFileSync(ledger,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
const signals=[];
let skipped=0;

for(const event of events){
  const key=event.pattern_key || `coarse:${event.event_type}`;
  if(event.privacy_status!=="sanitized" || key.startsWith("coarse:")){
    skipped++;
    continue;
  }
  signals.push({
    pattern_key:key,
    event_type:event.event_type,
    impact:event.impact,
    proposed_change_scope:Array.isArray(event.proposed_change_scope) ? event.proposed_change_scope : []
  });
}

const bundle={
  schema_version:"1.0",
  source_bucket:sourceBucket,
  created_at:new Date().toISOString(),
  signal_count:signals.length,
  skipped_count:skipped,
  signals
};

fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(bundle,null,2)+"\n","utf8");
console.log(`global feedback bundle -> ${output}; exported=${signals.length}; skipped=${skipped}`);
