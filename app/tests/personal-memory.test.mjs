import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateMemoryState } from "../../skills/personal-memory/scripts/memory-state-validator.mjs";
import { validateMemoryFixture } from "../../skills/personal-memory/scripts/memory-fixture-validator.mjs";

const skillRoot = fileURLToPath(new URL("../../skills/personal-memory/", import.meta.url));
const cli = path.join(skillRoot, "scripts/validate-personal-memory.mjs");
const fixture = JSON.parse(readFileSync(path.join(skillRoot, "references/fixture-memory-state.json"), "utf8"));
const skillText = readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
const fresh = () => structuredClone(fixture);
const rejects = (state, field) => assert.ok(validateMemoryState(state).some((error) => error.includes(field)), field);
const required = {
  facts: ["id", "statement", "attribution", "source_ref", "scope", "memory_scope", "evidence_status", "updated_at"],
  preferences: ["id", "preference", "scope", "memory_scope", "priority", "status", "source", "updated_at"],
  strategies: ["id", "context_pattern", "strategy", "scope", "memory_scope", "evidence", "outcome", "cost", "do_not_repeat", "status", "updated_at"],
};

test("synthetic fixture is structurally valid and remains a candidate example", () => {
  assert.deepEqual(validateMemoryState(fixture), []);
  assert.equal(fixture.strategies[0].status, "candidate");
  assert.equal(fixture.strategies[0].memory_scope, "project");
  assert.equal(fixture.facts[0].memory_scope, "project");
  assert.equal(fixture.facts[0].promotion_reason, null);
  assert.equal(fixture.preferences[0].memory_scope, "user-global");
});

test("validation is pure and never fills in either scope field", () => {
  for (const missingField of [null, "scope", "memory_scope", "promotion_reason"]) {
    const state = fresh();
    if (missingField) delete state.facts[0][missingField];
    const before = structuredClone(state);
    for (const store of Object.keys(required)) {
      state[store].forEach(Object.freeze);
      Object.freeze(state[store]);
    }
    Object.freeze(state);
    if (missingField) rejects(state, `facts[0].${missingField}`);
    else assert.deepEqual(validateMemoryState(state), []);
    assert.deepEqual(state, before);
  }
});

test("rejects malformed roots, versions, stores, and entries without throwing", () => {
  for (const value of [null, undefined, [], "state", false, 1]) rejects(value, "state");
  for (const version of [undefined, null, "", 1, "2.0"]) {
    const state = fresh();
    state.schema_version = version;
    rejects(state, "schema_version");
  }
  for (const store of Object.keys(required)) {
    for (const value of [undefined, null, {}, "store", false, 1]) {
      const state = fresh();
      state[store] = value;
      rejects(state, store);
    }
    for (const value of [null, [], "entry", false, 1]) {
      const state = fresh();
      state[store] = [value];
      rejects(state, `${store}[0]`);
    }
  }
});

for (const [store, fields] of Object.entries(required)) {
  test(`${store} rejects missing, blank, null, and wrongly typed required fields`, () => {
    for (const field of fields) {
      const missing = fresh();
      delete missing[store][0][field];
      rejects(missing, `${store}[0].${field}`);
      for (const value of ["", " \n\t", null, 0, false, {}, []]) {
        const state = fresh();
        state[store][0][field] = value;
        rejects(state, `${store}[0].${field}`);
      }
    }
  });
}

test("rejects old status-only preference and strategy counterexamples", () => {
  const state = fresh();
  state.preferences = [{ status: "confirmed" }];
  state.strategies = [{ status: "verified" }];
  for (const field of ["preferences[0].preference", "preferences[0].source", "strategies[0].evidence", "strategies[0].outcome"]) {
    rejects(state, field);
  }
});

test("verified strategy requires evidence and outcome; this is only a synthetic shape test", () => {
  for (const memoryScope of ["project", "user-global"]) {
    const state = fresh();
    state.strategies[0].status = "verified";
    state.strategies[0].memory_scope = memoryScope;
    // Deliberately synthetic: conformance is not real execution evidence or promotion.
    assert.deepEqual(validateMemoryState(state), []);
    for (const field of ["evidence", "outcome"]) {
      for (const value of [undefined, null, "", "  ", {}, []]) {
        const invalid = structuredClone(state);
        invalid.strategies[0][field] = value;
        rejects(invalid, `strategies[0].${field}`);
      }
    }
  }
});

