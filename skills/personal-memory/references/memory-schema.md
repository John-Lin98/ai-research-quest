# Personal Memory Schema

The examples below include both the existing required snapshot fields and governance extensions. See **Executable state contract** for the exact arbitrary-state boundary and **Public fixture contract** for the stricter bundled example checks. Governance policy approval does not make every example field mandatory in existing snapshots.

## Fact

```yaml
id:
statement:
attribution:
source_ref:
scope:
memory_scope: project | user-global
evidence_status: candidate | confirmed | verified
temporal_type: stable | slow-changing | dynamic | version-bound | event-bound | external-current
temporal_status: active | stale | needs-revalidation | superseded | archived
valid_from:
valid_until:
observed_at:
last_verified_at:
stale_after:
bound_version:
superseded_by:
updated_at:
promotion_reason:
```

## Preference

```yaml
id:
preference:
scope:
memory_scope: user-global | project
priority:
status: confirmed | superseded
source:
updated_at:
```

## Strategy

```yaml
id:
context_pattern:
memory_scope: user-global | project
strategy:
scope:
evidence:
outcome:
cost:
do_not_repeat:
status: candidate | verified | superseded
updated_at:
```

## Conflict

```yaml
id:
memory_type:
entry_ids:
conflict:
conflict_status: unresolved | resolved | superseded
resolution_status:
resolution_evidence:
updated_at:
```

## Rules

- Fact evidence cannot be upgraded by repetition alone.
- Preference is authoritative only for the user's own preference and stated scope.
- Strategy requires outcome evidence.
- Superseded entries retain provenance rather than disappearing silently.
- Retrieval should be goal-scoped and minimal.

## Scope Rules｜Approved Scope B

These are creation/controller policy defaults, not defaults supplied by validation:

- Preference defaults to `user-global` unless the user explicitly limits it to a project/domain.
- Verified Strategy defaults to `user-global`; an explicit project restriction may retain `project`. All non-verified Strategy, including `candidate` and `superseded`, remains `project`.
- Fact defaults to `project`.
- A Fact may be promoted to `user-global` only when it is Verified, cross-project useful, fresh enough, provenance-complete, non-sensitive, and has an explicit `promotion_reason`. Promotion must be auditable and reversible; `valid_until` or a freshness policy is required when appropriate.
- Scope promotion never upgrades evidence status by itself.

The semantic usefulness, freshness policy, sensitivity, and promotion audit/rollback requirements belong to the read/write controller. Structural validation does not establish that they have been satisfied.

## Executable state contract

`scripts/memory-state-validator.mjs` exports the pure `validateMemoryState(state)` function. It returns field-level errors and never reads, writes, or modifies a store or mutates the supplied state. A state has `schema_version: "1.0"` and the `facts`, `preferences`, and `strategies` arrays.

The existing required non-empty string fields remain:

- Fact: `id`, `statement`, `attribution`, `source_ref`, `scope`, `memory_scope`, `evidence_status`, `updated_at`.
- Preference: `id`, `preference`, `scope`, `memory_scope`, `priority`, `status`, `source`, `updated_at`.
- Strategy: `id`, `context_pattern`, `strategy`, `scope`, `memory_scope`, `evidence`, `outcome`, `cost`, `do_not_repeat`, `status`, `updated_at`.

IDs must be unique across these three stores, without surrounding whitespace. Status values use the enums above.

- Every entry requires an explicit, non-empty free-text `scope` describing its applicability and a separate `memory_scope` enum of `project` or `user-global`. Neither field substitutes for the other. Missing fields are rejected; the validator never fills creation defaults or infers one scope field from the other. It cannot infer scope authorization or check a retrieval caller's project.
- Strategy with `memory_scope: user-global` requires `status: verified`; `candidate` and `superseded` Strategy must use `project`. Verified Strategy may explicitly use `project`.
- Fact `promotion_reason` is required: for `project` it may be null or a non-empty string; for `user-global` it must be a non-empty string, and `evidence_status` must be `verified`. Missing, empty, or wrongly typed reasons are rejected. This structural gate does not judge the reason's semantic merit.
- Fact `source_ref`, Preference `source`, and Strategy `evidence` carry source/provenance text. Strategy `evidence` and `outcome` are required even when its status is `verified`; a status label alone is insufficient. This shape check cannot establish source authenticity or prove a real execution result.
- Required `updated_at` and supplied Fact validity bounds accept valid `YYYY-MM-DD` calendar dates or `YYYY-MM-DDTHH:mm:ss[.fraction]Z` / timezone-offset timestamps, with at most three fractional digits (millisecond precision). Invalid calendar dates, missing timestamp timezones, finer precision, and leap-second encodings are rejected. Fact `valid_from` / `valid_until` may be absent or null; supplied bounds must be valid and nondecreasing. Date-only bounds compare at UTC midnight. Date shape and ordering do not establish that a Fact is fresh enough for reuse.
- Governance extensions do not become required in arbitrary snapshots. When declared, Fact `temporal_type` / `temporal_status` and every store's `storage_tier` must match their documented enums; missing fields remain accepted and are never filled. Evidence and temporal status are independent: for example, a `verified` Fact may be `stale`. No combinations imply an automatic transition. Other governance fields, `conflicts`, and `memory_pack_contract` are not validated by this arbitrary-state checker. In particular, it does not validate the dates or meanings of `observed_at`, `last_verified_at`, `stale_after`, or `last_used_at`.
- Public illustrative strategies remain `candidate` and `project`. Synthetic test objects exercise structure only; passing them is never evidence that a real strategy works.

