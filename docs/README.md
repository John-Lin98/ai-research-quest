**English** | [简体中文](README.zh-CN.md)

# Research Quest Documentation

This index lists the public-facing material that should remain available in both English and Chinese.

## Product overview

| Topic | English | Chinese |
| --- | --- | --- |
| Repository overview | [README](../README.md) | [README.zh-CN](../README.zh-CN.md) |
| Chat-style Demo | [English Demo](https://john-lin98.github.io/ai-research-quest/en/) | [中文 Demo](https://john-lin98.github.io/ai-research-quest/) |
| Case-study article | [English article](https://john-lin98.github.io/ai-research-quest/en/case-study-alphafold-casp14.html) | [中文博文](https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html) |
| Demo data contract | [demo-data.en.md](usage/demo-data.en.md) | [demo-data.md](usage/demo-data.md) |
| Social copy | [social-copy.en.md](usage/social-copy.en.md) | [social-copy.md](usage/social-copy.md) |
| Privacy | [PRIVACY.md](../PRIVACY.md) | [PRIVACY.zh-CN.md](../PRIVACY.zh-CN.md) |
| Security | [SECURITY.md](../SECURITY.md) | [SECURITY.zh-CN.md](../SECURITY.zh-CN.md) |

## Core project files

- Skill rules: [`skills/research-quest/SKILL.md`](../skills/research-quest/SKILL.md)
- Canonical game-state Schema: [`shared/game-state.schema.json`](../shared/game-state.schema.json)
- Simulated Skill sessions: [`skills/research-quest/references/test-sessions.md`](../skills/research-quest/references/test-sessions.md)
- Public default state: [`public/demo-data/default-game-state.json`](../public/demo-data/default-game-state.json)

## Translation policy

Public-facing product claims, links, safety boundaries, Context / Goal terminology, and Known–Unknown quadrant semantics must match across languages. Translation may adapt sentence structure for clarity, but it must not add evidence, performance claims, or capabilities that are absent from the source version.

For every public documentation change:

1. update the English and Chinese counterpart in the same PR;
2. keep navigation between language versions visible near the top;
3. run desktop and mobile checks for both language pages;
4. verify all internal links and public-safety scans;
5. record any intentionally untranslated internal file in the PR description.
