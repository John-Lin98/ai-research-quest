import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  loadPromotionPolicy,
  validatePromotionPolicy,
  validatePromotionMetric,
  validateMutationPromotion,
} from "./validate-promotion-policy.mjs";

// All values below are SYNTHETIC validator inputs, not measured improvement evidence.
const policy = loadPromotionPolicy();
const fixture = JSON.parse(fs.readFileSync(fileURLToPath(
  new URL("../references/fixture-self-improvement.json", import.meta.url),
), "utf8"));
const syntheticMetric = (changes = {}) => ({
  metric_id: "synthetic-objective-example",
  risk_tier: "critical",
  direction: "higher_is_better",
  champion_value: 10,
  challenger_value: 10,
  margin: 0,
  margin_source: "synthetic test of existing critical zero-tolerance principle",
  held_out: true,
  decision: "pass",
  ...changes,
});
const accepted = (changes = {}) => ({
  ...structuredClone(fixture.candidate_mutations[0]),
  promotion_status: "accepted",
  ...changes,
});
const messages = result => result.join("; ");
const assertBlocked = mutation => {
  const errors = validateMutationPromotion(mutation, policy);
  assert.match(messages(errors), /approved, frozen executable.*contract is unavailable/);
  return errors;
};

test("existing approved policy and candidate fixture remain structurally valid", () => {
  assert.deepEqual(validatePromotionPolicy(policy), []);
  for (const candidate of fixture.candidate_mutations) {
    assert.equal(candidate.promotion_status, "candidate");
    assert.deepEqual(validateMutationPromotion(candidate, policy), []);
  }
});

test("malformed policy containers return validation errors without throwing", () => {
  for (const value of [null, undefined, [], false, "policy"]) {
    assert.ok(validatePromotionPolicy(value).length);
  }
  for (const field of ["tiers", "required_metric_fields", "allowed_decisions"]) {
    for (const value of [null, [], false, "pass"]) {
      assert.ok(validatePromotionPolicy({ ...policy, [field]: value }).length, `${field}: ${value}`);
    }
  }
});

test("every tier must retain its approved margin and human-approval policy", () => {
  for (const tier of ["critical", "high", "medium", "low"]) {
    for (const value of [null, [], true, "present", {}]) {
      const changed = structuredClone(policy);
      changed.tiers[tier] = value;
      assert.ok(validatePromotionPolicy(changed).length, `${tier}: ${value}`);
    }
    for (const field of ["margin_policy", "human_approval"]) {
      const changed = structuredClone(policy);
      changed.tiers[tier][field] = "challenger_may_override";
      assert.match(messages(validatePromotionPolicy(changed)), new RegExp(`tier ${tier} has invalid ${field}`));
    }
    for (const examples of [[], [""], ["privacy", "privacy"], [1]]) {
      const changed = structuredClone(policy);
      changed.tiers[tier].examples = examples;
      assert.ok(validatePromotionPolicy(changed).length);
    }
  }
  assert.match(messages(validatePromotionPolicy({ ...policy, tiers: { ...policy.tiers, unknown: {} } })), /unsupported tier/);
});

test("principles, metric fields and decisions cannot be silently relaxed", () => {
  for (const principle of Object.keys(policy.principles)) {
    const changed = structuredClone(policy);
    changed.principles[principle] = false;
    assert.ok(validatePromotionPolicy(changed).length);
  }
  for (const field of policy.required_metric_fields) {
    const changed = structuredClone(policy);
    changed.required_metric_fields = changed.required_metric_fields.filter(value => value !== field);
    assert.match(messages(validatePromotionPolicy(changed)), new RegExp(`missing metric field ${field}`));
  }
  for (const allowed_decisions of [["pass"], ["pass", "fail", "insufficient_evidence", "override"], ["pass", "pass", "fail", "insufficient_evidence"]]) {
    assert.ok(validatePromotionPolicy({ ...policy, allowed_decisions }).length);
  }
});

test("accepted mutation without evidence is blocked; proposed candidates are preserved", () => {
  assert.match(messages(assertBlocked(accepted())), /requires evaluation evidence/);
  for (const promotion_evidence of [null, [], "verified", {}, { metrics: [] }, { metrics: true }]) {
    assert.match(messages(assertBlocked(accepted({ promotion_evidence }))), /requires (evaluation evidence|non-empty held-out metrics)/);
  }
});

test("synthetic metric shape checks can succeed without permitting acceptance", () => {
  assert.deepEqual(validatePromotionMetric(syntheticMetric()), []);
  assertBlocked(accepted({
    promotion_evidence: { synthetic: true, metrics: [syntheticMetric()] },
  }));
});

