import { useMemo, useState } from "react";

const SKILL_URL = "https://github.com/John-Lin98/ai-research-quest/releases/latest";
const CASE_URL = "./case-study-alphafold-casp14.html";
const VIDEO_URL = "./research-quest-demo-75s.webm";
const FULL_DEMO_URL = "./?view=full";
const CONTEXT_FILENAME = "research-quest-context.md";

type Mode = "case" | "custom";

type QuadrantSnapshot = {
  knownKnowns: string;
  unknownKnowns: string;
  knownUnknowns: string;
  unknownUnknowns: string;
};

type Choice = {
  label: string;
  impact: string;
};

type Turn = {
  round: number;
  title: string;
  message: string;
  adaptive: string;
  progress: number;
  score: number;
  remaining: string;
  goalVersion: string;
  goalChange: string;
  snapshot: QuadrantSnapshot;
  question?: string;
  options?: Choice[];
  finalContext?: string;
  finalGoal?: string;
};

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyText(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
  } catch {
    // Fall through to the local textarea fallback.
  }
  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function compact(value: string, fallback: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || fallback;
}

function contextSaved(choice: string, next: string) {
  return `你刚才选择了“${choice}”。这项决定已写入当前会话 Context，导出时会保存为 ${CONTEXT_FILENAME}。${next}`;
}

