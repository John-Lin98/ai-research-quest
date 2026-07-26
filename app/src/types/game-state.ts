export const SCHEMA_VERSION = "1.0.0" as const;

export type SchemaVersion = typeof SCHEMA_VERSION;
export type CampaignId = "learning-cognition" | "research-decision";
export type LevelId =
  | "level-1"
  | "level-2"
  | "level-3"
  | "level-4"
  | "level-5"
  | "level-6"
  | "level-7";
export type CurrentLevel =
  | "prologue"
  | LevelId
  | "final-exam"
  | "goal-forge"
  | "complete";
export type LevelStatus = "locked" | "available" | "active" | "completed";
export type CampaignStatus = LevelStatus;
export type IsoDateTime = string;

export interface ProjectGoal {
  summary: string;
  success_criteria: string[];
  constraints: string[];
  status: "draft" | "reviewed" | "frozen" | "executed";
}

export interface SessionLifecycle {
  started_at: IsoDateTime;
  reset_count: number;
  last_reset_at: IsoDateTime | null;
  can_restart: true;
}

export interface TimeEstimate {
  min: number;
  max: number;
  unit: "minutes";
}

export interface Question {
  question_id: string;
  prompt: string;
  purpose: string;
}

export interface ChoiceOption {
  choice_id: string;
  label: string;
  impact_preview: string;
}

export interface CognitionDelta {
  candidate_added: string[];
  confirmed_added: string[];
  verified_added: string[];
  known_unknowns_added: string[];
  misconceptions_corrected: string[];
}

export interface Reward {
  title: string;
  artifact_ids: string[];
}

export interface PrologueState {
  status: LevelStatus;
  task: string;
  estimated_time: TimeEstimate;
  question: Question;
  choices: ChoiceOption[];
  selected_choice_id: string | null;
  goal_preview: string;
  cognition_map_delta: CognitionDelta;
  reward: Reward;
  next_level_id: "level-1";
}

export interface LevelQuiz {
  status: "not-started" | "passed" | "failed";
  question_ids: string[];
  accuracy: number | null;
}

export interface LevelState {
  level_id: LevelId;
  order: number;
  title: string;
  status: LevelStatus;
  task: string;
  knowledge_card: string;
  estimated_time: TimeEstimate;
  progress: number;
  question: Question;
  choices: ChoiceOption[];
  selected_choice_id: string | null;
  choice_impact: string | null;
  goal_preview: string;
  cognition_map_delta: CognitionDelta;
  quiz: LevelQuiz;
  reward: Reward;
  next_level_id: LevelId | "final-exam" | null;
}

export type SevenLevels = [
  LevelState,
  LevelState,
  LevelState,
  LevelState,
  LevelState,
  LevelState,
  LevelState
];

export interface ScenarioProvenance {
  data_classification: "simulated" | "adapted" | "deidentified";
  display_label: "模拟数据" | "改编场景" | "脱敏场景";
  public_safe: true;
  contains_real_research_results: false;
  source_traceability: string;
}

export interface CampaignState {
  campaign_id: CampaignId;
  title: string;
  description: string;
  status: CampaignStatus;
  progress: number;
  provenance: ScenarioProvenance;
  levels: SevenLevels;
}

export interface PlayerChoice {
  choice_record_id: string;
  campaign_id: CampaignId;
  level_id: LevelId;
  question_id: string;
  choice_id: string;
  impact: string;
  chosen_at: IsoDateTime;
}

export type EvidenceType =
  | "ai-extraction"
  | "user-confirmation"
  | "restatement"
  | "choice-application"
  | "level-quiz"
  | "final-exam"
  | "transfer-task"
  | "misconception-correction";

export interface KnowledgeEvidence {
  evidence_id: string;
  evidence_type: EvidenceType;
  source_ref: string;
  recorded_at: IsoDateTime;
  score?: number | null;
}

interface KnowledgeBase {
  knowledge_id: string;
  statement: string;
  campaign_id: CampaignId;
  introduced_level_id: LevelId;
  provenance: ScenarioProvenance;
  candidate_evidence: KnowledgeEvidence[];
}

export interface CandidateKnowledge extends KnowledgeBase {
  status: "candidate";
  confirmation_evidence?: KnowledgeEvidence[];
  verification_evidence?: KnowledgeEvidence[];
}

export interface ConfirmedKnowledge extends KnowledgeBase {
  status: "confirmed";
  confirmation_evidence: KnowledgeEvidence[];
  verification_evidence?: KnowledgeEvidence[];
}

export interface VerifiedKnowledge extends KnowledgeBase {
  status: "verified";
  confirmation_evidence: KnowledgeEvidence[];
  verification_evidence: KnowledgeEvidence[];
}

export interface CognitiveItem {
  item_id: string;
  statement: string;
  campaign_id: CampaignId;
  introduced_level_id: LevelId;
  status: "open" | "under-investigation" | "resolved";
}

export interface PromptClue {
  clue_id: string;
  clue_type:
    | "goal-clue"
    | "constraint-clue"
    | "workflow-clue"
    | "acceptance-clue"
    | "failure-clue"
    | "preference-clue"
    | "artifact-clue";
  text: string;
  source_kind: "public-context" | "sanitized-context" | "simulated";
  evidence_status: "candidate" | "confirmed" | "verified" | "retrieval-limited";
}

