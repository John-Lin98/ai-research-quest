import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInitialGameState } from "../src/core/index.ts";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const target = resolve(root, "public/demo-data/default-game-state.json");
const state = createInitialGameState({
  now: "2026-07-26T00:00:00.000Z",
  deterministicSeed: 20260726,
  stateId: "demo-real-research-quest-v2",
});
const generated = `${JSON.stringify(state, null, 2)}\n`;

if (process.argv.includes("--check-only")) {
  const committed = await readFile(target, "utf8");
  assert.equal(
    committed,
    generated,
    "default-game-state.json 与当前真实科研任务运行时状态不一致；请运行 npm run fixture:generate --prefix app",
  );
  console.log("DEFAULT_FIXTURE_OK 公开默认状态与真实科研任务运行时一致");
} else {
  await writeFile(target, generated, "utf8");
  console.log(`DEFAULT_FIXTURE_WRITTEN ${target}`);
}
