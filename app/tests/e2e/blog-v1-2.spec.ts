import { expect, test } from "@playwright/test";

test("v1.2 博文说明游戏式 Context、自适应和正反馈", async ({ page }) => {
  await page.goto("/case-study-alphafold-casp14.html");

  await expect(page.getByRole("heading", { name: "把科研任务聊清楚，再交给 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "游戏式对齐为什么能得到更完整的 Context" })).toBeVisible();
  await expect(page.getByText("游戏化不是表面装饰", { exact: false })).toContainText("需求对齐");

  await expect(page.getByRole("heading", { name: "认知地图怎样调整下一轮" })).toBeVisible();
  await expect(page.getByText("上一轮 Verified Known Knowns 较少", { exact: false })).toBeVisible();
  await expect(page.getByText("认知地图不是一个展示面板", { exact: false })).toContainText("下一轮问题生成器");

  await expect(page.getByRole("heading", { name: "正反馈为什么重要" })).toBeVisible();
  await expect(page.getByText("目标进度条与百分比", { exact: true })).toBeVisible();
  await expect(page.getByText("当前目标变化 (Goal vN)", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "点击选项怎样成为真实输入" })).toBeVisible();
  await expect(page.getByText("支持按钮的宿主", { exact: true })).toBeVisible();
  await expect(page.getByText("不支持按钮的宿主", { exact: true })).toBeVisible();

  await expect(page.getByRole("link", { name: "安装 Research Quest Skill v1.2.0" })).toHaveAttribute(
    "href",
    "https://github.com/John-Lin98/ai-research-quest/releases/latest",
  );
});
