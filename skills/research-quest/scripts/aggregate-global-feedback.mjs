#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

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

const files=fs.readdirSync(dir).filter(x=>x.endsWith(".json"));
const groups=new Map();
let bundles=0;

for(const file of files){
  const bundle=JSON.parse(fs.readFileSync(path.join(dir,file),"utf8"));
  if(bundle.schema_version!=="1.0" || !bundle.source_bucket || !Array.isArray(bundle.signals)) continue;
  bundles++;
  for(const signal of bundle.signals){
    if(!signal.pattern_key || signal.pattern_key.startsWith("coarse:")) continue;
    const g=groups.get(signal.pattern_key) ?? {
      pattern_key:signal.pattern_key,
      event_types:new Set(),
      sources:new Set(),
      event_count:0,
      impacts:{},
      proposed_change_scope:new Set()
    };
    g.sources.add(bundle.source_bucket);
    g.event_types.add(signal.event_type);
    g.event_count++;
    g.impacts[signal.impact]=(g.impacts[signal.impact]||0)+1;
    for(const scope of signal.proposed_change_scope||[]) g.proposed_change_scope.add(scope);
    groups.set(signal.pattern_key,g);
  }
}

const patterns=[...groups.values()].map(g=>({
  pattern_key:g.pattern_key,
  distinct_sources:g.sources.size,
  event_count:g.event_count,
  event_types:[...g.event_types].sort(),
  impacts:g.impacts,
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
