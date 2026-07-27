import { expect, test, type Page } from "@playwright/test";

async function reachFinalExam(page: Page) {
  await page.goto("/");
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  const cognitionMap = page.getByRole("region", { name: "Candidate → Confirmed → Verified" });

  for (let level = 0; level < 14; level += 1) {
    await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
    await cognitionMap.getByRole("button", { name: "升为 Confirmed" }).click();
    await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();
    await cognitionMap.getByRole("button", { name: "升为 Verified" }).click();
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
  await answers.nth(0).fill("单独复核局部活性位点并限制结论");
  await answers.nth(1).fill("pLDDT 是置信度，不等于催化几何或配体正确");
  await answers.nth(2).fill("增加实验结构基线、配体准备和对接控制");
  await page.getByRole("button", { name: "提交考试" }).click();
  await page.getByRole("button", { name: "锻造真实试点 Codex Goal" }).click();
}

test("桌面端展示真实科研需求、双战役与 Candidate→Verified 流程", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "把一个真实科研需求玩成可执行 Goal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AlphaFold2 预测能否支持酶活性位点几何初筛？" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("真实公开科研需求");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("不上传、不埋点，也不会向网络发送你的输入或游戏状态");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("通过浏览器本地 Blob 文件下载");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("不要输入邮箱、密钥、token、本机或服务器私有路径，或未公开科研资料");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("已通过独立公开审计（approved）");
  await expect(page.getByRole("heading", { name: "Candidate → Confirmed → Verified" })).toBeVisible();

  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await expect(page.getByRole("complementary", { name: "关卡小测" })).toContainText("真实需求定位");
  await expect(page.getByRole("complementary", { name: "关卡小测" })).toContainText("AlphaFold2 很准");
  const cognitionMap = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Candidate → Confirmed → Verified" }),
  });
  await expect(cognitionMap.getByRole("button", { name: "升为 Confirmed" })).toBeVisible();
  await cognitionMap.getByRole("button", { name: "升为 Confirmed" }).click();
  await expect(cognitionMap.getByRole("button", { name: "完成小测后验证" })).toBeDisabled();
  await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();
  await expect(cognitionMap.getByRole("button", { name: "升为 Verified" })).toBeVisible();
  await cognitionMap.getByRole("button", { name: "升为 Verified" }).click();

  await expect(cognitionMap).toContainText("已验证");
  const metricsPanel = page.locator("section").filter({
    has: page.getByRole("heading", { name: "只对 Verified 计分" }),
  });
  await expect(metricsPanel).toContainText("Verified 知识1");
});

test("锻造 Goal 后会冻结剩余认证操作，避免导出状态与 Goal 脱节", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFrozenGoalWithCandidates(page);
  const cognitionMap = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Candidate → Confirmed → Verified" }),
  });
  await expect(cognitionMap.getByRole("button", { name: "Goal 已冻结" }).first()).toBeDisabled();
  await expect(page.getByRole("region", { name: "演示控制" }).getByRole("button", { name: "导出 Codex Goal" })).toBeEnabled();
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

test("真实科研需求面板与完整案例页可访问", async ({ page }) => {
  await page.goto("/");
  const caseStudy = page.getByRole("region", { name: "AlphaFold2 预测能否支持酶活性位点几何初筛？" });
  await expect(caseStudy).toContainText("真实公开科研需求 · 无预设结果");
  await expect(caseStudy).toContainText("10 个目标");
  await expect(caseStudy.getByRole("link", { name: "查看完整真实需求：从 CASP14 到活性位点公开试点" })).toHaveAttribute("href", "./case-study-alphafold-casp14.html");

  await page.goto("/case-study-alphafold-casp14.html");
  await expect(page.getByRole("heading", { name: "从 CASP14 到真实科研需求：AlphaFold2 能否支持酶活性位点几何初筛？" })).toBeVisible();
  await expect(page.getByText("# Codex Goal：AlphaFold2 酶活性位点几何公开试点")).toBeVisible();
});

test("考试 rubric 拒绝无关回答，并接受当前科研任务的有效判断", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFinalExam(page);

  const answers = page.getByPlaceholder("输入你的研究判断");
  await answers.nth(0).fill("这是一段完整但没有任何 rubric 关键词的回答");
  await expect(page.getByRole("status")).toContainText("尚未命中本题公开演示 rubric");

  await answers.nth(0).fill("单独复核局部活性位点并限制结论");
  await expect(page.getByRole("status")).toContainText("符合公开演示 rubric");
  await answers.nth(1).fill("pLDDT 是置信度，不等于催化几何或配体正确");
  await answers.nth(2).fill("增加实验结构基线、配体准备和对接控制");
  await page.getByRole("button", { name: "提交考试" }).click();
  await expect(page.getByText("考试状态：")).toContainText("passed");
});

test("考试未通过时可清空答案并重新参加", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFinalExam(page);
  const answers = page.getByPlaceholder("输入你的研究判断");
  await answers.nth(0).fill("无效回答一");
  await answers.nth(1).fill("无效回答二");
  await answers.nth(2).fill("无效回答三");
  await page.getByRole("button", { name: "提交考试" }).click();
  await expect(page.getByText("本次未达到通关线。请回看已有证据后重新作答；重试会清空本次考试答案。")).toBeVisible();
  await page.getByRole("button", { name: "重新参加最终考试" }).click();
  await expect(page.getByPlaceholder("输入你的研究判断")).toHaveCount(3);
});

test("生成桌面与移动首屏发布截图", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把一个真实科研需求玩成可执行 Goal" })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-home.png`),
    fullPage: true,
  });
});

test("移动视口不产生横向页面溢出", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把一个真实科研需求玩成可执行 Goal" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
