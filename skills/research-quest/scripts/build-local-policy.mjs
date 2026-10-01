#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args=process.argv.slice(2);
const get=(name,fallback=null)=>{
  const i=args.indexOf(name);
  return i>=0 ? args[i+1] : fallback;
};
const ledger=get("--ledger",".research-quest/experience-ledger.jsonl");
const output=get("--output",".research-quest/local-policy.md");

if(!fs.existsSync(ledger)){
  console.error(`ledger not found: ${ledger}`);
  process.exit(2);
}
const events=fs.readFileSync(ledger,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
const lessons=[];
const bans=[];
const successes=[];
for(const e of events){
  if(e.lesson && !lessons.includes(e.lesson)) lessons.push(e.lesson);
  if(e.do_not_repeat && !bans.includes(e.do_not_repeat)) bans.push(e.do_not_repeat);
  if(e.event_type==="successful_pattern" && e.lesson && !successes.includes(e.lesson)) successes.push(e.lesson);
}
const md=[
  "# Research Quest Local Adaptive Policy",
  "",
  "> Auto-generated from the private Experience Ledger. This file may refine local behavior but may not override the user's latest instruction or protected privacy/evidence rules.",
  "",
  "## Do not repeat",
  ...(bans.length ? bans.map(x=>`- ${x}`) : ["- None recorded."]),
  "",
  "## Reusable lessons",
  ...(lessons.length ? lessons.map(x=>`- ${x}`) : ["- None recorded."]),
  "",
  "## Successful patterns to prefer",
  ...(successes.length ? successes.map(x=>`- ${x}`) : ["- None recorded."]),
  "",
  `Generated from ${events.length} experience event(s).`,
  ""
].join("\n");
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,md,"utf8");
console.log(`local adaptive policy -> ${output}`);
