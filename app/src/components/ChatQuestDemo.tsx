import { useMemo, useState } from "react";

const SKILL_URL = "https://github.com/John-Lin98/ai-research-quest/releases/tag/v1.1.0";
const CASE_URL = "./case-study-alphafold-casp14.html";
const VIDEO_URL = "./research-quest-demo-75s.webm";
const FULL_DEMO_URL = "./?view=full";

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

function compact(value: string, fallback: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || fallback;
}

function buildCaseTurns(answers: string[]): Turn[] {
  const purpose = answers[0] ?? "尚未冻结下游用途";
  const materials = answers[1] ?? "尚未确认已有材料";
  const boundary = answers[2] ?? "尚未冻结证据边界";
  const acceptance = answers[3] ?? "尚未冻结完成信号";

  const finalContext = `# Frozen Context｜AlphaFold2 酶活性位点几何试点

## 目标
评估 AlphaFold2 / AlphaFold DB 预测是否足以支持酶活性位点几何初筛。

## 已冻结决定
- 下游用途：${purpose}
- 已有材料：${materials}
- 证据边界：${boundary}
- 完成信号：${acceptance}

## Known–Unknown 四象限
- Known Knowns：研究对象、下游用途、输入范围、证据边界和验收已确认。
- Unknown Knowns：用户可能已有结构比较、数据库或阈值经验，执行前继续显式化。
- Known Unknowns：实际映射成功率、局部误差分布和失败样本类型仍待执行回答。
- Unknown Unknowns：链、残基编号、缺失区域和构象状态冲突由执行阶段暴露并回写。

## 公开边界
不把 pLDDT、结构相似性或局部几何结果外推为催化、结合或药物发现结论。`;

  const finalGoal = `# Codex Goal｜AlphaFold2 酶活性位点几何公开试点

开始前读取 Frozen Context，并将其作为唯一需求依据。不要重复询问已经冻结的决定。

## 目标
围绕“${purpose}”完成一个可追溯公开试点。

## 输入
${materials}

## 执行
1. 冻结公开目标清单、来源、纳入与排除规则；
2. 建立 AlphaFold DB、PDB 链和催化残基注释的可追溯映射；
3. 计算全局与局部结构指标、覆盖率和失败码；
4. 按“${boundary}”控制结论；
5. 以“${acceptance}”作为验收依据；
6. 完成测试、独立审查、中文 PR 和安全合并。

同一关键问题经过 3–5 轮实质不同的尝试仍失败时，输出根因分析。`;

  return [
    {
      round: 1,
      title: "先冻结真实下游判断",
      message: "我先不把这句需求直接交给 Codex。‘用于活性位点分析’仍然太宽，不同下游任务需要不同的数据、指标和结论边界。",
      adaptive: "初始认知地图显示 Known Knowns 较少，本轮只确定一个最关键目标，不引入实现细节。",
      progress: 12,
      score: 0,
      remaining: "约 6–9 分钟",
      goalVersion: "Goal v0.1",
      goalChange: "研究对象已出现，但下游用途尚未冻结。",
      snapshot: {
        knownKnowns: "已明确研究对象：AlphaFold2 与酶活性位点。",
        unknownKnowns: "可能已有结构分析经验，但尚未表达。",
        knownUnknowns: "还不知道需要支持哪种下游判断。",
        unknownUnknowns: "尚未检查残基映射和构象差异风险。",
      },
      question: "你最希望这项工作首先支持哪一种判断？",
      options: [
        { label: "酶活性位点几何初筛", impact: "聚焦局部结构准确性与失败模式。" },
        { label: "为后续分子对接筛选结构", impact: "需要额外考虑配体、口袋和对接控制。" },
        { label: "分析催化机制", impact: "需要更强证据，不能只依赖预测结构。" },
      ],
    },
    {
      round: 2,
      title: "确认可用输入与材料",
      message: `下游用途已暂定为“${purpose}”。为了避免 Codex 在执行时临时猜测数据来源，本轮只确认输入资产。`,
      adaptive: "上一轮 Verified Known Knowns 仍较少，本轮增加基础认知提升：区分预测结构、实验结构和催化残基注释各自的作用。",
      progress: 34,
      score: 10,
      remaining: "约 5–7 分钟",
      goalVersion: "Goal v0.2",
      goalChange: `已冻结下游用途：${purpose}。`,
      snapshot: {
        knownKnowns: `已确认下游用途：${purpose}。`,
        unknownKnowns: "可能已有 AlphaFold DB、PDB 或结构比较经验。",
        knownUnknowns: "还不知道输入是否足以形成公开配对分析。",
        unknownUnknowns: "链和残基编号可能无法直接对应。",
      },
      question: "当前最接近真实情况的是哪一项？",
      options: [
        { label: "已有 AlphaFold DB、匹配 PDB 和催化残基公开注释", impact: "可以设计公开配对试点。" },
        { label: "只有预测结构，实验结构和注释需要补齐", impact: "先增加数据准备与筛选关。" },
        { label: "材料尚未整理，需要 AI 先建立资产清单", impact: "先输出数据资产和缺口报告。" },
      ],
    },
    {
      round: 3,
      title: "冻结证据边界",
      message: `已记录材料状态：“${materials}”。现在需要确保最终结果不会被写成超出计算证据的结论。`,
      adaptive: "Known Unknowns 从‘有什么材料’转向‘材料能支持什么’；本轮进入证据边界判断。",
      progress: 56,
      score: 20,
      remaining: "约 3–5 分钟",
      goalVersion: "Goal v0.3",
      goalChange: "输入资产及缺口已进入 Context。",
      snapshot: {
        knownKnowns: `用途：${purpose}；材料：${materials}。`,
        unknownKnowns: "用户可能已有局部区域、阈值或失败分析偏好。",
        knownUnknowns: "还需明确结构指标能够支持和不能支持什么。",
        unknownUnknowns: "高置信度可能被误读为外部结构或功能正确。",
      },
      question: "首轮试点的结论应限制在哪个范围？",
      options: [
        { label: "只评价局部几何初筛适用性与失败模式", impact: "不外推到催化、结合或药物发现。" },
        { label: "同时报告对接结果，但与结构评测分开", impact: "增加配体、基线和对接控制。" },
        { label: "先保留开放，完成 pilot 后再冻结", impact: "Goal 中标记为待验证，不形成正式结论。" },
      ],
    },
    {
      round: 4,
      title: "定义可验收完成信号",
      message: `证据边界已记录为“${boundary}”。最后还需要一个能让 Codex 判断任务是否真正完成的量化信号。`,
      adaptive: "基础概念已经对齐，本轮不再补知识，直接进入执行合同与验收设计。",
      progress: 78,
      score: 30,
      remaining: "约 1–3 分钟",
      goalVersion: "Goal v0.4",
      goalChange: `结论边界已冻结：${boundary}。`,
      snapshot: {
        knownKnowns: `用途、材料和边界均已确认。`,
        unknownKnowns: "可能偏好先做小规模可追溯 pilot。",
        knownUnknowns: "还缺少样本规模、覆盖率和失败退出条件。",
        unknownUnknowns: "低覆盖率可能造成只报告成功样本的选择偏差。",
      },
      question: "哪个完成信号最适合作为首轮执行合同？",
      options: [
        { label: "10 个公开目标，至少 8 个形成有效配对分析", impact: "规模小、可追溯，适合验证流程。" },
        { label: "30 个以上目标，并按家族分层", impact: "证据更完整，但首轮成本更高。" },
        { label: "先跑 smoke，不预设正式覆盖率", impact: "只用于诊断，不能作为正式完成结论。" },
      ],
    },
    {
      round: 5,
      title: "Context Freeze 与 Goal Forge",
      message: "关键信息已经从模糊需求变成可追溯执行合同。现在 Codex 可以直接读取 Frozen Context 和 Goal，而不是重新猜测你的目标。",
      adaptive: "四象限中影响首轮执行的 Known Unknowns 已有关闭条件；剩余未知将由 Codex 的真实执行暴露并回写。",
      progress: 100,
      score: 50,
      remaining: "已完成",
      goalVersion: "Goal v1.0",
      goalChange: `已冻结：${purpose}；${materials}；${boundary}；${acceptance}。`,
      snapshot: {
        knownKnowns: "目标、输入、证据边界和验收均已冻结。",
        unknownKnowns: "执行时继续显式化用户的结构分析经验与偏好。",
        knownUnknowns: "实际映射成功率、误差分布和失败样本仍待执行回答。",
        unknownUnknowns: "新出现的链、编号和构象冲突将回写下一轮。",
      },
      finalContext,
      finalGoal,
    },
  ];
}

