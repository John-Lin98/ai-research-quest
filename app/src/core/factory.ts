import type {
  CampaignContent,
  CampaignState,
  GameState,
  LevelState,
  QuestContent,
  SevenLevels,
} from "../types/index.ts";
import { SCHEMA_VERSION } from "../types/index.ts";
import { createAutoDemoSteps, AUTO_DEMO_DURATION_SECONDS } from "./demo-plan.ts";
import { createDefaultQuestContent } from "./default-content.ts";

export interface CreateGameOptions {
  content?: QuestContent;
  now?: string | Date;
  stateId?: string;
  interactionMode?: "interactive" | "auto-demo";
  deterministicSeed?: number;
  resetCount?: number;
  lastResetAt?: string | null;
}

function iso(value: string | Date | undefined): string {
  return value instanceof Date
    ? value.toISOString()
    : value ?? new Date().toISOString();
}

function assertContent(content: QuestContent): void {
  for (const campaign of Object.values(content.campaigns)) {
    if (campaign.levels.length !== 7) {
      throw new Error(`战役 ${campaign.campaign_id} 必须且只能包含 7 关。`);
    }
    campaign.levels.forEach((level, index) => {
      if (level.order !== index + 1 || level.level_id !== `level-${index + 1}`) {
        throw new Error(
          `战役 ${campaign.campaign_id} 的关卡顺序必须固定为 level-1…level-7。`,
        );
      }
      if (level.choices.length < 2 || level.choices.length > 4) {
        throw new Error(`关卡 ${level.level_id} 必须提供 2–4 个选择。`);
      }
    });
    if (
      !campaign.provenance.public_safe ||
      campaign.provenance.contains_real_research_results
    ) {
      throw new Error("QuestContent 只能包含公开安全的模拟、改编或脱敏案例。");
    }
  }
  const categories = new Set(
    content.exam.questions.map((question) => question.category),
  );
  if (
    !categories.has("decision-application") ||
    !categories.has("concept-understanding") ||
    !categories.has("transfer")
  ) {
    throw new Error("最终考试必须覆盖应用、概念理解与迁移三类问题。");
  }
}

function initialLevel(
  level: CampaignContent["levels"][number],
): LevelState {
  return {
    ...level,
    status: "locked",
    progress: 0,
    selected_choice_id: null,
    choice_impact: null,
    quiz: {
      status: "not-started",
      question_ids: [`quiz-${level.level_id}`],
      accuracy: null,
    },
  };
}

function initialCampaign(content: CampaignContent): CampaignState {
  return {
    campaign_id: content.campaign_id,
    title: content.title,
    description: content.description,
    status:
      content.campaign_id === "learning-cognition" ? "available" : "locked",
    progress: 0,
    provenance: content.provenance,
    levels: content.levels.map(initialLevel) as SevenLevels,
  };
}

export function createInitialGameState(
  options: CreateGameOptions = {},
): GameState {
  const content = options.content ?? createDefaultQuestContent();
  assertContent(content);
  const now = iso(options.now);
  const learning = initialCampaign(content.campaigns.learning_cognition) as
    GameState["campaigns"]["learning_cognition"];
  const research = initialCampaign(content.campaigns.research_decision) as
    GameState["campaigns"]["research_decision"];

  return {
    schema_version: SCHEMA_VERSION,
    state_id: options.stateId ?? "research-quest-public-demo",
    revision: 0,
    session: {
      started_at: now,
      reset_count: options.resetCount ?? 0,
      last_reset_at: options.lastResetAt ?? null,
      can_restart: true,
    },
    project_goal: {
      ...content.project_goal,
      success_criteria: [...content.project_goal.success_criteria],
      constraints: [...content.project_goal.constraints],
      status: "draft",
    },
    mode: "controlled-loop",
    interaction_mode: options.interactionMode ?? "interactive",
    phase: "prologue",
    prologue: {
      ...content.prologue,
      status: "active",
      selected_choice_id: null,
      next_level_id: "level-1",
    },
    current_campaign: null,
    current_level: "prologue",
    overall_progress: 0,
    estimated_remaining_time: { min: 36, max: 69, unit: "minutes" },
    campaigns: {
      learning_cognition: learning,
      research_decision: research,
    },
    player_choices: [],
    goal_versions: [
      {
        version: 1,
        status: "draft",
        goal_text: content.prologue.goal_preview,
        source_decision_ids: [],
        created_at: now,
      },
    ],
    known_knowns: {
      candidate: [],
      confirmed: [],
      verified: [],
    },
    known_unknowns: [],
    unknown_knowns: [],
    unknown_unknowns: [],
    prompt_clues: content.prompt_clues.map((clue) => ({ ...clue })),
    artifacts: [],
    decisions: [],
    metrics: {
      new_verified_known_knowns: 0,
      corrected_misconceptions: 0,
      new_known_unknowns: 0,
      applied_knowledge_count: 0,
      level_quiz_accuracy: null,
      final_exam_accuracy: null,
      transfer_task_score: null,
      goal_revision_count: 0,
      formal_understanding_score: 0,
      verified_only_for_knowledge_count: true,
    },
    exam: {
      status: "not-started",
      pass_threshold: content.exam.pass_threshold,
      weights: {
        decision_application: 60,
        concept_understanding: 20,
        transfer: 20,
        weight_total: 100,
      },
      questions: content.exam.questions.map((question) => ({
        ...question,
        answer: null,
        is_correct: null,
        score: null,
      })),
      score: null,
      passed: null,
      completed_at: null,
    },
    auto_demo: {
      enabled: options.interactionMode === "auto-demo",
      duration_seconds: AUTO_DEMO_DURATION_SECONDS,
      status: "idle",
      deterministic_seed: options.deterministicSeed ?? 7,
      loop: false,
      current_step: 0,
      steps: createAutoDemoSteps(content),
    },
    exports: {
      state: {
        kind: "game-state",
        status: "not-generated",
        media_type: "application/json",
        filename: null,
        generated_at: null,
        sha256: null,
        content: null,
        schema_version: SCHEMA_VERSION,
        public_safe: true,
      },
      goal: {
        kind: "codex-goal",
        status: "not-generated",
        media_type: "text/markdown",
        filename: null,
        generated_at: null,
        sha256: null,
        content: null,
        schema_version: SCHEMA_VERSION,
        public_safe: true,
      },
    },
    privacy: {
      public_demo_disclosure:
        "本状态仅含模拟、改编或脱敏演示内容；不含真实科研结果，不构成科研结论。",
      research_claim_status: "illustrative-only",
      real_research_results_included: false,
      sanitization: {
        applied: true,
        removed_categories: [
          "personal-identifiers",
          "private-paths",
          "credentials",
          "private-code",
          "unpublished-results",
          "server-details",
          "datasets",
          "checkpoints",
        ],
        // This public snapshot passed independent content and product review.
        // The fixture contract verifies this value remains aligned with the
        // reviewed public demo snapshot.
        review_status: "approved",
      },
    },
    next_question: content.prologue.question,
    updated_at: now,
  };
}

export function restartGame(
  state: GameState,
  options: Omit<CreateGameOptions, "resetCount" | "lastResetAt"> = {},
): GameState {
  const resetAt = iso(options.now);
  return createInitialGameState({
    ...options,
    stateId: options.stateId ?? state.state_id,
    resetCount: state.session.reset_count + 1,
    lastResetAt: resetAt,
    now: resetAt,
  });
}
