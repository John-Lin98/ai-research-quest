import { expect, test } from "@playwright/test";

test("v1.2 博文突出认知地图、克制交互和可自定义游戏 Skill", async ({ page }) => {
  await page.goto("/case-study-alphafold-casp14.html");

  await expect(page.getByRole("heading", { name: "把科研任务聊清楚，再交给 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "游戏式对齐为什么能得到更完整的 Context" })).toBeVisible();
  await expect(page.getByText("游戏化不是表面装饰", { exact: false })).toContainText("需求对齐");

  await expect(page.getByRole("heading", { name: "为什么要有针对性地提问，也要克制地回答" })).toBeVisible();
  await expect(page.getByText("让用户少读一点", { exact: true })).toBeVisible();
  await expect(page.getByText("让上下文更干净", { exact: true })).toBeVisible();
  await expect(page.getByText("让纠错更容易", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "认知地图固定包含四部分" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Known Knowns（已知的已知）" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Unknown Unknowns（未知的未知）" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "认知地图怎样调整下一轮" })).toBeVisible();
  await expect(page.getByText("上一轮 Verified Known Knowns 较少", { exact: false })).toBeVisible();
  await expect(page.getByText("认知地图不是一个展示面板", { exact: false })).toContainText("下一轮问题生成器");

  await expect(page.getByRole("heading", { name: "Research Quest 怎样帮助用户澄清科研需求" })).toBeVisible();
  await expect(page.getByText("Research Quest 不预设固定轮数", { exact: false })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Research Quest 如何提供正反馈" })).toBeVisible();
  await expect(page.getByText("目标进度条与百分比", { exact: true })).toBeVisible();
  await expect(page.getByText("当前目标变化 (Goal vN)", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "让 AI 帮你设计属于自己的游戏 Skill" })).toBeVisible();
  await expect(page.getByText("Sol、Fable、Kimi", { exact: false })).toBeVisible();
  await expect(page.getByText("RPG、侦探推理、卡牌、模拟经营、Boss 战", { exact: false })).toBeVisible();

  await expect(page.getByRole("heading", { name: "点击选项怎样成为真实输入" })).toHaveCount(0);
  await expect(page.getByText("交互小细节：", { exact: false })).toContainText("不是 Research Quest 的核心价值");

  await expect(page.getByRole("heading", { name: "最终同时交给 Codex：Context 与 Goal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Frozen Context" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Codex Goal" })).toBeVisible();

  await expect(page.getByRole("link", { name: "Star 项目" })).toHaveAttribute(
    "href",
    "https://github.com/John-Lin98/ai-research-quest",
  );
  await expect(page.getByRole("link", { name: "Follow 作者" })).toHaveAttribute(
    "href",
    "https://github.com/John-Lin98",
  );

  await expect(page.locator("footer")).toHaveText(
    "本页展示产品逻辑和公开试点设计，不构成具体的实验结论或科研能力评价。",
  );

  await expect(page.getByRole("link", { name: "安装 Research Quest Skill v1.2.0" })).toHaveAttribute(
    "href",
    "https://github.com/John-Lin98/ai-research-quest/releases/latest",
  );
});
