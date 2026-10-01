#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const policy=JSON.parse(fs.readFileSync(path.resolve(here,"../references/promotion-policy.json"),"utf8"));

function fail(msg){ console.error("promotion-policy validation failed:",msg); process.exit(1); }

if(policy.schema_version!=="1.0") fail("schema_version must be 1.0");
if(policy.strategy!=="risk_tiered_non_inferiority") fail("wrong strategy");
if(policy.principles?.protected_zero_tolerance!==true) fail("protected_zero_tolerance must be true");
if(policy.principles?.personal_fit_cannot_offset_objective_regression!==true) fail("personal fit override must be forbidden");
if(policy.principles?.unspecified_margin_defaults_to_zero!==true) fail("unspecified margin must default to zero");
if(policy.principles?.promotion_requires_held_out_evidence!==true) fail("held-out evidence must be required");

for(const tier of ["critical","high","medium","low"]){
  if(!policy.tiers?.[tier]) fail(`missing tier ${tier}`);
}
if(policy.tiers.critical.margin_policy!=="zero") fail("critical tier must use zero margin");
if(policy.tiers.critical.human_approval!=="required_if_changed") fail("critical policy changes require human approval");

const required=["metric_id","risk_tier","direction","champion_value","challenger_value","margin","margin_source","held_out","decision"];
for(const field of required){
  if(!policy.required_metric_fields.includes(field)) fail(`missing metric field ${field}`);
}
for(const decision of ["pass","fail","insufficient_evidence"]){
  if(!policy.allowed_decisions.includes(decision)) fail(`missing decision ${decision}`);
}

console.log("RISK_TIERED_PROMOTION_POLICY_OK");
