import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  InvalidTransitionError,
  createInitialGameState,
  exportCodexGoal,
  exportGameState,
  runAutoDemo,
  scoreExamAnswer,
  transition,
} from "../src/core/index.ts";
import type { CampaignId, GameState, LevelId } from "../src/types/index.ts";

const NOW = "2026-07-26T08:00:00.000Z";

function expectInvalid(action: () => unknown, description: string): void {
  assert.throws(action, InvalidTransitionError, description);
}

function chooseAndVerify(
  source: GameState,
  campaignId: CampaignId,
  levelId: LevelId,
): GameState {
  const level = source.campaigns[
    campaignId === "learning-cognition" ? "learning_cognition" : "research_decision"
  ].levels.find((item) => item.level_id === levelId)!;
  let state = transition(
    source,
    {
      type: "SELECT_LEVEL_CHOICE",
      campaignId,
      levelId,
      choiceId: level.choices[0]!.choice_id,
    },
    { now: NOW },
  );
  const knowledgeId = `knowledge-${campaignId}-${levelId}`;
  state = transition(
    state,
    { type: "CONFIRM_KNOWLEDGE", knowledgeId, score: 100 },
    { now: NOW },
  );
  state = transition(
    state,
    { type: "SUBMIT_LEVEL_QUIZ", campaignId, levelId, accuracy: 1 },
    { now: NOW },
  );
  return transition(
    state,
    { type: "VERIFY_KNOWLEDGE", knowledgeId, evidenceType: "level-quiz", score: 100 },
    { now: NOW },
  );
}

