# Personal Memory Schema

## Fact

```yaml
id:
statement:
attribution:
source_ref:
scope:
memory_scope: project | user-global
evidence_status: candidate | confirmed | verified
valid_from:
valid_until:
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

- All listed Fact, Preference, and Strategy fields except Fact validity bounds and `promotion_reason` are required non-empty strings. IDs must be unique across all three stores, without surrounding whitespace. Status values use the enums above.
- Every entry requires an explicit, non-empty free-text `scope` describing its applicability and a separate `memory_scope` enum of `project` or `user-global`. Neither field substitutes for the other. Missing fields are rejected; the validator never fills creation defaults or infers one scope field from the other. It cannot infer scope authorization or check a retrieval caller's project.
- Strategy with `memory_scope: user-global` requires `status: verified`; `candidate` and `superseded` Strategy must use `project`. Verified Strategy may explicitly use `project`.
- Fact `promotion_reason` is required: for `project` it may be null or a non-empty string; for `user-global` it must be a non-empty string, and `evidence_status` must be `verified`. Missing, empty, or wrongly typed reasons are rejected. This structural gate does not judge the reason's semantic merit.
- Fact `source_ref`, Preference `source`, and Strategy `evidence` carry source/provenance text. Strategy `evidence` and `outcome` are required even when its status is `verified`; a status label alone is insufficient. This shape check cannot establish source authenticity or prove a real execution result.
- Dates accept valid `YYYY-MM-DD` calendar dates or `YYYY-MM-DDTHH:mm:ss[.fraction]Z` / timezone-offset timestamps, with at most three fractional digits (millisecond precision). Invalid calendar dates, missing timestamp timezones, finer precision, and leap-second encodings are rejected. Fact `valid_from` / `valid_until` may be absent or null; supplied bounds must be valid and nondecreasing. Date-only bounds compare at UTC midnight. Date shape and ordering do not establish that a Fact is fresh enough for reuse.
- Public illustrative strategies remain `candidate` and `project`. Synthetic test objects exercise structure only; passing them is never evidence that a real strategy works.

Run the bundled fixture check without arguments, or validate a supplied JSON state explicitly:

```sh
node skills/personal-memory/scripts/validate-personal-memory.mjs
node skills/personal-memory/scripts/validate-personal-memory.mjs --state path/to/state.json
npm run test:personal-memory --prefix app
```

The second command is read-only and prints `PERSONAL_MEMORY_STATE_SHAPE_OK` on structural success. Neither command is a persistent write gate or an approval to publish the state. The fixture's pattern scan is not a privacy guarantee for arbitrary data.

### Deferred for review

Conflict references/resolution evidence, explicit supersession, withdrawal lifecycle, provenance-preserving deltas, and prevention of evidence upgrades by repetition need an approved transition/controller contract. The current snapshot validator does not enforce those behaviors or validate extension fields. Retrieval isolation and withdrawal-after-retrieval tests require that controller as well. The semantic Fact promotion requirements above remain controller policy; their enforcement is not established by this snapshot validator. Scope B creation defaults are already approved; no new lifecycle, evidence-object format, freshness policy, or privacy/export behavior is selected here.
