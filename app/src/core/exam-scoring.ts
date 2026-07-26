import type { ExamQuestion } from "../types/index.ts";

export interface ExamAnswerScore {
  isCorrect: boolean;
  score: number;
}

const KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  "exam-decision-application": ["隔离", "暂停", "记录", "验证", "核验", "quarantine", "pause", "verify"],
  "exam-concept-understanding": ["candidate", "候选", "确认", "verified", "验证"],
  "exam-transfer": ["退出", "停止", "条件", "边界", "检查", "exit", "stop", "boundary"],
};

/**
 * This is a transparent demo rubric, not a learning-effect measurement.
 * It makes the UI's pass/fail behavior deterministic without sending text to
 * a model or claiming that an arbitrary non-empty response is correct.
 */
export function scoreExamAnswer(
  questionId: ExamQuestion["question_id"],
  answer: string,
): ExamAnswerScore {
  const normalized = answer.trim().toLocaleLowerCase();
  const isCorrect = (KEYWORDS[questionId] ?? []).some((keyword) =>
    normalized.includes(keyword.toLocaleLowerCase()),
  );
  return { isCorrect, score: isCorrect ? 100 : 0 };
}
