# Personal Memory Project Setup

## Recommended surface

Create a ChatGPT Project named, for example:

`Personal Intelligence Memory`

Use it as the control plane for:
- reviewing memory;
- correcting entries;
- auditing conflicts;
- maintaining Preference / Strategy;
- deciding what may become cross-project memory.

## Cross-project use

If the goal is to let ordinary Research Quest chats benefit from this memory, do not rely on a project-only memory island. Use the memory mode that allows account-level/default personalization where available, and keep canonical files in Library or another user-controlled file source that can be reused.

For sensitive domains that must stay isolated, create a separate project-only project and do not promote its facts into the global Personal Memory store unless explicitly approved.

## Canonical files

```text
personal-memory/preferences.yaml
personal-memory/strategies.yaml
personal-memory/facts.jsonl
personal-memory/change-log.jsonl
```

## Library

When Library search is available and enabled, ChatGPT can automatically use relevant Library files. Library files remain easier to inspect and reuse than relying only on opaque conversational memory.

## Skills availability

If the current ChatGPT workspace exposes Plugins → Skills → Create/Upload, install Personal Memory privately.

If not, paste the core Personal Memory rules into Project instructions and use the same files. The storage model remains compatible with a later Skill installation.