test("memory_scope is an explicit enum independent of free-text scope in every store", () => {
  for (const store of Object.keys(required)) {
    for (const value of ["global", "project-scoped", "USER-GLOBAL", " project", "user-global "]) {
      const state = fresh();
      state[store][0].memory_scope = value;
      rejects(state, `${store}[0].memory_scope`);
    }
    for (const memoryScope of ["project", "user-global"]) {
      const state = fresh();
      state[store][0].memory_scope = memoryScope;
      if (store === "facts") {
        state.facts[0].evidence_status = "verified";
        state.facts[0].promotion_reason = "Synthetic cross-project example only.";
      }
      if (store === "strategies") state.strategies[0].status = "verified";
      assert.deepEqual(validateMemoryState(state), []);
      delete state[store][0].scope;
      rejects(state, `${store}[0].scope`);
    }
  }
});

test("non-verified strategies cannot become user-global by changing memory_scope", () => {
  for (const status of ["candidate", "superseded"]) {
    const state = fresh();
    state.strategies[0].status = status;
    assert.deepEqual(validateMemoryState(state), []);
    state.strategies[0].memory_scope = "user-global";
    rejects(state, "strategies[0].memory_scope");
    assert.equal(state.strategies[0].status, status);
  }
});

test("project facts require a nullable promotion_reason without being promoted", () => {
  for (const status of ["candidate", "confirmed", "verified"]) {
    for (const reason of [null, "Synthetic project-only explanation."]) {
      const state = fresh();
      state.facts[0].evidence_status = status;
      state.facts[0].promotion_reason = reason;
      assert.deepEqual(validateMemoryState(state), []);
    }
  }
  const missing = fresh();
  delete missing.facts[0].promotion_reason;
  rejects(missing, "facts[0].promotion_reason");
  for (const reason of [undefined, "", " \n\t", false, 0, 1, {}, []]) {
    const state = fresh();
    state.facts[0].promotion_reason = reason;
    rejects(state, "facts[0].promotion_reason");
  }
});

test("user-global facts need verified status, textual promotion reason, and provenance dates", () => {
  const state = fresh();
  state.facts[0].memory_scope = "user-global";
  state.facts[0].evidence_status = "verified";
  state.facts[0].promotion_reason = "Synthetic cross-project example only.";
  assert.deepEqual(validateMemoryState(state), []);
  for (const status of ["candidate", "confirmed"]) {
    const invalid = structuredClone(state);
    invalid.facts[0].evidence_status = status;
    rejects(invalid, "facts[0].evidence_status");
    assert.equal(invalid.facts[0].evidence_status, status);
  }
  for (const reason of [undefined, null, "", " \n\t", false, 0, 1, {}, []]) {
    const invalid = structuredClone(state);
    invalid.facts[0].promotion_reason = reason;
    rejects(invalid, "facts[0].promotion_reason");
  }
  for (const field of ["attribution", "source_ref", "scope", "updated_at"]) {
    const invalid = structuredClone(state);
    delete invalid.facts[0][field];
    rejects(invalid, `facts[0].${field}`);
  }
  state.facts[0].updated_at = "2026-02-30";
  rejects(state, "facts[0].updated_at");
});

test("checks each store's status enum without changing evidence or lifecycle meanings", () => {
  const contracts = [
    ["facts", "evidence_status", ["candidate", "confirmed", "verified"]],
    ["preferences", "status", ["confirmed", "superseded"]],
    ["strategies", "status", ["candidate", "verified", "superseded"]],
  ];
  for (const [store, field, allowed] of contracts) {
    for (const value of [...allowed, "invalid", "revoked", "Verified"]) {
      const state = fresh();
      state[store][0][field] = value;
      if (allowed.includes(value)) assert.deepEqual(validateMemoryState(state), []);
      else rejects(state, `${store}[0].${field}`);
    }
  }
});

test("IDs are unique within and across stores", () => {
  for (const store of Object.keys(required)) {
    const state = fresh();
    state[store].push(structuredClone(state[store][0]));
    rejects(state, `${store}[${state[store].length - 1}].id`);
  }
  const state = fresh();
  state.strategies[0].id = state.facts[0].id;
  rejects(state, "strategies[0].id");
  state.strategies[0].id = ` ${state.facts[0].id} `;
  rejects(state, "strategies[0].id");
});