function buildCaseTurns(answers: string[]): Turn[] {
  const purpose = answers[0] ?? "还没有确定最先要支持的判断";
  const materials = answers[1] ?? "还没有说明手里有哪些资料";
  const boundary = answers[2] ?? "还没有确定结果最多能说明什么";
  const acceptance = answers[3] ?? "还没有约定做到什么才算完成";

  const finalContext = `# Research Quest Frozen Context｜AlphaFold2 活性位点试点

## 原始需求
用户希望判断 AlphaFold2 / AlphaFold DB 预测能否用于酶活性位点分析。

## 本轮读取和使用的资料
- AlphaFold2 与 CASP14 的公开背景；
- AlphaFold DB 预测结构；
- 可匹配的实验 PDB 结构；
- 可公开追溯的催化残基注释；
- 本次 5 轮聊天中的用户选择。

## 已确认决定
- 最先支持的判断：${purpose}
- 手里已有的资料：${materials}
- 结果最多能说明：${boundary}
- 做到什么算完成：${acceptance}

## Known–Unknown 四象限认知地图
### Known Knowns｜已知的已知
- 用户已经明确研究对象和目标用途；
- 用户已经说明现有资料、结论范围和完成标准；
- 上述决定均来自本次聊天选择，状态为 Confirmed；只有在执行或应用中得到支持后才升级为 Verified。

### Unknown Knowns｜未知的已知
- 用户可能已有结构比较、数据库筛选、阈值选择或失败分析经验，但尚未完整表达；
- Codex 执行中遇到取舍时，应优先从已有讨论和项目文档中提取偏好，再决定是否追问。

### Known Unknowns｜已知的未知
- 实际能成功匹配多少目标；
- 局部活性位点误差如何分布；
- 哪些失败来自链、编号、缺失残基或结构状态差异。

### Unknown Unknowns｜未知的未知
- 真实执行中可能出现新的映射冲突、数据偏差或评价盲点；
- 新风险出现时应写回 Context，并重新调整 Goal，而不是静默忽略。

## Goal 版本记录
- Goal v0.1：确定研究对象，目标用途未定；
- Goal v0.2：确定最先支持的判断；
- Goal v0.3：记录手里已有的资料；
- Goal v0.4：确定结果最多能说明什么；
- Goal v1.0：补齐完成标准并形成执行合同。

## 保存与交接
- 当前网页仅保存在页面内存中；
- 用户主动导出后保存为 ${CONTEXT_FILENAME}；
- Codex 开始前必须读取该 Context，不重复询问已经确认的决定。

## 结论范围
不把 pLDDT、结构相似性或局部几何结果直接写成催化活性、底物结合或药物发现结论。`;

  const finalGoal = `# Codex Goal｜AlphaFold2 活性位点公开试点

开始前读取 ${CONTEXT_FILENAME}，并把它作为本任务的需求依据。先使用其中已经确认的决定，不重复询问；只有真实执行暴露新的关键缺口时，才提出一个最高价值问题。

## 目标
围绕“${purpose}”完成一个公开、可追溯的小规模试点。

## 你可以使用的资料
${materials}

## 执行步骤
1. 建立公开目标清单，并记录每个目标为什么被纳入或排除；
2. 匹配 AlphaFold DB 预测、实验 PDB 链和催化残基注释；
3. 分别报告整体结构和活性位点附近的局部误差；
4. 记录成功率、失败原因和无法判断的样本；
5. 只在“${boundary}”范围内写结论；
6. 以“${acceptance}”作为完成标准；
7. 完成测试、独立审查、中文 PR 和安全合并。

## 交互规则
- 先查 Context、文档和代码，再提问；
- 每轮默认只问一个最影响结果的问题，确有必要时最多三个；
- 每个新决定都写回认知地图和 Goal 版本记录；
- 同一关键问题经过 3–5 轮不同尝试仍失败时，输出根因分析。`;

  return [
    {
      round: 1,
      title: "先说清楚要解决什么",
      message: "我先不把这句需求直接交给 Codex。‘用于活性位点分析’范围太大，先确认你最想支持的判断，后面的资料、指标和结论才不会选错。",
      adaptive: "现有需求只说明了研究对象，还没有说明最先要解决什么。认知地图里最大的空缺是 Known Unknowns，因此本轮只问一个目标问题。",
      progress: 12,
      score: 0,
      remaining: "约 6–9 分钟",
      goalVersion: "Goal v0.1",
      goalChange: "研究对象已明确，但最先要支持的判断还没有定下来。",
      snapshot: {
        knownKnowns: "已经知道研究对象是 AlphaFold2 和酶活性位点。",
        unknownKnowns: "你可能已有结构分析经验，但还没有说出来。",
        knownUnknowns: "还不知道这项工作最先要帮助你作出什么判断。",
        unknownUnknowns: "还没有检查结构编号和构象差异可能带来的问题。",
      },
      question: "你最希望这项工作先帮助你判断什么？",
      options: [
        { label: "先判断活性位点附近的结构是否可靠", impact: "重点比较局部结构和失败样本。" },
        { label: "先筛选哪些结构值得继续做分子对接", impact: "还需要补充配体、口袋和对照设置。" },
        { label: "直接分析催化机制", impact: "需要更强的实验或化学证据，不能只看预测结构。" },
      ],
    },
    {
      round: 2,
      title: "看看你手里有什么资料",
      message: contextSaved(purpose, "当前目标已经更清楚了；现在只需要确认你手里有哪些资料，避免 Codex 开始后再临时猜数据来源。"),
      adaptive: "上一轮已经确定目标，但 Known Knowns 里还没有可用资料。根据 grill-me-with-docs 的规则，本轮先用已有术语确认材料，不引入新的方法名。",
      progress: 34,
      score: 10,
      remaining: "约 5–7 分钟",
      goalVersion: "Goal v0.2",
      goalChange: `当前先支持：${purpose}。`,
      snapshot: {
        knownKnowns: `已经确认最先要支持：${purpose}。`,
        unknownKnowns: "你可能已经用过 AlphaFold DB、PDB 或结构比较工具。",
        knownUnknowns: "还不知道现有资料是否足够完成公开配对分析。",
        unknownUnknowns: "预测结构与实验结构的链和残基编号可能对不上。",
      },
      question: "下面哪一项最接近你现在手里的资料？",
      options: [
        { label: "已有 AlphaFold DB 预测、对应 PDB 和催化残基注释", impact: "可以直接设计一个小规模公开试点。" },
        { label: "只有预测结构，实验结构和注释还需要补齐", impact: "先增加资料收集和筛选步骤。" },
        { label: "资料还没有整理，希望 AI 先列出需要准备什么", impact: "先生成资料清单和缺口报告。" },
      ],
    },
    {
      round: 3,
      title: "确认结果最多能说明什么",
      message: contextSaved(materials, "资料够不够和结论能写多强是两回事；接下来只确认这一步最多能说明什么。"),
      adaptive: "认知地图中的 Known Unknowns 已从‘手里有什么’变成‘这些资料最多能说明什么’。因此本轮不继续问技术细节，只关闭结论范围这个关键空缺。",
      progress: 56,
      score: 20,
      remaining: "约 3–5 分钟",
      goalVersion: "Goal v0.3",
      goalChange: "你手里已有的资料和仍需补齐的部分已进入 Context。",
      snapshot: {
        knownKnowns: `目标：${purpose}；现有资料：${materials}。`,
        unknownKnowns: "你可能已有局部区域、阈值或失败分析偏好。",
        knownUnknowns: "还需要明确结构比较结果能支持什么、不能支持什么。",
        unknownUnknowns: "高置信度可能被误读成功能或催化正确。",
      },
      question: "首轮结果最多应该说明到哪一步？",
      options: [
        { label: "只判断局部结构是否适合初步筛选，并报告失败情况", impact: "不把结果扩大解释成催化或结合结论。" },
        { label: "结构比较和分子对接都报告，但分开解释", impact: "需要额外加入配体、基线和对接对照。" },
        { label: "先不下正式结论，完成小试点后再决定", impact: "把结论范围保留为待确认项。" },
      ],
    },
    {
      round: 4,
      title: "约定做到什么才算完成",
      message: contextSaved(boundary, "目标、资料和结果范围已经说清楚了；最后只差一个简单的完成标准，让 Codex 知道什么时候可以结束任务。"),
      adaptive: "四象限中的基础问题已经基本关闭。当前唯一会直接影响执行范围的 Known Unknown 是完成标准，所以本轮只问验收，不再增加知识负担。",
      progress: 78,
      score: 30,
      remaining: "约 1–3 分钟",
      goalVersion: "Goal v0.4",
      goalChange: `结果范围已确定：${boundary}。`,
      snapshot: {
        knownKnowns: "目标、资料和结果范围已经确认。",
        unknownKnowns: "你可能更偏好先做小规模、能快速复核的试点。",
        knownUnknowns: "还缺少样本数量、成功率和失败退出标准。",
        unknownUnknowns: "只报告成功样本可能造成选择偏差。",
      },
      question: "哪个标准最适合用来判断首轮任务已经完成？",
      options: [
        { label: "检查 10 个公开目标，至少 8 个得到可复核结果", impact: "规模小、结果可追溯，适合首轮验证。" },
        { label: "检查 30 个以上目标，并按酶家族分别统计", impact: "结果更完整，但首轮时间和成本更高。" },
        { label: "先只跑一个最小测试，不设正式成功率", impact: "适合排查流程，但不能当成正式结果。" },
      ],
    },
    {
      round: 5,
      title: "整理 Context，生成 Codex 目标",
      message: contextSaved(acceptance, "影响首轮执行的关键问题已经有答案，现在可以停止继续追问，把已确认内容整理成 Context 和 Codex Goal。"),
      adaptive: "认知地图中的核心 Known Unknowns 已经有关闭条件。剩余问题必须由真实执行回答，因此 grill-me-with-docs 在这里停止提问，转入 Codex 执行。",
      progress: 100,
      score: 50,
      remaining: "已完成",
      goalVersion: "Goal v1.0",
      goalChange: `已确定：${purpose}；${materials}；${boundary}；${acceptance}。`,
      snapshot: {
        knownKnowns: "目标、现有资料、结果范围和完成标准已经确认。",
        unknownKnowns: "执行中仍可从已有讨论提取你的分析经验和偏好。",
        knownUnknowns: "实际匹配成功率、误差分布和失败类型需要通过执行回答。",
        unknownUnknowns: "新出现的编号、缺失残基和构象冲突将写回下一轮。",
      },
      finalContext,
      finalGoal,
    },
  ];
}

