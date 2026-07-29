import { expect, test } from "@playwright/test";

test("聊天式认知地图保持固定 2×2 位置且使用中英双标题", async ({ page }) => {
  await page.goto("/");

  const map = page.getByRole("region", { name: "当前完整 Known–Unknown 四象限", exact: true });
  await expect(map).toBeVisible();
  await expect(map).not.toContainText("横轴：是否意识到");
  await expect(map).not.toContainText("纵轴：是否掌握");
  await expect(map).toContainText("Known Knowns");
  await expect(map).toContainText("已知的已知");
  await expect(map).toContainText("Unknown Knowns");
  await expect(map).toContainText("未知的已知");
  await expect(map).toContainText("Known Unknowns");
  await expect(map).toContainText("已知的未知");
  await expect(map).toContainText("Unknown Unknowns");
  await expect(map).toContainText("未知的未知");

  const positions = await map.evaluate((node) => {
    const rect = (selector: string) => {
      const element = node.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`missing ${selector}`);
      const value = element.getBoundingClientRect();
      return { x: value.x, y: value.y };
    };
    return {
      knownKnowns: rect(".cq-quadrant--kk"),
      unknownKnowns: rect(".cq-quadrant--uk"),
      knownUnknowns: rect(".cq-quadrant--ku"),
      unknownUnknowns: rect(".cq-quadrant--uu"),
    };
  });

  expect(positions.knownKnowns.x).toBeLessThan(positions.unknownKnowns.x);
  expect(positions.knownUnknowns.x).toBeLessThan(positions.unknownUnknowns.x);
  expect(positions.knownKnowns.y).toBeLessThan(positions.knownUnknowns.y);
  expect(positions.unknownKnowns.y).toBeLessThan(positions.unknownUnknowns.y);
});

test("默认聊天明确采用文档优先和一次一个关键问题", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("AI 先读已有资料", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Research Quest 第 1 回合")).toContainText("本轮只问一个目标问题");
});

test("完整 Dashboard 保留固定二维四象限但去掉重复轴说明", async ({ page }) => {
  await page.goto("/?view=full");
  const map = page.getByRole("region", { name: "Known–Unknown 四象限", exact: true });
  await expect(map).toContainText("用户已经意识到");
  await expect(map).toContainText("用户尚未意识到");
  await expect(map).toContainText("已经掌握");
  await expect(map).toContainText("尚未掌握");
  await expect(map).toContainText("已知的已知");
  await expect(map).not.toContainText("横轴：用户是否已经意识到这个问题");
  await expect(map).not.toContainText("纵轴：用户实际上是否已经掌握相关知识");
});
