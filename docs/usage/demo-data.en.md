[English] | [简体中文](demo-data.md)

# Demo Data Guide

## Files and canonical contract

| File | Purpose | Modification boundary |
| --- | --- | --- |
| `public/demo-data/default-game-state.json` | Default public state used by the webpage | Content may change; field semantics must not |
| `shared/game-state.schema.json` | Canonical Schema 1.0.0 | Contract changes require independent review |
| `skills/research-quest/references/fixture-*.json` | Complete simulated research, software, and learning sessions | Skill contract and installation smoke tests |

The webpage and the Skill must consume the same Schema semantics. Do not maintain a manually edited second field definition in either module merely to bypass validation.

## Public classification

Each campaign declares provenance fields:

- `data_classification`: `simulated`, `adapted`, or `deidentified`;
- `display_label`: the user-facing classification label;
- `public_safe: true`;
- `contains_real_research_results: false`;
- `source_traceability`: a description of public source types without disclosing or inferring private sources.

The root `privacy` object also states that personal identifiers, private paths, credentials, private code, unpublished results, server information, datasets, and checkpoints have been removed.

## Approval status

`privacy.sanitization.review_status` is not self-certification by the author:

- `pending`: no independent candidate-snapshot audit has completed; release is blocked;
- `reviewed`: the snapshot was checked but does not yet meet the release gate;
- `approved`: an independent audit produced reproducible evidence for that exact candidate snapshot.

The workflow requires the default state and all three fixtures to be `approved`, with `real_research_results_included === false`. Any content change invalidates earlier approval evidence and requires a new audit; changing the field value alone is not sufficient.

## Structural invariants

- The Full Dashboard has exactly two campaigns with seven levels each.
- The current interaction contains at most one main question.
- Confirmed knowledge must include confirmation evidence; Verified knowledge must include both confirmation and verification evidence.
- Formal cognition metrics are computed only from Verified knowledge.
- Final-exam weights are 60% decision application, 20% concept understanding, and 20% transfer, totaling 100%.
- State and Goal exports include the Schema version, SHA-256 hash, and public-safety marker.
- The automatic demo uses a fixed seed, lasts about 75 seconds, and does not loop.

## Maintenance and checks

```powershell
node skills/research-quest/scripts/generate-test-sessions.mjs --check-only
npm run test:contract --prefix app
npm run build --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

Strict Draft 2020-12 validation:

```powershell
npx --yes --package ajv-cli@5 --package ajv-formats ajv validate `
  --spec=draft2020 --strict=true --allow-union-types -c ajv-formats `
  -s shared/game-state.schema.json `
  -d "skills/research-quest/references/fixture-*.json"
```

The public-safety scan covers `app/`, `public/`, `shared/`, `skills/`, `docs/`, root public documents, workflows, and `app/dist`. Synthetic emails, tokens, and absolute paths used by security tests are allowed only by exact file path and exact matched value.
