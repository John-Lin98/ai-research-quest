from pathlib import Path

app = Path("app/src/App.tsx")
text = app.read_text(encoding="utf-8")
old = "\n".join([
    '        onSubmitLevelQuiz={(campaignId, levelId, accuracy) => run(',
    '          () => store.dispatch({ type: "SUBMIT_LEVEL_QUIZ", campaignId, levelId, accuracy }),',
    '          accuracy >= 0.8 ? "关卡小测已通过，下一关已解锁。" : "本关小测未通过，请查看知识卡后重试。",',
    '        )}',
])
new = "\n".join([
    '        onSubmitLevelQuiz={(campaignId, levelId, accuracy) => run(',
    '          () => {',
    '            const before = store.getState();',
    '            const campaign = campaignId === "learning-cognition"',
    '              ? before.campaigns.learning_cognition',
    '              : before.campaigns.research_decision;',
    '            const knowledgeId = campaign.levels.find((item) => item.level_id === levelId)',
    '              ?.cognition_map_delta.candidate_added[0];',
    '            store.dispatch({ type: "SUBMIT_LEVEL_QUIZ", campaignId, levelId, accuracy });',
    '            if (accuracy >= 0.8 && knowledgeId) {',
    '              let current = store.getState();',
    '              if (current.known_knowns.candidate.some((item) => item.knowledge_id === knowledgeId)) {',
    '                store.dispatch({',
    '                  type: "CONFIRM_KNOWLEDGE",',
    '                  knowledgeId,',
    '                  evidenceType: "user-confirmation",',
    '                  sourceRef: "public-demo:choice-and-quiz",',
    '                  score: 100,',
    '                });',
    '              }',
    '              current = store.getState();',
    '              if (current.known_knowns.confirmed.some((item) => item.knowledge_id === knowledgeId)) {',
    '                store.dispatch({',
    '                  type: "VERIFY_KNOWLEDGE",',
    '                  knowledgeId,',
    '                  evidenceType: "level-quiz",',
    '                  sourceRef: "public-demo:auto-level-quiz",',
    '                  score: 100,',
    '                });',
    '              }',
    '            }',
    '          },',
    '          accuracy >= 0.8',
    '            ? "关卡小测已通过；系统已自动记录 Confirmed / Verified 证据并解锁下一关。"',
    '            : "本关小测未通过；回答不会进入后续 Goal，请查看知识卡后重试。",',
    '        )}',
])
if old not in text:
    raise SystemExit("未找到 App.tsx 小测处理片段")
app.write_text(text.replace(old, new), encoding="utf-8")

test = Path("app/tests/e2e/quest-flow.spec.ts")
text = test.read_text(encoding="utf-8")
text = text.replace('    await cognitionMap.getByRole("button", { name: "升为 Confirmed" }).click();\n', '')
text = text.replace('    await cognitionMap.getByRole("button", { name: "升为 Verified" }).click();\n', '')
old_block = "\n".join([
    '  await expect(cognitionMap.getByRole("button", { name: "升为 Confirmed" })).toBeVisible();',
    '  await cognitionMap.getByRole("button", { name: "升为 Confirmed" }).click();',
    '  await expect(cognitionMap.getByRole("button", { name: "完成小测后验证" })).toBeDisabled();',
    '  await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();',
    '  await expect(cognitionMap.getByRole("button", { name: "升为 Verified" })).toBeVisible();',
    '  await cognitionMap.getByRole("button", { name: "升为 Verified" }).click();',
    '  await expect(cognitionMap).toContainText("已验证");',
])
new_block = "\n".join([
    '  await expect(page.getByRole("complementary", { name: "认知地图自适应提示" })).toContainText("基础认知提升");',
    '  await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();',
    '  await expect(cognitionMap).toContainText("系统会依据关卡选择、小测和任务结果自动补充");',
    '  await expect(cognitionMap).toContainText("已验证");',
])
if old_block not in text:
    raise SystemExit("未找到手动认证测试片段")
text = text.replace(old_block, new_block)
text = text.replace(
    'test("锻造 Goal 后会冻结认证操作且 Goal 包含四象限与持续执行"',
    'test("锻造 Goal 后可导出且 Goal 包含四象限与持续执行"',
)
text = text.replace(
    '  await expect(cognitionMap.getByRole("button", { name: "Goal 已冻结" }).first()).toBeDisabled();',
    '  await expect(cognitionMap).toContainText("系统会依据关卡选择、小测和任务结果自动补充");',
)
test.write_text(text, encoding="utf-8")
