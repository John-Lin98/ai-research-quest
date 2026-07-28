import { expect, test, type Page } from "@playwright/test";

async function reachFinalExam(page: Page) {
  await page.goto("/");
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  const cognitionMap = page.getByRole("region", { name: "Known–Unknown 四象限" });

  for (let level = 0; level < 14; level += 1) {
    await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
    await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();
  }

  await expect(page.getByRole("heading", { name: "最终考试与真实试点 Goal" })).toBeVisible();
  await page.getByRole("button", { name: "开始最终考试" }).click();
}

async function reachFrozenGoalWithCandidates(page: Page) {
  await page.goto("/");
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

test("桌面端展示真实科研任务、四象限与可操作的 Candidate→Verified 流程", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "先把项目讲清楚，再让 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AlphaFold2 预测能否支持酶活性位点几何初筛？" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("真实公开科研需求");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("不上传、不埋点，也不会向网络发送你的输入或游戏状态");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("通过浏览器本地 Blob 文件下载");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("已通过独立公开审计（approved）");

  const cognitionMap = page.getByRole("region", { name: "Known–Unknown 四象限" });
  await expect(cognitionMap).toBeVisible();
  await expect(cognitionMap.getByRole("heading", { name: "Known Knowns", exact: true })).toBeVisible();
  await expect(cognitionMap.getByRole("heading", { name: "Known Unknowns", exact: true })).toBeVisible();
  await expect(cognitionMap.getByRole("heading", { name: "Unknown Knowns", exact: true })).toBeVisible();
  await expect(cognitionMap.getByRole("heading", { name: "Unknown Unknowns", exact: true })).toBeVisible();
  await expect(cognitionMap).toContainText("AlphaFold2 预测是否足以支持酶活性位点几何初筛");
  await expect(cognitionMap).toContainText("局部结构比较、活性位点判断或失败分析经验");
  await expect(cognitionMap).toContainText("序列、链、残基编号、缺失区域和构象状态");

  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await expect(page.getByRole("complementary", { name: "关卡小测" })).toContainText("真实需求定位");
  await expect(page.getByRole("complementary", { name: "关卡小测" })).toContainText("AlphaFold2 很准");
  await expect(page.getByRole("complementary", { name: "认知地图自适应提示" })).toContainText("基础认知提升");
  await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();
  await expect(cognitionMap).toContainText("系统会依据关卡选择、小测和任务结果自动补充");
  await expect(cognitionMap).toContainText("已验证");

  const metricsPanel = page.locator("section").filter({
    has: page.getByRole("heading", { name: "四象限与 Verified 计分" }),
  });
  await expect(metricsPanel).toContainText("Verified 知识1");
  await expect(metricsPanel).toContainText("Known Unknown");
  await expect(metricsPanel).toContainText("Unknown Known");
  await expect(metricsPanel).toContainText("Unknown Unknown");
});

test("锻造 Goal 后可导出且 Goal 包含四象限与持续执行", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFrozenGoalWithCandidates(page);
  const cognitionMap = page.getByRole("region", { name: "Known–Unknown 四象限" });
  await expect(cognitionMap).toContainText("系统会依据关卡选择、小测和任务结果自动补充");
  await expect(page.getByRole("region", { name: "演示控制" }).getByRole("button", { name: "导出 Codex Goal" })).toBeEnabled();
  await page.getByText("展开完整 Codex Goal").click();
  const goalPreview = page.getByLabel("Codex Goal 预览");
  await expect(goalPreview).toContainText("Known–Unknown 四象限");
  await expect(goalPreview).toContainText("Unknown Knowns");
  await expect(goalPreview).toContainText("Unknown Unknowns");
  await expect(goalPreview).toContainText("Goal Forge 后默认继续执行");
});

test("键盘可使用跳转链接和自动演示控制", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "跳至主要内容" });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#quest-main")).toBeFocused();

  const autoDemoButton = page.getByRole("button", { name: "75 秒看真实需求如何变成 Goal（不计正式得分）" });
  await autoDemoButton.focus();
  await expect(autoDemoButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "演示控制" })).toContainText("playing");
  await page.getByRole("button", { name: "重新开始" }).click();
  await expect(page.getByRole("region", { name: "演示控制" })).toContainText("idle");
});

test("真实需求面板与完整案例博文可访问", async ({ page }) => {
  await page.goto("/");
  const caseStudy = page.getByRole("region", { name: "AlphaFold2 预测能否支持酶活性位点几何初筛？" });
  await expect(caseStudy).toContainText("真实公开科研需求 · 无预设结果");
  await expect(caseStudy).toContainText("阶段 1｜游戏化沟通");
  await expect(caseStudy).toContainText("中间产物｜Frozen Context");
  await expect(caseStudy).toContainText("阶段 2｜Codex 执行");
  await expect(caseStudy.getByRole("link", { name: "查看完整真实需求：从 CASP14 到活性位点公开试点" })).toHaveAttribute("href", "./case-study-alphafold-casp14.html");

  await page.goto("/case-study-alphafold-casp14.html");
  await expect(page.getByRole("heading", { name: "从 CASP14 到真实科研需求：AlphaFold2 能否支持酶活性位点几何初筛？" })).toBeVisible();
  await expect(page.getByText("为什么要先沟通，再让 Codex 执行")).toBeVisible();
  await expect(page.getByText("Known–Unknown 四象限采用固定坐标")).toBeVisible();
  await expect(page.getByText("先沟通再执行的完整闭环")).toBeVisible();
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

test("生成桌面与移动首屏发布截图", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "先把项目讲清楚，再让 Codex 执行" })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-home.png`),
    fullPage: true,
  });
});

test("移动视口不产生横向页面溢出", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "先把项目讲清楚，再让 Codex 执行" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Known–Unknown 四象限" })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
