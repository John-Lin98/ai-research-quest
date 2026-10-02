// Boundary validation for the existing v1 feedback shape, not anonymization.
// These are the existing public-export/ledger privacy blockers. Passing them
// cannot establish that an arbitrary semantic label contains no private facts.
const PUBLIC_EXPORT_BLOCKERS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\b[A-Z]:\\|\/(?:home|users|root|etc|var|data\d*|mnt)\/)/i,
  /\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]{10,}|AIza[A-Za-z0-9_-]{10,})\b/i,
  /\b(?:api[_-]?key|access[_-]?token|token|secret|password|passwd)\s*[:=]\s*\S+/i,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
];
// Match the existing public Demo's user-text export limit.
const MAX_PUBLIC_TEXT_LENGTH = 1_000;
const SIGNAL_FIELDS = ["pattern_key", "event_type", "impact", "proposed_change_scope"];
const BUNDLE_FIELDS = ["schema_version", "source_bucket", "created_at", "signal_count", "skipped_count", "signals"];

function reject(field, reason) {
  // Never reflect rejected content into a public artifact or diagnostic.
  throw new Error(`global feedback validation failed: ${field} ${reason}`);
}

export function assertObject(value, field) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    reject(field, "must be an object");
  }
}

function assertFields(value, fields, field) {
  assertObject(value, field);
  if (Object.keys(value).length !== fields.length || fields.some(key => !Object.hasOwn(value, key))) {
    reject(field, "has missing or unexpected fields");
  }
}

export function assertPublicFeedbackText(value, field) {
  if (typeof value !== "string" || !value.trim() || value.length > MAX_PUBLIC_TEXT_LENGTH) {
    reject(field, "must be non-empty text within the public export limit");
  }
  if (PUBLIC_EXPORT_BLOCKERS.some(pattern => pattern.test(value))) {
    reject(field, "contains blocked personal, path or credential-like content");
  }
}

export function assertSourceBucket(value) {
  assertPublicFeedbackText(value, "source_bucket");
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(value)) {
    reject("source_bucket", "must use the existing opaque identifier format");
  }
}

export function assertFeedbackSignal(signal) {
  assertFields(signal, SIGNAL_FIELDS, "signal");
  for (const field of ["pattern_key", "event_type", "impact"]) {
    assertPublicFeedbackText(signal[field], field);
  }
  if (signal.pattern_key.startsWith("coarse:")) reject("pattern_key", "must be explicit");
  if (!Array.isArray(signal.proposed_change_scope)) reject("proposed_change_scope", "must be an array");
  for (const scope of signal.proposed_change_scope) {
    assertPublicFeedbackText(scope, "proposed_change_scope entry");
  }
}

export function assertFeedbackBundle(bundle) {
  assertFields(bundle, BUNDLE_FIELDS, "bundle");
  if (bundle.schema_version !== "1.0") reject("schema_version", "must be 1.0");
  assertSourceBucket(bundle.source_bucket);
  if (typeof bundle.created_at !== "string" || !Number.isFinite(Date.parse(bundle.created_at)) ||
      new Date(bundle.created_at).toISOString() !== bundle.created_at) {
    reject("created_at", "must be an ISO timestamp");
  }
  if (!Array.isArray(bundle.signals)) reject("signals", "must be an array");
  for (const field of ["signal_count", "skipped_count"]) {
    if (!Number.isSafeInteger(bundle[field]) || bundle[field] < 0) reject(field, "must be a nonnegative safe integer");
  }
  if (bundle.signal_count !== bundle.signals.length) reject("signal_count", "must match signals");
  for (const signal of bundle.signals) assertFeedbackSignal(signal);
}
