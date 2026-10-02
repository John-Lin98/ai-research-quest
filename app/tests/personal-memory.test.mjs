import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateMemoryState } from "../../skills/personal-memory/scripts/memory-state-validator.mjs";

const skillRoot = fileURLToPath(new URL("../../skills/personal-memory/", import.meta.url));
const cli = path.join(skillRoot, "scripts/validate-personal-memory.mjs");
const fixture = JSON.parse(readFileSync(path.join(skillRoot, "references/fixture-memory-state.json"), "utf8"));
const fresh = () => structuredClone(fixture);
const rejects = (state, field) => assert.ok(validateMemoryState(state).some((error) => error.includes(field)), field);
const required = {
  facts: ["id", "statement", "attribution", "source_ref", "scope", "evidence_status", "updated_at"],
  preferences: ["id", "preference", "scope", "priority", "status", "source", "updated_at"],
  strategies: ["id", "context_pattern", "strategy", "scope", "evidence", "outcome", "cost", "do_not_repeat", "status", "updated_at"],
};

test("synthetic fixture is structurally valid and remains a candidate example", () => {
  assert.deepEqual(validateMemoryState(fixture), []);
  assert.equal(fixture.strategies[0].status, "candidate");
});

test("validation is pure and never fills in missing scope", () => {
  const state = fresh();
  delete state.strategies[0].scope;
  const before = structuredClone(state);
  for (const store of Object.keys(required)) {
    state[store].forEach(Object.freeze);
    Object.freeze(state[store]);
  }
  Object.freeze(state);
  rejects(state, "strategies[0].scope");
  assert.deepEqual(state, before);
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
  const state = fresh();
  state.strategies[0].status = "verified";
  // Deliberately synthetic: conformance is not real execution evidence or promotion.
  assert.deepEqual(validateMemoryState(state), []);
  for (const field of ["evidence", "outcome"]) {
    for (const value of [undefined, null, "", "  ", {}, []]) {
      const invalid = structuredClone(state);
      invalid.strategies[0][field] = value;
      rejects(invalid, `strategies[0].${field}`);
    }
  }
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
    rejects(state, `${store}[1].id`);
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
