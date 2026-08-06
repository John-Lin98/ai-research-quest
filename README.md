**English** | [简体中文](README.zh-CN.md)

# Research Quest | AI Research Game

Research Quest is an **open-source Skill for improving how users and AI clarify research tasks**. It does not require the user to learn a separate game. The AI reads project documents and existing Context first, builds a Known–Unknown cognition map, and defaults to one question that can materially change the final result.

> **Core logic: cognition map + grill-me-with-docs.** Documents answer what they already contain; the AI does not ask again. The four quadrants decide why the current question matters, how much terminology to use, when to stop, and how the Goal should change.

```text
Real research need + documents + previous discussion
→ read material first
→ build the Known–Unknown cognition map
→ ask one high-value question per turn by default
→ user answers, asks a question, or adds a task clue
→ classify evidence, detect duplicates and conflicts
→ update the map, Context, and Goal vN
→ rewrite the current question
→ Frozen Context
→ Codex / Agent execution, validation, and delivery
```

## Public entry points

- [English chat-style Demo](https://john-lin98.github.io/ai-research-quest/en/)
- [Chinese chat-style Demo](https://john-lin98.github.io/ai-research-quest/)
- [Full Dashboard](https://john-lin98.github.io/ai-research-quest/?view=full)
- [English case-study article](https://john-lin98.github.io/ai-research-quest/en/case-study-alphafold-casp14.html)
- [Chinese case-study article](https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html)
- [Full mechanism video](https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm)
- [Install the latest Research Quest Skill](https://github.com/John-Lin98/ai-research-quest/releases/latest)

## Why not send Codex one sentence immediately?

For example:

> Help me decide whether AlphaFold2 can be used for enzyme active-site analysis.

The sentence does not specify which downstream decision matters first, which material already exists, what the evidence may support, what counts as complete, or which questions require real execution.

Research Quest first turns that information into Context, then produces a Codex Goal. This reduces repeated questions, misunderstandings, and Goal drift.

## Core mechanism 1: Known–Unknown cognition map

|  | User is aware | User is not yet aware |
| --- | --- | --- |
| **Knowledge is present** | **Known Knowns** | **Unknown Knowns** |
| **Knowledge is missing** | **Known Unknowns** | **Unknown Unknowns** |

Known Knowns follow an evidence progression:

```text
Candidate → Confirmed → Verified
```

Only knowledge that is correctly applied in a choice, quiz, plan, transfer task, correction, or real execution is treated as Verified and counted in the formal cognition score.

The four quadrants decide the next question, whether foundational explanation is needed, whether a counterexample or failure check should be inserted, how the current Goal changes, how a question is rewritten after an interruption, and when the task is ready for Codex.

## Core mechanism 2: grill-me-with-docs

Before asking, the AI must:

1. read the documents, current conversation, previous prompts, and existing Context;
2. extract facts, constraints, preferences, and terminology already present;
3. mark questions already answered by the material and avoid asking them again;
4. place the remaining task-changing uncertainties in the cognition map;
5. select the single highest-value question by default.

“Why this is the highest-value question now” must explain what the documents already establish, which cognition-map gap is largest, and how closing that gap changes the final Goal.

## Default turn structure

```text
one-sentence recap of the previous decision
→ where the answer, question, or task clue is saved
→ why the current question is the highest-value one
→ compact but complete four-quadrant map
→ Goal progress bar + percentage
→ cognition score + estimated remaining time
→ current Goal change (Goal vN)
→ one key question
→ normal answer options
→ I want to add Context or a task clue
→ Pause the quest — I have a question
```

The last option always lets the user pause and ask the AI a question.

## Users can pause and ask questions at any time

When the user chooses “Pause the quest — I have a question” or types a question directly, Research Quest:

1. pauses the main question without advancing progress or reducing the score;
2. checks the documents, conversation, and Context first;
3. answers from the material, or clearly states when the material cannot confirm the answer;
4. saves the Q&A as a clue;
5. updates the Known–Unknown cognition map;
6. writes only confirmed information into the Goal;
7. rewrites the current grill-me question from the updated map;
8. lets the user continue or ask another question.

## Users can proactively add Context and task clues

Users may add documents, constraints, preferences, deadlines, objective corrections, results, links, file descriptions, or explicit corrections at any time. Research Quest then:

1. pauses the main question;
2. classifies the clue as objective, material, method, constraint, preference, resource, completion rule, result, or correction;
3. records the original wording and source;
4. checks duplicates and conflicts;
5. assigns an evidence state;
6. updates the map, Context, and Goal;
7. shrinks, skips, or rewrites the current question.

### Evidence states

- Direct user statements about the user's own objective, preference, constraint, deadline, and desired deliverable may be Confirmed.
- File contents, datasets, experimental results, and external facts remain Candidate until read or verified.
- Conflicts must be displayed rather than silently overwritten.
- Explicit corrections replace the superseded entry and roll back affected Goal changes.

```text
User adds a clue
→ classify the clue
→ Candidate / Confirmed
→ duplicate and conflict check
→ cognition-map update
→ keep, modify, or roll back the Goal
→ rewrite the grill-me question
```

The public Demo uses deterministic task clues for reproducibility. The installed Skill accepts arbitrary user input and uploaded documents; it must not copy the fixed case mechanically.

## How selections become input

- In hosts that support buttons, selecting an option creates a user reply and writes it into Context and Goal.
- In hosts without buttons, options provide complete text that can be copied and sent.
- Users can always type their own answer, question, correction, or task clue.

## Context persistence

Each turn states the actual save status.

- With file or knowledge-base access, write to an explicit project path.
- With only browser memory or conversation state, state honestly that the export will be saved as `research-quest-context.md`; do not pretend that a file has already been written.

The complete Context contains the original need, desired deliverable, read material, main questions and choices, user questions and answers, added task clues, the four quadrants, Candidate / Confirmed / Verified evidence, preferences, Goal vN history, open unknowns, completion criteria, and exit rules.

## Default public Demo

The chat-style Demo uses a public research need:

> Design a small public pilot to assess whether AlphaFold2 / AlphaFold DB predictions are suitable for preliminary screening of enzyme active-site-local structure.

Five deterministic turns cover purpose, available material, claim boundary, completion rule, and Goal handoff. The case does not predefine experimental success and does not treat pLDDT or structural similarity as proof of catalytic activity, substrate binding, or drug-discovery value.

## Custom research need

The browser provides a local starter workflow: describe the research need, desired deliverable, and current material or constraints. It then prepares an initial Context and a starter prompt.

The webpage does not pretend to run an LLM. Real document reading, free-form questions, proactive task clues, dynamic cognition mapping, and grill-me-with-docs behavior are performed by ChatGPT or another agent host with the Skill installed.

## Goal Forge

The final Goal should include the Frozen Context path, real objective and non-goals, read documents, cognition map, Q&A clues, proactive task clues, user preferences, inputs, steps, completion criteria, agent roles, tests and review, plus root-cause analysis after 3–5 repeated failures.

## Full Dashboard

The Full Dashboard preserves two seven-level campaigns, the global cognition map, scoring, examination, and Goal history. It is useful for mechanism review, teaching, and project retrospectives. The default entry remains the chat-style Demo.

Privacy and security details are documented in [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md). Chinese versions are available in [PRIVACY.zh-CN.md](PRIVACY.zh-CN.md) and [SECURITY.zh-CN.md](SECURITY.zh-CN.md).

## Local development and verification

Node.js 20 or newer is required.

```powershell
npm ci --prefix app
npm run lint --prefix app
npm run test:contract --prefix app
npx --prefix app playwright install chromium
npm run test:e2e --prefix app
npm run build --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

## Public data and documentation

- Default public state: [public/demo-data/default-game-state.json](public/demo-data/default-game-state.json)
- Canonical Schema: [shared/game-state.schema.json](shared/game-state.schema.json)
- Skill rules: [skills/research-quest/SKILL.md](skills/research-quest/SKILL.md)
- Three simulated test sessions: [skills/research-quest/references/test-sessions.md](skills/research-quest/references/test-sessions.md)
- English demo-data guide: [docs/usage/demo-data.en.md](docs/usage/demo-data.en.md)
- Chinese demo-data guide: [docs/usage/demo-data.md](docs/usage/demo-data.md)
- English documentation index: [docs/README.md](docs/README.md)
- Chinese documentation index: [docs/README.zh-CN.md](docs/README.zh-CN.md)

## Contributing and maintenance

- [Contributing guide](CONTRIBUTING.md)
- [Maintainers and decision process](MAINTAINERS.md)
- [Security policy](SECURITY.md)
- [Privacy policy](PRIVACY.md)

Research Quest is released under the [MIT License](LICENSE). Third-party software and licenses are listed in [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES).
