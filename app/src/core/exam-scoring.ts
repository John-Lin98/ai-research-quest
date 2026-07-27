import type { ExamQuestion } from "../types/index.ts";

export interface ExamAnswerScore {
  isCorrect: boolean;
  score: number;
}

const KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  "exam-decision-application": [
    "局部",
    "活性位点",
    "催化",
    "复核",
    "排除",
    "限制结论",
    "单独报告",
    "local",
    "active site",
    "review",
    "exclude",
  ],
  "exam-concept-understanding": [
    "plddt",
    "置信度",
    "不等于",
    "不能证明",
    "催化几何",
    "配体",
    "辅因子",
    "confidence",
    "ligand",
    "cofactor",
  ],
  "exam-transfer": [
    "配体",
    "对接",
    "实验结构",
    "基线",
    "控制",
    "质子化",
    "搜索框",
    "正交",
    "ligand",
    "docking",
    "baseline",
    "control",
  ],
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
