from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if old in text:
        p.write_text(text.replace(old, new), encoding="utf-8")
        return
    if new in text:
        return
    raise SystemExit(f"未找到待替换片段: {path}: {old[:100]!r}")


# 1. 布局：关卡自动换行、纵轴正向、隐藏手动认证按钮。
css_path = Path("app/src/styles/research-quest.css")
css = css_path.read_text(encoding="utf-8")
css = css.replace(
    ".rq-level-map { display: grid; grid-template-columns: repeat(7, minmax(5rem, 1fr)); gap: .5rem; padding: 0; list-style: none; }",
    ".rq-level-map { display: grid; grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); gap: .5rem; width: 100%; max-width: 100%; padding: 0; list-style: none; }",
)
css = css.replace(
    ".rq-level strong, .rq-level small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    ".rq-level strong, .rq-level small { display: block; overflow-wrap: anywhere; white-space: normal; }",
)
css = css.replace(
    "writing-mode: vertical-rl; transform: rotate(180deg);",
    "writing-mode: vertical-rl; text-orientation: upright;",
)
css = css.replace(
    ".rq-cognition-column li button { justify-self: start; border: 0; border-radius: .35rem; padding: .25rem .5rem; color: #0f766e; background: #ccfbf1; font-weight: 800; }",
    ".rq-cognition-column li button { display: none; }",
)
css = css.replace(
    ".rq-campaign-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }",
    ".rq-campaign-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.rq-campaign { min-width: 0; overflow: hidden; }",
)
if ".rq-adaptive-hint" not in css:
    css = css.replace(
        ".rq-knowledge-card p { margin-bottom: 0; }",
        ".rq-knowledge-card p { margin-bottom: 0; }.rq-adaptive-hint { margin: .7rem 0; padding: .8rem 1rem; border: 1px solid #93c5fd; border-radius: .75rem; background: #eff6ff; }.rq-adaptive-hint strong { color: #1d4ed8; }.rq-adaptive-hint p { margin: .25rem 0 0; }.rq-auto-evidence { margin: .5rem 0 .8rem; padding: .55rem .7rem; border-radius: .55rem; color: #065f46; background: #ccfbf1; font-size: .84rem; font-weight: 700; }",
    )
css = css.replace(
    ".rq-level-map { grid-template-columns: repeat(4, 1fr); }",
    ".rq-level-map { grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); }",
)
css_path.write_text(css, encoding="utf-8")


