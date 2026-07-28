import { expect, test } from "@playwright/test";

test("聊天式认知地图固定使用意识横轴和掌握纵轴", async ({ page }) => {
  await page.goto("/");

  const map = page.getByRole("region", { name: "当前完整 Known–Unknown 四象限", exact: true });
  await expect(map).toBeVisible();
  await expect(map).toContainText("横轴：是否意识到");
  await expect(map).toContainText("纵轴：是否掌握");
  await expect(map).toContainText("Known Knowns");
  await expect(map).toContainText("Unknown Knowns");
  await expect(map).toContainText("Known Unknowns");
  await expect(map).toContainText("Unknown Unknowns");

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

test("默认聊天明确每轮只处理一到三个关键问题", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("先用 1–3 个关键问题建立四象限认知地图", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Research Quest 第 1 回合")).toContainText("本轮只确定一个最关键目标");
});

test("完整 Dashboard 继续保留固定二维四象限", async ({ page }) => {
  await page.goto("/?view=full");
  const map = page.getByRole("region", { name: "Known–Unknown 四象限", exact: true });
  await expect(map).toContainText("横轴：用户是否已经意识到这个问题");
  await expect(map).toContainText("纵轴：用户实际上是否已经掌握相关知识");
});
