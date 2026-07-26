import type {
  AutoDemoStep,
  GameState,
  QuestContent,
} from "../types/index.ts";
import { transition } from "./engine.ts";
import { exportCodexGoal, exportGameState } from "./exports.ts";
import { restartGame } from "./factory.ts";

export interface AutoDemoOptions {
  content?: QuestContent;
  now?: string | Date;
}

function iso(value: string | Date | undefined): string {
  return value instanceof Date
    ? value.toISOString()
    : value ?? new Date().toISOString();
}

export function startAutoDemo(
  source: GameState,
  options: AutoDemoOptions = {},
): GameState {
  const state = restartGame(source, {
    content: options.content,
    now: options.now,
    stateId: source.state_id,
    interactionMode: "auto-demo",
    deterministicSeed: source.auto_demo.deterministic_seed,
  });
  state.auto_demo.enabled = true;
  state.auto_demo.status = "playing";
  return state;
}

export function pauseAutoDemo(
  source: GameState,
  nowValue?: string | Date,
): GameState {
  const state = structuredClone(source);
  if (state.auto_demo.status !== "playing") return state;
  state.auto_demo.status = "paused";
  state.updated_at = iso(nowValue);
  return state;
}

export function resumeAutoDemo(
  source: GameState,
  nowValue?: string | Date,
): GameState {
  const state = structuredClone(source);
  if (state.auto_demo.status !== "paused") return state;
  state.auto_demo.status = "playing";
  state.updated_at = iso(nowValue);
  return state;
}

async function applyStep(
  source: GameState,
  step: AutoDemoStep,
  now: string,
): Promise<GameState> {
  switch (step.action) {
    case "open-campaign":
    case "open-level":
      return source;
    case "select-choice": {
      const parts = step.target.split("/");
      if (parts[0] === "prologue") {
        return transition(
          source,
          { type: "ANSWER_PROLOGUE", choiceId: parts[1]! },
          { now },
        );
      }
      return transition(
        source,
        {
          type: "SELECT_LEVEL_CHOICE",
          campaignId: parts[0] as "learning-cognition" | "research-decision",
          levelId: parts[1] as
            | "level-1"
            | "level-2"
            | "level-3"
            | "level-4"
            | "level-5"
            | "level-6"
            | "level-7",
          choiceId: parts[2]!,
        },
        { now },
      );
    }
    case "confirm-knowledge":
      return transition(
        source,
        {
          type: "CONFIRM_KNOWLEDGE",
          knowledgeId: step.target,
          sourceRef: "public-demo:auto-confirmation",
          score: 100,
        },
        { now },
      );
    case "verify-knowledge": {
      const confirmed = source.known_knowns.confirmed.find(
        (item) => item.knowledge_id === step.target,
      );
      if (!confirmed) return source;
      const state = transition(source, {
        type: "SUBMIT_LEVEL_QUIZ",
        campaignId: confirmed.campaign_id,
        levelId: confirmed.introduced_level_id,
        accuracy: 1,
      }, { now });
      return transition(
        state,
        {
          type: "VERIFY_KNOWLEDGE",
          knowledgeId: step.target,
          evidenceType: "level-quiz",
          sourceRef: "public-demo:auto-level-quiz",
          score: 100,
        },
        { now },
      );
    }
    case "answer-exam": {
      let state = source;
      if (state.exam.status === "not-started") {
        state = transition(state, { type: "START_EXAM" }, { now });
      }
      return transition(
        state,
        {
          type: "ANSWER_EXAM",
          questionId: step.target,
          answer: "公开演示用模拟答案",
          isCorrect: true,
          score: 100,
        },
        { now },
      );
    }
    case "complete": {
      let state = source;
      if (state.exam.status === "in-progress") {
        state = transition(state, { type: "SUBMIT_EXAM" }, { now });
      }
      if (state.phase === "goal-forge") {
        state = transition(state, { type: "FORGE_GOAL" }, { now });
      }
      return state;
    }
    case "export-state":
      return (await exportGameState(source, now)).state;
    case "export-goal":
      return (await exportCodexGoal(source, now)).state;
  }
}

export async function advanceAutoDemo(
  source: GameState,
  elapsedSeconds: number,
  nowValue?: string | Date,
): Promise<GameState> {
  if (source.auto_demo.status !== "playing") return structuredClone(source);
  const now = iso(nowValue);
  let state = structuredClone(source);
  const dueSteps = state.auto_demo.steps.slice(
    state.auto_demo.current_step,
  ).filter((step) => step.at_second <= elapsedSeconds);

  for (const step of dueSteps) {
    state = await applyStep(state, step, now);
    state.auto_demo.current_step += 1;
    state.updated_at = now;
  }
  if (
    state.auto_demo.current_step >= state.auto_demo.steps.length ||
    elapsedSeconds >= state.auto_demo.duration_seconds
  ) {
    state.auto_demo.status = "completed";
  }
  return state;
}

export async function runAutoDemo(
  source: GameState,
  options: AutoDemoOptions = {},
): Promise<GameState> {
  const started = startAutoDemo(source, options);
  return advanceAutoDemo(
    started,
    started.auto_demo.duration_seconds,
    options.now,
  );
}