function completeInteractiveGame(): GameState {
  let state = createInitialGameState({ now: NOW, deterministicSeed: 20260726 });
  assert.equal(state.schema_version, "1.0.0");
  assert.equal(state.phase, "prologue");
  assert.equal(state.current_level, "prologue");
  assert.equal(state.prologue.status, "active");
  assert.equal(state.known_knowns.verified.length, 0);
  assert.equal(state.metrics.new_verified_known_knowns, 0);
  assert.equal(state.metrics.formal_understanding_score, 0);
  assert.equal(
    state.privacy.sanitization.review_status,
    "approved",
    "公开默认 demo 必须反映已完成的独立发布审查",
  );

  expectInvalid(
    () => transition(state, {
      type: "SELECT_LEVEL_CHOICE",
      campaignId: "learning-cognition",
      levelId: "level-2",
      choiceId: "not-yet-available",
    }, { now: NOW }),
    "序章完成前不能跳到关卡",
  );

  state = transition(
    state,
    { type: "ANSWER_PROLOGUE", choiceId: state.prologue.choices[0]!.choice_id },
    { now: NOW },
  );
  const first = state.campaigns.learning_cognition.levels[0]!;
  state = transition(
    state,
    {
      type: "SELECT_LEVEL_CHOICE",
      campaignId: "learning-cognition",
      levelId: "level-1",
      choiceId: first.choices[0]!.choice_id,
    },
    { now: NOW },
  );
  const firstKnowledge = "knowledge-learning-cognition-level-1";
  assert.equal(state.known_knowns.candidate.length, 1);
  assert.equal(state.known_knowns.confirmed.length, 0);
  assert.equal(state.metrics.new_verified_known_knowns, 0);
  assert.equal(state.metrics.formal_understanding_score, 0);
  expectInvalid(
    () => transition(state, { type: "VERIFY_KNOWLEDGE", knowledgeId: firstKnowledge, evidenceType: "level-quiz", score: 100 }, { now: NOW }),
    "Candidate 不得跳级为 Verified",
  );
  expectInvalid(
    () => transition(state, {
      type: "SELECT_LEVEL_CHOICE",
      campaignId: "learning-cognition",
      levelId: "level-1",
      choiceId: first.choices[1]!.choice_id,
    }, { now: NOW }), "同一关卡不得重复选择");
  state = transition(
    state,
    { type: "CONFIRM_KNOWLEDGE", knowledgeId: firstKnowledge, score: 100 },
    { now: NOW },
  );
  assert.equal(state.known_knowns.candidate.length, 0);
  assert.equal(state.known_knowns.confirmed.length, 1);
  assert.equal(state.metrics.new_verified_known_knowns, 0);
  assert.equal(state.metrics.formal_understanding_score, 0);
  expectInvalid(
    () => transition(state, { type: "CONFIRM_KNOWLEDGE", knowledgeId: firstKnowledge }, { now: NOW }),
    "Confirmed 不得重复确认",
  );
  expectInvalid(
    () => transition(state, { type: "VERIFY_KNOWLEDGE", knowledgeId: firstKnowledge, evidenceType: "choice-application", score: 100 }, { now: NOW }),
    "没有通过小测不得升级为 Verified",
  );
  state = transition(
    state,
    { type: "SUBMIT_LEVEL_QUIZ", campaignId: "learning-cognition", levelId: "level-1", accuracy: 0 },
    { now: NOW },
  );
  assert.equal(state.campaigns.learning_cognition.levels[0]!.status, "active");
  expectInvalid(
    () => transition(state, { type: "VERIFY_KNOWLEDGE", knowledgeId: firstKnowledge, evidenceType: "level-quiz", score: 100 }, { now: NOW }),
    "未通过小测不得升级为 Verified",
  );
  state = transition(
    state,
    { type: "SUBMIT_LEVEL_QUIZ", campaignId: "learning-cognition", levelId: "level-1", accuracy: 1 },
    { now: NOW },
  );
  state = transition(
    state,
    { type: "VERIFY_KNOWLEDGE", knowledgeId: firstKnowledge, evidenceType: "level-quiz", score: 100 },
    { now: NOW },
  );
  assert.equal(state.known_knowns.verified.length, 1);
  assert.equal(state.metrics.new_verified_known_knowns, 1);
  assert.ok((state.metrics.formal_understanding_score ?? 0) > 0);

  for (const campaignId of ["learning-cognition", "research-decision"] as const) {
    const levels = state.campaigns[
      campaignId === "learning-cognition" ? "learning_cognition" : "research_decision"
    ].levels;
    assert.equal(levels.length, 7, `${campaignId} 必须严格七关`);
    for (const level of levels) {
      if (campaignId === "learning-cognition" && level.level_id === "level-1") continue;
      state = chooseAndVerify(state, campaignId, level.level_id);
    }
  }
  assert.equal(state.known_knowns.verified.length, 14);
  assert.equal(state.phase, "final-exam");
  assert.equal(state.current_level, "final-exam");

  state = transition(state, { type: "START_EXAM" }, { now: NOW });
  for (const question of state.exam.questions) {
    state = transition(state, {
      type: "ANSWER_EXAM",
      questionId: question.question_id,
      answer: "不含 rubric 的模拟回答",
      isCorrect: false,
      score: 0,
    }, { now: NOW });
  }
  state = transition(state, { type: "SUBMIT_EXAM" }, { now: NOW });
  assert.equal(state.exam.status, "failed");
  state = transition(state, { type: "START_EXAM" }, { now: NOW });
  assert.equal(state.exam.status, "in-progress");
  assert.ok(state.exam.questions.every((question) => question.answer === null));
  for (const question of state.exam.questions) {
    state = transition(state, {
      type: "ANSWER_EXAM",
      questionId: question.question_id,
      answer: "公开、安全的模拟答案",
      isCorrect: true,
      score: 100,
    }, { now: NOW });
  }
  state = transition(state, { type: "SUBMIT_EXAM" }, { now: NOW });
  assert.equal(state.exam.passed, true);
  assert.equal(state.phase, "goal-forge");
  state = transition(state, { type: "FORGE_GOAL" }, { now: NOW });
  assert.equal(state.phase, "completed");
  return state;
}

