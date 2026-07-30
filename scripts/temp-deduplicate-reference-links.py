from pathlib import Path

files = {
    "public/case-study-alphafold-casp14.html": (
        '''        <p class="sources">方法参考：<a href="https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns">A field guide to Claude Fable 5: Finding your unknowns（Known–Unknown 认知地图）</a> · <a href="https://github.com/mattpocock/skills">Matt Pocock / skills</a> · <a href="https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md">grill-with-docs 源文件</a></p>\n''',
    ),
    "docs/usage/social-copy.md": (
        '''- 认知地图参考：https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns
- grill-me / grill-with-docs 参考：https://github.com/mattpocock/skills
- grill-with-docs 源文件：https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
''',
    ),
    "app/tests/e2e/blog-v1-2.spec.ts": (
        '''  await expect(page.getByText("聊天界面不反复展示横轴和纵轴文字", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Finding your unknowns/ })).toHaveAttribute("href", "https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns");
  await expect(page.getByRole("link", { name: "Matt Pocock / skills" })).toHaveAttribute("href", "https://github.com/mattpocock/skills");
  await expect(page.getByRole("link", { name: "grill-with-docs 源文件" })).toHaveAttribute("href", "https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md");
''',
    ),
}

for filename, (block,) in files.items():
    path = Path(filename)
    text = path.read_text(encoding="utf-8")
    while block + block in text:
        text = text.replace(block + block, block)
    path.write_text(text, encoding="utf-8")
