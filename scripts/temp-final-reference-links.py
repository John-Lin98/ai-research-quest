from pathlib import Path

BLOG = Path("public/case-study-alphafold-casp14.html")
SOCIAL = Path("docs/usage/social-copy.md")
TEST = Path("app/tests/e2e/blog-v1-2.spec.ts")

COGNITION_URL = "https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns"
GRILL_REPO_URL = "https://github.com/mattpocock/skills"
GRILL_DOCS_URL = "https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f"未找到待替换片段: {label}")


blog = BLOG.read_text(encoding="utf-8")
blog = replace_once(
    blog,
    '        <p>聊天界面不反复展示横轴和纵轴文字，但四个位置和含义固定。问题、解释、进度和 Goal 变化都由这张地图产生。</p>\n',
    "",
    "删除横纵轴说明",
)
anchor = '''        <div class="two-loop">
          <section><h3>Known–Unknown 四象限</h3><p>四象限告诉 AI：用户已经掌握什么、明确不知道什么、可能会但还没表达什么，以及还有哪些隐藏风险没有被看到。</p></section>
          <section><h3>grill-me-with-docs</h3><p>AI 先读文档，不重复问材料里已有的答案；默认每轮只问一个关键问题，并尽量沿用用户已经使用的术语。</p></section>
        </div>'''
references = anchor + f'''
        <p class="sources">方法参考：<a href="{COGNITION_URL}">A field guide to Claude Fable 5: Finding your unknowns（Known–Unknown 认知地图）</a> · <a href="{GRILL_REPO_URL}">Matt Pocock / skills</a> · <a href="{GRILL_DOCS_URL}">grill-with-docs 源文件</a></p>'''
blog = replace_once(blog, anchor, references, "博文参考链接")
BLOG.write_text(blog, encoding="utf-8")

social = SOCIAL.read_text(encoding="utf-8")
entry_anchor = '''- 聊天式 Demo：https://john-lin98.github.io/ai-research-quest/
- 案例博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html
- GitHub 与 Skill：https://github.com/John-Lin98/ai-research-quest'''
entry_refs = entry_anchor + f'''
- 认知地图参考：{COGNITION_URL}
- grill-me / grill-with-docs 参考：{GRILL_REPO_URL}
- grill-with-docs 源文件：{GRILL_DOCS_URL}'''
social = replace_once(social, entry_anchor, entry_refs, "社媒公开入口参考链接")

old_x = '''## X 单帖版

我做了一个开源科研游戏 Skill：Research Quest。

AI 先读文档，用 Known–Unknown 认知地图 + grill-me-with-docs 每轮只问一个关键问题，并克制回答，降低用户阅读长文和 AI 错误上下文累积的负担。最后生成 Context + Goal 交给 Codex。

也可用 Sol/Fable/Kimi 改造成 RPG、侦探或卡牌 Skill。

Demo：https://john-lin98.github.io/ai-research-quest/
GitHub：https://github.com/John-Lin98/ai-research-quest
欢迎 Star & Follow。'''
new_x = f'''## X 单帖版（主帖 + 参考资料回复）

### 主帖

我做了一个开源科研游戏 Skill：Research Quest。

AI 先读文档，用 Known–Unknown 认知地图 + grill-me-with-docs 每轮只问一个关键问题，并克制回答，降低用户阅读长文和 AI 错误 Context 累积的负担。最后生成 Context + Goal 交给 Codex。

Demo：https://john-lin98.github.io/ai-research-quest/
GitHub：https://github.com/John-Lin98/ai-research-quest
欢迎 Star & Follow。

### 参考资料回复

方法参考：
认知地图：{COGNITION_URL}
grill-me / grill-with-docs：{GRILL_REPO_URL}

也欢迎参考这套思路，用 Sol / Fable / Kimi 做成你喜欢的 RPG、侦探或卡牌 Skill。'''
social = replace_once(social, old_x, new_x, "X 主帖和参考回复")

thread_anchor = '''博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html

这是一个仍待真实用户验证的产品假设，不声称已经证明提升科研能力或效率。'''
thread_refs = f'''博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html
认知地图参考：{COGNITION_URL}
grill-me / grill-with-docs：{GRILL_REPO_URL}

这是一个仍待真实用户验证的产品假设，不声称已经证明提升科研能力或效率。'''
social = replace_once(social, thread_anchor, thread_refs, "X Thread 参考链接")

redbook_anchor = '''案例博文：`https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html`

它目前仍是一个等待真实用户验证的产品假设，不代表已经证明能够提升科研能力或效率。'''
redbook_refs = f'''案例博文：`https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html`

方法参考：

认知地图文章：`{COGNITION_URL}`

grill-me / grill-with-docs GitHub：`{GRILL_REPO_URL}`

grill-with-docs 源文件：`{GRILL_DOCS_URL}`

它目前仍是一个等待真实用户验证的产品假设，不代表已经证明能够提升科研能力或效率。'''
social = replace_once(social, redbook_anchor, redbook_refs, "小红书参考链接")
SOCIAL.write_text(social, encoding="utf-8")

test = TEST.read_text(encoding="utf-8")
old_assert = '''  await expect(page.getByRole("heading", { name: "Known Knowns（已知的已知）" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Unknown Unknowns（未知的未知）" })).toBeVisible();'''
new_assert = old_assert + f'''
  await expect(page.getByText("聊天界面不反复展示横轴和纵轴文字", {{ exact: false }})).toHaveCount(0);
  await expect(page.getByRole("link", {{ name: /Finding your unknowns/ }})).toHaveAttribute("href", "{COGNITION_URL}");
  await expect(page.getByRole("link", {{ name: "Matt Pocock / skills" }})).toHaveAttribute("href", "{GRILL_REPO_URL}");
  await expect(page.getByRole("link", {{ name: "grill-with-docs 源文件" }})).toHaveAttribute("href", "{GRILL_DOCS_URL}");'''
test = replace_once(test, old_assert, new_assert, "博文参考链接测试")
TEST.write_text(test, encoding="utf-8")
