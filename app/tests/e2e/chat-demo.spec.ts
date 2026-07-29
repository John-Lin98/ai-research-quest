import { expect, test } from "@playwright/test";

test("默认首页突出认知地图与 grill-me-with-docs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "把科研聊天变成更精准的任务对齐" })).toBeVisible();
  await expect(page.getByText("核心逻辑只有两步", { exact: false })).toContainText("Known–Unknown 四象限");
  await expect(page.getByText("核心逻辑只有两步", { exact: false })).toContainText("grill-me-with-docs");
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

test("每轮最后一个选项暂停闯关并生成固定关卡线索", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "固定关卡线索完整路径只在桌面项目执行一次");
  await page.goto("/");

  const rounds = [
    {
      question: "为什么不能直接让 Codex 自己判断我到底想做什么？",
      answer: "Codex 可以选择技术实现",
      choice: "先判断活性位点附近的结构是否可靠",
    },
    {
      question: "为什么需要同时准备预测结构、实验结构和催化残基注释？",
      answer: "预测结构是要检查的对象",
      choice: "已有 AlphaFold DB 预测、对应 PDB 和催化残基注释",
    },
    {
      question: "这里说的‘结果最多能说明什么’到底是什么意思？",
      answer: "区分‘计算结果看到什么’和‘最终能下什么结论’",
      choice: "只判断局部结构是否适合初步筛选，并报告失败情况",
    },
    {
      question: "为什么要先规定 10 个目标和至少 8 个有效结果？",
      answer: "给 Codex 一个清楚的结束条件",
      choice: "检查 10 个公开目标，至少 8 个得到可复核结果",
    },
  ];

  for (const item of rounds) {
    const current = page.locator(".cq-turn-pair").last();
    const clueButton = current.locator(".cq-option-row--clue .cq-option-select");
    await expect(clueButton).toContainText("暂不闯关，我还有一些问题");
    await clueButton.click();
    await expect(current.getByText(item.question, { exact: true })).toBeVisible();
    await expect(current.getByText(item.answer, { exact: false })).toBeVisible();
    await expect(current.getByText("主目标进度暂停", { exact: true })).toBeVisible();
    await expect(current.getByText(/已保存到：/)).toBeVisible();
    await current.locator(".cq-option-select").filter({ hasText: item.choice }).click();
  }

  await expect(page.getByLabel("Research Quest 第 5 回合")).toBeVisible();
  const frozen = page.getByLabel("Frozen Context 与 Codex Goal");
  await expect(frozen).toContainText("关卡线索与用户追问");
  await expect(frozen).toContainText(rounds[0].question);
  await expect(frozen).toContainText(rounds[3].question);
  await expect(frozen).toContainText("用户可以随时暂停主问题并提出额外问题");
  await expect(frozen.getByRole("button", { name: "下载 context.md" })).toBeVisible();
  await expect(frozen.getByRole("button", { name: "下载目标提示词" })).toBeVisible();
});

test("普通选择直接成为带头像的用户回复并提供复制兼容", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".cq-turn-pair").first();
  await expect(first.getByRole("button", { name: /复制选项：先判断活性位点附近的结构是否可靠/ })).toBeVisible();
  await first.locator(".cq-option-select").filter({ hasText: "先判断活性位点附近的结构是否可靠" }).click();
  await expect(first.getByText("先判断活性位点附近的结构是否可靠", { exact: true })).toBeVisible();
  await expect(first.locator(".cq-avatar--user")).toBeVisible();
});

test("自定义需求生成的启动材料包含自由追问与关卡线索协议", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "自定义生成流程只在桌面项目执行一次");
  await page.goto("/");
  await page.getByRole("button", { name: "输入我的科研需求" }).click();

  await page.getByLabel("我的科研需求").fill("我想设计一个 RNA 二级结构逆折叠实验方案，并复现近五年的公开 baseline。");
  await page.getByRole("button", { name: "继续补充 Context" }).click();
  await page.getByLabel("最终希望获得什么产物？").fill("实验方案、baseline 清单和可执行 Codex Goal");
  await page.getByLabel("当前有哪些资料或限制？").fill("已有公开数据集说明，每天可使用一张 GPU，首轮先完成 smoke test。");
  await page.getByRole("button", { name: "生成启动提示词与 context.md" }).click();

  await expect(page.getByText("已生成初始 Context 和启动提示词", { exact: false })).toBeVisible();
  const generated = page.locator(".cq-generated > div");
  await expect(generated.nth(0)).toContainText("核心逻辑：认知地图 + grill-me-with-docs");
  await expect(generated.nth(0)).toContainText("暂不闯关，我还有一些问题");
  await expect(generated.nth(1)).toContainText("用户可以随时提出任意问题");
  await expect(generated.nth(1)).toContainText("重新生成当前 grill-me 问题");
  await expect(page.getByRole("button", { name: "下载 context.md" })).toBeVisible();
  await expect(page.getByRole("button", { name: "下载启动提示词" })).toBeVisible();
});

test("完整 Dashboard 保留且长隐私说明收为一句提示", async ({ page }) => {
  const redirect = await page.request.get("/full-demo/index.html");
  expect(redirect.ok()).toBeTruthy();
  expect(await redirect.text()).toContain("?view=full");

  await page.goto("/?view=full");
  await expect(page.getByRole("heading", { name: "先读资料、建立认知地图，再让 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();
  const boundary = page.getByLabel("公开演示边界");
  await expect(boundary).toContainText("本页只使用公开或脱敏内容");
  await expect(page.getByText("公开演示与隐私声明", { exact: true })).not.toBeVisible();
  await expect(page.getByText("本地处理边界", { exact: true })).not.toBeVisible();
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
