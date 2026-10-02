#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const policy=JSON.parse(fs.readFileSync(path.resolve(here,"../references/replay-policy.json"),"utf8"));

function fail(m){ console.error("replay-policy validation failed:",m); process.exit(1); }

if(policy.schema_version!=="1.0") fail("wrong schema version");
if(policy.replay_policy!=="rolling_three_tier") fail("wrong replay policy");
for(const tier of ["dev","audit","promotion"]){
  if(!policy.tiers?.[tier]) fail(`missing tier ${tier}`);
}
if(policy.tiers.dev.feedback!=="detailed") fail("dev must provide detailed feedback");
if(policy.tiers.audit.visibility!=="hidden") fail("audit must be hidden");
if(policy.tiers.promotion.visibility!=="strict-hidden") fail("promotion must be strict-hidden");
if(policy.tiers.promotion.feedback!=="outcome-only") fail("promotion feedback must be outcome-only");
for(const key of ["personal_global_separated","promotion_set_rotates","hidden_usage_budget_required","benchmark_audit_required","promotion_feedback_may_not_be_detailed"]){
  if(policy.rules?.[key]!==true) fail(`rule ${key} must be true`);
}
for(const field of ["id","scope","task_type","risk_tier","goal","expected_behavior","must_not_do","objective_evaluator","failure_modes","replay_tier","feedback_policy","usage_budget","usage_count","retired"]){
  if(!policy.required_task_fields.includes(field)) fail(`missing required task field ${field}`);
}
console.log("ROLLING_REPLAY_POLICY_OK");
