import { expect, test, type Page } from "@playwright/test";

const FULL_DEMO = "/?view=full";

async function reachFinalExam(page: Page) {
  await page.goto(FULL_DEMO);
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  for (let level = 0; level < 14; level += 1) {
    await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
    await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();
  }
  await expect(page.getByRole("heading", { name: "最终考试与真实试点 Goal" })).toBeVisible();
  await page.getByRole("button", { name: "开始最终考试" }).click();
}

async function reachFrozenGoalWithCandidates(page: Page) {
  await page.goto(FULL_DEMO);
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  for (let level = 0; level < 14; level += 1) {
    await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
    await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();
  }
  await page.getByRole("button", { name: "开始最终考试" }).click();
  const answers = page.getByPlaceholder("输入你的研究判断");
  await answers.nth(0).fill("全局结构接近但局部活性位点误差较大，应单独报告局部失败并限制结论");
  await answers.nth(1).fill("pLDDT 是置信度，不等于催化几何正确，也不能证明配体位置");
  await answers.nth(2).fill("迁移到分子对接需要配体、实验结构、基线和控制");
  await page.getByRole("button", { name: "提交考试" }).click();
  await page.getByRole("button", { name: "锻造真实试点 Codex Goal" }).click();
}

test("完整 Dashboard 展示真实任务、四象限与简短公开边界", async ({ page }) => {
  await page.goto(FULL_DEMO);
  await expect(page.getByRole("heading", { name: "先读资料、建立认知地图，再让 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AlphaFold2 预测能否支持酶活性位点几何初筛？" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();
  const boundary = page.getByRole("complementary", { name: "公开演示边界" });
  await expect(boundary).toContainText("本页只使用公开或脱敏内容");
  await expect(boundary).toContainText("主动导出时本地下载");
  await expect(boundary).not.toContainText("公开演示与隐私声明");
  await expect(boundary).not.toContainText("本地处理边界");
  const cognitionMap = page.getByRole("region", { name: "Known–Unknown 四象限" });
  await expect(cognitionMap.getByRole("heading", { name: /Known Knowns/ })).toContainText("已知的已知");
  await expect(cognitionMap.getByRole("heading", { name: /Known Unknowns/ })).toContainText("已知的未知");
  await expect(cognitionMap.getByRole("heading", { name: /Unknown Knowns/ })).toContainText("未知的已知");
  await expect(cognitionMap.getByRole("heading", { name: /Unknown Unknowns/ })).toContainText("未知的未知");
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await expect(page.getByRole("complementary", { name: "关卡小测" })).toContainText("哪项做法");
  await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();
  await expect(cognitionMap).toContainText("已验证");
});

test("锻造 Goal 后可导出且 Goal 包含四象限与持续执行", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFrozenGoalWithCandidates(page);
  await expect(page.getByRole("region", { name: "演示控制" }).getByRole("button", { name: "导出 Codex Goal" })).toBeEnabled();
  await page.getByText("展开完整 Codex Goal").click();
  const goalPreview = page.getByLabel("Codex Goal 预览");
  await expect(goalPreview).toContainText("Known–Unknown 四象限");
  await expect(goalPreview).toContainText("Unknown Knowns");
  await expect(goalPreview).toContainText("Unknown Unknowns");
  await expect(goalPreview).toContainText("Goal Forge 后默认继续执行");
});

test("键盘可使用跳转链接和自动演示控制", async ({ page }) => {
  await page.goto(FULL_DEMO);
  const skipLink = page.getByRole("link", { name: "跳至主要内容" });
  await skipLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#quest-main")).toBeFocused();
  const autoDemoButton = page.getByRole("button", { name: "75 秒看真实需求如何变成 Goal（不计正式得分）" });
  await autoDemoButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "演示控制" })).toContainText("playing");
  await page.getByRole("button", { name: "重新开始" }).click();
  await expect(page.getByRole("region", { name: "演示控制" })).toContainText("idle");
});

test("真实需求面板与认知地图案例博文可访问", async ({ page }) => {
  await page.goto(FULL_DEMO);
  const caseStudy = page.getByRole("region", { name: "AlphaFold2 预测能否支持酶活性位点几何初筛？" });
  await expect(caseStudy).toContainText("先读材料");
  await expect(caseStudy).toContainText("建立认知地图");
  await expect(caseStudy).toContainText("交给 Codex");
  await page.goto("/case-study-alphafold-casp14.html");
  await expect(page.getByRole("heading", { name: "把科研任务聊清楚，再交给 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "两个核心逻辑" })).toBeVisible();
  await expect(page.getByText("grill-me-with-docs", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "用户可以随时暂停闯关提问" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "用户也可以主动补充上下文和任务线索" })).toBeVisible();
  await expect(page.getByText("Candidate", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Confirmed", { exact: false }).first()).toBeVisible();
});

test("考试 rubric 拒绝无关回答，并接受真实任务判断", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFinalExam(page);
  const answers = page.getByPlaceholder("输入你的研究判断");
  await answers.nth(0).fill("这是一段完整但没有任何 rubric 关键词的回答");
  await expect(page.getByRole("status")).toContainText("尚未命中本题公开演示 rubric");
  await answers.nth(0).fill("全局结构接近但局部活性位点误差较大，应单独报告局部失败并限制结论");
  await expect(page.getByRole("status")).toContainText("符合公开演示 rubric");
  await answers.nth(1).fill("pLDDT 是置信度，不等于催化几何正确，也不能证明配体位置");
  await answers.nth(2).fill("迁移到分子对接需要配体、实验结构、基线和控制");
  await page.getByRole("button", { name: "提交考试" }).click();
  await expect(page.getByText("考试状态：")).toContainText("passed");
});

test("考试未通过时只回到薄弱关卡并可重新参加", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFinalExam(page);
  const answers = page.getByPlaceholder("输入你的研究判断");
  await answers.nth(0).fill("无效回答一");
  await answers.nth(1).fill("无效回答二");
  await answers.nth(2).fill("无效回答三");
  await page.getByRole("button", { name: "提交考试" }).click();
  await expect(page.getByText("本次未达到通关线。只回到最薄弱的一关补证据，不重新完成整套题。")).toBeVisible();
  await page.getByRole("button", { name: "重新参加最终考试" }).click();
  await expect(page.getByPlaceholder("输入你的研究判断")).toHaveCount(3);
});

test("生成完整 Dashboard 的桌面与移动发布截图", async ({ page }, testInfo) => {
  await page.goto(FULL_DEMO);
  await expect(page.getByRole("heading", { name: "先读资料、建立认知地图，再让 Codex 执行" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-full-dashboard.png`), fullPage: true });
});

test("完整 Dashboard 移动视口不产生横向页面溢出", async ({ page }) => {
  await page.goto(FULL_DEMO);
  await expect(page.getByRole("region", { name: "Known–Unknown 四象限" })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