function completeWithoutKnowledgeCertification(): GameState {
  let state = createInitialGameState({ now: NOW, deterministicSeed: 20260726 });
  state = transition(
    state,
    { type: "ANSWER_PROLOGUE", choiceId: state.prologue.choices[0]!.choice_id },
    { now: NOW },
  );
  for (const campaignId of ["learning-cognition", "research-decision"] as const) {
    const levels = state.campaigns[
      campaignId === "learning-cognition" ? "learning_cognition" : "research_decision"
    ].levels;
    for (const level of levels) {
      state = transition(state, {
        type: "SELECT_LEVEL_CHOICE",
        campaignId,
        levelId: level.level_id,
        choiceId: level.choices[0]!.choice_id,
      }, { now: NOW });
      state = transition(state, {
        type: "SUBMIT_LEVEL_QUIZ",
        campaignId,
        levelId: level.level_id,
        accuracy: 1,
      }, { now: NOW });
    }
  }
  state = transition(state, { type: "START_EXAM" }, { now: NOW });
  for (const question of state.exam.questions) {
    state = transition(state, {
      type: "ANSWER_EXAM",
      questionId: question.question_id,
      answer: "公开、安全的模拟答案",
      isCorrect: true,
      score: 100,
    }, { now: NOW });
  }
  state = transition(state, { type: "SUBMIT_EXAM" }, { now: NOW });
  return transition(state, { type: "FORGE_GOAL" }, { now: NOW });
}

function assertPublicDemoFixtureContract(): void {
  const fixture = JSON.parse(
    readFileSync(
      new URL("../../public/demo-data/default-game-state.json", import.meta.url),
      "utf8",
    ),
  ) as GameState;
  assert.equal(fixture.auto_demo.duration_seconds, 75, "公开默认数据必须与 75 秒演示合同一致");
  assert.equal(
    fixture.privacy.sanitization.review_status,
    "approved",
    "公开默认数据必须反映已完成的独立发布审查",
  );
  const runtime = createInitialGameState({ now: NOW, deterministicSeed: 20260726 });
  assert.equal(
    runtime.privacy.real_research_results_included,
    fixture.privacy.real_research_results_included,
    "运行时和公开 fixture 必须对真实研究结果边界保持一致",
  );
  assert.deepEqual(
    runtime.privacy.sanitization,
    fixture.privacy.sanitization,
    "运行时和公开 fixture 必须共享同一公开审查状态与脱敏声明",
  );
}

