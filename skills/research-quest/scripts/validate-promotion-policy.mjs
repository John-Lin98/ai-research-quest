#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const policyPath = path.resolve(here, "../references/promotion-policy.json");
const requiredMetricFields = [
  "metric_id", "risk_tier", "direction", "champion_value", "challenger_value",
  "margin", "margin_source", "held_out", "decision",
];
const decisions = ["pass", "fail", "insufficient_evidence"];
const tierContracts = {
  critical: ["zero", "required_if_changed"],
  high: ["explicit_small_non_inferiority_margin_required", "required_for_margin_change"],
  medium: ["explicit_non_inferiority_margin_required", "not_required_if_within_approved_policy"],
  low: ["utility_optimization_after_objective_gates", "not_required_if_within_approved_policy"],
};
const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = value => typeof value === "string" && value.trim().length > 0;
const isStringList = value => Array.isArray(value) && value.length > 0
  && value.every(isText) && new Set(value).size === value.length;
const hasOwn = (value, key) => Object.hasOwn(value, key);

export function loadPromotionPolicy() {
  return JSON.parse(fs.readFileSync(policyPath, "utf8"));
}

// This validates the approved policy's structure, not the existence of evidence.
export function validatePromotionPolicy(policy) {
  const errors = [];
  if (!isRecord(policy)) return ["policy must be an object"];
  if (policy.schema_version !== "1.0") errors.push("schema_version must be 1.0");
  if (policy.strategy !== "risk_tiered_non_inferiority") errors.push("wrong strategy");
  for (const principle of [
    "protected_zero_tolerance",
    "personal_fit_cannot_offset_objective_regression",
    "unspecified_margin_defaults_to_zero",
    "promotion_requires_held_out_evidence",
  ]) {
    if (policy.principles?.[principle] !== true) errors.push(`${principle} must be true`);
  }
  if (!isRecord(policy.tiers)) errors.push("tiers must be an object");
  for (const [name, [marginPolicy, humanApproval]] of Object.entries(tierContracts)) {
    const tier = policy.tiers?.[name];
    if (!isRecord(tier)) {
      errors.push(`tier ${name} must be an object`);
      continue;
    }
    if (tier.margin_policy !== marginPolicy) errors.push(`tier ${name} has invalid margin_policy`);
    if (tier.human_approval !== humanApproval) errors.push(`tier ${name} has invalid human_approval`);
    if (!isStringList(tier.examples)) errors.push(`tier ${name} examples must be unique non-empty strings`);
  }
  if (isRecord(policy.tiers)) {
    for (const name of Object.keys(policy.tiers)) {
      if (!hasOwn(tierContracts, name)) errors.push(`unsupported tier ${name}`);
    }
  }
  if (!isStringList(policy.required_metric_fields)) {
    errors.push("required_metric_fields must be unique non-empty strings");
  }
  for (const field of requiredMetricFields) {
    if (!Array.isArray(policy.required_metric_fields) || !policy.required_metric_fields.includes(field)) {
      errors.push(`missing metric field ${field}`);
    }
  }
  if (!isStringList(policy.allowed_decisions)
    || decisions.some(decision => !policy.allowed_decisions.includes(decision))
    || policy.allowed_decisions.some(decision => !decisions.includes(decision))) {
    errors.push("allowed_decisions must contain only pass, fail, and insufficient_evidence");
  }
  return errors;
}

// Necessary checks only. A structurally valid metric is never a promotion approval.
// Direction spellings below are diagnostic inputs, not a frozen evaluator contract.
export function validatePromotionMetric(metric) {
  if (!isRecord(metric)) return ["metric must be an object"];
  const errors = [];
  for (const field of requiredMetricFields) {
    if (!hasOwn(metric, field)) errors.push(`metric missing ${field}`);
  }
  if (!isText(metric.metric_id)) errors.push("metric_id must be non-empty text");
  if (typeof metric.risk_tier !== "string" || !hasOwn(tierContracts, metric.risk_tier)) {
    errors.push("metric has invalid risk_tier");
  }
  const directionValid = ["higher_is_better", "lower_is_better"].includes(metric.direction);
  if (!directionValid) errors.push("metric direction must be higher_is_better or lower_is_better");
  for (const field of ["champion_value", "challenger_value"]) {
    if (!Number.isFinite(metric[field])) errors.push(`${field} must be a finite number`);
  }
  // An omitted margin never grants tolerance, even when the record is malformed.
  const margin = hasOwn(metric, "margin") ? metric.margin : 0;
  const marginValid = Number.isFinite(margin) && margin >= 0;
  if (!marginValid) errors.push("margin must be a finite non-negative number");
  if (metric.risk_tier === "critical" && margin !== 0) errors.push("critical margin must be zero");
  if (!isText(metric.margin_source)) errors.push("margin_source must identify a predeclared source and scope");
  if (marginValid && margin > 0) {
    errors.push("nonzero margin cannot be verified: approved margin source and scope are unavailable");
  }
  if (metric.held_out !== true) errors.push("insufficient_evidence: metric requires held_out=true");
  if (!decisions.includes(metric.decision)) errors.push("metric has invalid decision");
  if (metric.decision === "fail") errors.push("objective metric FAIL cannot be offset by personal utility");
  if (metric.decision === "insufficient_evidence") errors.push("insufficient_evidence prevents promotion");
  if (metric.risk_tier !== "low" && directionValid && marginValid
    && Number.isFinite(metric.champion_value) && Number.isFinite(metric.challenger_value)) {
    const regression = metric.direction === "higher_is_better"
      ? metric.champion_value - metric.challenger_value
      : metric.challenger_value - metric.champion_value;
    if (regression > margin) errors.push("objective regression exceeds the declared margin; decision cannot be pass");
  }
  return errors;
}

export function validateMutationPromotion(mutation, policy = loadPromotionPolicy()) {
  if (!isRecord(mutation)) return ["mutation must be an object"];
  if (mutation.promotion_status !== "accepted") return [];
  const errors = validatePromotionPolicy(policy);
  if (mutation.personal_fit_can_override_hard_gates === true) {
    errors.push("personal fit cannot override objective hard gates");
  }
  const evidence = mutation.promotion_evidence;
  if (!isRecord(evidence)) {
    errors.push("insufficient_evidence: accepted mutation requires evaluation evidence");
  } else if (!Array.isArray(evidence.metrics) || evidence.metrics.length === 0) {
    errors.push("insufficient_evidence: accepted mutation requires non-empty held-out metrics");
  } else {
    const ids = new Set();
    evidence.metrics.forEach((metric, index) => {
      errors.push(...validatePromotionMetric(metric).map(error => `metric[${index}]: ${error}`));
      if (isText(metric?.metric_id)) {
        if (ids.has(metric.metric_id)) errors.push(`duplicate metric_id ${metric.metric_id}`);
        ids.add(metric.metric_id);
      }
    });
  }
  // The current policy leaves sufficiency, uncertainty and metric aggregation open.
  // Neither mutation-supplied flags nor synthetic test data can freeze those rules.
  // Replace this blocker only after a separately approved executable contract exists.
  errors.push("insufficient_evidence: accepted promotion is blocked because an approved, frozen executable evidence-sufficiency and aggregation contract is unavailable");
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const errors = validatePromotionPolicy(loadPromotionPolicy());
    if (errors.length) throw new Error(errors.join("; "));
    console.log("RISK_TIERED_PROMOTION_POLICY_OK");
  } catch (error) {
    console.error("promotion-policy validation failed:", error.message);
    process.exitCode = 1;
  }
}
