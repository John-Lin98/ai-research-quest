from pathlib import Path

path = Path("app/src/components/ChatQuestDemo.tsx")
text = path.read_text(encoding="utf-8")
text = text.replace(
    "function QuestionClueTurn({ turn, onChoose, onCopy, onAddContext, onAskQuestion }:",
    "function QuestionClueTurn({ turn, onChoose, onAddContext, onAskQuestion }:",
)
text = text.replace(
    "function TaskClueTurn({ turn, onChoose, onCopy, onAddContext, onAskQuestion }:",
    "function TaskClueTurn({ turn, onChoose, onAddContext, onAskQuestion }:",
)
if "onChoose, onCopy, onAddContext" in text:
    raise SystemExit("仍存在过期 onCopy 解构")
path.write_text(text, encoding="utf-8")
