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


## Scope Rules

- Preference defaults to `user-global` unless the user explicitly limits it to a project/domain.
- Verified Strategy defaults to `user-global`; candidate Strategy remains project-scoped until outcome evidence exists.
- Fact defaults to `project`.
- A Fact may be promoted to `user-global` only when it is Verified, cross-project useful, fresh enough, provenance-complete, non-sensitive, and has an explicit `promotion_reason`.
- Scope promotion never upgrades evidence status by itself.
