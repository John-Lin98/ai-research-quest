const stores = {
  facts: {
    fields: ["id", "statement", "attribution", "source_ref", "scope", "evidence_status", "updated_at"],
    statusField: "evidence_status",
    statuses: ["candidate", "confirmed", "verified"],
  },
  preferences: {
    fields: ["id", "preference", "scope", "priority", "status", "source", "updated_at"],
    statusField: "status",
    statuses: ["confirmed", "superseded"],
  },
  strategies: {
    fields: ["id", "context_pattern", "strategy", "scope", "evidence", "outcome", "cost", "do_not_repeat", "status", "updated_at"],
    statusField: "status",
    statuses: ["candidate", "verified", "superseded"],
  },
};

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;

// Accept an ISO calendar date or a timestamp with an explicit timezone.
// Check calendar components before Date.parse, which otherwise normalizes bad days.
function dateValue(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (!match) return NaN;
  const [, y, m, d, hour, minute, second, zone] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) return NaN;
  if (hour !== undefined && (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59)) return NaN;
  if (zone && zone !== "Z" && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) return NaN;
  return Date.parse(value);
}

/**
 * Validate one supplied JSON state without reading, writing, or changing it.
 * An empty error list proves structural conformance only, not source authenticity,
 * permission to reuse a scope, or acceptance by a persistent write controller.
 */
export function validateMemoryState(state) {
  const errors = [];
  if (!isRecord(state)) return ["state must be an object"];
  if (state.schema_version !== "1.0") errors.push("schema_version must be 1.0");
  const ids = new Set();

  for (const [store, contract] of Object.entries(stores)) {
    if (!Array.isArray(state[store])) {
      errors.push(`${store} must be an array`);
      continue;
    }
    for (const [index, entry] of state[store].entries()) {
      const location = `${store}[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${location} must be an object`);
        continue;
      }
      for (const field of contract.fields) {
        if (!isText(entry[field])) errors.push(`${location}.${field} must be a non-empty string`);
      }
      if (isText(entry.id)) {
        if (entry.id !== entry.id.trim()) errors.push(`${location}.id must not have surrounding whitespace`);
        if (ids.has(entry.id.trim())) errors.push(`${location}.id must be unique across all stores`);
        ids.add(entry.id.trim());
      }
      if (!contract.statuses.includes(entry[contract.statusField])) {
        errors.push(`${location}.${contract.statusField} has an invalid status`);
      }
      if (!Number.isFinite(dateValue(entry.updated_at))) {
        errors.push(`${location}.updated_at must be a valid ISO date or timezone-qualified timestamp`);
      }
      if (store === "facts") {
        for (const field of ["valid_from", "valid_until"]) {
          if (entry[field] !== undefined && entry[field] !== null && !Number.isFinite(dateValue(entry[field]))) {
            errors.push(`${location}.${field} must be null or a valid ISO date or timezone-qualified timestamp`);
          }
        }
        const from = dateValue(entry.valid_from);
        const until = dateValue(entry.valid_until);
        if (Number.isFinite(from) && Number.isFinite(until) && from > until) {
          errors.push(`${location}.valid_until must not precede valid_from`);
        }
      }
    }
  }
  return errors;
}