test("checks calendar dates and timezone-qualified timestamps in all stores", () => {
  const invalid = [
    "not-a-date", "2026-02-29", "2026-04-31", "2026-00-01", "2026-13-01", "2026-10-00",
    "2026-10-32", "1900-02-29", "2026-1-1", "2026-10-02T12:00:00", "2026-10-02T24:00:00Z",
    "2026-10-02T12:60:00Z", "2026-10-02T12:00:60Z", "2026-10-02T12:00:00+24:00",
    "2026-10-02T12:00:00+01:60", "2026-02-30T12:00:00Z", " 2026-10-02", 1790899200000,
    "2026-10-02T00:00:00.0009Z",
  ];
  const valid = ["2024-02-29", "2000-02-29", "2026-10-02", "2026-10-02T12:00:00Z", "2026-10-02T12:00:00.123+08:00"];
  for (const store of Object.keys(required)) {
    for (const value of invalid) {
      const state = fresh();
      state[store][0].updated_at = value;
      rejects(state, `${store}[0].updated_at`);
    }
    for (const value of valid) {
      const state = fresh();
      state[store][0].updated_at = value;
      assert.deepEqual(validateMemoryState(state), [], String(value));
    }
  }
});

test("optional fact validity bounds must be valid and correctly ordered", () => {
  for (const field of ["valid_from", "valid_until"]) {
    for (const value of ["", false, 1, {}, [], "2026-02-30"]) {
      const state = fresh();
      state.facts[0][field] = value;
      rejects(state, `facts[0].${field}`);
    }
    for (const value of [undefined, null, "2026-10-02"]) {
      const state = fresh();
      state.facts[0][field] = value;
      assert.deepEqual(validateMemoryState(state), []);
    }
  }
  const state = fresh();
  state.facts[0].valid_from = "2026-10-03";
  state.facts[0].valid_until = "2026-10-02";
  rejects(state, "valid_until must not precede valid_from");
  state.facts[0].valid_from = "2026-10-02T08:00:00+08:00";
  state.facts[0].valid_until = "2026-10-02T00:00:00Z";
  assert.deepEqual(validateMemoryState(state), []);
  // Reject finer precision rather than silently rounding reversed bounds to equality.
  state.facts[0].valid_from = "2026-10-02T00:00:00.0009Z";
  state.facts[0].valid_until = "2026-10-02T00:00:00.0001Z";
  rejects(state, "facts[0].valid_from");
  rejects(state, "facts[0].valid_until");
});

test("diagnostics identify fields without echoing supplied values", () => {
  const state = fresh();
  state.facts[0].id = "synthetic-sensitive-value";
  state.preferences[0].id = state.facts[0].id;
  state.strategies[0].status = state.facts[0].id;
  state.facts[0].memory_scope = state.facts[0].id;
  state.facts[0].promotion_reason = { private: state.facts[0].id };
  const errors = validateMemoryState(state);
  assert.ok(errors.length > 0);
  assert.ok(!errors.join(" ").includes(state.facts[0].id));
});

