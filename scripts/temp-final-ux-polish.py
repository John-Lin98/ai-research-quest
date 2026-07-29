from pathlib import Path


def replace(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if old not in text:
        if new in text:
            return
        raise SystemExit(f"未找到待替换内容: {path}: {old[:100]!r}")
    p.write_text(text.replace(old, new), encoding="utf-8")


# 1. Demo：复制反馈恢复原选项后，再生成用户回复。
replace(
    "app/src/components/ChatQuestDemo.tsx",
    '''    window.setTimeout(() => {
      setCopyFeedback(null);
      action?.();
    }, 650);''',
    '''    window.setTimeout(() => {
      setCopyFeedback(null);
      window.setTimeout(() => action?.(), 180);
    }, 650);''',
)

# 2. Demo CSS：重做用户气泡、单按钮选项和整体字号。
css_path = Path("app/src/styles/chat-quest.css")
css = css_path.read_text(encoding="utf-8")
css = css.replace(
    ".cq-app { width: min(980px, calc(100% - 2rem)); margin: 0 auto; padding: 1.5rem 0 4rem; color: var(--cq-text); }",
    ".cq-app { width: min(980px, calc(100% - 2rem)); margin: 0 auto; padding: 1.5rem 0 4rem; color: var(--cq-text); font-size: 1.03rem; }",
)
css = css.replace(
    ".cq-overview p { margin-bottom: 0; color: var(--cq-muted); }",
    ".cq-overview p { margin-bottom: 0; color: var(--cq-muted); font-size: 1rem; line-height: 1.68; }",
)
css = css.replace(
    ".cq-message--user > header { justify-content: flex-end; }",
    ".cq-message--user > header { justify-content: flex-end; }",
)
css = css.replace(
    ".cq-message--user { justify-self: end; color: #17345f; background: var(--cq-user); border-bottom-right-radius: .25rem; }",
    ".cq-message--user { justify-self: end; color: #17345f; background: var(--cq-user); border-bottom-right-radius: .25rem; }\n.cq-user-turn { display: flex; justify-self: end; align-items: flex-end; gap: .6rem; width: min(78%, 700px); }\n.cq-user-content { display: grid; justify-items: end; gap: .3rem; min-width: 0; }\n.cq-user-label { padding-right: .25rem; color: #64748b; font-size: .86rem; font-weight: 700; }\n.cq-user-bubble { padding: .8rem 1rem; border: 1px solid #bfd3f5; border-radius: 1.05rem 1.05rem .25rem 1.05rem; color: #17345f; background: #eaf2ff; }\n.cq-user-bubble p { margin: 0; font-size: 1rem; line-height: 1.6; overflow-wrap: anywhere; }",
)
css = css.replace(
    ".cq-message p { line-height: 1.65; }",
    ".cq-message p { font-size: 1rem; line-height: 1.68; }",
)
css = css.replace(
    ".cq-adaptive p { margin: .25rem 0 0; color: #334155; font-size: .9rem; }",
    ".cq-adaptive p { margin: .25rem 0 0; color: #334155; font-size: .96rem; }",
)
css = css.replace(
    ".cq-quadrant strong { display: block; font-size: .86rem; }",
    ".cq-quadrant strong { display: block; font-size: .94rem; }",
)
css = css.replace(
    ".cq-quadrant small { display: block; margin-top: .05rem; color: #64748b; font-size: .72rem; }",
    ".cq-quadrant small { display: block; margin-top: .05rem; color: #64748b; font-size: .8rem; }",
)
css = css.replace(
    ".cq-quadrant p { margin: .35rem 0 0; color: #475569; font-size: .8rem; line-height: 1.5; overflow-wrap: anywhere; }",
    ".cq-quadrant p { margin: .35rem 0 0; color: #475569; font-size: .88rem; line-height: 1.55; overflow-wrap: anywhere; }",
)
css = css.replace(
    ".cq-feedback > span, .cq-feedback__progress { display: grid; gap: .2rem; min-width: 0; padding: .65rem .72rem; border-radius: .62rem; color: #475569; background: #f1f5f9; font-size: .78rem; }",
    ".cq-feedback > span, .cq-feedback__progress { display: grid; gap: .2rem; min-width: 0; padding: .65rem .72rem; border-radius: .62rem; color: #475569; background: #f1f5f9; font-size: .86rem; }",
)
css = css.replace(
    ".cq-option-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .5rem; align-items: stretch; }",
    ".cq-option-row { display: grid; grid-template-columns: minmax(0, 1fr); align-items: stretch; }",
)
css = css.replace(
    ".cq-option-select { display: grid; gap: .2rem; width: 100%; padding: .75rem .85rem; border: 1px solid #b8c7d9; border-radius: .7rem; color: #172033; background: #fff; text-align: left; }",
    ".cq-option-select { display: grid; gap: .25rem; width: 100%; padding: .82rem .95rem; border: 1px solid #b8c7d9; border-radius: .75rem; color: #172033; background: #fff; text-align: left; transition: border-color .16s ease, background .16s ease, color .16s ease; }",
)
css = css.replace(
    ".cq-option-select small { color: var(--cq-muted); }",
    ".cq-option-select > span { font-size: 1rem; font-weight: 700; }\n.cq-option-select small { color: var(--cq-muted); font-size: .88rem; }\n.cq-option-select.is-copying { place-items: center; min-height: 4.2rem; border-color: var(--cq-accent); color: #0f766e; background: #ecfdf5; text-align: center; }\n.cq-option-select.is-copying > span { font-size: 1.05rem; }\n.cq-option-select:disabled { cursor: wait; opacity: 1; }",
)
# 删除旧复制按钮和重复 composer 的可视样式。
css = css.replace(".cq-option-copy { min-width: 4rem; padding: .6rem .7rem; border: 1px solid #b8c7d9; border-radius: .7rem; color: #0f766e; background: #fff; font-weight: 800; }\n", "")
css = css.replace(".cq-option-copy:hover { border-color: var(--cq-accent); background: var(--cq-accent-soft); }\n", "")
css = css.replace(".cq-composer { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .65rem; align-items: center; margin-top: .75rem; padding: .65rem; border: 1px solid #cbd5e1; border-radius: .85rem; background: #fff; }\n", "")
css = css.replace(".cq-composer p { margin: 0; color: #64748b; font-size: .82rem; }\n", "")
css = css.replace(".cq-composer button { padding: .5rem .75rem; border: 0; border-radius: .55rem; color: #94a3b8; background: #e2e8f0; }\n", "")
css = css.replace(
    ".cq-footer { margin-top: 1.25rem; padding: 1rem 0; border-top: 1px solid var(--cq-border); color: var(--cq-muted); font-size: .9rem; }",
    ".cq-footer { margin-top: 1.25rem; padding: 1rem 0; border-top: 1px solid var(--cq-border); color: var(--cq-muted); font-size: .94rem; }\n.cq-footer p { margin: .45rem 0; }\n.cq-interaction-note { color: #334155; font-weight: 600; }",
)
css = css.replace("  .cq-message { max-width: 100%; }", "  .cq-message { max-width: 100%; }\n  .cq-user-turn { width: min(88%, 700px); }")
css = css.replace("  .cq-option-row { grid-template-columns: 1fr; }\n  .cq-option-copy { justify-self: end; }\n  .cq-composer { grid-template-columns: auto minmax(0, 1fr); }\n  .cq-composer button { display: none; }", "  .cq-option-row { grid-template-columns: 1fr; }\n  .cq-user-turn { width: 94%; }")
css_path.write_text(css, encoding="utf-8")


# 3. 博文：放大字号、四象限单行标题、通用澄清流程、正反馈方式与双交接框。
blog_path = Path("public/case-study-alphafold-casp14.html")
blog = blog_path.read_text(encoding="utf-8")
blog = blog.replace(
    ':root { color: #172554; background: #f8fafc; font-family: Inter, "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif; line-height: 1.72; }',
    ':root { color: #172554; background: #f8fafc; font-family: Inter, "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif; font-size: 18px; line-height: 1.75; }',
)
blog = blog.replace('width: min(900px, calc(100% - 2rem))', 'width: min(960px, calc(100% - 2rem))')
blog = blog.replace('.eyebrow { margin: 0; color: #bfdbfe; font-size: .84rem;', '.eyebrow { margin: 0; color: #bfdbfe; font-size: .94rem;')
blog = blog.replace('.lede { max-width: 72ch; font-size: 1.12rem; }', '.lede { max-width: 72ch; font-size: 1.22rem; }')
blog = blog.replace('.badge { display: inline-block; margin-top: .5rem; padding: .4rem .72rem; border: 1px solid #99f6e4; border-radius: 999px; color: #ccfbf1; font-size: .88rem; }', '.badge { display: inline-block; margin-top: .5rem; padding: .48rem .8rem; border: 1px solid #99f6e4; border-radius: 999px; color: #ccfbf1; font-size: 1rem; }')
blog = blog.replace('.quadrant h3 { font-size: 1rem; }\n       .quadrant small { display: block; color: #64748b; }', '.quadrant h3 { font-size: 1.08rem; line-height: 1.35; }')
blog = blog.replace('.label { margin: 0 0 .3rem; color: #0f766e; font-size: .88rem;', '.label { margin: 0 0 .3rem; color: #0f766e; font-size: 1rem;')
blog = blog.replace('.flow pre { margin: 0; white-space: pre-wrap; font: .88rem/1.65 ui-monospace, SFMono-Regular, Consolas, monospace; }', '.flow pre { margin: 0; white-space: pre-wrap; font: 1rem/1.72 ui-monospace, SFMono-Regular, Consolas, monospace; }')
blog = blog.replace('.sources { font-size: .94rem;', '.sources { font-size: 1rem;')
blog = blog.replace('footer { padding: 0 0 2.5rem; color: #64748b; font-size: .88rem; }', 'footer { padding: 0 0 2.5rem; color: #64748b; font-size: .96rem; }')
if '.handoff-grid' not in blog:
    blog = blog.replace(
        '.feedback-list li { padding: .9rem 1rem; border: 1px solid #dbeafe; border-radius: .8rem; background: #fff; }',
        '.feedback-list li { padding: .9rem 1rem; border: 1px solid #dbeafe; border-radius: .8rem; background: #fff; }\n       .handoff-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }\n       .handoff-box { min-width: 0; padding: 1.1rem; border-radius: 1rem; color: #e2e8f0; background: #0f172a; }\n       .handoff-box h3 { margin: 0 0 .7rem; color: #fff; font-size: 1.2rem; }\n       .handoff-box pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font: 1rem/1.72 ui-monospace, SFMono-Regular, Consolas, monospace; }'
    )
blog = blog.replace('.two-loop, .three-grid, .quadrants, .feedback-list { grid-template-columns: 1fr; }', '.two-loop, .three-grid, .quadrants, .feedback-list, .handoff-grid { grid-template-columns: 1fr; }')
blog = blog.replace(
    '<section class="quadrant kk"><h3>Known Knowns</h3><small>已知的已知</small><p>',
    '<section class="quadrant kk"><h3>Known Knowns（已知的已知）</h3><p>',
)
blog = blog.replace(
    '<section class="quadrant uk"><h3>Unknown Knowns</h3><small>未知的已知</small><p>',
    '<section class="quadrant uk"><h3>Unknown Knowns（未知的已知）</h3><p>',
)
blog = blog.replace(
    '<section class="quadrant ku"><h3>Known Unknowns</h3><small>已知的未知</small><p>',
    '<section class="quadrant ku"><h3>Known Unknowns（已知的未知）</h3><p>',
)
blog = blog.replace(
    '<section class="quadrant uu"><h3>Unknown Unknowns</h3><small>未知的未知</small><p>',
    '<section class="quadrant uu"><h3>Unknown Unknowns（未知的未知）</h3><p>',
)
old_process = '''        <h2>5 轮聊天怎样把需求说清楚</h2>
        <ol class="rounds">
          <li><strong>先说清楚要解决什么</strong>已有资料只说明研究对象，因此先问：你最想让这项工作帮助你判断什么？</li>
          <li><strong>看看手里有什么资料</strong>目标已经明确，再确认是否有 AlphaFold DB 预测、实验 PDB 和催化残基注释。</li>
          <li><strong>确认结果最多能说明什么</strong>资料够不等于结论可以无限扩大，因此先确定只做局部结构初筛，还是还要加入对接。</li>
          <li><strong>约定做到什么才算完成</strong>目标、资料和结果范围都明确后，只需要补一个可检查的完成标准。</li>
          <li><strong>停止提问，交给 Codex</strong>关键 Known Unknowns 已有答案，剩余问题必须通过执行解决，因此整理 Context 和 Goal。</li>
        </ol>'''
new_process = '''        <h2>Research Quest 怎样帮助用户澄清科研需求</h2>
        <p>Research Quest 不预设固定轮数。任务简单时可能只需要两三轮；材料较多、冲突较多或目标尚不清楚时，轮数会随认知地图动态变化。核心不是“完成五关”，而是把影响执行的关键未知逐步关闭。</p>
        <ol class="rounds">
          <li><strong>先读材料，整理已经知道的内容</strong>AI 读取文档、历史讨论和当前 Context，不再重复询问材料已经回答的问题。</li>
          <li><strong>建立认知地图，找到最大的空缺</strong>把明确事实、未表达经验、已知问题和隐藏风险放入固定四象限。</li>
          <li><strong>一次只问一个最高价值问题</strong>问题必须会改变目标、资料、结果范围、完成标准或执行方式，并尽量沿用用户已经使用的词。</li>
          <li><strong>接收回答、追问和主动任务线索</strong>用户可以选择答案、要求解释，也可以补充资料、约束、偏好、截止时间、结果或纠错。</li>
          <li><strong>更新四象限、Context 与当前 Goal</strong>新信息先分类和核验，再决定缩小原问题、跳过已解决问题、处理冲突或插入隐藏风险关。</li>
          <li><strong>满足交接条件后停止提问</strong>当影响执行的核心 Known Unknowns 已有答案或关闭条件，就生成完整 Context 与 Goal，交给 Codex 或 Agent 执行。</li>
        </ol>'''
if old_process not in blog:
    raise SystemExit("未找到旧的五轮流程段落")
blog = blog.replace(old_process, new_process)
blog = blog.replace('<h2>正反馈为什么重要</h2>', '<h2>Research Quest 如何提供正反馈</h2>')
blog = blog.replace(
    '<p>这些反馈不是为了制造虚拟分数，而是帮助用户理解自己的决定、保持参与感，并及时发现 AI 是否误解了任务。</p>',
    '<p>每次用户作出选择、提出问题或补充线索后，界面都会立即更新这四类反馈。用户由此看到“刚才输入了什么、它改变了什么、还剩多少、下一步为什么这样问”，并能及时纠正 AI 对任务的理解。</p>',
)
old_handoff = '''        <h2>最终交给 Codex 的内容</h2>
        <div class="flow"><pre>Frozen Context
+ 真实目标与非目标
+ 已读材料和用户偏好
+ Known–Unknown 四象限
+ 关卡线索与问答记录
+ 用户主动追加的任务线索
+ 当前目标变化历史
+ 输入、步骤、指标和完成标准
+ Agent 分工、测试和审查
+ 3–5 轮失败后的根因分析
→ Codex 执行</pre></div>'''
new_handoff = '''        <h2>最终同时交给 Codex：Context 与 Goal</h2>
        <p>Context 负责告诉 Codex“用户真正想做什么、讨论过什么、哪些信息可信”；Goal 负责告诉 Codex“接下来具体怎样执行、怎样验收和何时停止”。两者缺一不可。</p>
        <div class="handoff-grid">
          <section class="handoff-box"><h3>Frozen Context</h3><pre>原始需求与最终产物
已读文档及可追溯来源
用户选择、追问与 AI 回答
主动补充的资料、约束和偏好
Known–Unknown 四象限
Candidate / Confirmed / Verified
Goal vN 变化历史
开放未知、冲突与关闭条件</pre></section>
          <section class="handoff-box"><h3>Codex Goal</h3><pre>Context 文件路径
真实目标与非目标
输入、数据和执行步骤
指标与结果范围
做到什么才算完成
失败退出和根因分析规则
Agent 分工、测试与独立审查
执行结果如何写回 Context</pre></section>
        </div>'''
if old_handoff not in blog:
    raise SystemExit("未找到旧的 Codex 交接段落")
blog = blog.replace(old_handoff, new_handoff)
blog_path.write_text(blog, encoding="utf-8")


# 4. 更新浏览器测试：无独立复制按钮、按钮内反馈、说明仅在页脚一次；博文结构更新。
test_path = Path("app/tests/e2e/chat-demo.spec.ts")
test = test_path.read_text(encoding="utf-8")
old_test = '''test("普通选择直接成为带头像的用户回复并提供复制兼容", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".cq-turn-pair").first();
  await expect(first.getByRole("button", { name: /复制选项：先判断活性位点附近的结构是否可靠/ })).toBeVisible();
  await first.locator(".cq-option-select").filter({ hasText: "先判断活性位点附近的结构是否可靠" }).click();
  await expect(first.getByText("先判断活性位点附近的结构是否可靠", { exact: true })).toBeVisible();
  await expect(first.locator(".cq-avatar--user")).toBeVisible();
});'''
new_test = '''test("点击单一选项会显示复制反馈并生成自然用户气泡", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".cq-turn-pair").first();
  await expect(first.locator(".cq-option-copy")).toHaveCount(0);
  const option = first.getByRole("button", { name: "选择：先判断活性位点附近的结构是否可靠" });
  await option.click();
  await expect(option).toContainText("已复制");
  await expect(first.getByText("先判断活性位点附近的结构是否可靠", { exact: true })).toBeVisible();
  const userTurn = first.getByLabel("你的消息");
  await expect(userTurn).toBeVisible();
  await expect(userTurn.locator(".cq-user-bubble")).toContainText("先判断活性位点附近的结构是否可靠");
  await expect(userTurn.locator(".cq-avatar--user")).toBeVisible();
});

test("聊天交互说明只在页面底部出现一次", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cq-composer")).toHaveCount(0);
  const note = page.getByText("点击选项会自动复制，并生成一条用户回复", { exact: false });
  await expect(note).toHaveCount(1);
  await expect(page.locator(".cq-footer").getByText("点击选项会自动复制", { exact: false })).toBeVisible();
});'''
if old_test not in test:
    raise SystemExit("未找到旧复制兼容测试")
test = test.replace(old_test, new_test)
test_path.write_text(test, encoding="utf-8")

quest_test_path = Path("app/tests/e2e/quest-flow.spec.ts")
quest_test = quest_test_path.read_text(encoding="utf-8")
quest_test = quest_test.replace(
    'await expect(page.getByRole("heading", { name: "用户也可以主动补充上下文和任务线索" })).toBeVisible();',
    'await expect(page.getByRole("heading", { name: "Research Quest 怎样帮助用户澄清科研需求" })).toBeVisible();\n  await expect(page.getByRole("heading", { name: "Research Quest 如何提供正反馈" })).toBeVisible();\n  await expect(page.getByRole("heading", { name: "最终同时交给 Codex：Context 与 Goal" })).toBeVisible();\n  await expect(page.getByRole("heading", { name: "用户也可以主动补充上下文和任务线索" })).toBeVisible();'
)
quest_test_path.write_text(quest_test, encoding="utf-8")
