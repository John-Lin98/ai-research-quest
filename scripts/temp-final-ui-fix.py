from pathlib import Path

path = Path("app/src/components/QuestDashboard.tsx")
text = path.read_text(encoding="utf-8")
old = ': <em>已验证</em>}</li>;'
new = ': <em>{stage.title === "Verified" ? "已验证" : stage.title === "Candidate" ? "等待回答证据" : "等待应用证据"}</em>}</li>;'
if old in text:
    text = text.replace(old, new)
elif new not in text:
    raise SystemExit("未找到认知状态标签片段")

old_case = '<article><strong>认知自适应</strong><p>如果上一关 Verified Known Knowns 较少，下一关会自动补基础、减少术语；掌握度提升后再进入反例和研究决策。</p></article>'
new_case = '<article><strong>快速小步与认知自适应</strong><p>每回合通常只问 1 个、最多 3 个关键问题；如果上一关 Verified Known Knowns 较少，下一关会自动补基础、减少术语。</p></article>'
if old_case in text:
    text = text.replace(old_case, new_case)
elif new_case not in text:
    raise SystemExit("未找到案例自适应卡片片段")
path.write_text(text, encoding="utf-8")
