import type {
  CampaignState,
  GameState,
  LevelState,
  ProjectGoal,
  Question,
  TimeEstimate,
  UnderstandingMetrics,
} from "../types/index.ts";

export interface QuestView {
  phase: GameState["phase"];
  interactionMode: GameState["interaction_mode"];
  currentCampaign: CampaignState | null;
  currentLevel: LevelState | null;
  overallProgress: number;
  estimatedRemainingTime: TimeEstimate;
  goalPreview: string;
  nextQuestion: Question | null;
  metrics: UnderstandingMetrics;
  projectGoal: ProjectGoal;
  canRestart: true;
  canExportState: boolean;
  canExportGoal: boolean;
}

export function selectCurrentCampaign(
  state: GameState,
): CampaignState | null {
  if (state.current_campaign === "learning-cognition") {
    return state.campaigns.learning_cognition;
  }
  if (state.current_campaign === "research-decision") {
    return state.campaigns.research_decision;
  }
  return null;
}

export function selectCurrentLevel(state: GameState): LevelState | null {
  const campaign = selectCurrentCampaign(state);
  if (!campaign || !state.current_level.startsWith("level-")) return null;
  return (
    campaign.levels.find(
      (level) => level.level_id === state.current_level,
    ) ?? null
  );
}

export function selectGoalPreview(state: GameState): string {
  if (state.phase === "prologue") return state.prologue.goal_preview;
  const level = selectCurrentLevel(state);
  if (level) return level.goal_preview;
  return (
    [...state.goal_versions].reverse().find(
      (version) => version.status !== "superseded",
    )?.goal_text ?? state.project_goal.summary
  );
}

export function selectQuestView(state: GameState): QuestView {
  return {
    phase: state.phase,
    interactionMode: state.interaction_mode,
    currentCampaign: selectCurrentCampaign(state),
    currentLevel: selectCurrentLevel(state),
    overallProgress: state.overall_progress,
    estimatedRemainingTime: state.estimated_remaining_time,
    goalPreview: selectGoalPreview(state),
    nextQuestion: state.next_question,
    metrics: state.metrics,
    projectGoal: state.project_goal,
    canRestart: true,
    canExportState: true,
    canExportGoal:
      state.phase === "completed" &&
      state.goal_versions.some((version) => version.status === "frozen"),
  };
}
