from pathlib import Path
import re

path = Path("app/src/components/ChatQuestDemo.tsx")
text = path.read_text(encoding="utf-8")

old_user = '''function UserMessage({ children, label = "你" }: { children: string; label?: string }) {
  return (
    <article className="cq-message cq-message--user">
      <header><div><strong>{label}</strong><small>用户回复</small></div><span className="cq-avatar cq-avatar--user">你</span></header>
      <p>{children}</p>
    </article>
  );
}'''
new_user = '''function UserMessage({ children, label = "你" }: { children: string; label?: string }) {
  return (
    <article className="cq-user-turn" aria-label={`${label}的消息`}>
      <div className="cq-user-content">
        <small className="cq-user-label">{label}</small>
        <div className="cq-user-bubble"><p>{children}</p></div>
      </div>
      <span className="cq-avatar cq-avatar--user" aria-hidden="true">你</span>
    </article>
  );
}'''
if old_user not in text:
    raise SystemExit("未找到 UserMessage 旧实现")
text = text.replace(old_user, new_user)

choice_pattern = re.compile(r'''function ChoiceList\(\{.*?\n\}\n\nfunction AssistantTurn''', re.S)
choice_replacement = '''function ChoiceList({
  question,
  options,
  onChoose,
  onAddContext,
  onAskQuestion,
}: {
  question: string;
  options: Choice[];
  onChoose?: (choice: Choice) => void;
  onAddContext?: () => void;
  onAskQuestion?: () => void;
}) {
  const [copyFeedback, setCopyFeedback] = useState<{ label: string; text: string } | null>(null);

  const activate = async (label: string, action?: () => void) => {
    if (copyFeedback) return;
    const copied = await copyText(label);
    setCopyFeedback({ label, text: copied ? "已复制" : "已选择" });
    window.setTimeout(() => {
      setCopyFeedback(null);
      action?.();
    }, 650);
  };

  const optionButton = (label: string, detail: string, className: string, action?: () => void) => {
    const active = copyFeedback?.label === label;
    return (
      <div className={`cq-option-row ${className}`} key={label}>
        <button
          className={`cq-option-select${active ? " is-copying" : ""}`}
          type="button"
          disabled={Boolean(copyFeedback)}
          onClick={() => void activate(label, action)}
          aria-label={`选择：${label}`}
        >
          <span aria-live="polite">{active ? copyFeedback.text : label}</span>
          <small>{active ? "正在生成你的回复…" : detail}</small>
        </button>
      </div>
    );
  };

  return (
    <section className="cq-question" aria-label="关键提问">
      <strong>{question}</strong>
      <div className="cq-options">
        {options.map((choice) => optionButton(choice.label, choice.impact, "", () => onChoose?.(choice)))}
        {optionButton(ADD_CONTEXT_LABEL, "主动补充资料、约束、偏好、截止时间或纠错；AI 会分类并更新下一问。", "cq-option-row--task", onAddContext)}
        {optionButton(ASK_CLUE_LABEL, "暂停主关卡，先让 AI 回答你的问题；进度不会丢失。", "cq-option-row--clue", onAskQuestion)}
      </div>
    </section>
  );
}

function AssistantTurn'''
text, count = choice_pattern.subn(choice_replacement, text, count=1)
if count != 1:
    raise SystemExit(f"ChoiceList 替换次数异常: {count}")

# 移除已经不再需要的 onCopy 参数与传递。
text = text.replace("  onCopy,\n", "")
text = text.replace("  onCopy?: (text: string) => void;\n", "")
text = text.replace(" onCopy={onCopy}", "")
text = text.replace(" onCopy={copy}", "")

old_copy = '''  const copy = async (text: string) => {
    const copied = await copyText(text);
    setCopyNotice(copied ? `已复制“${text}”，可粘贴到真实 ChatGPT 对话。` : "复制失败，请手动选择文字。");
  };

'''
if old_copy in text:
    text = text.replace(old_copy, "")

# 普通选择不再用顶部状态条重复提示复制。
text = text.replace('''    setAnswers((current) => [...current, choice.label]);
    setCopyNotice(`已把“${choice.label}”作为你的回复，并写入当前会话 Context。`);''', '''    setAnswers((current) => [...current, choice.label]);''')

old_footer = '''      <footer className="cq-footer"><p>页面只在浏览器本地演示交互；请勿输入敏感或未公开资料。<a href={FULL_DEMO_URL}>完整 Dashboard</a>、<a href={CASE_URL}>案例博文</a>、<a href={VIDEO_URL}>原完整机制视频</a>与 <a href={SKILL_URL}>Skill 安装包</a>均继续保留。</p></footer>'''
new_footer = '''      <footer className="cq-footer">
        <p className="cq-interaction-note">交互说明：点击选项会自动复制，并生成一条用户回复；在真实 ChatGPT 中也可以直接输入自己的答案、问题或任务线索。</p>
        <p>页面只在浏览器本地演示交互；请勿输入敏感或未公开资料。<a href={FULL_DEMO_URL}>完整 Dashboard</a>、<a href={CASE_URL}>案例博文</a>、<a href={VIDEO_URL}>原完整机制视频</a>与 <a href={SKILL_URL}>Skill 安装包</a>均继续保留。</p>
      </footer>'''
if old_footer not in text:
    raise SystemExit("未找到页脚旧实现")
text = text.replace(old_footer, new_footer)

path.write_text(text, encoding="utf-8")
