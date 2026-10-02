import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assertFeedbackBundle, assertFeedbackSignal, assertSourceBucket } from "./global-feedback-contract.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));
const signal=()=>({
  pattern_key:"grill.low_value.choice_over_blind_spot",
  event_type:"bad_grill",
  impact:"high",
  proposed_change_scope:["skills/research-quest/SKILL.md"]
});
const bundle=()=>({
  schema_version:"1.0", source_bucket:"synthetic-source-1",
  created_at:"2026-10-01T00:00:00.000Z", signal_count:1, skipped_count:0,
  signals:[signal()]
});
const risky=[
  ["person", "@example.test"].join(""),
  ["C:", String.raw`\Users\synthetic\private.txt`].join(""),
  ["/ho", "me/synthetic/private.txt"].join(""),
  ["/ro", "ot/synthetic/private.txt"].join(""),
  ["/da", "ta2/synthetic/private.txt"].join(""),
  ["ghp", "_synthetic00000000"].join(""),
  ["api", "_key=synthetic_value"].join(""),
  ["-----BEGIN ", "RSA PRIVATE KEY-----"].join(""),
  "x".repeat(1001)
];
const malformed=[null, {}, [], 123, true, "", "   "];

function run(script,args){
  return spawnSync(process.execPath,[path.join(here,script),...args],{encoding:"utf8"});
}
function temporary(fn){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"rq-feedback-synthetic-"));
  try { return fn(dir); } finally { fs.rmSync(dir,{recursive:true,force:true}); }
}

test("synthetic v1 projection preserves existing public relative scopes",()=>{
  assert.doesNotThrow(()=>assertFeedbackBundle(bundle()));
  const custom=signal();
  custom.event_type="custom_event";
  custom.pattern_key="custom.synthetic.label";
  assert.doesNotThrow(()=>assertFeedbackSignal(custom));
  // V1 has no semantic taxonomy. Pattern checks are not a privacy guarantee.
});

for(const field of ["pattern_key","event_type","impact","proposed_change_scope"]){
  test(`${field} rejects unsafe text and malformed entries`,()=>{
    for(const value of [...risky,...malformed]){
      const s=signal();
      s[field]=field==="proposed_change_scope" ? [value] : value;
      assert.throws(()=>assertFeedbackSignal(s),/global feedback validation failed/);
    }
  });
}

test("signal and bundle shapes are fail-closed",()=>{
  for(const scope of [null,{},"scope"]){
    assert.throws(()=>assertFeedbackSignal({...signal(),proposed_change_scope:scope}));
  }
  assert.throws(()=>assertFeedbackSignal({...signal(),pattern_key:"coarse:bad_grill"}));
  assert.throws(()=>assertFeedbackSignal({...signal(),private_note:"not an exported field"}));
  for(const value of [null,[],true]) assert.throws(()=>assertFeedbackSignal(value));
  for(const field of Object.keys(bundle())){
    const b=bundle(); delete b[field]; assert.throws(()=>assertFeedbackBundle(b));
  }
  for(const patch of [
    {schema_version:"2.0"},{created_at:"not a date"},{created_at:0},
    {signal_count:0},{signal_count:1.1},{skipped_count:-1},{skipped_count:"0"},
    {signals:{}},{signals:[null]}, {private_note:"not an exported field"}
  ]) assert.throws(()=>assertFeedbackBundle({...bundle(),...patch}));
  for(const value of [...risky,...malformed,"x","invalid/source"]){
    assert.throws(()=>assertSourceBucket(value));
  }
});

test("sanitized flag cannot bypass CLI checks or overwrite previous output",()=>temporary(dir=>{
  const ledger=path.join(dir,"ledger.jsonl");
  const output=path.join(dir,"bundle.json");
  const source=path.join(dir,"source-id");
  fs.writeFileSync(output,"unchanged previous artifact");
  for(const field of ["pattern_key","event_type","impact","proposed_change_scope"]){
    const event={...signal(),privacy_status:"sanitized"};
    event[field]=field==="proposed_change_scope" ? [risky[0]] : risky[0];
    fs.writeFileSync(ledger,JSON.stringify(event)+"\n");
    const result=run("export-global-feedback.mjs",["--ledger",ledger,"--output",output,"--source-id-file",source]);
    assert.notEqual(result.status,0);
    assert.equal(fs.readFileSync(output,"utf8"),"unchanged previous artifact");
    assert.equal(fs.existsSync(source),false);
    assert.equal((result.stdout+result.stderr).includes(risky[0]),false);
  }
}));

