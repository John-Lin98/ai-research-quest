#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { assertFeedbackBundle } from "./global-feedback-contract.mjs";

const args=process.argv.slice(2);
const get=(name,fallback=null)=>{
  const i=args.indexOf(name);
  return i>=0 ? args[i+1] : fallback;
};

const dir=get("--dir");
const output=get("--output","global-common-pain-report.json");
const minSources=Number(get("--min-sources","3"));
if(!dir) {
  console.error("usage: node aggregate-global-feedback.mjs --dir <bundle-dir> [--min-sources 3] [--output report.json]");
  process.exit(2);
}
if(!Number.isInteger(minSources) || minSources<2) throw new Error("min-sources must be >=2");

const files=fs.readdirSync(dir).filter(file=>file.endsWith(".json") &&
  path.resolve(dir,file)!==path.resolve(output));
const groups=new Map();
let bundles=0;

for(const file of files){
  const raw=fs.readFileSync(path.join(dir,file),"utf8");
  let bundle;
  try { bundle=JSON.parse(raw); }
  catch { throw new Error("global feedback validation failed: invalid JSON in input bundle"); }
  // Bundles may be hand-edited or bypass the exporter: validate again.
  assertFeedbackBundle(bundle);
  bundles++;
  for(const signal of bundle.signals){
    const g=groups.get(signal.pattern_key) ?? {
      pattern_key:signal.pattern_key,
      event_types:new Set(),
      sources:new Set(),
      event_count:0,
      impacts:new Map(),
      proposed_change_scope:new Set()
    };
    g.sources.add(bundle.source_bucket);
    g.event_types.add(signal.event_type);
    g.event_count++;
    g.impacts.set(signal.impact,(g.impacts.get(signal.impact)||0)+1);
    for(const scope of signal.proposed_change_scope||[]) g.proposed_change_scope.add(scope);
    groups.set(signal.pattern_key,g);
  }
}

const patterns=[...groups.values()].map(g=>({
  pattern_key:g.pattern_key,
  distinct_sources:g.sources.size,
  event_count:g.event_count,
  event_types:[...g.event_types].sort(),
  impacts:Object.fromEntries(g.impacts),
  proposed_change_scope:[...g.proposed_change_scope].sort(),
  global_candidate:g.sources.size>=minSources
})).sort((a,b)=>(b.distinct_sources-a.distinct_sources)||(b.event_count-a.event_count));

const report={
  schema_version:"1.0",
  generated_at:new Date().toISOString(),
  bundle_count:bundles,
  min_sources:minSources,
  candidate_count:patterns.filter(x=>x.global_candidate).length,
  patterns
};

fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n","utf8");
console.log(`global common-pain report -> ${output}; bundles=${bundles}; candidates=${report.candidate_count}`);
