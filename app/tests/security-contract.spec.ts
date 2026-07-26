import assert from "node:assert/strict";
import {
  PublicSafetyError,
  createInitialGameState,
  exportGameState,
} from "../src/core/index.ts";

const NOW = "2026-07-26T08:00:00.000Z";

async function expectBlocked(unsafeText: string, description: string): Promise<void> {
  const state = createInitialGameState({ now: NOW, deterministicSeed: 20260726 });
  state.exam.questions[0]!.answer = unsafeText;
  await assert.rejects(
    () => exportGameState(state, NOW),
    PublicSafetyError,
    description,
  );
}

async function main(): Promise<void> {
  await expectBlocked("user@example.test", "邮箱必须阻止导出");
  await expectBlocked("C:\\Users\\research\\private.txt", "绝对 Windows 路径必须阻止导出");
  await expectBlocked("token=ghp_0123456789abcdef", "伪 token 必须阻止导出");
  await expectBlocked("安全回答 ".repeat(201), "单题超过 1000 字符必须阻止导出");
  console.log("SECURITY_EXPORT_GATE_OK 邮箱、绝对路径和伪 token 均被 fail-closed 阻止");
}

void main();