test("CLI only exports checked projection, retaining private/coarse events locally",()=>temporary(dir=>{
  const ledger=path.join(dir,"ledger.jsonl");
  const output=path.join(dir,"bundle.json");
  const source=path.join(dir,"source-id");
  const privateText="LOCAL_ONLY_SYNTHETIC_DESCRIPTION";
  const events=[
    {...signal(),privacy_status:"sanitized",symptom:privateText,evidence_summary:privateText,lesson:privateText},
    {...signal(),privacy_status:"private-local-only",pattern_key:risky[0]},
    {...signal(),privacy_status:"sanitized",pattern_key:"coarse:bad_grill"}
  ];
  fs.writeFileSync(ledger,events.map(x=>JSON.stringify(x)).join("\n"));
  const result=run("export-global-feedback.mjs",["--ledger",ledger,"--output",output,"--source-id-file",source]);
  assert.equal(result.status,0,result.stderr);
  const raw=fs.readFileSync(output,"utf8");
  const exported=JSON.parse(raw);
  assertFeedbackBundle(exported);
  assert.equal(exported.signal_count,1);
  assert.equal(exported.skipped_count,2);
  assert.equal(raw.includes(privateText),false);
  assert.equal(raw.includes(risky[0]),false);
  assert.deepEqual(exported.signals,[signal()]);
}));

test("aggregator revalidates tampered bundles without overwriting output",()=>temporary(dir=>{
  const input=path.join(dir,"input");fs.mkdirSync(input);
  const output=path.join(dir,"report.json");fs.writeFileSync(output,"unchanged previous artifact");
  for(const field of ["pattern_key","event_type","impact","proposed_change_scope"]){
    const b=bundle();b.signals[0][field]=field==="proposed_change_scope" ? [risky[0]] : risky[0];
    fs.writeFileSync(path.join(input,"bundle.json"),JSON.stringify(b));
    const result=run("aggregate-global-feedback.mjs",["--dir",input,"--output",output]);
    assert.notEqual(result.status,0);
    assert.equal(fs.readFileSync(output,"utf8"),"unchanged previous artifact");
  }
}));

test("synthetic source buckets aggregate without treating repeated events as people",()=>temporary(dir=>{
  const input=path.join(dir,"input");fs.mkdirSync(input);
  const output=path.join(dir,"report.json");
  const b=bundle();b.signals[0].impact="__proto__";
  fs.writeFileSync(path.join(input,"bundle-1.json"),JSON.stringify(b));
  fs.writeFileSync(path.join(input,"bundle-2.json"),JSON.stringify(b));
  const result=run("aggregate-global-feedback.mjs",["--dir",input,"--output",output]);
  assert.equal(result.status,0,result.stderr);
  const pattern=JSON.parse(fs.readFileSync(output,"utf8")).patterns[0];
  assert.equal(pattern.distinct_sources,1);
  assert.equal(pattern.event_count,2);
  assert.equal(pattern.impacts.__proto__,2);
  assert.equal(pattern.global_candidate,false);
}));

test("public safety scanner inspects JSONL content",()=>{
  const fixtureDir=fs.mkdtempSync(path.join(here,"synthetic-scan-"));
  try{
    fs.writeFileSync(path.join(fixtureDir,"events.jsonl"),JSON.stringify({synthetic:risky[0]})+"\n");
    const result=run("public-safety-scan.mjs",[]);
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/events\.jsonl:1: email address/);
  }finally{fs.rmSync(fixtureDir,{recursive:true,force:true});}
});


test("malformed JSON never reflects private content or overwrites artifacts",()=>temporary(dir=>{
  const input=path.join(dir,"input");fs.mkdirSync(input);
  const ledger=path.join(dir,"ledger.jsonl");
  const output=path.join(dir,"output.json");
  const source=path.join(dir,"source-id");
  const marker="SYNTHETIC_PRIVATE_MARKER";
  const malformed=`{"private":"${marker}", broken}`;
  fs.writeFileSync(output,"unchanged previous artifact");
  fs.writeFileSync(ledger,malformed);
  fs.writeFileSync(path.join(input,"bundle.json"),malformed);
  for(const [script,args] of [
    ["export-global-feedback.mjs",["--ledger",ledger,"--output",output,"--source-id-file",source]],
    ["aggregate-global-feedback.mjs",["--dir",input,"--output",output]],
  ]){
    const result=run(script,args);
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/invalid JSON/);
    assert.equal((result.stdout+result.stderr).includes(marker),false);
    assert.equal(fs.readFileSync(output,"utf8"),"unchanged previous artifact");
  }
  assert.equal(fs.existsSync(source),false);
}));

test("aggregation can safely repeat when its output is inside the input directory",()=>temporary(dir=>{
  fs.writeFileSync(path.join(dir,"bundle.json"),JSON.stringify(bundle()));
  const output=path.join(dir,"report.json");
  for(let attempt=0;attempt<2;attempt++){
    const result=run("aggregate-global-feedback.mjs",["--dir",dir,"--output",output]);
    assert.equal(result.status,0,result.stderr);
    const report=JSON.parse(fs.readFileSync(output,"utf8"));
    assert.equal(report.bundle_count,1);
    assert.equal(report.patterns[0].event_count,1);
  }
}));
