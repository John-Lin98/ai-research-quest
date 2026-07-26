import type { ExportRecord, GameState } from "../types/index.ts";

export interface ExportResult {
  state: GameState;
  record: ExportRecord;
}

export class PublicSafetyError extends Error {
  constructor() {
    super("导出已停止：检测到可能的敏感个人、路径或凭据文本。请移除后重试。");
    this.name = "PublicSafetyError";
  }
}

const PUBLIC_EXPORT_BLOCKERS: readonly RegExp[] = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\b[A-Z]:\\|\/(?:home|users|etc|var|data|mnt)\/)/i,
  /\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]{10,}|AIza[A-Za-z0-9_-]{10,})\b/i,
  /\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*\S+/i,
];
const MAX_EXAM_ANSWER_LENGTH = 1_000;

function assertPublicExportSafe(content: string): void {
  if (PUBLIC_EXPORT_BLOCKERS.some((pattern) => pattern.test(content))) {
    throw new PublicSafetyError();
  }
}

function assertExamAnswersPublicSafe(source: GameState): void {
  for (const question of source.exam.questions) {
    const answers = Array.isArray(question.answer)
      ? question.answer
      : question.answer === null
        ? []
        : [question.answer];
    if (answers.some((answer) => answer.length > MAX_EXAM_ANSWER_LENGTH)) {
      throw new PublicSafetyError();
    }
    for (const answer of answers) assertPublicExportSafe(answer);
  }
}

function iso(value: string | Date | undefined): string {
  return value instanceof Date
    ? value.toISOString()
    : value ?? new Date().toISOString();
}

async function sha256(content: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("当前运行环境不支持 Web Crypto SHA-256。");
  }
  const bytes = new TextEncoder().encode(content);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function addExportArtifact(
  state: GameState,
  kind: "state" | "goal",
): void {
  const artifactId =
    kind === "state" ? "artifact-state-export" : "artifact-goal-export";
  if (state.artifacts.some((item) => item.artifact_id === artifactId)) return;
  state.artifacts.push({
    artifact_id: artifactId,
    artifact_type:
      kind === "state" ? "game-state-export" : "codex-goal-export",
    title:
      kind === "state"
        ? "公开安全的游戏状态导出"
        : "公开安全的 Codex Goal 导出",
    uri: `quest://artifact/${artifactId}`,
    public_safe: true,
  });
}

export async function exportGameState(
  source: GameState,
  nowValue?: string | Date,
): Promise<ExportResult> {
  assertExamAnswersPublicSafe(source);
  const state = structuredClone(source);
  const snapshot = structuredClone(source);
  snapshot.exports.state = {
    ...snapshot.exports.state,
    status: "not-generated",
    filename: null,
    generated_at: null,
    sha256: null,
    content: null,
  };
  const content = JSON.stringify(snapshot, null, 2);
  assertPublicExportSafe(content);
  const generatedAt = iso(nowValue);
  const record: GameState["exports"]["state"] = {
    kind: "game-state",
    status: "ready",
    media_type: "application/json",
    filename: `research-quest-state-r${source.revision}.json`,
    generated_at: generatedAt,
    sha256: await sha256(content),
    content,
    schema_version: "1.0.0",
    public_safe: true,
  };
  state.exports.state = record;
  addExportArtifact(state, "state");
  state.revision += 1;
  state.updated_at = generatedAt;
  return { state, record };
}

export async function exportCodexGoal(
  source: GameState,
  nowValue?: string | Date,
): Promise<ExportResult> {
  const goal = [...source.goal_versions]
    .reverse()
    .find((version) => version.status === "frozen");
  if (!goal || source.phase !== "completed") {
    throw new Error("完成最终考试并锻造 Goal 后才能导出 Codex Goal。");
  }
  assertPublicExportSafe(goal.goal_text);
  const state = structuredClone(source);
  const generatedAt = iso(nowValue);
  const record: GameState["exports"]["goal"] = {
    kind: "codex-goal",
    status: "ready",
    media_type: "text/markdown",
    filename: `research-quest-codex-goal-v${goal.version}.md`,
    generated_at: generatedAt,
    sha256: await sha256(goal.goal_text),
    content: goal.goal_text,
    schema_version: "1.0.0",
    public_safe: true,
  };
  state.exports.goal = record;
  addExportArtifact(state, "goal");
  state.revision += 1;
  state.updated_at = generatedAt;
  return { state, record };
}

export function markExportDownloaded(
  source: GameState,
  kind: "state" | "goal",
  nowValue?: string | Date,
): GameState {
  const state = structuredClone(source);
  const record = state.exports[kind];
  if (record.status !== "ready") {
    throw new Error(`${kind} 导出尚未就绪。`);
  }
  record.status = "downloaded";
  state.revision += 1;
  state.updated_at = iso(nowValue);
  return state;
}