async function main(): Promise<void> {
  assertPublicDemoFixtureContract();
  const initialExam = createInitialGameState({ now: NOW }).exam.questions;
  const validAnswers: Record<string, string> = {
    "exam-decision-application": "先隔离并记录来源。",
    "exam-concept-understanding": "Candidate 仍是候选，尚未完成验证。",
    "exam-transfer": "先写出停止条件和检查边界。",
  };
  for (const question of initialExam) {
    assert.deepEqual(scoreExamAnswer(question.question_id, validAnswers[question.question_id]!), {
      isCorrect: true,
      score: 100,
    });
    assert.deepEqual(scoreExamAnswer(question.question_id, "随便试试看"), {
      isCorrect: false,
      score: 0,
    });
  }

  const completed = completeInteractiveGame();
  const stateExport = await exportGameState(completed, NOW);
  assert.equal(stateExport.record.status, "ready");
  assert.equal(stateExport.record.schema_version, "1.0.0");
  assert.match(stateExport.record.sha256 ?? "", /^[a-f0-9]{64}$/);
  assert.equal(
    stateExport.record.sha256,
    createHash("sha256").update(stateExport.record.content!).digest("hex"),
  );
  const goalExport = await exportCodexGoal(stateExport.state, NOW);
  assert.equal(goalExport.record.status, "ready");
  assert.equal(goalExport.record.schema_version, "1.0.0");
  assert.match(goalExport.record.sha256 ?? "", /^[a-f0-9]{64}$/);
  assert.equal(
    goalExport.record.sha256,
    createHash("sha256").update(goalExport.record.content!).digest("hex"),
  );

  const unsafeState = structuredClone(completed);
  unsafeState.exam.questions[0]!.answer = "contact demo@example.com";
  await assert.rejects(
    () => exportGameState(unsafeState, NOW),
    /检测到可能的敏感个人、路径或凭据文本/,
  );

  const frozenWithCandidates = completeWithoutKnowledgeCertification();
  const frozenGoal = frozenWithCandidates.goal_versions.at(-1)?.goal_text;
  const frozenMetrics = structuredClone(frozenWithCandidates.metrics);
  const pendingKnowledge = frozenWithCandidates.known_knowns.candidate[0]!;
  assert.equal(frozenWithCandidates.phase, "completed");
  assert.ok(pendingKnowledge, "未认证知识应保留在 Candidate，供冻结守卫验证");
  expectInvalid(
    () => transition(frozenWithCandidates, {
      type: "CONFIRM_KNOWLEDGE",
      knowledgeId: pendingKnowledge.knowledge_id,
    }, { now: NOW }),
    "Goal 冻结后不得再修改认证状态",
  );
  assert.equal(frozenWithCandidates.goal_versions.at(-1)?.goal_text, frozenGoal);
  assert.deepEqual(frozenWithCandidates.metrics, frozenMetrics);
  const oversizedState = structuredClone(completed);
  oversizedState.exam.questions[0]!.answer = "x".repeat(1_001);
  await assert.rejects(
    () => exportGameState(oversizedState, NOW),
    /检测到可能的敏感个人、路径或凭据文本/,
  );

  const firstAuto = await runAutoDemo(
    createInitialGameState({ now: NOW, deterministicSeed: 20260726 }),
    { now: NOW },
  );
  const secondAuto = await runAutoDemo(
    createInitialGameState({ now: NOW, deterministicSeed: 20260726 }),
    { now: NOW },
  );
  assert.equal(firstAuto.auto_demo.duration_seconds, 75);
  assert.ok(firstAuto.auto_demo.duration_seconds >= 60 && firstAuto.auto_demo.duration_seconds <= 90);
  assert.equal(firstAuto.auto_demo.loop, false);
  assert.equal(firstAuto.auto_demo.status, "completed");
  assert.equal(firstAuto.phase, "completed");
  assert.equal(firstAuto.interaction_mode, "auto-demo");
  assert.equal(firstAuto.known_knowns.verified.length, 14, "自动演示可保留可视化状态轨迹");
  assert.equal(firstAuto.metrics.new_verified_known_knowns, 0);
  assert.equal(firstAuto.metrics.corrected_misconceptions, 0);
  assert.equal(firstAuto.metrics.new_known_unknowns, 0);
  assert.equal(firstAuto.metrics.applied_knowledge_count, 0);
  assert.equal(firstAuto.metrics.level_quiz_accuracy, null);
  assert.equal(firstAuto.metrics.final_exam_accuracy, null);
  assert.equal(firstAuto.metrics.transfer_task_score, null);
  assert.equal(firstAuto.metrics.goal_revision_count, 0);
  assert.equal(firstAuto.metrics.formal_understanding_score, 0);
  assert.match(firstAuto.goal_versions.at(-1)?.goal_text ?? "", /不构成用户 Verified 或正式理解分/);
  assert.equal(firstAuto.exports.state.status, "ready");
  assert.equal(firstAuto.exports.goal.status, "ready");
  assert.deepEqual(firstAuto, secondAuto, "固定 seed 和时间必须产出确定性自动演示");

  console.log("CONTRACT_CORE_OK 初始状态、单向认证、双战役、考试、导出与 75 秒自动演示均通过");
}

void main();
