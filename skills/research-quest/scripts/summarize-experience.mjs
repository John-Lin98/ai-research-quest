#!/usr/bin/env node
import fs from "node:fs";

const args=process.argv.slice(2);
const i=args.indexOf("--ledger");
const ledger=i>=0 ? args[i+1] : ".research-quest/experience-ledger.jsonl";
if(!fs.existsSync(ledger)){
  console.log(JSON.stringify({ledger,events:0,meta_review:false,groups:[]},null,2));
  process.exit(0);
}
const lines=fs.readFileSync(ledger,"utf8").split(/\r?\n/).filter(Boolean);
const events=lines.map((line,n)=>{
  try{return JSON.parse(line)}catch{throw new Error(`invalid JSONL at line ${n+1}`)}
});
const map=new Map();
for(const e of events){
  const g=map.get(e.event_type) ?? {event_type:e.event_type,count:0,high_impact:0,latest_lessons:[]};
  g.count++;
  if(["high","critical"].includes(String(e.impact).toLowerCase())) g.high_impact++;
  if(e.lesson && !g.latest_lessons.includes(e.lesson)) g.latest_lessons.unshift(e.lesson);
  g.latest_lessons=g.latest_lessons.slice(0,3);
  map.set(e.event_type,g);
}
const groups=[...map.values()].sort((a,b)=>(b.high_impact-a.high_impact)||(b.count-a.count));
const meta_review=groups.some(g=>g.count>=3 || g.high_impact>=1);
console.log(JSON.stringify({
  ledger,
  events:events.length,
  meta_review,
  trigger_reason:meta_review ? "repeated-or-high-impact-experience" : null,
  groups
},null,2));
