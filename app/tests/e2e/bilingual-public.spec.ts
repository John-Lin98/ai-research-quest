import { expect, test } from "@playwright/test";

test("中文 Demo 提供右上角英文切换", async ({ page }) => {
  await page.goto("/");
  const language = page.getByRole("link", { name: "Switch to the English version" });
  await expect(language).toBeVisible();
  await expect(language).toHaveText("English");
  await expect(language).toHaveAttribute("href", "./en/");
});

test("英文 Demo 完整展示认知地图并支持逐轮选择", async ({ page }) => {
  await page.goto("/en/");

  await expect(page.getByRole("heading", { name: "Turn a vague research request into a traceable Context and Goal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "切换到中文版本" })).toHaveAttribute("href", "../");
  await expect(page.getByRole("heading", { name: "Known–Unknown cognition map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "grill-me-with-docs" })).toBeVisible();

  const firstChoice = page.getByRole("button", { name: /Check whether local active-site geometry is reliable enough/ });
  await firstChoice.click();
  await expect(firstChoice).toContainText(/Copied|Selected/);
  await expect(page.getByText("Check whether local active-site geometry is reliable enough for preliminary screening", { exact: true })).toBeVisible();
  await expect(page.getByText(/Turn 2\/5/)).toBeVisible();
});

test("英文 Demo 可以为自定义科研需求生成本地启动材料", async ({ page }) => {
  await page.goto("/en/");
  await page.getByRole("button", { name: "Start from my own need" }).click();
  await page.getByLabel("What research task are you trying to clarify?").fill("Choose and reproduce a recent RNA inverse-folding baseline.");
  await page.getByLabel("What final deliverable do you need?").fill("A benchmark plan and an executable Codex Goal.");
  await page.getByLabel("What material or constraints already exist?").fill("Public papers, one GPU, and a two-day pilot.");
  await page.getByRole("button", { name: "Generate starter Context + prompt" }).click();

  await expect(page.getByRole("heading", { name: "Starter Context" })).toBeVisible();
  await expect(page.getByText("Choose and reproduce a recent RNA inverse-folding baseline.", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Starter prompt" })).toBeVisible();
  await expect(page.getByText("Candidate / Confirmed / Verified", { exact: false })).toBeVisible();
});

test("中英文案例博文可以互相切换并保持核心逻辑一致", async ({ page }) => {
  await page.goto("/case-study-alphafold-casp14.html");
  await expect(page.getByRole("link", { name: "Switch to the English article" })).toHaveAttribute(
    "href",
    "./en/case-study-alphafold-casp14.html",
  );

  await page.goto("/en/case-study-alphafold-casp14.html");
  await expect(page.getByRole("link", { name: "切换到中文博文" })).toHaveAttribute(
    "href",
    "../case-study-alphafold-casp14.html",
  );
  await expect(page.getByRole("heading", { name: "Clarify the research task before asking Codex to execute it" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The two core mechanisms" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Frozen Context" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Codex Goal" })).toBeVisible();
  await expect(page.getByText("Candidate → Confirmed → Verified", { exact: false })).toBeVisible();
});

test("英文 Demo 与博文在当前视口不产生横向溢出", async ({ page }) => {
  for (const path of ["/en/", "/en/case-study-alphafold-casp14.html"]) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});