function MiniQuadrant({ snapshot, label }: { snapshot: QuadrantSnapshot; label: string }) {
  const items = [
    ["Known Knowns", "已知的已知", "kk", snapshot.knownKnowns],
    ["Unknown Knowns", "未知的已知", "uk", snapshot.unknownKnowns],
    ["Known Unknowns", "已知的未知", "ku", snapshot.knownUnknowns],
    ["Unknown Unknowns", "未知的未知", "uu", snapshot.unknownUnknowns],
  ] as const;
  return (
    <section className="cq-mini-map" aria-label={label}>
      <div className="cq-mini-map__grid">
        {items.map(([english, chinese, key, content]) => (
          <article className={`cq-quadrant cq-quadrant--${key}`} key={english}>
            <strong>{english}</strong><small>{chinese}</small><p>{content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductLinks() {
  return (
    <nav className="cq-product-links" aria-label="Research Quest 产品入口">
      <a href={SKILL_URL}>安装 Skill</a>
      <a href={FULL_DEMO_URL}>完整 Dashboard</a>
      <a href={CASE_URL}>案例博文</a>
      <a href={VIDEO_URL}>完整机制视频</a>
    </nav>
  );
}

function UserMessage({ children, label = "你" }: { children: string; label?: string }) {
  return (
    <article className="cq-message cq-message--user">
      <header><div><strong>{label}</strong><small>用户回复</small></div><span className="cq-avatar cq-avatar--user">你</span></header>
      <p>{children}</p>
    </article>
  );
}

function AssistantTurn({
  turn,
  onChoose,
  onCopy,
}: {
  turn: Turn;
  onChoose?: (choice: Choice) => void;
  onCopy?: (choice: Choice) => void;
}) {
  return (
    <article className="cq-message cq-message--assistant" aria-label={`Research Quest 第 ${turn.round} 回合`}>
      <header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>第 {turn.round}/5 回合 · {turn.title}</small></div></header>
      <p>{turn.message}</p>
      <aside className="cq-adaptive"><strong>为什么这一步最值得问</strong><p>{turn.adaptive}</p></aside>
      <MiniQuadrant snapshot={turn.snapshot} label={`第 ${turn.round} 回合 Known–Unknown 四象限`} />
      <div className="cq-feedback" aria-label="本轮正反馈">
        <section className="cq-feedback__progress"><span>目标进度</span><strong>{turn.progress}%</strong><div className="cq-progress-track" aria-hidden="true"><i style={{ width: `${turn.progress}%` }} /></div></section>
        <span>认知分 <strong>{turn.score}</strong></span>
        <span>预计剩余 <strong>{turn.remaining}</strong></span>
        <span className="cq-goal-change">当前目标变化 ({turn.goalVersion}) <strong>{turn.goalChange}</strong></span>
      </div>
      {turn.question && turn.options ? (
        <section className="cq-question" aria-label={`第 ${turn.round} 回合关键问题`}>
          <strong>{turn.question}</strong>
          <div className="cq-options">
            {turn.options.map((choice) => (
              <div className="cq-option-row" key={choice.label}>
                <button className="cq-option-select" type="button" onClick={() => onChoose?.(choice)}>
                  <span>{choice.label}</span><small>{choice.impact}</small>
                </button>
                <button className="cq-option-copy" type="button" onClick={() => onCopy?.(choice)} aria-label={`复制选项：${choice.label}`}>复制</button>
              </div>
            ))}
          </div>
          <div className="cq-composer" aria-label="聊天回复提示"><span className="cq-avatar cq-avatar--user">你</span><p>点击一个选项后，它会自动成为你的回复；在真实 ChatGPT 中也可以先复制，再粘贴发送。</p><button type="button" disabled>发送</button></div>
        </section>
      ) : null}
      {turn.finalContext && turn.finalGoal ? (
        <section className="cq-frozen" aria-label="Frozen Context 与 Codex Goal">
          <div><strong>完整 Context</strong><pre>{turn.finalContext}</pre><button type="button" onClick={() => downloadText(CONTEXT_FILENAME, turn.finalContext!)}>下载 context.md</button></div>
          <div><strong>Codex Goal</strong><pre>{turn.finalGoal}</pre><button type="button" onClick={() => downloadText("research-quest-codex-goal.md", turn.finalGoal!)}>下载目标提示词</button></div>
          <ProductLinks />
        </section>
      ) : null}
    </article>
  );
}

function FixedCaseChat() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [copyNotice, setCopyNotice] = useState("");
  const turns = useMemo(() => buildCaseTurns(answers), [answers]);
  const visibleCount = Math.min(answers.length + 1, turns.length);
  const visibleTurns = turns.slice(0, visibleCount);
  const latest = visibleTurns.at(-1) ?? turns[0];

  const choose = (index: number, choice: Choice) => {
    if (answers.length !== index) return;
    setAnswers((current) => [...current, choice.label]);
    setCopyNotice(`已把“${choice.label}”作为你的本轮回复，并写入当前会话 Context。`);
  };

  const copy = async (choice: Choice) => {
    const copied = await copyText(choice.label);
    setCopyNotice(copied ? `已复制“${choice.label}”，可粘贴到真实 ChatGPT 对话。` : "复制失败，请手动选择文字。");
  };

  return (
    <section className="cq-chat-mode" aria-labelledby="fixed-case-title">
      <div className="cq-overview">
        <div><p className="cq-eyebrow">认知地图 + grill-me-with-docs</p><h2 id="fixed-case-title">AlphaFold2 活性位点试点</h2><p>AI 先读已有资料，再根据四象限每轮只问一个最关键问题；每次选择都写入 Context，并逐步形成 Codex Goal。</p></div>
        <MiniQuadrant snapshot={latest.snapshot} label="当前完整 Known–Unknown 四象限" />
      </div>
      <p className="cq-live-note" aria-live="polite">{copyNotice || `当前决定保存在页面内存；导出时写入 ${CONTEXT_FILENAME}。`}</p>
      <div className="cq-thread" aria-label="固定案例聊天记录">
        <UserMessage>我想评估 AlphaFold2 预测能不能用于酶活性位点分析。</UserMessage>
        {visibleTurns.map((turn, index) => (
          <div key={turn.round} className="cq-turn-pair">
            <AssistantTurn turn={turn} onChoose={(choice) => choose(index, choice)} onCopy={copy} />
            {answers[index] ? <UserMessage>{answers[index]}</UserMessage> : null}
          </div>
        ))}
      </div>
      {answers.length ? <button className="cq-secondary-button" type="button" onClick={() => { setAnswers([]); setCopyNotice(""); }}>重新体验 5 轮案例</button> : null}
    </section>
  );
}

function initialCustomQuadrant(requirement: string, deliverable: string): QuadrantSnapshot {
  return {
    knownKnowns: `你已明确提出：${compact(requirement, "还没有填写需求")}；希望得到：${compact(deliverable, "待确认")}。`,
    unknownKnowns: "你可能已有相关经验、偏好或失败教训，但还没有说出来。",
    knownUnknowns: "数据、评价标准、完成条件和不能做什么仍需继续确认。",
    unknownUnknowns: "隐藏依赖、反例和执行风险需要通过真实对话与工具调用发现。",
  };
}

function CustomRequirementChat() {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [requirement, setRequirement] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [materials, setMaterials] = useState("");
  const [error, setError] = useState("");

  const containsSensitive = (value: string) => /(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:sk|ghp|github_pat)[-_A-Za-z0-9]{12,}|[A-Za-z]:\\|\/(?:home|Users|data\d*)\/)/.test(value);

  const context = useMemo(() => {
    const req = compact(requirement, "待补充");
    const output = compact(deliverable, "待通过 Research Quest 对话确认");
    const available = compact(materials, "尚未提供；AI 应先从现有文档和会话中整理，再询问缺口");
    return `# Research Quest Initial Context

## 原始科研需求
${req}

## 最终希望得到
${output}

## 现在手里有什么资料或限制
${available}

## grill-me-with-docs 工作规则
1. 先读取用户提供的文档、历史讨论和已有 Context；
2. 不询问文档中已经能够回答的问题；
3. 从四象限中选出最影响最终结果的一个空缺；
4. 每轮默认只问一个关键问题，确有必要时最多三个；
5. 使用用户和文档中已经出现的术语，必须引入新词时先用通俗语言解释；
6. 每次回答后更新四象限、保存位置和当前目标变化 (Goal vN)。

## 初始 Known–Unknown 四象限
### Known Knowns｜已知的已知
用户已经明确表达需求与期望产物。

### Unknown Knowns｜未知的已知
用户可能已有但尚未表达的经验、偏好和失败教训。

### Known Unknowns｜已知的未知
数据、评价标准、完成条件、边界和执行方式仍需确认。

### Unknown Unknowns｜未知的未知
隐藏依赖、反例和执行风险需要由真实对话与工具调用暴露。

## 保存状态
这是网页本地生成的启动草图，尚未经过 AI 访谈、确认或验证；导出后保存为 research-quest-initial-context.md。`;
  }, [requirement, deliverable, materials]);

  const prompt = useMemo(() => `请启用 Research Quest Skill，并基于下面的 Initial Context 启动聊天式科研对齐。

${context}

执行要求：
1. 先读文档和已有 Context，再决定是否需要提问；
2. 核心逻辑固定为 Known–Unknown 四象限认知地图 + grill-me-with-docs；
3. 每轮默认只问一个最影响最终结果的问题，必要时最多三个；
4. 每轮回复采用：一句话回顾与保存提示 → 为什么这一步最值得问 → 完整四象限 → 目标进度/认知分/剩余时间/当前目标变化 (Goal vN) → 关键问题；
5. 用户选择后，自动将选项作为输入；宿主不支持按钮时，提供可复制的完整选项文字；
6. 只有经过确认或验证的信息才能进入 Frozen Context；
7. 完成认知对齐后，生成引用 Frozen Context 的完整 Codex Goal。`, [context]);

  const generate = () => {
    const combined = `${requirement}\n${deliverable}\n${materials}`;
    if (requirement.trim().length < 10) {
      setError("请先用至少 10 个字描述真实科研需求。");
      setStage(1);
      return;
    }
    if (containsSensitive(combined)) {
      setError("检测到邮箱、密钥或私人绝对路径。请先脱敏，再生成公开启动材料。");
      return;
    }
    setError("");
    setStage(3);
  };

  const snapshot = initialCustomQuadrant(requirement, deliverable);

  return (
    <section className="cq-custom" aria-labelledby="custom-title">
      <div className="cq-overview">
        <div><p className="cq-eyebrow">输入自己的科研需求</p><h2 id="custom-title">两步生成启动材料</h2><p>网页只在本地整理需求；真正的认知建图和 grill-me-with-docs 提问由安装 Skill 的 ChatGPT / Agent 完成。</p></div>
        <MiniQuadrant snapshot={snapshot} label="自定义需求初始 Known–Unknown 四象限草图" />
      </div>
      <div className="cq-thread">
        <article className="cq-message cq-message--assistant"><header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>自定义启动 · 第 {stage === 1 ? 1 : 2}/2 步</small></div></header><p>{stage === 1 ? "先用一段话告诉我你真正想完成的科研任务。" : "再补充最终产物，以及现有资料或不能改变的限制。"}</p></article>
        <article className="cq-message cq-message--user cq-form-message">
          <header><div><strong>你</strong><small>用户输入</small></div><span className="cq-avatar cq-avatar--user">你</span></header>
          {stage === 1 ? <label><span>我的科研需求</span><textarea maxLength={1500} value={requirement} onChange={(event) => setRequirement(event.target.value)} placeholder="例如：我想设计一个 RNA 二级结构逆折叠实验方案，并找到可复现的近五年 baseline。" /></label> : null}
          {stage >= 2 ? <>
            <label><span>最终希望获得什么？</span><input maxLength={300} value={deliverable} onChange={(event) => setDeliverable(event.target.value)} placeholder="例如：实验方案、Codex Goal 和验收标准" /></label>
            <label><span>现在有哪些资料或限制？</span><textarea maxLength={1200} value={materials} onChange={(event) => setMaterials(event.target.value)} placeholder="例如：已有数据、代码仓库、算力、截止时间或不能改变的边界" /></label>
          </> : null}
          {error ? <p className="cq-error" role="alert">{error}</p> : null}
          {stage === 1 ? <button type="button" onClick={() => requirement.trim().length >= 10 ? (setError(""), setStage(2)) : setError("请用至少 10 个字描述真实科研需求。")}>继续补充 Context</button> : null}
          {stage === 2 ? <button type="button" onClick={generate}>生成启动提示词与 context.md</button> : null}
        </article>
        {stage === 3 ? <article className="cq-message cq-message--assistant"><header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>本地准备完成</small></div></header><p>已生成初始 Context 和启动提示词，并标明保存文件名。它们是进入真实 AI 对话的起点，不是已经验证的科研方案。</p><MiniQuadrant snapshot={snapshot} label="自定义需求完整初始四象限" /><section className="cq-generated"><div><strong>context.md</strong><pre>{context}</pre><button type="button" onClick={() => downloadText("research-quest-initial-context.md", context)}>下载 context.md</button></div><div><strong>Research Quest 启动提示词</strong><pre>{prompt}</pre><button type="button" onClick={() => downloadText("research-quest-start-prompt.md", prompt)}>下载启动提示词</button></div></section><ProductLinks /></article> : null}
      </div>
      {stage > 1 ? <button className="cq-secondary-button" type="button" onClick={() => { setStage(1); setError(""); }}>重新填写</button> : null}
    </section>
  );
}

export function ChatQuestDemo() {
  const [mode, setMode] = useState<Mode>("case");
  return (
    <main className="cq-app">
      <header className="cq-header">
        <div><p className="cq-eyebrow">Research Quest｜Cognition Map + grill-me-with-docs</p><h1>先读资料、建立认知地图，再问一个真正重要的问题</h1><p>Research Quest 改造的是人与 AI 的科研聊天：AI 先理解文档和已有 Context，用四象限找到最关键的认知空缺，再以小步提问形成可交给 Codex 的精确目标。</p></div>
        <ProductLinks />
      </header>
      <section className="cq-mode-switch" aria-label="选择演示模式">
        <button type="button" className={mode === "case" ? "is-active" : ""} onClick={() => setMode("case")}>体验 5 轮真实案例</button>
        <button type="button" className={mode === "custom" ? "is-active" : ""} onClick={() => setMode("custom")}>输入我的科研需求</button>
      </section>
      {mode === "case" ? <FixedCaseChat /> : <CustomRequirementChat />}
      <footer className="cq-footer"><p>核心逻辑：先读文档，再用 Known–Unknown 四象限决定每轮唯一的关键问题。<a href={FULL_DEMO_URL}>完整 Dashboard</a>、<a href={CASE_URL}>案例博文</a>、<a href={VIDEO_URL}>完整机制视频</a>和 <a href={SKILL_URL}>Skill 安装包</a>均继续保留。</p></footer>
    </main>
  );
}
