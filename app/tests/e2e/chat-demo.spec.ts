import { expect, test } from "@playwright/test";

test("默认首页突出认知地图与 grill-me-with-docs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "把科研聊天变成更精准的任务对齐" })).toBeVisible();
  const intro = page.getByText("核心逻辑是 Known–Unknown 四象限", { exact: false });
  await expect(intro).toContainText("grill-me-with-docs");
  await expect(intro).toContainText("主动补充上下文");
  const map = page.getByLabel("当前完整 Known–Unknown 四象限");
  await expect(map).toContainText("Known Knowns");
  await expect(map).toContainText("已知的已知");
  await expect(map).toContainText("Unknown Unknowns");
  await expect(map).toContainText("未知的未知");
  await expect(map).not.toContainText("横轴：");
  await expect(page.getByRole("region", { name: "双战役地图" })).toHaveCount(0);

  const firstTurn = page.locator(".cq-turn-pair").first();
  await expect(firstTurn.locator(".cq-option-row--task .cq-option-select")).toContainText("我想补充上下文或任务线索");
  await expect(firstTurn.locator(".cq-option-row--clue .cq-option-select")).toContainText("暂不闯关，我还有一些问题");

  const rows = firstTurn.locator(".cq-option-row");
  await expect(rows.nth(-2)).toContainText("我想补充上下文或任务线索");
  await expect(rows.last()).toContainText("暂不闯关，我还有一些问题");

  const productNav = page.getByRole("navigation", { name: "Research Quest 产品入口" }).first();
  await expect(productNav.getByRole("link", { name: "安装 Skill" })).toHaveAttribute("href", /releases\/latest/);
  await expect(productNav.getByRole("link", { name: "完整 Dashboard" })).toHaveAttribute("href", "./?view=full");
});

test("每轮最后一个选项暂停闯关并生成固定关卡线索", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "固定关卡线索完整路径只在桌面项目执行一次");
  await page.goto("/");

  const rounds = [
    { question: "为什么不能直接让 Codex 自己判断我到底想做什么？", answer: "Codex 可以选择技术实现", choice: "先判断活性位点附近的结构是否可靠" },
    { question: "为什么需要同时准备预测结构、实验结构和催化残基注释？", answer: "预测结构是要检查的对象", choice: "已有 AlphaFold DB 预测、对应 PDB 和催化残基注释" },
    { question: "这里说的‘结果最多能说明什么’到底是什么意思？", answer: "区分‘计算结果看到什么’和‘最终能下什么结论’", choice: "只判断局部结构是否适合初步筛选，并报告失败情况" },
    { question: "为什么要先规定 10 个目标和至少 8 个有效结果？", answer: "给 Codex 一个清楚的结束条件", choice: "检查 10 个公开目标，至少 8 个得到可复核结果" },
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

  const frozen = page.getByLabel("Frozen Context 与 Codex Goal");
  await expect(frozen).toContainText("用户问题与关卡线索");
  await expect(frozen).toContainText(rounds[0].question);
  await expect(frozen).toContainText(rounds[3].question);
  await expect(frozen).toContainText("用户可以随时暂停并提出问题");
});

