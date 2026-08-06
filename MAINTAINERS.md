# Maintainers

This document describes the current maintainership and decision-making process for Research Quest.

## Current maintainers

| Maintainer | GitHub                                       | Role                           | Responsibilities                                                                                                               |
| ---------- | -------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Lin Zefeng | [@John-Lin98](https://github.com/John-Lin98) | Creator and primary maintainer | Project direction, Skill contract, cognition-map mechanism, schema, releases, pull-request review, security and privacy review |

## Maintainer responsibilities

The primary maintainer is responsible for:

* defining the project's scope and public claim boundaries;
* maintaining the canonical Research Quest Skill;
* reviewing changes to the Known–Unknown cognition map and evidence-state rules;
* maintaining the shared schema and public fixtures;
* reviewing pull requests and triaging issues;
* keeping English and Chinese public documentation consistent;
* maintaining regression tests, privacy checks and security checks;
* preparing and publishing versioned Skill releases;
* making final merge, release and deprecation decisions.

## Decision-making process

Research Quest currently uses a maintainer-led review model.

1. Changes should normally be submitted through a pull request.
2. Contributors should explain the problem, proposed change and verification evidence.
3. Changes affecting the Skill contract, shared schema, privacy model, security model or public claims require explicit approval from the primary maintainer.
4. A pull request should not be merged while required checks are failing.
5. The primary maintainer makes the final decision when technical, product or evidence-boundary considerations conflict.

Feedback and alternative proposals are welcome. Decisions should be documented in the relevant issue or pull request rather than being made only in private discussions.

## Merge authority

The primary maintainer currently has final authority to:

* approve and merge pull requests;
* publish GitHub releases;
* modify the canonical Skill contract;
* update the shared schema;
* change public safety or privacy policies;
* appoint additional maintainers.

Authorship alone does not grant merge or release authority.

## Release process

A release should:

1. be based on an reviewed commit from the default branch;
2. pass the repository's contract, browser, build and public-safety checks;
3. include a versioned Skill archive;
4. include a checksum for the archive;
5. document significant behavior and compatibility changes;
6. avoid including credentials, private paths, unpublished research materials or private datasets.

## Adding or removing maintainers

Additional maintainers may be appointed after sustained contributions that demonstrate:

* understanding of the Skill contract and evidence model;
* reliable review and issue-triage work;
* respect for privacy, security and public claim boundaries;
* ability to maintain tests and documentation;
* consistent participation over time.

Maintainer changes must be recorded in this file through a reviewed pull request.

## Contact

For ordinary questions, bug reports and feature proposals, use GitHub Issues.

For security vulnerabilities, use the private reporting process described in [SECURITY.md](SECURITY.md).
