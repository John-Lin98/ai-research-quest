# Security Policy

## Supported version

Security fixes target the current `main` branch. Historical commits and local forks are not supported releases.

## Reporting a vulnerability

Please use the repository's private security advisory form:

https://github.com/John-Lin98/ai-research-quest/security/advisories/new

Do not include exploit details, credentials, personal data or unpublished material in a public issue. A useful private report includes:

- the affected commit and browser or Node.js version;
- minimal reproduction steps using synthetic data;
- expected and actual behavior;
- the security or privacy impact;
- a proposed mitigation, if known.

Do not test against other people, accounts or data. Do not upload private files to demonstrate a problem.

## Security model

- The published Demo is a static site with no application backend.
- User interaction stays in browser memory until the user explicitly downloads a local export.
- Exports fail closed on common email, credential, token, private-path and excessive-length patterns.
- GitHub Actions are pinned to commit SHAs. Build jobs have read-only repository access; Pages write and identity-token permissions are isolated to the final deploy job.
- Public fixtures are synthetic and must pass Schema, provenance, approval and sensitive-content checks.

These controls do not make arbitrary user text safe. Review exports before sharing and rotate any real credential that was entered or disclosed.
