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
