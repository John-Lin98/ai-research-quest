from pathlib import Path

path = Path("public/case-study-alphafold-casp14.html")
text = path.read_text(encoding="utf-8")

anchor = '''        <div class="plain-box"><p class="label">核心收益</p><p>游戏化不是表面装饰。它服务于需求对齐：让用户更轻松地持续提供信息，让 AI 更准确地理解任务，最终为 Codex 准备一份更完整、可追溯、可执行的 Context。</p></div>

        <h2>两个核心逻辑</h2>'''
replacement = '''        <div class="plain-box"><p class="label">核心收益</p><p>游戏化不是表面装饰。它服务于需求对齐：让用户更轻松地持续提供信息，让 AI 更准确地理解任务，最终为 Codex 准备一份更完整、可追溯、可执行的 Context。</p></div>

        <h2>为什么要克制提问和回答</h2>
        <div class="two-loop">
          <section><h3>降低用户获取信息的难度</h3><p>AI 每轮只问一个最高价值问题，并只回答当前真正需要理解的部分。用户不必一次面对十几个问题，也不用从长篇回答里自己寻找最关键的结论。</p></section>
          <section><h3>降低 AI 的上下文和推理负担</h3><p>更短、更聚焦的回合可以减少无关 Context 持续累积，避免尚未确认的假设进入后续推理与 Goal，让 AI 更容易持续对齐用户真正想完成的任务。</p></section>
        </div>
        <p>克制不等于省略必要信息。需要深入时，用户可以继续追问；材料、风险或冲突发生变化时，AI 也会依据认知地图补充解释。目标是每一轮只解决当前最有价值的不确定性。</p>

        <h2>两个核心逻辑</h2>'''
if anchor not in text:
    raise SystemExit("未找到核心收益插入位置")
text = text.replace(anchor, replacement)

old_click = '''        <h2>点击选项怎样成为真实输入</h2>
        <div class="two-loop">
          <section><h3>支持按钮的宿主</h3><p>用户点击后，选项直接生成带头像的用户气泡，并写入 Context、认知地图和 Goal vN。</p></section>
          <section><h3>不支持按钮的宿主</h3><p>每个选项提供完整可复制文本；用户复制并发送，也可以直接输入自己的答案、问题或任务线索。</p></section>
        </div>

'''
if old_click not in text:
    raise SystemExit("未找到点击选项章节")
text = text.replace(old_click, "")

context_anchor = '''        <h2>Context 保存的不只是最终结论</h2>'''
custom_section = '''        <h2>用你喜欢的方式制作自己的游戏 Skill</h2>
        <p>Research Quest 提供的是一套可复用的交互方法，而不是固定的美术或剧情模板。你可以保留“认知地图 + grill-me-with-docs + Context / Goal 交接”的核心，再换成自己喜欢的游戏方式。</p>
        <div class="three-grid">
          <section><h3>选择游戏风格</h3><p>可以做成 RPG、侦探推理、卡牌构筑、经营养成、冒险探索，或任何适合目标用户的互动形式。</p></section>
          <section><h3>让模型参与创作</h3><p>可以让 Sol、Fable、Kimi 等你常用的模型帮助设计角色、剧情、关卡、奖励、反馈和交互文案，发挥它们的游戏化创作能力。</p></section>
          <section><h3>根据认知地图持续优化</h3><p>用户的选择、追问、卡点和主动线索会更新认知地图；AI 再据此调整难度、叙事和下一轮问题，让 Skill 的交互逐步贴近用户。</p></section>
        </div>
        <div class="plain-box"><p class="label">可复用思路</p><p>先确定你希望游戏帮助用户完成什么，再设计认知地图、每轮问题、正反馈和最终交付。游戏风格可以自由变化，但每个关卡都应帮助 AI 获得更准确的 Context，而不是只增加装饰。</p></div>

        <h2>Context 保存的不只是最终结论</h2>'''
if context_anchor not in text:
    raise SystemExit("未找到 Context 章节")
text = text.replace(context_anchor, custom_section)

handoff_end = '''        </div>

        <h2>案例的事实边界</h2>'''
new_handoff_end = '''        </div>
        <p class="sources">交互小细节：在支持按钮的界面中，点击选项可以直接生成用户回复；在真实 ChatGPT 或其他宿主中，用户也可以直接输入自己的答案、问题或任务线索。</p>

        <h2>案例的事实边界</h2>'''
if handoff_end not in text:
    raise SystemExit("未找到交接章节结尾")
text = text.replace(handoff_end, new_handoff_end, 1)

old_cta = '''        <section class="cta"><h2>查看和使用</h2><p><a href="./">聊天式 Demo</a> · <a href="./?view=full">完整 Dashboard</a> · <a href="https://github.com/John-Lin98/ai-research-quest/releases/latest">安装 Research Quest Skill v1.2.0</a> · <a href="https://github.com/John-Lin98/ai-research-quest">GitHub 仓库</a></p></section>'''
new_cta = '''        <section class="cta"><h2>查看、使用与共同完善</h2><p><a href="./">聊天式 Demo</a> · <a href="./?view=full">完整 Dashboard</a> · <a href="https://github.com/John-Lin98/ai-research-quest/releases/latest">安装 Research Quest Skill v1.2.0</a> · <a href="https://github.com/John-Lin98/ai-research-quest">GitHub 仓库</a></p><p>欢迎试玩、提出修改意见，也欢迎在 GitHub Star 项目并 Follow 后续更新。你也可以参考这套思路，制作属于自己的游戏 Skill。</p></section>'''
if old_cta not in text:
    raise SystemExit("未找到 CTA")
text = text.replace(old_cta, new_cta)

text = text.replace(
    "<footer>本页展示产品逻辑和公开试点设计，不构成具体酶目标的实验结论或科研能力评价。</footer>",
    "<footer>本页展示产品逻辑和公开试点设计，不构成具体的实验结论或科研能力评价。</footer>",
)

path.write_text(text, encoding="utf-8")

# 同步浏览器测试。
test_path = Path("app/tests/e2e/blog-v1-2.spec.ts")
test = test_path.read_text(encoding="utf-8")
old = '''  await expect(page.getByRole("heading", { name: "点击选项怎样成为真实输入" })).toBeVisible();
  await expect(page.getByText("支持按钮的宿主", { exact: true })).toBeVisible();
  await expect(page.getByText("不支持按钮的宿主", { exact: true })).toBeVisible();

'''
new = '''  await expect(page.getByRole("heading", { name: "为什么要克制提问和回答" })).toBeVisible();
  await expect(page.getByText("降低用户获取信息的难度", { exact: true })).toBeVisible();
  await expect(page.getByText("降低 AI 的上下文和推理负担", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "用你喜欢的方式制作自己的游戏 Skill" })).toBeVisible();
  await expect(page.getByText("Sol、Fable、Kimi", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "点击选项怎样成为真实输入" })).toHaveCount(0);

'''
if old not in test:
    raise SystemExit("未找到旧博文交互测试")
test = test.replace(old, new)

insert = '''  await expect(page.getByRole("heading", { name: "Codex Goal" })).toBeVisible();
'''
extra = '''  await expect(page.getByRole("heading", { name: "Codex Goal" })).toBeVisible();
  await expect(page.getByText("欢迎试玩、提出修改意见", { exact: false })).toContainText("Star");
  await expect(page.locator("footer")).toContainText("不构成具体的实验结论或科研能力评价");
'''
if insert not in test:
    raise SystemExit("未找到 Goal 测试插入点")
test = test.replace(insert, extra)
test_path.write_text(test, encoding="utf-8")