test("decorated held-out, approval and frozen-rule claims cannot authorize promotion", () => {
  const mutation = accepted({
    held_out: true,
    approved: true,
    frozen: true,
    evidence_sufficient: true,
    metrics: [syntheticMetric()],
    objective_gates: "pass",
    promotion_evidence: {
      synthetic: false,
      held_out: true,
      sufficient: true,
      approved: true,
      frozen: true,
      sample_size: 1000000,
      confidence: 1,
      rules: { status: "approved", frozen: true, aggregation: "all-pass" },
      metrics: [syntheticMetric()],
    },
  });
  assertBlocked(mutation);
  assert.ok(validateMutationPromotion(mutation, {
    ...policy,
    evidence_contract: { approved: true, frozen: true, minimum_sample_size: 1 },
  }).length);
});

test("personal utility never offsets objective failure or insufficient evidence", () => {
  for (const decision of ["fail", "insufficient_evidence"]) {
    const errors = assertBlocked(accepted({
      personal_utility: Number.MAX_VALUE,
      personal_fit_can_override_hard_gates: true,
      promotion_evidence: { personal_utility_improves: true, metrics: [syntheticMetric({ decision })] },
    }));
    assert.match(messages(errors), /personal fit cannot override/);
    assert.match(messages(errors), decision === "fail" ? /FAIL cannot be offset/ : /insufficient_evidence prevents promotion/);
  }
});

test("critical regression and both metric directions cannot be hidden by pass labels", () => {
  for (const changes of [
    { challenger_value: 9 },
    { direction: "lower_is_better", challenger_value: 11 },
    { challenger_value: 9, margin: 1 },
  ]) {
    const metric = syntheticMetric(changes);
    const errors = validatePromotionMetric(metric);
    assert.match(messages(errors), /critical margin must be zero|regression exceeds/);
    assertBlocked(accepted({ promotion_evidence: { metrics: [metric] } }));
  }
});

test("missing, malformed and unverified margins never grant tolerance", () => {
  const missing = syntheticMetric({ challenger_value: 9 });
  delete missing.margin;
  assert.match(messages(validatePromotionMetric(missing)), /metric missing margin/);
  assert.match(messages(validatePromotionMetric(missing)), /regression exceeds/);
  for (const margin of [-1, null, "0", NaN, Infinity]) {
    assert.match(messages(validatePromotionMetric(syntheticMetric({ margin }))), /margin must be a finite non-negative number/);
  }
  for (const margin_source of [undefined, "", " ", {}, []]) {
    assert.match(messages(validatePromotionMetric(syntheticMetric({ margin_source }))), /margin_source must identify/);
  }
  for (const risk_tier of ["high", "medium"]) {
    const metric = syntheticMetric({ risk_tier, margin: 0.01, margin_source: "approved-by-challenger" });
    assert.match(messages(validatePromotionMetric(metric)), /approved margin source and scope are unavailable/);
    assertBlocked(accepted({ promotion_evidence: { metrics: [metric] } }));
  }
});

test("held-out flags, malformed metric values and unknown decisions fail closed", () => {
  for (const held_out of [undefined, false, "true", 1, {}, { verified: true }]) {
    assert.match(messages(validatePromotionMetric(syntheticMetric({ held_out }))), /requires held_out=true/);
  }
  for (const field of ["champion_value", "challenger_value"]) {
    for (const value of [null, "10", NaN, Infinity]) {
      assert.match(messages(validatePromotionMetric(syntheticMetric({ [field]: value }))), /must be a finite number/);
    }
  }
  for (const changes of [
    { risk_tier: "unknown" }, { risk_tier: ["critical"] },
    { risk_tier: { toString: null } }, { direction: "improves" }, { decision: "override" },
  ]) {
    assert.ok(validatePromotionMetric(syntheticMetric(changes)).length);
  }
  for (const metric of [null, [], "pass", true]) assert.ok(validatePromotionMetric(metric).length);
  const errors = assertBlocked(accepted({ promotion_evidence: { metrics: [syntheticMetric(), syntheticMetric()] } }));
  assert.match(messages(errors), /duplicate metric_id/);
});


test("self-improvement CLI rejects accepted fixtures through the integrated hook", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rq-promotion-synthetic-"));
  try {
    const scripts = path.join(root, "scripts");
    const references = path.join(root, "references");
    fs.mkdirSync(scripts);
    fs.mkdirSync(references);
    for (const name of ["validate-self-improvement.mjs", "validate-promotion-policy.mjs"]) {
      fs.copyFileSync(fileURLToPath(new URL(name, import.meta.url)), path.join(scripts, name));
    }
    fs.writeFileSync(path.join(references, "promotion-policy.json"), JSON.stringify(policy));
    for (const promotion_evidence of [undefined, {
      synthetic: true, held_out: true, approved: true, frozen: true,
      metrics: [syntheticMetric()],
    }]) {
      const input = structuredClone(fixture);
      input.candidate_mutations[0] = accepted({ promotion_evidence });
      fs.writeFileSync(path.join(references, "fixture-self-improvement.json"), JSON.stringify(input));
      const result = spawnSync(process.execPath, [path.join(scripts, "validate-self-improvement.mjs")], { encoding: "utf8" });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /mutation promotion blocked/);
      assert.match(result.stderr, /insufficient_evidence: accepted promotion is blocked/);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