function MiniQuadrant({ snapshot, label }: { snapshot: QuadrantSnapshot; label: string }) {
  return (
    <section className="cq-mini-map" aria-label={label}>
      <div className="cq-mini-map__axis">横轴：是否意识到 · 纵轴：是否掌握</div>
      <div className="cq-mini-map__grid">
        <article className="cq-quadrant cq-quadrant--kk"><strong>Known Knowns</strong><p>{snapshot.knownKnowns}</p></article>
        <article className="cq-quadrant cq-quadrant--uk"><strong>Unknown Knowns</strong><p>{snapshot.unknownKnowns}</p></article>
        <article className="cq-quadrant cq-quadrant--ku"><strong>Known Unknowns</strong><p>{snapshot.knownUnknowns}</p></article>
        <article className="cq-quadrant cq-quadrant--uu"><strong>Unknown Unknowns</strong><p>{snapshot.unknownUnknowns}</p></article>
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

function AssistantTurn({ turn, onChoose }: { turn: Turn; onChoose?: (choice: Choice) => void }) {
  return (
    <article className="cq-message cq-message--assistant" aria-label={`Research Quest 第 ${turn.round} 回合`}>
      <header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>第 {turn.round}/5 回合 · {turn.title}</small></div></header>
      <p>{turn.message}</p>
      <aside className="cq-adaptive"><strong>为什么本轮这样问</strong><p>{turn.adaptive}</p></aside>
      <MiniQuadrant snapshot={turn.snapshot} label={`第 ${turn.round} 回合 Known–Unknown 四象限`} />
      <div className="cq-feedback" aria-label="本轮正反馈">
        <span>目标进度 <strong>{turn.progress}%</strong></span>
        <span>认知分 <strong>{turn.score}</strong></span>
        <span>预计剩余 <strong>{turn.remaining}</strong></span>
        <span>{turn.goalVersion} <strong>{turn.goalChange}</strong></span>
      </div>
      {turn.question && turn.options ? (
        <section className="cq-question" aria-label={`第 ${turn.round} 回合关键问题`}>
          <strong>{turn.question}</strong>
          <div className="cq-options">
            {turn.options.map((choice) => (
              <button key={choice.label} type="button" onClick={() => onChoose?.(choice)}>
                <span>{choice.label}</span><small>{choice.impact}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {turn.finalContext && turn.finalGoal ? (
        <section className="cq-frozen" aria-label="Frozen Context 与 Codex Goal">
          <div><strong>Frozen Context</strong><pre>{turn.finalContext}</pre><button type="button" onClick={() => downloadText("research-quest-context.md", turn.finalContext!)}>下载 context.md</button></div>
          <div><strong>Codex Goal</strong><pre>{turn.finalGoal}</pre><button type="button" onClick={() => downloadText("research-quest-codex-goal.md", turn.finalGoal!)}>下载目标提示词</button></div>
          <ProductLinks />
        </section>
      ) : null}
    </article>
  );
}

function FixedCaseChat() {
  const [answers, setAnswers] = useState<string[]>([]);
  const turns = useMemo(() => buildCaseTurns(answers), [answers]);
  const visibleCount = Math.min(answers.length + 1, turns.length);
  const visibleTurns = turns.slice(0, visibleCount);
  const latest = visibleTurns.at(-1) ?? turns[0];

  const choose = (index: number, choice: Choice) => {
    if (answers.length !== index) return;
    setAnswers((current) => [...current, choice.label]);
  };

  return (
    <section className="cq-chat-mode" aria-labelledby="fixed-case-title">
      <div className="cq-overview">
        <div><p className="cq-eyebrow">当前认知地图总览</p><h2 id="fixed-case-title">AlphaFold2 活性位点试点</h2><p>固定 5 轮真实案例，展示 Research Quest 如何把模糊需求变成 Context 和 Codex Goal。</p></div>
        <MiniQuadrant snapshot={latest.snapshot} label="当前完整 Known–Unknown 四象限" />
      </div>
      <div className="cq-thread" aria-label="固定案例聊天记录">
        <article className="cq-message cq-message--user"><strong>你</strong><p>我想评估 AlphaFold2 预测能不能用于酶活性位点分析。</p></article>
        {visibleTurns.map((turn, index) => (
          <div key={turn.round} className="cq-turn-pair">
            <AssistantTurn turn={turn} onChoose={(choice) => choose(index, choice)} />
            {answers[index] ? <article className="cq-message cq-message--user"><strong>你</strong><p>{answers[index]}</p></article> : null}
          </div>
        ))}
      </div>
      {answers.length ? <button className="cq-secondary-button" type="button" onClick={() => setAnswers([])}>重新体验 5 轮案例</button> : null}
    </section>
  );
}

function initialCustomQuadrant(requirement: string, deliverable: string): QuadrantSnapshot {
  return {
    knownKnowns: `用户明确提出：${compact(requirement, "尚未填写需求")}；期望产物：${compact(deliverable, "待确认")}。`,
    unknownKnowns: "用户可能已有领域经验、偏好或失败教训，但尚未表达。",
    knownUnknowns: "数据、指标、验收和执行边界需要通过 Skill 继续对齐。",
    unknownUnknowns: "隐藏依赖、反例和执行风险需要由真实对话与工具调用暴露。",
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
    const assets = compact(materials, "尚未提供；需要 AI 在首轮建立材料与约束清单");
    return `# Research Quest Initial Context\n\n## 原始科研需求\n${req}\n\n## 期望产物\n${output}\n\n## 已有材料与约束\n${assets}\n\n## 初始 Known–Unknown 四象限草图\n- Known Knowns：用户明确表达的需求与期望产物。\n- Unknown Knowns：可能已有但尚未表达的经验、偏好和失败教训。\n- Known Unknowns：数据、指标、验收、边界和执行方式仍需确认。\n- Unknown Unknowns：隐藏依赖、反例和执行风险需由真实对话与工具调用暴露。\n\n## 状态\n这是网页本地生成的初始草图，尚未经过 AI 访谈、确认或验证。`;
  }, [requirement, deliverable, materials]);

  const prompt = useMemo(() => `请启用 Research Quest Skill，并基于下面的 Initial Context 启动聊天式科研闯关。\n\n${context}\n\n执行要求：\n1. 先展示预计关卡、总时间和最终产物；\n2. 每轮通常只问 1 个、最多 3 个最影响目标的问题；\n3. 每轮以聊天回复展示完整但紧凑的 Known–Unknown 四象限、认知分、目标进度、预计剩余时间和 Goal vN 变化；\n4. 根据上一轮认知地图动态调整下一轮难度，并明确解释调整原因；\n5. 只有经过确认或验证的信息才能进入 Frozen Context；\n6. 完成认知对齐后，生成引用 Frozen Context 的完整 Codex Goal；\n7. 用户要求仅制定目标时，在 Goal 交接处结束；否则由 Codex / Agent 执行。`, [context]);

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
        <div><p className="cq-eyebrow">输入自己的科研需求</p><h2 id="custom-title">两步生成启动材料</h2><p>网页只做本地整理，不假装运行大模型；真正的自适应关卡由 ChatGPT / Agent 使用 Skill 生成。</p></div>
        <MiniQuadrant snapshot={snapshot} label="自定义需求初始 Known–Unknown 四象限草图" />
      </div>
      <div className="cq-thread">
        <article className="cq-message cq-message--assistant"><header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>自定义启动 · 第 {stage === 1 ? 1 : 2}/2 步</small></div></header><p>{stage === 1 ? "先用一段话告诉我你真正想完成的科研任务。" : "再补充两个最影响 Context 精度的信息。"}</p></article>
        <article className="cq-message cq-message--user cq-form-message">
          {stage === 1 ? <label><span>我的科研需求</span><textarea maxLength={1500} value={requirement} onChange={(event) => setRequirement(event.target.value)} placeholder="例如：我想设计一个 RNA 二级结构逆折叠实验方案，并找到可复现的近五年 baseline。" /></label> : null}
          {stage >= 2 ? <>
            <label><span>最终希望获得什么产物？</span><input maxLength={300} value={deliverable} onChange={(event) => setDeliverable(event.target.value)} placeholder="例如：实验方案、Codex Goal 和验收标准" /></label>
            <label><span>当前有哪些材料或约束？</span><textarea maxLength={1200} value={materials} onChange={(event) => setMaterials(event.target.value)} placeholder="例如：已有数据、代码仓库、算力、截止时间或不能改变的边界" /></label>
          </> : null}
          {error ? <p className="cq-error" role="alert">{error}</p> : null}
          {stage === 1 ? <button type="button" onClick={() => requirement.trim().length >= 10 ? (setError(""), setStage(2)) : setError("请用至少 10 个字描述真实科研需求。")}>继续补充 Context</button> : null}
          {stage === 2 ? <button type="button" onClick={generate}>生成启动提示词与 context.md</button> : null}
        </article>
        {stage === 3 ? <article className="cq-message cq-message--assistant"><header><span className="cq-avatar">RQ</span><div><strong>Research Quest</strong><small>本地准备完成</small></div></header><p>已生成初始 Context 和启动提示词。它们只是进入真实 AI 对话的起点，不是已验证的科研方案。</p><MiniQuadrant snapshot={snapshot} label="自定义需求完整初始四象限" /><section className="cq-generated"><div><strong>context.md</strong><pre>{context}</pre><button type="button" onClick={() => downloadText("research-quest-initial-context.md", context)}>下载 context.md</button></div><div><strong>Research Quest 启动提示词</strong><pre>{prompt}</pre><button type="button" onClick={() => downloadText("research-quest-start-prompt.md", prompt)}>下载启动提示词</button></div></section><ProductLinks /></article> : null}
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
        <div><p className="cq-eyebrow">Research Quest｜AI Research Game</p><h1>把科研聊天变成更精准的任务对齐</h1><p>这不是一款独立游戏。Research Quest 改造的是人与 AI 的聊天方式：先用 1–3 个关键问题建立四象限认知地图，再冻结 Context 和 Goal 交给 Codex 执行。</p></div>
        <ProductLinks />
      </header>
      <section className="cq-mode-switch" aria-label="选择演示模式">
        <button type="button" className={mode === "case" ? "is-active" : ""} onClick={() => setMode("case")}>体验 5 轮真实案例</button>
        <button type="button" className={mode === "custom" ? "is-active" : ""} onClick={() => setMode("custom")}>输入我的科研需求</button>
      </section>
      {mode === "case" ? <FixedCaseChat /> : <CustomRequirementChat />}
      <footer className="cq-footer"><p>聊天式 Demo 展示 Skill 使用后的交互效果；<a href={FULL_DEMO_URL}>完整 Dashboard</a>、<a href={CASE_URL}>案例博文</a>、<a href={VIDEO_URL}>原完整机制视频</a>与 <a href={SKILL_URL}>Skill 安装包</a>均继续保留。</p></footer>
    </main>
  );
}
