import { expect, test } from "@playwright/test";

test("认知地图固定使用意识横轴和掌握纵轴", async ({ page }) => {
  await page.goto("/");

  const map = page.getByRole("region", { name: "Known–Unknown 四象限" });
  await expect(map).toBeVisible();
  await expect(map).toContainText("横轴：用户是否已经意识到这个问题");
  await expect(map).toContainText("纵轴：用户实际上是否已经掌握");

  const positions = await map.evaluate((node) => {
    const rect = (id: string) => {
      const element = node.querySelector<HTMLElement>(`#${id}`)?.closest<HTMLElement>("article");
      if (!element) throw new Error(`missing ${id}`);
      const value = element.getBoundingClientRect();
      return { x: value.x, y: value.y };
    };
    return {
      knownKnowns: rect("quadrant-known-knowns"),
      unknownKnowns: rect("quadrant-unknown-knowns"),
      knownUnknowns: rect("quadrant-known-unknowns"),
      unknownUnknowns: rect("quadrant-unknown-unknowns"),
    };
  });

  expect(positions.knownKnowns.x).toBeLessThan(positions.unknownKnowns.x);
  expect(positions.knownUnknowns.x).toBeLessThan(positions.unknownUnknowns.x);
  expect(positions.knownKnowns.y).toBeLessThan(positions.knownUnknowns.y);
  expect(positions.unknownKnowns.y).toBeLessThan(positions.unknownUnknowns.y);
});

test("每回合明确限制为一个主问题和最多两个补充问题", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("本回合认知测试：1 个主问题；只有必要时追加最多 2 个证据或边界问题。")).toBeVisible();
});