# 2. 页面：自适应提示、自动证据说明、双层命名、考试边界。
replace_once(
    "app/src/components/QuestDashboard.tsx",
    '  const title = state.phase === "prologue" ? "序章：冻结真实科研问题" : `${level!.order}. ${level!.title}`;\n  return (',
    '''  const title = state.phase === "prologue" ? "序章：冻结真实科研问题" : `${level!.order}. ${level!.title}`;
  const verifiedCount = state.known_knowns.verified.length;
  const adaptiveMessage = verifiedCount <= 2
    ? "上一关显示 Verified Known Knowns 较少：本关自动切换为基础认知提升，减少术语并增加具体对比。"
    : verifiedCount <= 8
      ? "当前认知地图已具备基础：本关进入正常研究决策，要求说明理由和证据边界。"
      : "当前 Verified Known Knowns 较充足：本关升级为高阶挑战，加入反例、冲突证据或迁移判断。";
  return (''',
)
replace_once(
    "app/src/components/QuestDashboard.tsx",
    '      <p className="rq-question-budget">本回合认知测试：1 个主问题；只有必要时追加最多 2 个证据或边界问题。</p>\n      <p className="rq-question">{prompt.prompt}</p>',
    '''      <p className="rq-question-budget">本回合认知测试：1 个主问题；只有必要时追加最多 2 个证据或边界问题。</p>
      {level ? <aside className="rq-adaptive-hint" aria-label="认知地图自适应提示"><strong>认知地图自适应</strong><p>{adaptiveMessage}</p></aside> : null}
      <p className="rq-question">{prompt.prompt}</p>''',
)
replace_once(
    "app/src/components/QuestDashboard.tsx",
    '    { title: "Candidate", hint: "AI 或材料提取的候选认识，不计分", items: state.known_knowns.candidate, action: onConfirmKnowledge, actionLabel: "升为 Confirmed" },\n    { title: "Confirmed", hint: "用户已确认，仍需应用或小测", items: state.known_knowns.confirmed, action: onVerifyKnowledge, actionLabel: "升为 Verified" },',
    '    { title: "Candidate", hint: "AI 或材料提取的候选认识，不计分", items: state.known_knowns.candidate },\n    { title: "Confirmed", hint: "已由回答或选择确认，等待应用证据", items: state.known_knowns.confirmed },',
)
replace_once(
    "app/src/components/QuestDashboard.tsx",
    '    <div className="rq-known-known-stages">',
    '    <p className="rq-auto-evidence">系统会依据关卡选择、小测和任务结果自动补充 Confirmed / Verified 证据，无需手动升级。</p>\n    <div className="rq-known-known-stages">',
)
replace_once(
    "app/src/components/QuestDashboard.tsx",
    "本 Demo 使用透明关键词 rubric，不代表真实学习或科研效果。",
    "为保证公开网页完全离线、结果可复验，本 Demo 使用公开关键词规则。正式 Skill 不使用固定关键词，而是由 AI 根据当前四象限与任务 Context 动态生成三道应用题，并按推理、证据和边界进行解释式评分。",
)
replace_once(
    "app/src/components/QuestDashboard.tsx",
    '<article><strong>快速小步</strong><p>每回合通常只问 1 个、最多 3 个关键问题；错误回答停留在 Candidate 或误解记录，不进入后续 Goal。</p></article>',
    '<article><strong>认知自适应</strong><p>如果上一关 Verified Known Knowns 较少，下一关会自动补基础、减少术语；掌握度提升后再进入反例和研究决策。</p></article>',
)
replace_once(
    "app/src/components/QuestDashboard.tsx",
    '<p className="rq-eyebrow">Research Quest · 真实科研任务 Demo</p>',
    '<p className="rq-eyebrow">Research Quest｜AI Research Game · 真实科研任务 Demo</p>',
)


