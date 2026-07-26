import type {
  CampaignId,
  CampaignState,
  CandidateKnowledge,
  CognitiveItem,
  GameEvent,
  GameState,
  KnowledgeEvidence,
  LevelId,
  LevelState,
  Question,
} from "../types/index.ts";
import { InvalidTransitionError } from "../types/index.ts";
import { generateCodexGoal } from "./goal.ts";
import { calculateMetrics } from "./metrics.ts";

export interface TransitionOptions {
  now?: string | Date;
}

function iso(value: string | Date | undefined): string {
  return value instanceof Date
    ? value.toISOString()
    : value ?? new Date().toISOString();
}

function campaign(state: GameState, id: CampaignId): CampaignState {
  return id === "learning-cognition"
    ? state.campaigns.learning_cognition
    : state.campaigns.research_decision;
}

function level(
  state: GameState,
  campaignId: CampaignId,
  levelId: LevelId,
): LevelState {
  const result = campaign(state, campaignId).levels.find(
    (candidate) => candidate.level_id === levelId,
  );
  if (!result) {
    throw new InvalidTransitionError(
      `不存在关卡 ${campaignId}/${levelId}。`,
    );
  }
  return result;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clamp100(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function addArtifact(
  state: GameState,
  artifactId: string,
  title: string,
  artifactType: GameState["artifacts"][number]["artifact_type"],
): void {
  if (state.artifacts.some((artifact) => artifact.artifact_id === artifactId)) {
    return;
  }
  state.artifacts.push({
    artifact_id: artifactId,
    artifact_type: artifactType,
    title,
    uri: `quest://artifact/${artifactId}`,
    public_safe: true,
  });
}

function supersedeDraftGoals(state: GameState): void {
  for (const version of state.goal_versions) {
    if (version.status === "draft" || version.status === "reviewed") {
      version.status = "superseded";
    }
  }
}

function appendGoalPreview(
  state: GameState,
  preview: string,
  now: string,
): void {
  supersedeDraftGoals(state);
  state.goal_versions.push({
    version: state.goal_versions.length + 1,
    status: "draft",
    goal_text: preview,
    source_decision_ids: state.decisions.map(
      (decision) => decision.decision_id,
    ),
    created_at: now,
  });
}

function evidence(
  state: GameState,
  knowledgeId: string,
  evidenceType: KnowledgeEvidence["evidence_type"],
  sourceRef: string,
  now: string,
  score?: number,
): KnowledgeEvidence {
  const result: KnowledgeEvidence = {
    evidence_id: `evidence-${knowledgeId}-${state.revision + 1}`,
    evidence_type: evidenceType,
    source_ref: sourceRef,
    recorded_at: now,
  };
  if (score !== undefined) result.score = clamp100(score);
  return result;
}

function knowledgeExists(state: GameState, knowledgeId: string): boolean {
  return [
    ...state.known_knowns.candidate,
    ...state.known_knowns.confirmed,
    ...state.known_knowns.verified,
  ].some((knowledge) => knowledge.knowledge_id === knowledgeId);
}

function addCognitionFromLevel(
  state: GameState,
  campaignState: CampaignState,
  levelState: LevelState,
  now: string,
): void {
  for (const knowledgeId of levelState.cognition_map_delta.candidate_added) {
    if (knowledgeExists(state, knowledgeId)) continue;
    const item: CandidateKnowledge = {
      knowledge_id: knowledgeId,
      statement: levelState.knowledge_card,
      status: "candidate",
      campaign_id: campaignState.campaign_id,
      introduced_level_id: levelState.level_id,
      provenance: { ...campaignState.provenance },
      candidate_evidence: [
        evidence(
          state,
          knowledgeId,
          "ai-extraction",
          `public-demo:${campaignState.campaign_id}/${levelState.level_id}`,
          now,
        ),
      ],
    };
    state.known_knowns.candidate.push(item);
  }
  for (const itemId of levelState.cognition_map_delta.known_unknowns_added) {
    if (state.known_unknowns.some((item) => item.item_id === itemId)) continue;
    const item: CognitiveItem = {
      item_id: itemId,
      statement: `${levelState.title}仍有适用边界待验证（模拟案例）。`,
      campaign_id: campaignState.campaign_id,
      introduced_level_id: levelState.level_id,
      status: "open",
    };
    state.known_unknowns.push(item);
  }
  state.metrics.corrected_misconceptions +=
    levelState.cognition_map_delta.misconceptions_corrected.length;
}

function activateCampaign(
  state: GameState,
  campaignId: CampaignId,
): void {
  const target = campaign(state, campaignId);
  target.status = "active";
  target.levels[0].status = "active";
  state.phase = "campaign";
  state.current_campaign = campaignId;
  state.current_level = "level-1";
}

function advanceAfterLevel(
  state: GameState,
  campaignId: CampaignId,
  completedLevel: LevelState,
): void {
  const currentCampaign = campaign(state, campaignId);
  const nextIndex = completedLevel.order;
  if (nextIndex < currentCampaign.levels.length) {
    currentCampaign.levels[nextIndex].status = "active";
    state.current_level = currentCampaign.levels[nextIndex].level_id;
    return;
  }

  currentCampaign.status = "completed";
  if (campaignId === "learning-cognition") {
    activateCampaign(state, "research-decision");
    return;
  }

  state.phase = "final-exam";
  state.current_campaign = null;
  state.current_level = "final-exam";
}

function currentQuestion(state: GameState): Question | null {
  if (state.phase === "prologue") return state.prologue.question;
  if (state.phase === "campaign" && state.current_campaign) {
    const active = campaign(state, state.current_campaign).levels.find(
      (candidate) => candidate.status === "active",
    );
    return active?.question ?? null;
  }
  if (state.phase === "final-exam") {
    const unanswered = state.exam.questions.find(
      (question) => question.answer === null,
    );
    return unanswered
      ? {
          question_id: unanswered.question_id,
          prompt: unanswered.prompt,
          purpose: `最终考试：${unanswered.category}`,
        }
      : null;
  }
  return null;
}

function updateProgressAndTime(state: GameState): void {
  const completedLevels = Object.values(state.campaigns)
    .flatMap((item) => item.levels)
    .filter((item) => item.status === "completed").length;
  const milestones =
    (state.prologue.status === "completed" ? 1 : 0) +
    completedLevels +
    (state.exam.passed ? 1 : 0) +
    (state.phase === "completed" ? 1 : 0);
  state.overall_progress = Number(((milestones / 17) * 100).toFixed(2));

  for (const campaignState of Object.values(state.campaigns)) {
    const completed = campaignState.levels.filter(
      (item) => item.status === "completed",
    ).length;
    campaignState.progress = Number(((completed / 7) * 100).toFixed(2));
  }

  const remainingLevels = Object.values(state.campaigns)
    .flatMap((item) => item.levels)
    .filter((item) => item.status !== "completed");
  let min = remainingLevels.reduce(
    (sum, item) => sum + item.estimated_time.min,
    0,
  );
  let max = remainingLevels.reduce(
    (sum, item) => sum + item.estimated_time.max,
    0,
  );
  if (state.prologue.status !== "completed") {
    min += state.prologue.estimated_time.min;
    max += state.prologue.estimated_time.max;
  }
  if (!state.exam.passed) {
    min += 5;
    max += 8;
  }
  if (state.phase !== "completed") {
    min += 2;
    max += 3;
  }
  state.estimated_remaining_time = { min, max, unit: "minutes" };
  state.next_question = currentQuestion(state);
}

function finish(state: GameState, now: string): GameState {
  state.revision += 1;
  state.updated_at = now;
  updateProgressAndTime(state);
  state.metrics = calculateMetrics(state);
  return state;
}

function answerPrologue(
  state: GameState,
  choiceId: string,
  now: string,
): void {
  if (state.phase !== "prologue" || state.prologue.status !== "active") {
    throw new InvalidTransitionError("序章已经完成或当前不可回答。");
  }
  const choice = state.prologue.choices.find(
    (candidate) => candidate.choice_id === choiceId,
  );
  if (!choice) throw new InvalidTransitionError(`序章选择 ${choiceId} 不存在。`);
  state.prologue.selected_choice_id = choiceId;
  state.prologue.status = "completed";
  state.project_goal.summary = `${state.project_goal.summary}｜${choice.impact_preview}`;
  appendGoalPreview(state, state.project_goal.summary, now);
  for (const artifactId of state.prologue.reward.artifact_ids) {
    addArtifact(
      state,
      artifactId,
      state.prologue.reward.title,
      "decision-record",
    );
  }
  activateCampaign(state, "learning-cognition");
}

function selectLevelChoice(
  state: GameState,
  event: Extract<GameEvent, { type: "SELECT_LEVEL_CHOICE" }>,
  now: string,
): void {
  if (
    state.phase !== "campaign" ||
    state.current_campaign !== event.campaignId ||
    state.current_level !== event.levelId
  ) {
    throw new InvalidTransitionError(
      `只能回答当前关卡；当前为 ${state.current_campaign ?? "none"}/${state.current_level}。`,
    );
  }
  const targetCampaign = campaign(state, event.campaignId);
  const targetLevel = level(state, event.campaignId, event.levelId);
  if (targetLevel.status !== "active" || targetLevel.selected_choice_id) {
    throw new InvalidTransitionError("每个关卡只能提交一项选择。");
  }
  const choice = targetLevel.choices.find(
    (candidate) => candidate.choice_id === event.choiceId,
  );
  if (!choice) {
    throw new InvalidTransitionError(
      `关卡 ${event.levelId} 不存在选择 ${event.choiceId}。`,
    );
  }

  const recordId = `choice-record-${state.revision + 1}`;
  targetLevel.selected_choice_id = choice.choice_id;
  targetLevel.choice_impact = choice.impact_preview;
  targetLevel.goal_preview = `${targetLevel.goal_preview} ${choice.impact_preview}`;
  state.player_choices.push({
    choice_record_id: recordId,
    campaign_id: event.campaignId,
    level_id: event.levelId,
    question_id: targetLevel.question.question_id,
    choice_id: choice.choice_id,
    impact: choice.impact_preview,
    chosen_at: now,
  });
  state.decisions.push({
    decision_id: `decision-${state.revision + 1}`,
    campaign_id: event.campaignId,
    level_id: event.levelId,
    summary: `${targetLevel.title}：${choice.label}。${choice.impact_preview}`,
    status: "confirmed",
    source_choice_record_id: recordId,
  });
  state.project_goal.summary = `${state.project_goal.summary.split("｜")[0]}｜${choice.impact_preview}`;
  appendGoalPreview(state, targetLevel.goal_preview, now);
  addCognitionFromLevel(state, targetCampaign, targetLevel, now);
  for (const artifactId of targetLevel.reward.artifact_ids) {
    addArtifact(
      state,
      artifactId,
      targetLevel.reward.title,
      "decision-record",
    );
  }
}

function submitLevelQuiz(
  state: GameState,
  event: Extract<GameEvent, { type: "SUBMIT_LEVEL_QUIZ" }>,
): void {
  if (
    state.phase !== "campaign" ||
    state.current_campaign !== event.campaignId ||
    state.current_level !== event.levelId
  ) {
    throw new InvalidTransitionError("只能提交当前关卡的小测。");
  }
  const target = level(state, event.campaignId, event.levelId);
  if (target.status !== "active" || !target.selected_choice_id) {
    throw new InvalidTransitionError("关卡选择完成后才能提交小测。");
  }
  if (target.quiz.status === "passed") {
    throw new InvalidTransitionError("本关小测已经通过。");
  }
  const accuracy = clamp01(event.accuracy);
  target.quiz.accuracy = accuracy;
  target.quiz.status = accuracy >= 0.8 ? "passed" : "failed";
  if (target.quiz.status === "passed") {
    target.status = "completed";
    target.progress = 100;
    advanceAfterLevel(state, event.campaignId, target);
  }
}

function confirmKnowledge(
  state: GameState,
  event: Extract<GameEvent, { type: "CONFIRM_KNOWLEDGE" }>,
  now: string,
): void {
  if (state.phase === "completed" || state.project_goal.status === "frozen") {
    throw new InvalidTransitionError(
      "Codex Goal 已冻结；如需补充认证，请重新开始一个新的互动回合。",
    );
  }
  const index = state.known_knowns.candidate.findIndex(
    (item) => item.knowledge_id === event.knowledgeId,
  );
  if (index < 0) {
    throw new InvalidTransitionError(
      "只有 Candidate 知识可迁移到 Confirmed；禁止跳级或重复确认。",
    );
  }
  const [candidate] = state.known_knowns.candidate.splice(index, 1);
  state.known_knowns.confirmed.push({
    ...candidate!,
    status: "confirmed",
    confirmation_evidence: [
      evidence(
        state,
        event.knowledgeId,
        event.evidenceType ?? "user-confirmation",
        event.sourceRef ?? "public-demo:user-confirmation",
        now,
        event.score,
      ),
    ],
  });
}

function verifyKnowledge(
  state: GameState,
  event: Extract<GameEvent, { type: "VERIFY_KNOWLEDGE" }>,
  now: string,
): void {
  if (state.phase === "completed" || state.project_goal.status === "frozen") {
    throw new InvalidTransitionError(
      "Codex Goal 已冻结；如需补充认证，请重新开始一个新的互动回合。",
    );
  }
  const index = state.known_knowns.confirmed.findIndex(
    (item) => item.knowledge_id === event.knowledgeId,
  );
  if (index < 0) {
    throw new InvalidTransitionError(
      "只有 Confirmed 知识可迁移到 Verified；Candidate 不得直接计分。",
    );
  }
  const confirmed = state.known_knowns.confirmed[index]!;
  const sourceLevel = level(
    state,
    confirmed.campaign_id,
    confirmed.introduced_level_id,
  );
  if (
    event.evidenceType !== "level-quiz" ||
    sourceLevel.quiz.status !== "passed"
  ) {
    throw new InvalidTransitionError(
      "只有通过所属关卡小测的应用证据才能升级为 Verified。",
    );
  }
  const [verifiedKnowledge] = state.known_knowns.confirmed.splice(index, 1);
  state.known_knowns.verified.push({
    ...verifiedKnowledge!,
    status: "verified",
    verification_evidence: [
      evidence(
        state,
        event.knowledgeId,
        "level-quiz",
        event.sourceRef ?? "public-demo:level-quiz",
        now,
        Math.round((sourceLevel.quiz.accuracy ?? 0) * 100),
      ),
    ],
  });
}

function startExam(state: GameState): void {
  if (state.phase !== "final-exam") {
    throw new InvalidTransitionError("完成两个七关战役后才能开始最终考试。");
  }
  if (state.exam.status === "in-progress") {
    throw new InvalidTransitionError("最终考试正在进行中。");
  }
  if (state.exam.status === "failed") {
    for (const question of state.exam.questions) {
      question.answer = null;
      question.is_correct = null;
      question.score = null;
    }
    state.exam.score = null;
    state.exam.passed = null;
    state.exam.completed_at = null;
  }
  state.exam.status = "in-progress";
}

function answerExam(
  state: GameState,
  event: Extract<GameEvent, { type: "ANSWER_EXAM" }>,
): void {
  if (state.exam.status !== "in-progress") {
    throw new InvalidTransitionError("最终考试尚未开始。");
  }
  const question = state.exam.questions.find(
    (candidate) => candidate.question_id === event.questionId,
  );
  if (!question) {
    throw new InvalidTransitionError(`考试题 ${event.questionId} 不存在。`);
  }
  question.answer = Array.isArray(event.answer)
    ? [...event.answer]
    : event.answer;
  question.is_correct = event.isCorrect;
  question.score = clamp100(event.score);
}

function categoryAverage(
  state: GameState,
  category: GameState["exam"]["questions"][number]["category"],
): number {
  const questions = state.exam.questions.filter(
    (question) => question.category === category,
  );
  const scores = questions
    .map((question) => question.score)
    .filter((score): score is number => score !== null);
  if (scores.length === 0 || scores.length !== questions.length) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function submitExam(state: GameState, now: string): void {
  if (
    state.exam.status !== "in-progress" ||
    state.exam.questions.some((question) => question.answer === null)
  ) {
    throw new InvalidTransitionError("必须回答全部最终考试题后才能提交。");
  }
  const score =
    categoryAverage(state, "decision-application") * 0.6 +
    categoryAverage(state, "concept-understanding") * 0.2 +
    categoryAverage(state, "transfer") * 0.2;
  state.exam.score = Number(score.toFixed(2));
  state.exam.passed = score >= state.exam.pass_threshold;
  state.exam.status = state.exam.passed ? "passed" : "failed";
  state.exam.completed_at = now;
  addArtifact(
    state,
    "artifact-final-exam",
    "最终考试结果（模拟）",
    "exam-result",
  );
  if (state.exam.passed) {
    state.phase = "goal-forge";
    state.current_level = "goal-forge";
  }
}

function forgeGoal(state: GameState, now: string): void {
  if (!state.exam.passed || state.phase !== "goal-forge") {
    throw new InvalidTransitionError("最终考试通过后才能锻造 Codex Goal。");
  }
  for (const decision of state.decisions) {
    if (decision.status === "confirmed") decision.status = "frozen";
  }
  state.metrics = calculateMetrics(state);
  const goal = generateCodexGoal(state);
  supersedeDraftGoals(state);
  state.goal_versions.push({
    version: state.goal_versions.length + 1,
    status: "frozen",
    goal_text: goal,
    source_decision_ids: state.decisions.map(
      (decision) => decision.decision_id,
    ),
    created_at: now,
  });
  state.project_goal.status = "frozen";
  state.phase = "completed";
  state.current_campaign = null;
  state.current_level = "complete";
}

export function transition(
  source: GameState,
  event: GameEvent,
  options: TransitionOptions = {},
): GameState {
  const state = structuredClone(source);
  const now = iso(options.now);

  switch (event.type) {
    case "ANSWER_PROLOGUE":
      answerPrologue(state, event.choiceId, now);
      break;
    case "SELECT_LEVEL_CHOICE":
      selectLevelChoice(state, event, now);
      break;
    case "SUBMIT_LEVEL_QUIZ":
      submitLevelQuiz(state, event);
      break;
    case "CONFIRM_KNOWLEDGE":
      confirmKnowledge(state, event, now);
      break;
    case "VERIFY_KNOWLEDGE":
      verifyKnowledge(state, event, now);
      break;
    case "START_EXAM":
      startExam(state);
      break;
    case "ANSWER_EXAM":
      answerExam(state, event);
      break;
    case "SUBMIT_EXAM":
      submitExam(state, now);
      break;
    case "FORGE_GOAL":
      forgeGoal(state, now);
      break;
  }
  return finish(state, now);
}

export function recalculateDerivedState(source: GameState): GameState {
  const state = structuredClone(source);
  updateProgressAndTime(state);
  state.metrics = calculateMetrics(state);
  return state;
}
