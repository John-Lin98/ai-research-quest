import { validateMemoryState } from "./memory-state-validator.mjs";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Static checks for the bundled public example and Skill constitution only.
 * These fixture requirements do not add required fields to arbitrary --state input
 * or implement freshness, conflict adjudication, retrieval, or compaction.
 */
export function validateMemoryFixture(state, skill) {
  const errors = validateMemoryState(state);
  if (errors.length) return errors;

  for (const [index, fact] of state.facts.entries()) {
    for (const field of ["temporal_type", "temporal_status", "observed_at", "last_verified_at"]) {
      if (!Object.hasOwn(fact, field)) errors.push(`facts[${index}].${field} is required in the fixture`);
    }
  }
  // The general validator checks declared enum values; only the fixture requires
  // these optional lifecycle fields to be present in every example record.
  for (const store of ["facts", "preferences", "strategies"]) {
    for (const [index, entry] of state[store].entries()) {
      if (!Object.hasOwn(entry, "storage_tier")) errors.push(`${store}[${index}].storage_tier is required in the fixture`);
    }
  }

  if (!Array.isArray(state.conflicts)) {
    errors.push("fixture conflicts must be an array");
  } else {
    for (const [index, conflict] of state.conflicts.entries()) {
      const location = `conflicts[${index}]`;
      if (!isRecord(conflict)) {
        errors.push(`${location} must be an object`);
        continue;
      }
      if (!["fact", "preference", "strategy"].includes(conflict.memory_type)) {
        errors.push(`${location}.memory_type has an invalid type`);
      }
      if (!["unresolved", "resolved", "superseded"].includes(conflict.conflict_status)) {
        errors.push(`${location}.conflict_status has an invalid status`);
      }
      if (!Array.isArray(conflict.entry_ids) || conflict.entry_ids.length < 2) {
        errors.push(`${location}.entry_ids requires at least two entries`);
      }
    }
  }

  if (!isRecord(state.memory_pack_contract)) {
    errors.push("fixture memory_pack_contract must be an object");
  } else {
    const pack = state.memory_pack_contract;
    if (!Array.isArray(pack.ranking_factors)) {
      errors.push("memory_pack_contract.ranking_factors must be an array");
    } else {
      for (const factor of ["relevance", "scope_match", "freshness", "evidence", "action_usefulness"]) {
        if (!pack.ranking_factors.includes(factor)) errors.push(`missing retrieval factor ${factor}`);
      }
    }
    if (pack.conflict_coverage !== true) errors.push("conflict coverage must be true");
    if (pack.minimal_sufficient !== true) errors.push("memory pack must be minimal sufficient");
  }

  if (typeof skill !== "string") {
    errors.push("SKILL must be text");
  } else {
    for (const phrase of ["Fact", "Preference", "Strategy", "Candidate → Confirmed → Verified", "Personal Memory Write Gate"]) {
      if (!skill.includes(phrase)) errors.push(`SKILL missing ${phrase}`);
    }
    for (const [phrase, diagnostic] of [
      ["Preference / Strategy 的跨项目复用是默认便利；Fact 的跨项目复用是受控晋升", "scope constitution missing"],
      ["Memory Freshness Constitution｜已批准 D-M1-C", "freshness constitution missing"],
      ["verify-on-use", "verify-on-use rule missing"],
      ["Memory Conflict Constitution｜已批准 D-M2-C", "conflict constitution missing"],
      ["Memory Portfolio Retrieval｜已批准 D-M3-C", "portfolio retrieval constitution missing"],
      ["Forgetting / Compaction Constitution｜已批准 D-M4-C", "forgetting constitution missing"],
    ]) {
      if (!skill.includes(phrase)) errors.push(diagnostic);
    }
  }
  if (/[A-Z]:\\|\/home\/|password|api[_-]?key|secret/i.test(JSON.stringify(state))) {
    errors.push("fixture appears to contain sensitive data");
  }
  // Public examples are illustrations, never evidence for a verified strategy.
  if (state.strategies.some((strategy) => strategy.status !== "candidate")) {
    errors.push("illustrative fixture strategies must remain candidate");
  }
  return errors;
}