# 3. 自动认证：通过回答与小测自动生成 Confirmed / Verified 证据。
app_path = Path("app/src/App.tsx")
app_text = app_path.read_text(encoding="utf-8")
app_old = "\n".join([
    '        onSubmitLevelQuiz={(campaignId, levelId, accuracy) => run(',
    '          () => store.dispatch({ type: "SUBMIT_LEVEL_QUIZ", campaignId, levelId, accuracy }),',
    '          accuracy >= 0.8 ? "关卡小测已通过，下一关已解锁。" : "本关小测未通过，请查看知识卡后重试。",',
    '        )}',
])
app_new = "\n".join([
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
if app_old in app_text:
    app_path.write_text(app_text.replace(app_old, app_new), encoding="utf-8")
elif app_new not in app_text:
    raise SystemExit("未找到 App.tsx 小测处理片段")


# 4. 浏览器测试改为验证自动认证与自适应。
test_path = Path("app/tests/e2e/quest-flow.spec.ts")
test_text = test_path.read_text(encoding="utf-8")
test_text = test_text.replace('    await cognitionMap.getByRole("button", { name: "升为 Confirmed" }).click();\n', '')
test_text = test_text.replace('    await cognitionMap.getByRole("button", { name: "升为 Verified" }).click();\n', '')
manual_block = "\n".join([
    '  await expect(cognitionMap.getByRole("button", { name: "升为 Confirmed" })).toBeVisible();',
    '  await cognitionMap.getByRole("button", { name: "升为 Confirmed" }).click();',
    '  await expect(cognitionMap.getByRole("button", { name: "完成小测后验证" })).toBeDisabled();',
    '  await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();',
    '  await expect(cognitionMap.getByRole("button", { name: "升为 Verified" })).toBeVisible();',
    '  await cognitionMap.getByRole("button", { name: "升为 Verified" }).click();',
    '  await expect(cognitionMap).toContainText("已验证");',
])
auto_block = "\n".join([
    '  await expect(page.getByRole("complementary", { name: "认知地图自适应提示" })).toContainText("基础认知提升");',
    '  await page.getByRole("group", { name: "回答关卡小测" }).getByRole("button").first().click();',
    '  await expect(cognitionMap).toContainText("系统会依据关卡选择、小测和任务结果自动补充");',
    '  await expect(cognitionMap).toContainText("已验证");',
])
if manual_block in test_text:
    test_text = test_text.replace(manual_block, auto_block)
elif auto_block not in test_text:
    raise SystemExit("未找到手动认证测试片段")
test_text = test_text.replace(
    'test("锻造 Goal 后会冻结认证操作且 Goal 包含四象限与持续执行"',
    'test("锻造 Goal 后可导出且 Goal 包含四象限与持续执行"',
)
test_text = test_text.replace(
    '  await expect(cognitionMap.getByRole("button", { name: "Goal 已冻结" }).first()).toBeDisabled();',
    '  await expect(cognitionMap).toContainText("系统会依据关卡选择、小测和任务结果自动补充");',
)
test_path.write_text(test_text, encoding="utf-8")


# 5. Skill：动态关卡、强制游戏界面、自动认证、自适应与动态考试。
skill_path = Path("skills/research-quest/SKILL.md")
skill = skill_path.read_text(encoding="utf-8")
marker = "## 15. 任意科研需求的动态关卡生成与界面合同"
if marker not in skill:
    skill += '''

## 15. 任意科研需求的动态关卡生成与界面合同

默认双战役只是一套结构模板，不是固定题库。面对任意科研需求时，AI 必须根据用户材料和当前四象限重新生成关卡标题、知识卡、Boss 题、奖励和 Goal 变化，不得照搬 AlphaFold2 示例。

动态生成步骤：

1. 从目标、约束、证据、偏好和交付物中抽取本项目的 3–7 个关键不确定性；
2. 按四象限判断哪些需要基础解释、哪些需要决策、哪些需要反例或执行验证；
3. 将最高价值的不确定性编译为当前关卡，每回合通常 1 个、最多 3 个问题；
4. 每轮根据新证据重新排序剩余关卡，允许跳过已掌握内容或插入隐藏 Boss；
5. 所有关卡必须共同修改同一份 Goal，不得形成互不相关的问答集合。

### 每次交互必须呈现为游戏界面

使用本 Skill 后，AI 的每一次回复都必须包含以下可见区块；宿主支持可视化组件时渲染为游戏面板，否则使用结构化 Markdown：

```text
Research Quest｜第 N 回合：<关卡名>
任务卡：本轮解决什么
自适应说明：为什么本轮更基础 / 更深入
关卡进度：当前 / 总进度
预计时间：本轮与剩余时间
认知分：本轮变化与累计值
关键问题：1 个主问题，必要时最多 2 个补充问题
Known–Unknown 四象限：四个象限的变化
Goal vN：本轮冻结了什么
奖励：解锁的知识卡、决定、实验或 Agent
下一关：进入条件
```

不得退化成只有长篇正文和问题列表的普通命令式聊天。

## 16. 自动认知认证

用户不应机械点击 Candidate、Confirmed 或 Verified。AI 必须根据证据自动迁移：

- 从材料或首次回答提取：Candidate；
- 用户明确选择、无提示复述或给出一致理由：自动记录 Confirmed；
- 通过本关小测、正确用于方案、任务结果验证或完成迁移：自动记录 Verified；
- 回答错误、证据不足或题目有误：保留 Candidate 或写入误解记录，不进入后续 Goal。

每次自动迁移必须展示证据来源，用户仍可纠正 AI 的判断。

## 17. 认知地图自适应必须可见

下一关开始时必须明确说明调整原因，例如：

- `上一关 Verified Known Knowns 较少，本关增加基础认知提升环节，减少术语并加入具体对比。`
- `当前 Known Unknowns 已基本关闭，本关进入方案取舍与验收设计。`
- `发现新的 Unknown Unknown，本关解锁失败 Boss，先处理隐藏风险。`

这一说明必须同时进入游戏界面、任务 Context 和 Goal 变更记录。

## 18. 正式 Skill 的动态最终考试

正式 Skill 的最终考试固定为三道题，但题目内容必须由 AI 根据当前任务 Context 与四象限即时生成：

1. **决策应用题**：应用本次已冻结的关键决定处理一个失败或冲突情境；
2. **证据边界题**：解释核心指标或证据能够支持和不能支持什么；
3. **迁移题**：把本次方法迁移到邻近科研任务，指出新增输入、控制和风险。

不得使用与任务无关的通用题，也不得只靠固定关键词判分。AI 应按推理完整性、证据使用、边界意识和迁移可行性给出解释式评分。网页公开 Demo 为了离线、确定和可测试，可以使用透明关键词规则，但必须明确它只用于演示界面逻辑，不代表正式 Skill 的考试机制。
'''
skill_path.write_text(skill, encoding="utf-8")


# 6. 博文：展示自适应亮点并解释考试机制。
replace_once(
    "public/case-study-alphafold-casp14.html",
    "<p>未确认的回答只停留在 Candidate；错误回答进入误解记录并回滚受影响的 Goal 草案，不能直接成为后续 Agent 的执行前提。</p>",
    '''<p>未确认的回答只停留在 Candidate；错误回答进入误解记录并回滚受影响的 Goal 草案，不能直接成为后续 Agent 的执行前提。</p>

        <h2>上一关会怎样改变下一关</h2>
        <div class="lesson-box">
          <p class="label">认知地图自适应</p>
          <p>如果上一关显示用户的 Verified Known Knowns 较少，下一关会明确提示“增加基础认知提升环节”，减少术语、补充具体对比并降低问题难度；当 Known Unknowns 逐步关闭后，再升级到研究决策、冲突证据和迁移题。</p>
        </div>
        <p>这种自适应不是隐藏算法：每一关都会告诉用户“为什么本关变简单或变困难”，并把调整原因写入任务 Context 和 Goal vN。</p>''',
)
replace_once(
    "public/case-study-alphafold-casp14.html",
    '<p>最终考试只检查决策应用、核心概念和新项目迁移。玩家需要处理“全局结构很接近，但催化残基邻域误差较大”的目标，解释高 pLDDT 的边界，并说明迁移到分子对接时需要增加的输入、基线和控制。</p>',
    '<p>最终考试只检查决策应用、核心概念和新项目迁移。公开网页为了完全离线和可复验，采用透明关键词规则；正式 Skill 会由 AI 根据当前四象限和任务 Context 动态生成三道应用题，并按推理、证据、边界和迁移可行性解释评分。</p>',
)


# 7. 双层命名、Release 链接和传播文案。
replace_once("README.md", "# AI Research Quest", "# Research Quest｜AI Research Game")
replace_once(
    "README.md",
    "- 根据四象限、正确率和用户偏好自动调整下一关难度；",
    "- 根据四象限、正确率和用户偏好自动调整下一关难度，并在每关明确显示调整原因；",
)
readme_path = Path("README.md")
readme = readme_path.read_text(encoding="utf-8").replace(
    "https://github.com/John-Lin98/ai-research-quest/releases/tag/v1.0.0",
    "https://github.com/John-Lin98/ai-research-quest/releases/tag/v1.1.0",
)
readme_path.write_text(readme, encoding="utf-8")
social_path = Path("docs/usage/social-copy.md")
social = social_path.read_text(encoding="utf-8")
if "## 核心传播亮点：认知地图自适应" not in social:
    social = social.replace(
        "## 小红书：把 ChatGPT 科研变成玩游戏",
        '''## 核心传播亮点：认知地图自适应

> 上一关如果显示 Verified Known Knowns 较少，下一关会自动增加基础认知提升环节；当用户已经掌握基础后，再切换到证据冲突、研究决策和迁移挑战。每次调整都会告诉用户原因，而不是隐藏在黑箱里。

## 小红书：把 ChatGPT 科研变成玩游戏''',
    )
social_path.write_text(social, encoding="utf-8")


# 8. 视频：加入自适应镜头并缩短到 60–90 秒。
video_path = Path("app/scripts/record-research-quest-demo.mjs")
video = video_path.read_text(encoding="utf-8")
video = video.replace(
    "Research Quest｜把真实科研任务变成可玩的执行闭环",
    "Research Quest｜AI Research Game：把科研目标玩成可执行任务",
)
old_timeline = '''await caption("1｜用更有趣的方式澄清真实科研目标");
await scroll(".rq-decision");
await page.waitForTimeout(9000);

await caption("2｜固定四象限：意识 × 掌握");
await scroll("#cognition-title");
await page.waitForTimeout(11000);

await caption("3｜每轮通常 1 个、最多 3 个关键问题");
await scroll(".rq-decision");
await page.waitForTimeout(11000);

await caption("4｜持续生成 Context、方案与 Goal vN");
await scroll(".rq-campaign-grid");
await page.waitForTimeout(11000);

await caption("5｜交给 ChatGPT / Codex / 多 Agent 真正执行");
await scroll("#cognition-title");
await page.waitForTimeout(12000);

await caption("每轮反馈：认知分、科研进度、剩余时间、Goal 变化");
await scroll(".rq-metrics");
await page.waitForTimeout(11000);

await caption("通关不是结束：Goal Forge → 执行 → 验证 → 四象限回写");
await scroll(".rq-final");
await page.waitForTimeout(12000);'''
new_timeline = '''await caption("1｜用更有趣的方式澄清真实科研目标");
await scroll(".rq-decision");
await page.waitForTimeout(7000);

await caption("2｜固定四象限：意识 × 掌握");
await scroll("#cognition-title");
await page.waitForTimeout(8000);

await caption("3｜每轮通常 1 个、最多 3 个关键问题");
await scroll(".rq-decision");
await page.waitForTimeout(7500);

await caption("4｜上一关 Known Knowns 较少 → 下一关自动补基础");
await scroll(".rq-adaptive-hint");
await page.waitForTimeout(8500);

await caption("5｜持续生成 Context、方案与 Goal vN");
await scroll(".rq-campaign-grid");
await page.waitForTimeout(7500);

await caption("6｜交给 ChatGPT / Codex / 多 Agent 执行");
await scroll("#cognition-title");
await page.waitForTimeout(8000);

await caption("每轮反馈：认知分、科研进度、剩余时间、Goal 变化");
await scroll(".rq-metrics");
await page.waitForTimeout(7500);

await caption("Goal Forge → 执行 → 验证 → 四象限回写");
await scroll(".rq-final");
await page.waitForTimeout(8000);'''
if old_timeline in video:
    video = video.replace(old_timeline, new_timeline)
elif new_timeline not in video:
    raise SystemExit("未找到视频时间线")
video_path.write_text(video, encoding="utf-8")


# 9. 视频压缩失败时回退 Chromium 原始 WebM。
workflow_path = Path(".github/workflows/generate-v1-1-video.yml")
workflow = workflow_path.read_text(encoding="utf-8")
compress_old = '''          ffmpeg -y -i /tmp/research-quest-recording.webm -an -c:v libvpx-vp9 -crf 38 -b:v 0 -deadline good -cpu-used 2 public/research-quest-demo-75s.webm
          ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,codec_name -of default=noprint_wrappers=1 public/research-quest-demo-75s.webm'''
compress_new = '''          if ffmpeg -y -i /tmp/research-quest-recording.webm -an -c:v libvpx-vp9 -crf 38 -b:v 0 -deadline good -cpu-used 2 public/research-quest-demo-75s.webm; then
            echo "VP9 压缩成功。"
          else
            echo "VP9 压缩失败，回退使用 Chromium 原始 WebM。"
            cp /tmp/research-quest-recording.webm public/research-quest-demo-75s.webm
          fi
          ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,codec_name -of default=noprint_wrappers=1 public/research-quest-demo-75s.webm
          duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 public/research-quest-demo-75s.webm)
          awk -v d="$duration" 'BEGIN { if (d < 60 || d > 90) exit 1 }' '''
if compress_old in workflow:
    workflow = workflow.replace(compress_old, compress_new)
elif compress_new not in workflow:
    raise SystemExit("未找到视频压缩片段")
workflow_path.write_text(workflow, encoding="utf-8")
