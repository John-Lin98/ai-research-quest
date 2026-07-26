import type {
  AutoDemoStep,
  CampaignContent,
  QuestContent,
} from "../types/index.ts";

const DEMO_DURATION_SECONDS = 75;

function campaignSteps(campaign: CampaignContent): AutoDemoStep[] {
  return campaign.levels.flatMap((level) => {
    const knowledgeId =
      level.cognition_map_delta.candidate_added[0] ??
      `knowledge-${campaign.campaign_id}-${level.level_id}`;
    return [
      {
        step_id: `demo-select-${campaign.campaign_id}-${level.level_id}`,
        at_second: 0,
        action: "select-choice",
        target: `${campaign.campaign_id}/${level.level_id}/${level.choices[0]!.choice_id}`,
      },
      {
        step_id: `demo-confirm-${campaign.campaign_id}-${level.level_id}`,
        at_second: 0,
        action: "confirm-knowledge",
        target: knowledgeId,
      },
      {
        step_id: `demo-verify-${campaign.campaign_id}-${level.level_id}`,
        at_second: 0,
        action: "verify-knowledge",
        target: knowledgeId,
      },
    ] satisfies AutoDemoStep[];
  });
}

export function createAutoDemoSteps(content: QuestContent): AutoDemoStep[] {
  const steps: AutoDemoStep[] = [
    {
      step_id: "demo-prologue",
      at_second: 0,
      action: "select-choice",
      target: `prologue/${content.prologue.choices[0]!.choice_id}`,
    },
    ...campaignSteps(content.campaigns.learning_cognition),
    ...campaignSteps(content.campaigns.research_decision),
    ...content.exam.questions.map(
      (question): AutoDemoStep => ({
        step_id: `demo-exam-${question.question_id}`,
        at_second: 0,
        action: "answer-exam",
        target: question.question_id,
      }),
    ),
    {
      step_id: "demo-complete",
      at_second: 0,
      action: "complete",
      target: "final-exam-and-goal",
    },
    {
      step_id: "demo-export-state",
      at_second: 0,
      action: "export-state",
      target: "game-state",
    },
    {
      step_id: "demo-export-goal",
      at_second: 0,
      action: "export-goal",
      target: "codex-goal",
    },
  ];
  const interval = (DEMO_DURATION_SECONDS - 3) / (steps.length - 1);
  return steps.map((step, index) => ({
    ...step,
    at_second: Number((index * interval).toFixed(2)),
  }));
}

export const AUTO_DEMO_DURATION_SECONDS = DEMO_DURATION_SECONDS;
