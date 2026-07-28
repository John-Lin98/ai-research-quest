import { expect, test } from "@playwright/test";

test("默认首页展示聊天式科研对齐而不是完整游戏 Dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "把科研聊天变成更精准的任务对齐" })).toBeVisible();
  await expect(page.getByRole("button", { name: "体验 5 轮真实案例" })).toHaveClass(/is-active/);
  await expect(page.getByRole("heading", { name: "AlphaFold2 活性位点试点" })).toBeVisible();
  await expect(page.getByLabel("当前完整 Known–Unknown 四象限")).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toHaveCount(0);

  const productNav = page.getByRole("navigation", { name: "Research Quest 产品入口" }).first();
  await expect(productNav.getByRole("link", { name: "安装 Skill" })).toHaveAttribute("href", /releases\/tag\/v1\.1\.0/);
  await expect(productNav.getByRole("link", { name: "完整 Dashboard" })).toHaveAttribute("href", "./?view=full");
});

test("固定真实案例以五轮聊天生成 Frozen Context 与 Codex Goal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "固定完整流程只在桌面项目执行一次");
  await page.goto("/");

  await page.getByRole("button", { name: /酶活性位点几何初筛/ }).click();
  await expect(page.getByLabel("Research Quest 第 2 回合")).toContainText("基础认知提升");
  await page.getByRole("button", { name: /已有 AlphaFold DB、匹配 PDB 和催化残基公开注释/ }).click();
  await page.getByRole("button", { name: /只评价局部几何初筛适用性与失败模式/ }).click();
  await page.getByRole("button", { name: /10 个公开目标，至少 8 个形成有效配对分析/ }).click();

  await expect(page.getByLabel("Research Quest 第 5 回合")).toBeVisible();
  const frozen = page.getByLabel("Frozen Context 与 Codex Goal");
  await expect(frozen).toContainText("Frozen Context");
  await expect(frozen).toContainText("开始前读取 Frozen Context");
  await expect(frozen.getByRole("button", { name: "下载 context.md" })).toBeVisible();
  await expect(frozen.getByRole("button", { name: "下载目标提示词" })).toBeVisible();
  await expect(page.getByLabel(/第 \d 回合 Known–Unknown 四象限/)).toHaveCount(5);
});

test("自定义需求采用两步聊天并生成启动提示词与 context.md", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "自定义生成流程只在桌面项目执行一次");
  await page.goto("/");
  await page.getByRole("button", { name: "输入我的科研需求" }).click();

  await page.getByLabel("我的科研需求").fill("我想设计一个 RNA 二级结构逆折叠实验方案，并复现近五年的公开 baseline。");
  await page.getByRole("button", { name: "继续补充 Context" }).click();
  await page.getByLabel("最终希望获得什么产物？").fill("实验方案、baseline 清单和可执行 Codex Goal");
  await page.getByLabel("当前有哪些材料或约束？").fill("已有公开数据集说明，每天可使用一张 GPU，首轮先完成 smoke test。");
  await page.getByRole("button", { name: "生成启动提示词与 context.md" }).click();

  await expect(page.getByText("已生成初始 Context 和启动提示词")).toBeVisible();
  await expect(page.getByLabel("自定义需求完整初始四象限")).toContainText("RNA 二级结构逆折叠");
  await expect(page.getByText("Research Quest Initial Context")).toBeVisible();
  await expect(page.getByText("请启用 Research Quest Skill")).toBeVisible();
  await expect(page.getByRole("button", { name: "下载 context.md" })).toBeVisible();
  await expect(page.getByRole("button", { name: "下载启动提示词" })).toBeVisible();
  await expect(page.getByRole("link", { name: "完整 Dashboard" }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: "安装 Skill" }).last()).toBeVisible();
});

test("完整 Dashboard 静态入口能够回到原有产品", async ({ page }) => {
  await page.goto("/full-demo/");
  await expect(page).toHaveURL(/\?view=full$/);
  await expect(page.getByRole("heading", { name: "先把项目讲清楚，再让 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();
  await expect(page.getByRole("link", { name: "返回聊天式 Demo" })).toBeVisible();
});

test("聊天式首页在移动视口不产生横向页面溢出", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("当前完整 Known–Unknown 四象限")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test("生成聊天式首页发布截图", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把科研聊天变成更精准的任务对齐" })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-chat-demo.png`),
    fullPage: true,
  });
});
