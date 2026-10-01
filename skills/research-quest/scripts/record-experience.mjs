#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const get = (name, fallback=null) => {
  const i=args.indexOf(name);
  return i>=0 ? args[i+1] : fallback;
};

const ledger=get("--ledger",".research-quest/experience-ledger.jsonl");
const eventFile=get("--event");
if (!eventFile) {
  console.error("usage: node record-experience.mjs --event <event.json> [--ledger <ledger.jsonl>]");
  process.exit(2);
}

const event=JSON.parse(fs.readFileSync(eventFile,"utf8"));
const required=["id","event_type","symptom","evidence_summary","impact","root_cause_candidate","lesson","do_not_repeat","proposed_change_scope","privacy_status"];
for(const key of required){
  if(!(key in event)) throw new Error(`missing required field: ${key}`);
}
if(!["sanitized","private-local-only"].includes(event.privacy_status)) {
  throw new Error("privacy_status must be sanitized or private-local-only");
}
if(event.privacy_status==="sanitized"){
  const text=JSON.stringify(event);
  const risky=[
    /[A-Z]:\\\\[^"\n]+/i,
    /\/home\/[^"\n]+/i,
    /(password|passwd|api[_-]?key|secret|token)\s*[:=]/i,
    /-----BEGIN [A-Z ]+PRIVATE KEY-----/
  ];
  if(risky.some(r=>r.test(text))) throw new Error("sanitized event contains path/secret-like content");
}
fs.mkdirSync(path.dirname(ledger),{recursive:true});
fs.appendFileSync(ledger,JSON.stringify({...event,recorded_at:new Date().toISOString()})+"\n","utf8");
console.log(`recorded ${event.id} -> ${ledger}`);