test("CLI retains no-argument fixture check and validates explicitly supplied JSON", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "personal-memory-contract-"));
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd: dir, encoding: "utf8" });
  try {
    const defaultResult = run();
    assert.equal(defaultResult.status, 0, defaultResult.stderr);
    assert.match(defaultResult.stdout, /PERSONAL_MEMORY_CONTRACT_OK/);
    const input = path.join(dir, "synthetic-state.json");
    writeFileSync(input, JSON.stringify(fresh()));
    const before = readFileSync(input, "utf8");
    const valid = run("--state", "synthetic-state.json");
    assert.equal(valid.status, 0, valid.stderr);
    assert.match(valid.stdout, /PERSONAL_MEMORY_STATE_SHAPE_OK/);
    assert.equal(readFileSync(input, "utf8"), before);
    const invalid = fresh();
    invalid.preferences = [{ status: "confirmed" }];
    writeFileSync(input, JSON.stringify(invalid));
    assert.equal(run("--state", input).status, 1);
    const invalidScope = fresh();
    invalidScope.strategies[0].memory_scope = "user-global";
    invalidScope.facts[0].memory_scope = "user-global";
    writeFileSync(input, JSON.stringify(invalidScope));
    const scopeBefore = readFileSync(input, "utf8");
    const rejectedScope = run("--state", input);
    assert.equal(rejectedScope.status, 1);
    assert.match(rejectedScope.stderr, /strategies\[0\]\.memory_scope/);
    assert.match(rejectedScope.stderr, /facts\[0\]\.promotion_reason/);
    assert.ok(!rejectedScope.stderr.includes(input));
    assert.equal(readFileSync(input, "utf8"), scopeBefore);
    writeFileSync(input, "not json synthetic content");
    const malformed = run("--state", input);
    assert.equal(malformed.status, 1);
    assert.ok(!malformed.stderr.includes(input));
    assert.ok(!malformed.stderr.includes("not json synthetic content"));
    assert.equal(run("--state", "does-not-exist.json").status, 1);
    assert.equal(run("--state").status, 1);
    assert.equal(run("--unknown", input).status, 1);
    assert.equal(run("--state", input, "extra").status, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("fixture CLI preserves the upstream Scope B constitution check", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "personal-memory-scope-"));
  try {
    cpSync(skillRoot, dir, { recursive: true });
    const skillPath = path.join(dir, "SKILL.md");
    const skill = readFileSync(skillPath, "utf8");
    writeFileSync(skillPath, skill.replace("Preference / Strategy 的跨项目复用是默认便利；Fact 的跨项目复用是受控晋升", ""));
    const result = spawnSync(process.execPath, [path.join(dir, "scripts/validate-personal-memory.mjs")], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /scope constitution missing/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("public fixture CLI refuses to present synthetic strategies as verified", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "personal-memory-fixture-"));
  try {
    cpSync(skillRoot, dir, { recursive: true });
    const state = fresh();
    state.strategies[0].status = "verified";
    writeFileSync(path.join(dir, "references/fixture-memory-state.json"), JSON.stringify(state));
    const result = spawnSync(process.execPath, [path.join(dir, "scripts/validate-personal-memory.mjs")], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /illustrative fixture strategies must remain candidate/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

const fixtureRejects = (state, field) => assert.ok(validateMemoryFixture(state, skillText).some((error) => error.includes(field)), field);
const temporalEnums = {
  temporal_type: ["stable", "slow-changing", "dynamic", "version-bound", "event-bound", "external-current"],
  temporal_status: ["active", "stale", "needs-revalidation", "superseded", "archived"],
};
const tiers = ["hot", "warm", "archive"];
const legacyState = () => {
  const state = fresh();
  for (const store of Object.keys(required)) {
    for (const entry of state[store]) {
      for (const field of Object.keys(entry)) {
        if (!required[store].includes(field) && !(store === "facts" && ["promotion_reason", "valid_from", "valid_until"].includes(field))) {
          delete entry[field];
        }
      }
    }
  }
  delete state.conflicts;
  delete state.memory_pack_contract;
  return state;
};

test("legacy arbitrary state without governance extensions remains valid without defaults", () => {
  const state = legacyState();
  const before = structuredClone(state);
  const freeze = (value) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
  };
  freeze(state);
  assert.deepEqual(validateMemoryState(state), []);
  assert.deepEqual(state, before);
  fixtureRejects(state, "temporal_type");
  fixtureRejects(state, "storage_tier");
  fixtureRejects(state, "conflicts");
  fixtureRejects(state, "memory_pack_contract");
});

test("declared optional temporal and storage enums are checked without coupling evidence or lifecycle", () => {
  for (const [field, values] of Object.entries(temporalEnums)) {
    for (const value of [...values, undefined, null, "", "invalid", "ACTIVE", 0, false, {}, []]) {
      const state = legacyState();
      state.facts[0][field] = value;
      if (values.includes(value)) assert.deepEqual(validateMemoryState(state), []);
      else rejects(state, `facts[0].${field}`);
    }
  }
  for (const store of Object.keys(required)) {
    for (const value of [...tiers, undefined, null, "", "archived", "Hot", 0, false, {}, []]) {
      const state = legacyState();
      state[store][0].storage_tier = value;
      if (tiers.includes(value)) assert.deepEqual(validateMemoryState(state), []);
      else rejects(state, `${store}[0].storage_tier`);
    }
  }
  for (const evidenceStatus of ["candidate", "confirmed", "verified"]) {
    for (const temporalStatus of temporalEnums.temporal_status) {
      const state = fresh();
      state.facts[0].evidence_status = evidenceStatus;
      state.facts[0].temporal_status = temporalStatus;
      const before = structuredClone(state);
      assert.deepEqual(validateMemoryState(state), []);
      assert.deepEqual(state, before);
    }
  }
});

test("fixture retains every upstream required temporal field and storage-tier guard", () => {
  assert.deepEqual(validateMemoryFixture(fixture, skillText), []);
  for (const field of ["temporal_type", "temporal_status", "observed_at", "last_verified_at"]) {
    const state = fresh();
    delete state.facts[0][field];
    assert.deepEqual(validateMemoryState(state), []);
    fixtureRejects(state, `facts[0].${field}`);
  }
  for (const [field, values] of Object.entries(temporalEnums)) {
    for (const value of [...values, null, "invalid", 0, {}, []]) {
      const state = fresh();
      state.facts[0][field] = value;
      if (values.includes(value)) assert.deepEqual(validateMemoryFixture(state, skillText), []);
      else fixtureRejects(state, `facts[0].${field}`);
    }
  }
  for (const store of Object.keys(required)) {
    const missing = fresh();
    delete missing[store][0].storage_tier;
    assert.deepEqual(validateMemoryState(missing), []);
    fixtureRejects(missing, `${store}[0].storage_tier`);
    for (const value of [...tiers, null, "invalid", 0, {}, []]) {
      const state = fresh();
      state[store][0].storage_tier = value;
      if (tiers.includes(value)) assert.deepEqual(validateMemoryFixture(state, skillText), []);
      else fixtureRejects(state, `${store}[0].storage_tier`);
    }
  }
});

test("fixture retains conflict-store, type, status, and two-entry static checks safely", () => {
  for (const value of [undefined, null, {}, "conflicts", false, 1]) {
    const state = fresh();
    state.conflicts = value;
    fixtureRejects(state, "conflicts");
  }
  for (const value of [null, [], "entry", false, 1]) {
    const state = fresh();
    state.conflicts = [value];
    fixtureRejects(state, "conflicts[0]");
  }
  for (const [field, allowed] of [
    ["memory_type", ["fact", "preference", "strategy"]],
    ["conflict_status", ["unresolved", "resolved", "superseded"]],
  ]) {
    for (const value of [...allowed, undefined, null, "", "invalid", 0, {}, []]) {
      const state = fresh();
      state.conflicts[0][field] = value;
      if (allowed.includes(value)) assert.deepEqual(validateMemoryFixture(state, skillText), []);
      else fixtureRejects(state, `conflicts[0].${field}`);
    }
  }
  for (const value of [undefined, null, "two entries", {}, 2, [], ["one-entry"]]) {
    const state = fresh();
    state.conflicts[0].entry_ids = value;
    fixtureRejects(state, "conflicts[0].entry_ids");
  }
  const empty = fresh();
  empty.conflicts = [];
  assert.deepEqual(validateMemoryFixture(empty, skillText), []);
});

test("fixture retains all five ranking factors and both exact-true retrieval flags", () => {
  for (const value of [undefined, null, [], false, 1, "pack"]) {
    const state = fresh();
    state.memory_pack_contract = value;
    fixtureRejects(state, "memory_pack_contract");
  }
  for (const value of [undefined, null, {}, false, 1, fixture.memory_pack_contract.ranking_factors.join(" ")]) {
    const state = fresh();
    state.memory_pack_contract.ranking_factors = value;
    fixtureRejects(state, "ranking_factors");
  }
  for (const factor of ["relevance", "scope_match", "freshness", "evidence", "action_usefulness"]) {
    const state = fresh();
    state.memory_pack_contract.ranking_factors = state.memory_pack_contract.ranking_factors.filter((value) => value !== factor);
    fixtureRejects(state, `missing retrieval factor ${factor}`);
  }
  for (const [flag, diagnostic] of [["conflict_coverage", "conflict coverage"], ["minimal_sufficient", "minimal sufficient"]]) {
    for (const value of [undefined, null, false, 0, 1, "true", {}, []]) {
      const state = fresh();
      state.memory_pack_contract[flag] = value;
      fixtureRejects(state, diagnostic);
    }
  }
});

test("fixture retains the complete constitution and public-data scan without leaking values", () => {
  for (const [phrase, diagnostic] of [
    ["Fact", "SKILL missing Fact"],
    ["Preference", "SKILL missing Preference"],
    ["Strategy", "SKILL missing Strategy"],
    ["Candidate → Confirmed → Verified", "SKILL missing Candidate → Confirmed → Verified"],
    ["Personal Memory Write Gate", "SKILL missing Personal Memory Write Gate"],
    ["Preference / Strategy 的跨项目复用是默认便利；Fact 的跨项目复用是受控晋升", "scope constitution missing"],
    ["Memory Freshness Constitution｜已批准 D-M1-C", "freshness constitution missing"],
    ["verify-on-use", "verify-on-use rule missing"],
    ["Memory Conflict Constitution｜已批准 D-M2-C", "conflict constitution missing"],
    ["Memory Portfolio Retrieval｜已批准 D-M3-C", "portfolio retrieval constitution missing"],
    ["Forgetting / Compaction Constitution｜已批准 D-M4-C", "forgetting constitution missing"],
  ]) {
    const errors = validateMemoryFixture(fixture, skillText.replaceAll(phrase, ""));
    assert.ok(errors.includes(diagnostic), diagnostic);
  }
  for (const value of ["C:\\synthetic", ["", "home", "synthetic"].join("/"), "password-demo", "api_key-demo", "api-key-demo", "secret-demo"]) {
    const state = fresh();
    state.facts[0].statement = value;
    const errors = validateMemoryFixture(state, skillText);
    assert.ok(errors.includes("fixture appears to contain sensitive data"));
    assert.ok(!errors.join(" ").includes(value));
  }
  const state = fresh();
  state.facts[0].temporal_status = "synthetic-sensitive-value";
  const errors = validateMemoryFixture(state, skillText);
  assert.ok(errors.some((error) => error.includes("temporal_status")));
  assert.ok(!errors.join(" ").includes("synthetic-sensitive-value"));
});

test("synthetic conflict references are coherent without inventing a state reference-integrity rule", () => {
  for (const conflict of fixture.conflicts) {
    const store = { fact: "facts", preference: "preferences", strategy: "strategies" }[conflict.memory_type];
    const ids = new Set(fixture[store].map((entry) => entry.id));
    assert.ok(conflict.entry_ids.every((id) => ids.has(id)));
    assert.equal(new Set(conflict.entry_ids).size, conflict.entry_ids.length);
  }
  const state = legacyState();
  state.conflicts = [{ entry_ids: ["absent-a", "absent-b"] }];
  state.memory_pack_contract = {};
  const before = structuredClone(state);
  // Unknown governance semantics are not certified or newly rejected by --state.
  assert.deepEqual(validateMemoryState(state), []);
  assert.deepEqual(state, before);
});

test("fixture validation is pure, and temporal timestamps retain their presence-only boundary", () => {
  const state = fresh();
  state.facts[0].observed_at = null;
  state.facts[0].last_verified_at = null;
  const before = structuredClone(state);
  const freeze = (value) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
  };
  freeze(state);
  assert.deepEqual(validateMemoryFixture(state, skillText), []);
  assert.deepEqual(state, before);
});

test("CLI separates strict fixture governance from read-only legacy state acceptance", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "personal-memory-governance-"));
  try {
    cpSync(skillRoot, dir, { recursive: true });
    const copyCli = path.join(dir, "scripts/validate-personal-memory.mjs");
    const fixturePath = path.join(dir, "references/fixture-memory-state.json");
    const statePath = path.join(dir, "legacy-state.json");
    const run = (...args) => spawnSync(process.execPath, [copyCli, ...args], { encoding: "utf8" });
    const legacy = legacyState();
    writeFileSync(fixturePath, JSON.stringify(legacy));
    const rejected = run();
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /temporal_type/);
    assert.match(rejected.stderr, /storage_tier/);
    assert.match(rejected.stderr, /conflicts/);
    assert.match(rejected.stderr, /memory_pack_contract/);
    assert.ok(!rejected.stderr.includes(fixturePath));
    writeFileSync(statePath, JSON.stringify(legacy));
    const before = readFileSync(statePath, "utf8");
    rmSync(path.join(dir, "SKILL.md"));
    const accepted = run("--state", statePath);
    assert.equal(accepted.status, 0, accepted.stderr);
    assert.match(accepted.stdout, /PERSONAL_MEMORY_STATE_SHAPE_OK/);
    assert.equal(readFileSync(statePath, "utf8"), before);
    legacy.facts[0].storage_tier = "synthetic-sensitive-value";
    writeFileSync(statePath, JSON.stringify(legacy));
    const invalidBefore = readFileSync(statePath, "utf8");
    const invalid = run("--state", statePath);
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /storage_tier/);
    assert.ok(!invalid.stderr.includes("synthetic-sensitive-value"));
    assert.ok(!invalid.stderr.includes(statePath));
    assert.equal(readFileSync(statePath, "utf8"), invalidBefore);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
