import type {
  CampaignId,
  ChoiceOption,
  CognitionDelta,
  ExamCategory,
  LevelId,
  PromptClue,
  Question,
  Reward,
  ScenarioProvenance,
  TimeEstimate,
} from "./game-state.ts";

export interface PrologueContent {
  task: string;
  estimated_time: TimeEstimate;
  question: Question;
  choices: ChoiceOption[];
  goal_preview: string;
  cognition_map_delta: CognitionDelta;
  reward: Reward;
}

export interface LevelContent {
  level_id: LevelId;
  order: number;
  title: string;
  task: string;
  knowledge_card: string;
  estimated_time: TimeEstimate;
  question: Question;
  choices: ChoiceOption[];
  goal_preview: string;
  cognition_map_delta: CognitionDelta;
  reward: Reward;
  next_level_id: LevelId | "final-exam" | null;
}

export interface CampaignContent {
  campaign_id: CampaignId;
  title: string;
  description: string;
  provenance: ScenarioProvenance;
  levels: [
    LevelContent,
    LevelContent,
    LevelContent,
    LevelContent,
    LevelContent,
    LevelContent,
    LevelContent
  ];
}

export interface ExamQuestionContent {
  question_id: string;
  category: ExamCategory;
  prompt: string;
  question_type:
    | "single-choice"
    | "multi-choice"
    | "short-answer"
    | "application";
}

export interface QuestContent {
  project_goal: {
    summary: string;
    success_criteria: string[];
    constraints: string[];
  };
  prologue: PrologueContent;
  campaigns: {
    learning_cognition: CampaignContent & {
      campaign_id: "learning-cognition";
    };
    research_decision: CampaignContent & {
      campaign_id: "research-decision";
    };
  };
  prompt_clues: PromptClue[];
  exam: {
    pass_threshold: number;
    questions: ExamQuestionContent[];
  };
}
