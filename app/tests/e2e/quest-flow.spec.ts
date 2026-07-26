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

  await expect(page.getByRole("heading", { name: "最终考试与 Codex Goal" })).toBeVisible();
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
  const answers = page.getByPlaceholder("输入你的模拟回答");
  await answers.nth(0).fill("先暂停并验证模拟风险");
  await answers.nth(1).fill("Candidate 必须经过确认与验证");
  await answers.nth(2).fill("设置明确的退出条件和边界");
  await page.getByRole("button", { name: "提交考试" }).click();
  await page.getByRole("button", { name: "锻造 Codex Goal" }).click();
}

test("桌面端展示双战役、公开声明与可操作的 Candidate→Verified 流程", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "把决策变成可验证的学习闭环" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("不包含真实研究结果、私人路径、凭据或未公开资料");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("不上传、不埋点，也不会向网络发送你的输入或游戏状态");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("通过浏览器本地 Blob 文件下载");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("不要输入邮箱、密钥、token、本机或服务器私有路径，或未公开科研资料");
  await expect(page.getByRole("complementary", { name: "公开演示数据说明" })).toContainText("已通过独立公开审计（approved）");
  await expect(page.getByRole("heading", { name: "Candidate → Confirmed → Verified" })).toBeVisible();

  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await page.getByRole("group", { name: "选择一个下一步" }).getByRole("button").first().click();
  await expect(page.getByRole("complementary", { name: "关卡小测" })).toContainText("目标罗盘");
  await expect(page.getByRole("complementary", { name: "关卡小测" })).toContainText("把模糊学习愿望改写为可检查的理解目标");
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

  const autoDemoButton = page.getByRole("button", { name: "75 秒看完整流程（不计正式得分）" });
  await autoDemoButton.focus();
  await expect(autoDemoButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "演示控制" })).toContainText("playing");
  await page.getByRole("button", { name: "重新开始" }).click();
  await expect(page.getByRole("region", { name: "演示控制" })).toContainText("idle");
});

test("考试 rubric 拒绝非空无关键词回答，并接受有效关键词回答", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFinalExam(page);

  const answers = page.getByPlaceholder("输入你的模拟回答");
  await answers.nth(0).fill("这是一段完整但没有任何 rubric 关键词的模拟回答");
  await expect(page.getByRole("status")).toContainText("尚未命中本题公开演示 rubric");

  await answers.nth(0).fill("先暂停并验证模拟风险");
  await expect(page.getByRole("status")).toContainText("符合公开演示 rubric");
  await answers.nth(1).fill("Candidate 必须经过确认与验证");
  await answers.nth(2).fill("设置明确的退出条件和边界");
  await page.getByRole("button", { name: "提交考试" }).click();
  await expect(page.getByText("考试状态：")).toContainText("passed");
});

test("考试未通过时可清空答案并重新参加", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "移动视口已由基础交互与布局用例覆盖");
  await reachFinalExam(page);
  const answers = page.getByPlaceholder("输入你的模拟回答");
  await answers.nth(0).fill("无效回答一");
  await answers.nth(1).fill("无效回答二");
  await answers.nth(2).fill("无效回答三");
  await page.getByRole("button", { name: "提交考试" }).click();
  await expect(page.getByText("本次未达到通关线。请回看已有证据后重新作答；重试会清空本次考试答案。")).toBeVisible();
  await page.getByRole("button", { name: "重新参加最终考试" }).click();
  await expect(page.getByPlaceholder("输入你的模拟回答")).toHaveCount(3);
});

test("生成桌面与移动首屏发布截图", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把决策变成可验证的学习闭环" })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-home.png`),
    fullPage: true,
  });
});

test("移动视口不产生横向页面溢出", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把决策变成可验证的学习闭环" })).toBeVisible();
  await expect(page.getByRole("region", { name: "双战役地图" })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
