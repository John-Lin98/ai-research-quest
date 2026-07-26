import type {
  GameState,
  UnderstandingMetrics,
} from "../types/index.ts";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateMetrics(state: GameState): UnderstandingMetrics {
  const verified = state.known_knowns.verified;
  if (state.interaction_mode !== "interactive") {
    // Auto-demo is a deterministic product walkthrough, not a user session.
    // Keep its visible state transitions, but never attach learning or research
    // credit to the person watching it.
    return {
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
    };
  }
  const verificationEvidence = verified.flatMap(
    (knowledge) => knowledge.verification_evidence,
  );
  const quizAccuracy = average(
    Object.values(state.campaigns)
      .flatMap((campaign) => campaign.levels)
      .map((level) => level.quiz.accuracy)
      .filter((value): value is number => value !== null),
  );
  const completedExamQuestions = state.exam.questions.filter(
    (question) => question.is_correct !== null,
  );
  const examAccuracy =
    completedExamQuestions.length === 0
      ? null
      : completedExamQuestions.filter((question) => question.is_correct).length /
        completedExamQuestions.length;
  const transferScore = average(
    state.exam.questions
      .filter(
        (question) =>
          question.category === "transfer" && question.score !== null,
      )
      .map((question) => question.score as number),
  );
  const appliedKnowledgeCount = verificationEvidence.filter((evidence) =>
    ["choice-application", "level-quiz", "final-exam", "transfer-task"].includes(
      evidence.evidence_type,
    ),
  ).length;

  // Formal understanding has a deliberately narrow contract: only items that
  // completed Candidate -> Confirmed -> Verified may contribute to it.
  // Quiz, exam, correction, and open-question signals remain observable
  // diagnostics, but must never turn unverified material into formal credit.
  const formalUnderstandingScore = clamp((verified.length / 14) * 100);

  return {
    new_verified_known_knowns: verified.length,
    corrected_misconceptions: state.metrics.corrected_misconceptions,
    new_known_unknowns: state.known_unknowns.length,
    applied_knowledge_count: appliedKnowledgeCount,
    level_quiz_accuracy: quizAccuracy,
    final_exam_accuracy: examAccuracy,
    transfer_task_score: transferScore,
    goal_revision_count: Math.max(0, state.goal_versions.length - 1),
    formal_understanding_score: Number(formalUnderstandingScore.toFixed(2)),
    verified_only_for_knowledge_count: true,
  };
}
