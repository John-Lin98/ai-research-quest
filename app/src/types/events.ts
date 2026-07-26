import type {
  CampaignId,
  EvidenceType,
  LevelId,
} from "./game-state.ts";

export type GameEvent =
  | { type: "ANSWER_PROLOGUE"; choiceId: string }
  | {
      type: "SELECT_LEVEL_CHOICE";
      campaignId: CampaignId;
      levelId: LevelId;
      choiceId: string;
    }
  | {
      type: "SUBMIT_LEVEL_QUIZ";
      campaignId: CampaignId;
      levelId: LevelId;
      accuracy: number;
    }
  | {
      type: "CONFIRM_KNOWLEDGE";
      knowledgeId: string;
      evidenceType?: Extract<
        EvidenceType,
        "user-confirmation" | "restatement" | "misconception-correction"
      >;
      sourceRef?: string;
      score?: number;
    }
  | {
      type: "VERIFY_KNOWLEDGE";
      knowledgeId: string;
      evidenceType?: Extract<
        EvidenceType,
        "choice-application" | "level-quiz" | "final-exam" | "transfer-task"
      >;
      sourceRef?: string;
      score?: number;
    }
  | { type: "START_EXAM" }
  | {
      type: "ANSWER_EXAM";
      questionId: string;
      answer: string | string[];
      isCorrect: boolean;
      score: number;
    }
  | { type: "SUBMIT_EXAM" }
  | { type: "FORGE_GOAL" };

export class InvalidTransitionError extends Error {
  readonly code = "INVALID_TRANSITION";

  constructor(message: string) {
    super(message);
    this.name = "InvalidTransitionError";
  }
}
