# Contributing to Research Quest

Thank you for contributing to Research Quest.

Research Quest is an open-source Skill and public demonstration for turning ambiguous research requests into evidence-grounded Context and Codex-ready Goals. Contributions should preserve its document-first workflow, evidence boundaries, privacy model and transparent human-maintainer control.

## Ways to contribute

Useful contributions include:

* reporting reproducible bugs;
* improving the Research Quest Skill;
* improving cognition-map or Goal-generation behavior;
* adding regression test sessions;
* improving accessibility or mobile behavior;
* improving English or Chinese documentation;
* strengthening privacy and security checks;
* proposing integrations with agent or research workflows.

Large behavioral changes should begin with an issue before implementation.

## Before opening an issue

Please:

1. search existing issues and pull requests;
2. confirm the problem exists on the current `main` branch;
3. prepare a minimal reproduction using synthetic or public material;
4. separate observed behavior from expected behavior;
5. avoid including credentials, personal information, private paths, unpublished research data or private project documents.

Security vulnerabilities must not be reported in a public issue. Follow [SECURITY.md](SECURITY.md).

## Repository areas

| Path                     | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `skills/research-quest/` | Canonical Skill rules, references and validation scripts |
| `shared/`                | Shared schemas and contracts                             |
| `app/`                   | React/Vite public Demo and tests                         |
| `public/`                | Public pages, fixtures, articles and media               |
| `docs/`                  | Usage, maintenance and communication documentation       |
| `.github/workflows/`     | Continuous integration, deployment and release workflows |

Read the relevant files before modifying a subsystem.

## Development requirements

Node.js 20 or newer is required.

Install dependencies:

```bash
npm ci --prefix app
```

Run the main verification commands:

```bash
npm run lint --prefix app
npm run test:contract --prefix app
npx --prefix app playwright install chromium
npm run test:e2e --prefix app
npm run build --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

A documentation-only change may not require every browser test locally, but all applicable repository checks must pass before merge.

## Contribution rules

### Preserve the Skill contract

Changes must not silently alter:

* the meanings of Known Knowns, Unknown Knowns, Known Unknowns or Unknown Unknowns;
* the Candidate, Confirmed and Verified evidence states;
* the document-first requirement;
* conflict and correction handling;
* the distinction between Context preparation and actual task execution;
* the requirement to describe unverified information honestly.

Behavioral changes must include corresponding tests or test-session updates.

### Use safe public data

Tests, fixtures and demonstrations must use synthetic, public or explicitly approved material.

Do not commit:

* API keys, tokens or passwords;
* private server paths;
* personal email addresses or identifiers;
* unpublished research documents;
* private datasets or checkpoints;
* copied private conversation histories.

### Maintain bilingual public documentation

When a change affects public behavior, installation, privacy, security or usage, update the corresponding English and Chinese documentation where applicable.

Minor wording differences are acceptable, but the two versions must not describe conflicting behavior.

### Keep changes focused

A pull request should address one clearly defined problem.

Avoid combining unrelated changes such as:

* Skill behavior changes;
* website redesign;
* release automation;
* documentation restructuring;
* unrelated dependency upgrades.

Smaller pull requests are easier to review and validate.

## Pull-request process

1. Create a branch from the latest `main`.
2. Use a descriptive branch name, such as:

   * `fix/context-conflict-handling`
   * `feat/new-test-session`
   * `docs/contributing-guide`
3. Implement the smallest change that solves the stated problem.
4. Add or update tests when behavior changes.
5. Run the applicable verification commands.
6. Open a pull request using the repository template.
7. Respond to review comments and update the pull request description when scope changes.
8. Wait for required checks and maintainer approval before merge.

Pull-request descriptions may be written in English or Chinese. Maintainer-created pull requests currently use Chinese summaries; external contributions are welcome in either language.

## Review criteria

Pull requests are reviewed for:

* alignment with the project scope;
* correctness and clarity;
* compatibility with the Skill contract and schema;
* test coverage;
* privacy and security impact;
* public claim boundaries;
* bilingual documentation consistency;
* maintainability.

Passing automated tests does not guarantee acceptance. The primary maintainer also reviews product scope, evidence quality and long-term maintenance cost.

## Commit messages

Use clear, action-oriented commit messages.

Examples:

```text
fix: prevent conflicting clues from silently overwriting context
test: add regression case for interrupted questions
docs: clarify the maintainer review process
```

## Licensing

By submitting a contribution, you agree that your contribution may be distributed under the repository's [MIT License](LICENSE).
