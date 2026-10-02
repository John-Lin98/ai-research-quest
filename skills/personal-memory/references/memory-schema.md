# Personal Memory Schema

## Fact

```yaml
id:
statement:
attribution:
source_ref:
scope:
evidence_status: candidate | confirmed | verified
valid_from:
valid_until:
updated_at:
```

## Preference

```yaml
id:
preference:
scope:
priority:
status: confirmed | superseded
source:
updated_at:
```

## Strategy

```yaml
id:
context_pattern:
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

## Executable state contract

`scripts/memory-state-validator.mjs` exports the pure `validateMemoryState(state)` function. It returns field-level errors and never reads, writes, or modifies a store. A state has `schema_version: "1.0"` and the `facts`, `preferences`, and `strategies` arrays.

- All listed Fact, Preference, and Strategy fields except Fact validity bounds are required non-empty strings. IDs must be unique across all three stores, without surrounding whitespace. Status values use the enums above.
- Every entry requires an explicit, non-empty `scope`; missing scope is rejected. Nothing defaults to a global or project scope. The validator cannot infer scope authorization or check a retrieval caller's project.
- Fact `source_ref`, Preference `source`, and Strategy `evidence` carry source/provenance text. Strategy `evidence` and `outcome` are required even when its status is `verified`; a status label alone is insufficient. This shape check cannot establish source authenticity or prove a real execution result.
- Dates accept valid `YYYY-MM-DD` calendar dates or `YYYY-MM-DDTHH:mm:ss[.fraction]Z` / timezone-offset timestamps, with at most three fractional digits (millisecond precision). Invalid calendar dates, missing timestamp timezones, finer precision, and leap-second encodings are rejected. Fact `valid_from` / `valid_until` may be absent or null; supplied bounds must be valid and nondecreasing. Date-only bounds compare at UTC midnight.
- Public illustrative strategies remain `candidate`. Synthetic test objects exercise structure only; passing them is never evidence that a real strategy works.

Run the bundled fixture check without arguments, or validate a supplied JSON state explicitly:

```sh
node skills/personal-memory/scripts/validate-personal-memory.mjs
node skills/personal-memory/scripts/validate-personal-memory.mjs --state path/to/state.json
npm run test:personal-memory --prefix app
```

The second command is read-only and prints `PERSONAL_MEMORY_STATE_SHAPE_OK` on structural success. Neither command is a persistent write gate or an approval to publish the state. The fixture's pattern scan is not a privacy guarantee for arbitrary data.

### Deferred for review

Conflict references/resolution evidence, explicit supersession, withdrawal lifecycle, provenance-preserving deltas, and prevention of evidence upgrades by repetition need an approved transition/controller contract. The current snapshot validator does not enforce those behaviors or validate extension fields. Retrieval isolation and withdrawal-after-retrieval tests require that controller as well. No new lifecycle, evidence-object format, or cross-project default is selected here.