export interface GoalVersion {
  version: number;
  status: "draft" | "reviewed" | "frozen" | "superseded" | "executed";
  goal_text: string;
  source_decision_ids: string[];
  created_at: IsoDateTime;
}

export interface Decision {
  decision_id: string;
  campaign_id: CampaignId;
  level_id: LevelId;
  summary: string;
  status: "candidate" | "confirmed" | "frozen" | "superseded";
  source_choice_record_id: string;
}

export interface Artifact {
  artifact_id: string;
  artifact_type:
    | "knowledge-card"
    | "decision-record"
    | "cognition-map"
    | "exam-result"
    | "game-state-export"
    | "codex-goal-export"
    | "other";
  title: string;
  uri: string;
  public_safe: boolean;
}

export interface UnderstandingMetrics {
  new_verified_known_knowns: number;
  corrected_misconceptions: number;
  new_known_unknowns: number;
  applied_knowledge_count: number;
  level_quiz_accuracy: number | null;
  final_exam_accuracy: number | null;
  transfer_task_score: number | null;
  goal_revision_count: number;
  formal_understanding_score: number | null;
  verified_only_for_knowledge_count: true;
}

export type ExamCategory =
  | "decision-application"
  | "concept-understanding"
  | "transfer";

export interface ExamQuestion {
  question_id: string;
  category: ExamCategory;
  prompt: string;
  question_type:
    | "single-choice"
    | "multi-choice"
    | "short-answer"
    | "application";
  answer: string | string[] | null;
  is_correct: boolean | null;
  score: number | null;
}

export interface ExamState {
  status: "not-started" | "in-progress" | "passed" | "failed";
  pass_threshold: number;
  weights: {
    decision_application: number;
    concept_understanding: number;
    transfer: number;
    weight_total: 100;
  };
  questions: ExamQuestion[];
  score: number | null;
  passed: boolean | null;
  completed_at: IsoDateTime | null;
}

export type AutoDemoAction =
  | "open-campaign"
  | "open-level"
  | "select-choice"
  | "confirm-knowledge"
  | "verify-knowledge"
  | "answer-exam"
  | "export-state"
  | "export-goal"
  | "complete";

export interface AutoDemoStep {
  step_id: string;
  at_second: number;
  action: AutoDemoAction;
  target: string;
}

export interface AutoDemo {
  enabled: boolean;
  duration_seconds: number;
  status: "idle" | "playing" | "paused" | "completed";
  deterministic_seed: number;
  loop: false;
  current_step: number;
  steps: AutoDemoStep[];
}

export interface ExportRecord {
  kind: "game-state" | "codex-goal";
  status: "not-generated" | "ready" | "downloaded" | "failed";
  media_type: "application/json" | "text/markdown" | "text/plain";
  filename: string | null;
  generated_at: IsoDateTime | null;
  sha256: string | null;
  content: string | null;
  schema_version: SchemaVersion;
  public_safe: true;
}

export interface GameState {
  schema_version: SchemaVersion;
  state_id: string;
  revision: number;
  session: SessionLifecycle;
  project_goal: ProjectGoal;
  mode: "controlled-loop";
  interaction_mode: "interactive" | "auto-demo";
  phase: "prologue" | "campaign" | "final-exam" | "goal-forge" | "completed";
  prologue: PrologueState;
  current_campaign: CampaignId | null;
  current_level: CurrentLevel;
  overall_progress: number;
  estimated_remaining_time: TimeEstimate;
  campaigns: {
    learning_cognition: CampaignState & { campaign_id: "learning-cognition" };
    research_decision: CampaignState & { campaign_id: "research-decision" };
  };
  player_choices: PlayerChoice[];
  goal_versions: GoalVersion[];
  known_knowns: {
    candidate: CandidateKnowledge[];
    confirmed: ConfirmedKnowledge[];
    verified: VerifiedKnowledge[];
  };
  known_unknowns: CognitiveItem[];
  unknown_knowns: CognitiveItem[];
  unknown_unknowns: CognitiveItem[];
  prompt_clues: PromptClue[];
  artifacts: Artifact[];
  decisions: Decision[];
  metrics: UnderstandingMetrics;
  exam: ExamState;
  auto_demo: AutoDemo;
  exports: {
    state: ExportRecord & {
      kind: "game-state";
      media_type: "application/json";
    };
    goal: ExportRecord & {
      kind: "codex-goal";
      media_type: "text/markdown" | "text/plain";
    };
  };
  privacy: {
    public_demo_disclosure: string;
    research_claim_status: "illustrative-only";
    real_research_results_included: false;
    sanitization: {
      applied: true;
      removed_categories: Array<
        | "personal-identifiers"
        | "private-paths"
        | "credentials"
        | "private-code"
        | "unpublished-results"
        | "server-details"
        | "datasets"
        | "checkpoints"
      >;
      review_status: "pending" | "reviewed" | "approved";
    };
  };
  next_question: Question | null;
  updated_at: IsoDateTime;
}
