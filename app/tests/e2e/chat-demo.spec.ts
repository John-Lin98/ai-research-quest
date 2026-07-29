import { expect, test } from "@playwright/test";

test("默认首页突出认知地图与 grill-me-with-docs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "先读资料、建立认知地图，再问一个真正重要的问题" })).toBeVisible();
  await expect(page.getByText("Cognition Map + grill-me-with-docs", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "体验 5 轮真实案例" })).toHaveClass(/is-active/);
  await expect(page.getByRole("heading", { name: "AlphaFold2 活性位点试点" })).toBeVisible();
  const map = page.getByLabel("当前完整 Known–Unknown 四象限");
  await expect(map).toContainText("Known Knowns");
  await expect(map).toContainText("已知的已知");
  await expect(map).toContainText("Unknown Unknowns");
  await expect(map).toContainText("未知的未知");
  await expect(map).not.toContainText("横轴：");
  await expect(page.getByRole("region", { name: "双战役地图" })).toHaveCount(0);

  const productNav = page.getByRole("navigation", { name: "Research Quest 产品入口" }).first();
  await expect(productNav.getByRole("link", { name: "安装 Skill" })).toHaveAttribute("href", /releases\/latest/);
  await expect(productNav.getByRole("link", { name: "完整 Dashboard" })).toHaveAttribute("href", "./?view=full");
});

test("固定案例每轮保存 Context、显示目标变化并生成用户气泡", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "固定完整流程只在桌面项目执行一次");
  await page.goto("/");

  await expect(page.getByLabel("Research Quest 第 1 回合")).toContainText("为什么这一步最值得问");
  await expect(page.getByLabel("Research Quest 第 1 回合")).toContainText("当前目标变化 (Goal v0.1)");
  await expect(page.getByLabel("Research Quest 第 1 回合").getByRole("button", { name: /复制选项/ }).first()).toBeVisible();

  await page.locator(".cq-option-select").filter({ hasText: "先判断活性位点附近的结构是否可靠" }).click();
  await expect(page.getByText("先判断活性位点附近的结构是否可靠", { exact: true }).last()).toBeVisible();
  await expect(page.getByLabel("Research Quest 第 2 回合")).toContainText("research-quest-context.md");
  await expect(page.getByLabel("Research Quest 第 2 回合")).toContainText("grill-me-with-docs");

  await page.locator(".cq-option-select").filter({ hasText: "已有 AlphaFold DB 预测、对应 PDB 和催化残基注释" }).click();
  await page.locator(".cq-option-select").filter({ hasText: "只判断局部结构是否适合初步筛选" }).click();
  await page.locator(".cq-option-select").filter({ hasText: "检查 10 个公开目标，至少 8 个得到可复核结果" }).click();

  await expect(page.getByLabel("Research Quest 第 5 回合")).toBeVisible();
  const frozen = page.getByLabel("Frozen Context 与 Codex Goal");
  await expect(frozen).toContainText("Known Knowns｜已知的已知");
  await expect(frozen).toContainText("Goal 版本记录");
  await expect(frozen).toContainText("先查 Context、文档和代码，再提问");
  await expect(frozen.getByRole("button", { name: "下载 context.md" })).toBeVisible();
  await expect(frozen.getByRole("button", { name: "下载目标提示词" })).toBeVisible();
  await expect(page.getByLabel(/第 \d 回合 Known–Unknown 四象限/)).toHaveCount(5);
});

test("自定义需求生成以认知地图和文档驱动为核心的启动材料", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "自定义生成流程只在桌面项目执行一次");
  await page.goto("/");
  await page.getByRole("button", { name: "输入我的科研需求" }).click();

  await page.getByLabel("我的科研需求").fill("我想设计一个 RNA 二级结构逆折叠实验方案，并复现近五年的公开 baseline。");
  await page.getByRole("button", { name: "继续补充 Context" }).click();
  await page.getByLabel("最终希望获得什么？").fill("实验方案、baseline 清单和可执行 Codex Goal");
  await page.getByLabel("现在有哪些资料或限制？").fill("已有公开数据集说明，每天可使用一张 GPU，首轮先完成 smoke test。");
  await page.getByRole("button", { name: "生成启动提示词与 context.md" }).click();

  await expect(page.getByText("已生成初始 Context 和启动提示词", { exact: false })).toBeVisible();
  await expect(page.getByLabel("自定义需求完整初始四象限")).toContainText("RNA 二级结构逆折叠");
  const generated = page.locator(".cq-generated > div");
  await expect(generated.nth(0)).toContainText("grill-me-with-docs 工作规则");
  await expect(generated.nth(1)).toContainText("核心逻辑固定为 Known–Unknown 四象限认知地图 + grill-me-with-docs");
  await expect(page.getByRole("button", { name: "下载 context.md" })).toBeVisible();
  await expect(page.getByRole("button", { name: "下载启动提示词" })).toBeVisible();
  await expect(page.getByRole("link", { name: "完整 Dashboard" }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: "安装 Skill" }).last()).toBeVisible();
});

test("完整 Dashboard 友好入口与原有产品均保留", async ({ page }) => {
  const redirect = await page.request.get("/full-demo/index.html");
  expect(redirect.ok()).toBeTruthy();
  expect(await redirect.text()).toContain("?view=full");

  await page.goto("/?view=full");
  await expect(page.getByRole("heading", { name: "先读资料、建立认知地图，再让 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();
  await expect(page.getByRole("link", { name: "返回聊天式 Demo" })).toBeVisible();
  const boundary = page.getByRole("complementary", { name: "公开演示边界" });
  await expect(boundary).toContainText("本页只使用公开或脱敏内容");
  await expect(boundary).not.toContainText("本地处理边界");
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
  await expect(page.getByRole("heading", { name: "先读资料、建立认知地图，再问一个真正重要的问题" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-chat-demo.png`), fullPage: true });
});
