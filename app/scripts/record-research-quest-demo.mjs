import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.env.RESEARCH_QUEST_URL ?? "http://127.0.0.1:4174/";
const output = resolve(
  process.cwd(),
  process.env.RESEARCH_QUEST_VIDEO ?? "public/research-quest-demo-75s.webm",
);
const videoDir = resolve(process.env.RUNNER_TEMP ?? process.env.TEMP ?? ".", "research-quest-video");
await mkdir(videoDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
await page.goto(baseUrl, { waitUntil: "networkidle" });

await page.evaluate(() => {
  const overlay = document.createElement("aside");
  overlay.id = "rq-video-caption";
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    zIndex: "9999",
    right: "28px",
    top: "28px",
    maxWidth: "460px",
    padding: "16px 20px",
    border: "1px solid rgba(255,255,255,.35)",
    borderRadius: "18px",
    color: "white",
    background: "linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,64,175,.94))",
    boxShadow: "0 18px 45px rgba(15,23,42,.35)",
    font: "700 22px/1.35 Inter, 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
    backdropFilter: "blur(10px)",
  });
  overlay.textContent = "Research Quest｜AI Research Game：把科研目标玩成可执行任务";
  document.body.appendChild(overlay);
});

async function caption(text) {
  await page.evaluate((value) => {
    const overlay = document.querySelector("#rq-video-caption");
    if (overlay) overlay.textContent = value;
  }, text);
}

async function scroll(selector) {
  const target = page.locator(selector).first();
  if (await target.count()) {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
  }
}

const video = page.video();
await page.waitForTimeout(1800);
await page.getByRole("button", { name: "75 秒看真实需求如何变成 Goal（不计正式得分）" }).click();

await caption("1｜用更有趣的方式澄清真实科研目标");
await scroll(".rq-decision");
await page.waitForTimeout(7000);

await caption("2｜固定四象限：意识 × 掌握");
await scroll("#cognition-title");
await page.waitForTimeout(8000);

await caption("3｜每轮通常 1 个、最多 3 个关键问题");
await scroll(".rq-decision");
await page.waitForTimeout(7500);

await caption("4｜上一关 Known Knowns 较少 → 下一关自动补基础");
await scroll(".rq-adaptive-hint");
await page.waitForTimeout(8500);

await caption("5｜持续生成 Context、方案与 Goal vN");
await scroll(".rq-campaign-grid");
await page.waitForTimeout(7500);

await caption("6｜交给 ChatGPT / Codex / 多 Agent 执行");
await scroll("#cognition-title");
await page.waitForTimeout(8000);

await caption("每轮反馈：认知分、科研进度、剩余时间、Goal 变化");
await scroll(".rq-metrics");
await page.waitForTimeout(7500);

await caption("Goal Forge → 执行 → 验证 → 四象限回写");
await scroll(".rq-final");
await page.waitForTimeout(8000);

await context.close();
if (!video) throw new Error("Playwright 未生成视频对象。");
await video.saveAs(output);
await browser.close();
console.log(`VIDEO_WRITTEN ${output}`);