test("用户主动追加的上下文与任务线索会分类、暂停主线并进入最终 Context", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "主动任务线索完整路径只在桌面项目执行一次");
  await page.goto("/");

  const rounds = [
    { clue: "补充一个任务线索：最终需要把任务交给 Codex 执行，我最担心它理解错目标。", type: "目标与用户偏好", status: "Confirmed", revised: "已确认最终要交给 Codex 执行", choice: "先判断活性位点附近的结构是否可靠" },
    { clue: "补充一份资料线索：我还有一份活性位点注释表，但字段和残基编号还没有核对。", type: "资料与待核对事实", status: "Candidate", revised: "预测结构和对应实验 PDB", choice: "已有 AlphaFold DB 预测、对应 PDB 和催化残基注释" },
    { clue: "补充一个约束：首轮只能使用公开资料，不使用内部数据或未公开结果。", type: "公开范围与硬约束", status: "Confirmed", revised: "首轮只使用公开资料", choice: "只判断局部结构是否适合初步筛选，并报告失败情况" },
    { clue: "补充一个时间线索：首轮希望一天内完成，优先验证流程，不追求一次覆盖所有酶家族。", type: "时间限制与执行偏好", status: "Confirmed", revised: "一天内优先验证流程", choice: "检查 10 个公开目标，至少 8 个得到可复核结果" },
  ];

  for (let index = 0; index < rounds.length; index += 1) {
    const item = rounds[index];
    const current = page.locator(".cq-turn-pair").last();
    await current.locator(".cq-option-row--task .cq-option-select").click();
    await expect(current.getByText(item.clue, { exact: true })).toBeVisible();
    const taskCard = current.getByLabel(`第 ${index + 1} 回合上下文与任务线索`);
    await expect(taskCard).toContainText(item.type);
    await expect(taskCard).toContainText(item.status);
    await expect(taskCard).toContainText("主目标进度暂停");
    await expect(taskCard).toContainText("已保存到：");
    await expect(taskCard).toContainText(item.revised);
    await expect(taskCard).toContainText("这条线索如何改变认知地图");
    await current.locator(".cq-option-select").filter({ hasText: item.choice }).click();
  }

  const frozen = page.getByLabel("Frozen Context 与 Codex Goal");
  await expect(frozen).toContainText("用户主动补充的上下文与任务线索");
  await expect(frozen).toContainText(rounds[0].clue);
  await expect(frozen).toContainText(rounds[1].status);
  await expect(frozen).toContainText(rounds[3].clue);
  await expect(frozen).toContainText("新线索先分类、去重、检查冲突并判断 Candidate / Confirmed");
});

test("点击单一选项会显示复制反馈并生成自然用户气泡", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".cq-turn-pair").first();
  await expect(first.locator(".cq-option-copy")).toHaveCount(0);
  const option = first.getByRole("button", { name: "选择：先判断活性位点附近的结构是否可靠" });
  await option.click();
  await expect(option).toContainText("已复制");
  await expect(first.getByText("先判断活性位点附近的结构是否可靠", { exact: true })).toBeVisible();
  const userTurn = first.getByLabel("你的消息");
  await expect(userTurn).toBeVisible();
  await expect(userTurn.locator(".cq-user-bubble")).toContainText("先判断活性位点附近的结构是否可靠");
  await expect(userTurn.locator(".cq-avatar--user")).toBeVisible();
});

test("聊天交互说明只在页面底部出现一次", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cq-composer")).toHaveCount(0);
  const note = page.getByText("点击选项会自动复制，并生成一条用户回复", { exact: false });
  await expect(note).toHaveCount(1);
  await expect(page.locator(".cq-footer").getByText("点击选项会自动复制", { exact: false })).toBeVisible();
});

test("自定义需求生成的启动材料包含自由追问与主动任务线索协议", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "自定义生成流程只在桌面项目执行一次");
  await page.goto("/");
  await page.getByRole("button", { name: "输入我的科研需求" }).click();
  await page.getByLabel("我的科研需求").fill("我想设计一个 RNA 二级结构逆折叠实验方案，并复现近五年的公开 baseline。");
  await page.getByRole("button", { name: "继续补充 Context" }).click();
  await page.getByLabel("最终希望获得什么产物？").fill("实验方案、baseline 清单和可执行 Codex Goal");
  await page.getByLabel("当前有哪些资料或限制？").fill("已有公开数据集说明，每天可使用一张 GPU，首轮先完成 smoke test。");
  await page.getByRole("button", { name: "生成启动提示词与 context.md" }).click();

  const generated = page.locator(".cq-generated > div");
  await expect(generated.nth(0)).toContainText("我想补充上下文或任务线索");
  await expect(generated.nth(0)).toContainText("分类、去重、检查冲突");
  await expect(generated.nth(1)).toContainText("用户可随时输入任意问题，或主动追加资料");
  await expect(generated.nth(1)).toContainText("Candidate / Confirmed");
});

test("完整 Dashboard 保留且长隐私说明收为一句提示", async ({ page }) => {
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
  const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