Run the bundled fixture check without arguments, or validate a supplied JSON state explicitly:

```sh
node skills/personal-memory/scripts/validate-personal-memory.mjs
node skills/personal-memory/scripts/validate-personal-memory.mjs --state path/to/state.json
npm run test:personal-memory --prefix app
```

The second command is read-only and prints `PERSONAL_MEMORY_STATE_SHAPE_OK` on structural success. Neither command is a persistent write gate or an approval to publish the state. The fixture's pattern scan is not a privacy guarantee for arbitrary data.

### Public fixture contract

The no-argument CLI also calls `scripts/memory-fixture-validator.mjs` (`validateMemoryFixture(state, skill)`), which retains the upstream static guards:

- Fact examples contain `temporal_type`, `temporal_status`, `observed_at`, and `last_verified_at`; temporal enums are checked by the pure state validator. The two timestamp keys are presence-only checks, not proof of verification or freshness.
- Every example record contains a valid `storage_tier`. This fixture requirement does not override the optional lifecycle-field contract for arbitrary states.
- `conflicts` is an array. Each example has `memory_type` in `fact | preference | strategy`, `conflict_status` in `unresolved | resolved | superseded`, and an `entry_ids` array of at least two elements. `conflict_status` is distinct from the illustrative `resolution_status`; there is no inferred mapping. The checker does not validate reference existence, distinctness, element types, resolution evidence, or adjudication. The bundled synthetic example now points to two existing synthetic Facts, covered by a regression test; this is not a new arbitrary-state reference-integrity rule.
- `memory_pack_contract` is an object with a `ranking_factors` array containing `relevance`, `scope_match`, `freshness`, `evidence`, and `action_usefulness`; `conflict_coverage` and `minimal_sufficient` are exactly `true`.
- The Skill retains the Scope B and D-M1–D-M4 constitution text, including `verify-on-use`; the public-data pattern scan and Candidate-only illustrative Strategy guard remain in force.

These are executable static example/document checks. They do not implement the policy behavior advertised by the fields or flags. `--state` neither reads the Skill nor applies these fixture-only requirements. It continues to accept prior snapshots without governance extensions, conflicts, or a memory-pack declaration.

### Approved policy and remaining runtime work

Scope B and D-M1–D-M4 are approved governance policies. This compatibility update preserves them; it does not choose a new policy or tighten the required arbitrary-state format. Live verification, typed adjudication, retrieval ranking/conflict coverage, dynamic budgets, archive/reactivation, provenance-preserving compaction, supersession, withdrawal, deltas, and prevention of evidence upgrades by repetition still need controller implementation and runtime tests. Snapshot or fixture success cannot establish those behaviors. Reference integrity, resolution-evidence formats, and lifecycle transitions are not newly specified here. Semantic Fact promotion, sensitivity, audit/rollback, and retrieval isolation remain controller requirements. Privacy/export behavior is outside this update.

## Freshness Rules

- Evidence status and temporal status are independent.
- A Verified Fact can still become `stale` or `needs-revalidation`.
- High-risk use may require live verification even when temporal_status is `active`.
- Version-bound Fact becomes stale when its bound version changes.
- Event-bound Fact should expire or archive after the event.
- External-current Fact should be reverified on consequential use.
- Preference has no universal TTL; explicit new preference supersedes old state.
- Strategy should be revalidated when its context/environment fingerprint changes.


## Governance Fields

Common optional lifecycle fields:

```yaml
storage_tier: hot | warm | archive
retrieval_priority:
last_used_at:
use_count:
compacted_from:
archived_reason:
```

## Conflict Rules

### Preference
- same scope + explicit newer user statement may supersede;
- different scopes may coexist.

### Fact
- adjudicate with source, evidence, scope, freshness, and version/event applicability;
- unresolved conflict is allowed;
- never silently overwrite.

### Strategy
- context-specific strategies may coexist;
- supersede only when outcome evidence and context match justify it.

## Retrieval Rules

Candidate memories should be ranked using:
- semantic relevance;
- scope match;
- freshness;
- evidence strength;
- action usefulness.

If a consequential conflict exists, retrieval must include conflict coverage rather than returning only the highest-scoring convenient entry.

The output should be a minimal sufficient Memory Pack.

## Forgetting / Compaction Rules

- Hot: active/frequently useful.
- Warm: lower-frequency but still potentially useful.
- Archive: superseded, historical, or low-priority.
- Archive is not deletion.
- Compaction must preserve provenance, source IDs, evidence state, conflict state, and superseded links.
- Hard delete is reserved for explicit user deletion, retention/privacy requirements, or disposable data with no audit value.
