import type { ReactNode } from "react";
import type { QuestView } from "../core/selectors.ts";
import type {
  CampaignId,
  CampaignState,
  GameState,
  LevelState,
} from "../types/index.ts";

export interface QuestDashboardProps {
  state: GameState;
  view: QuestView;
  onAnswerPrologue: (choiceId: string) => void;
  onChooseLevel: (campaignId: CampaignId, levelId: LevelState["level_id"], choiceId: string) => void;
  onSubmitLevelQuiz: (campaignId: CampaignId, levelId: LevelState["level_id"], accuracy: number) => void;
  onConfirmKnowledge: (knowledgeId: string) => void;
  onVerifyKnowledge: (knowledgeId: string) => void;
  onStartExam: () => void;
  onAnswerExam: (questionId: string, answer: string) => void;
  onSubmitExam: () => void;
  onForgeGoal: () => void;
  onStartAutoDemo: () => void;
  onRestart: () => void;
  onExportState: () => void;
  onExportGoal: () => void;
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="rq-progress" aria-label={`${label}：${value}%`}>
      <div className="rq-progress__label"><span>{label}</span><strong>{value}%</strong></div>
      <div className="rq-progress__track" aria-hidden="true"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function CampaignMap({ campaign, activeCampaign }: { campaign: CampaignState; activeCampaign: CampaignId | null }) {
  return (
    <section className="rq-panel rq-campaign" aria-labelledby={`campaign-${campaign.campaign_id}`}>
      <header className="rq-panel__header">
        <div><p className="rq-eyebrow">7 关战役</p><h2 id={`campaign-${campaign.campaign_id}`}>{campaign.title}</h2></div>
        <span className={`rq-status rq-status--${campaign.status}`}>{campaign.status}</span>
      </header>
      <p>{campaign.description}</p>
      <ProgressBar value={campaign.progress} label="战役进度" />
      <ol className="rq-level-map" aria-label={`${campaign.title}关卡地图`}>
        {campaign.levels.map((level) => (
          <li key={level.level_id} className={`rq-level rq-level--${level.status}`}>
            <span className="rq-level__number" aria-hidden="true">{level.order}</span>
            <span><strong>{level.title}</strong><small>{level.status === "locked" ? "尚未解锁" : level.status === "completed" ? "已完成" : activeCampaign === campaign.campaign_id ? "当前可操作" : "已解锁"}</small></span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function campaignFromState(state: GameState, campaignId: CampaignId): CampaignState {
  return campaignId === "learning-cognition" ? state.campaigns.learning_cognition : state.campaigns.research_decision;
}

function DecisionCard({ state, onAnswerPrologue, onChooseLevel, onSubmitLevelQuiz }: Pick<QuestDashboardProps, "state" | "onAnswerPrologue" | "onChooseLevel" | "onSubmitLevelQuiz">) {
  const level = state.current_campaign && state.current_level.startsWith("level-")
    ? campaignFromState(state, state.current_campaign).levels.find((item) => item.level_id === state.current_level) ?? null
    : null;
  const prompt = state.phase === "prologue" ? state.prologue.question : level?.question;
  const choices = state.phase === "prologue" ? state.prologue.choices : level?.choices;
  const task = state.phase === "prologue" ? state.prologue.task : level?.task;
  const estimate = state.phase === "prologue" ? state.prologue.estimated_time : level?.estimated_time;
  const selectedChoice = level?.choices.find((choice) => choice.choice_id === level.selected_choice_id);
  const latestChoice = state.player_choices.at(-1);
  const completedLevel = latestChoice ? campaignFromState(state, latestChoice.campaign_id).levels.find((item) => item.level_id === latestChoice.level_id) : null;
  if (!prompt || !choices) return null;

  const title = state.phase === "prologue" ? "序章：先说清楚真实问题" : `${level!.order}. ${level!.title}`;
  const verifiedCount = state.known_knowns.verified.length;
  const adaptiveMessage = verifiedCount <= 2
    ? "现有认知地图中的已验证内容较少，本关先补一个基础判断，并尽量使用已有术语。"
    : verifiedCount <= 8
      ? "基础内容已经明确，本关只处理一个会改变方案或结论范围的选择。"
      : "已验证内容较充分，本关加入反例或迁移判断，检查目标是否稳固。";

  return (
    <section className="rq-panel rq-decision" aria-labelledby="decision-title">
      <p className="rq-eyebrow">当前决策</p>
      <h2 id="decision-title">{title}</h2>
      <p className="rq-task">{task}</p>
      {estimate ? <p className="rq-muted">预计用时：{estimate.min}–{estimate.max} 分钟</p> : null}
      <p className="rq-question-budget">默认只问 1 个关键问题；只有会立即改变证据或执行边界时，才追加最多 2 个问题。</p>
      {level ? <aside className="rq-adaptive-hint" aria-label="认知地图自适应提示"><strong>为什么这一步最值得问</strong><p>{adaptiveMessage}</p></aside> : null}
      <p className="rq-question">{prompt.prompt}</p>
      <p className="rq-muted">{prompt.purpose}</p>
      {level ? <aside className="rq-knowledge-card"><strong>当前目标变化</strong><p>{level.goal_preview}</p><p className="rq-muted">本关会把一个候选认识或待回答问题写入认知地图；隐藏经验和风险仍由后续解释、反例与真实执行发现。</p></aside> : null}
      {!level?.selected_choice_id ? <div className="rq-choice-list" role="group" aria-label="选择一个下一步">
        {choices.map((choice) => (
          <button className="rq-choice" key={choice.choice_id} type="button" onClick={() => state.phase === "prologue" ? onAnswerPrologue(choice.choice_id) : onChooseLevel(state.current_campaign!, level!.level_id, choice.choice_id)}>
            <span>{choice.label}</span><small>{choice.impact_preview}</small>
          </button>
        ))}
      </div> : null}
      {level?.knowledge_card ? <aside className="rq-knowledge-card"><strong>知识卡</strong><p>{level.knowledge_card}</p></aside> : null}
      {level?.selected_choice_id && level.quiz.status !== "passed" ? <aside className="rq-knowledge-card" aria-label="关卡小测"><strong>关卡小测：{level.title}</strong><p>哪项做法能把你选择的“{selectedChoice?.label}”变成可检查的下一步？</p><div className="rq-choice-list" role="group" aria-label="回答关卡小测"><button className="rq-choice" type="button" onClick={() => onSubmitLevelQuiz(state.current_campaign!, level.level_id, 1)}><span>执行“{level.choice_impact}”，并记录理由、能说明什么和失败信号。</span><small>把本关选择转成可复核行动</small></button><button className="rq-choice" type="button" onClick={() => onSubmitLevelQuiz(state.current_campaign!, level.level_id, 0)}><span>跳过具体边界，直接把模型输出当成结论。</span><small>错误答案不会进入后续 Goal</small></button></div>{level.quiz.status === "failed" ? <p className="rq-muted">本次未通过；该回答不会进入后续 Goal。回看知识卡后再用一个更直接的问题确认。</p> : null}</aside> : null}
      {completedLevel ? <aside className="rq-knowledge-card"><strong>最近奖励：{completedLevel.reward.title}</strong><p>{completedLevel.choice_impact}</p><p className="rq-muted">当前目标变化：{completedLevel.goal_preview}</p></aside> : null}
    </section>
  );
}

export function CognitionMap({ state }: Pick<QuestDashboardProps, "state">) {
  const knownKnownStages = [
    { title: "Candidate", hint: "从文档或回答提取的候选认识，不计分", items: state.known_knowns.candidate },
    { title: "Confirmed", hint: "用户已经确认，等待应用证据", items: state.known_knowns.confirmed },
    { title: "Verified", hint: "已在任务中正确应用，唯一计分层", items: state.known_knowns.verified },
  ];
  const unresolvedKnownUnknowns = state.known_unknowns.filter((item) => item.status !== "resolved");
  const unresolvedUnknownKnowns = state.unknown_knowns.filter((item) => item.status !== "resolved");
  const unresolvedUnknownUnknowns = state.unknown_unknowns.filter((item) => item.status !== "resolved");

  const knownKnownPanel = <article className="rq-quadrant rq-quadrant--known-knowns" aria-labelledby="quadrant-known-knowns">
    <h3 id="quadrant-known-knowns">Known Knowns <small>已知的已知</small></h3>
    <p>用户已经表达并能够使用的内容，内部按 Candidate → Confirmed → Verified 认证。</p>
    <p className="rq-auto-evidence">系统会根据选择、小测和任务结果自动补充证据，无需手动升级。</p>
    <div className="rq-known-known-stages">
      {knownKnownStages.map((stage) => <section className="rq-cognition-column" key={stage.title} aria-label={stage.title}><h4>{stage.title}</h4><p>{stage.hint}</p><ul>{stage.items.length ? stage.items.map((item) => <li key={item.knowledge_id}><span>{item.statement}</span><em>{stage.title === "Verified" ? "已验证" : stage.title === "Candidate" ? "等待回答证据" : "等待应用证据"}</em></li>) : <li className="rq-empty">暂无条目</li>}</ul></section>)}
    </div>
  </article>;
  const unknownKnownPanel = <article className="rq-quadrant rq-quadrant--unknown-knowns" aria-labelledby="quadrant-unknown-knowns"><h3 id="quadrant-unknown-knowns">Unknown Knowns <small>未知的已知</small></h3><p>用户可能已经有经验或偏好，但还没有明确表达。</p><ul className="rq-quadrant-list">{unresolvedUnknownKnowns.length ? unresolvedUnknownKnowns.map((item) => <li key={item.item_id}>{item.statement}<small>{item.status}</small></li>) : <li className="rq-empty">等待从理由、经验、偏好和迁移题中发现。</li>}</ul></article>;
  const knownUnknownPanel = <article className="rq-quadrant rq-quadrant--known-unknowns" aria-labelledby="quadrant-known-unknowns"><h3 id="quadrant-known-unknowns">Known Unknowns <small>已知的未知</small></h3><p>用户已经意识到自己缺少答案；每项都需要关闭条件。</p><ul className="rq-quadrant-list">{unresolvedKnownUnknowns.length ? unresolvedKnownUnknowns.map((item) => <li key={item.item_id}>{item.statement}<small>{item.status}</small></li>) : <li className="rq-empty">尚未发现明确的待回答问题。</li>}</ul></article>;
  const unknownUnknownPanel = <article className="rq-quadrant rq-quadrant--unknown-unknowns" aria-labelledby="quadrant-unknown-unknowns"><h3 id="quadrant-unknown-unknowns">Unknown Unknowns <small>未知的未知</small></h3><p>用户尚未意识到的问题，由反例、失败或真实执行暴露。</p><ul className="rq-quadrant-list">{unresolvedUnknownUnknowns.length ? unresolvedUnknownUnknowns.map((item) => <li key={item.item_id}>{item.statement}<small>{item.status}</small></li>) : <li className="rq-empty">尚未发现隐藏风险；后续执行会继续探索。</li>}</ul></article>;

  return (
    <section className="rq-panel" aria-labelledby="cognition-title">
      <header className="rq-panel__header"><div><p className="rq-eyebrow">认知地图</p><h2 id="cognition-title">Known–Unknown 四象限</h2><p className="rq-muted">四个象限共同决定下一关的问题、难度和当前目标变化。</p></div></header>
      <div className="rq-quadrant-matrix">
        <div className="rq-matrix-corner" aria-hidden="true"></div>
        <div className="rq-matrix-column-label">用户已经意识到</div>
        <div className="rq-matrix-column-label">用户尚未意识到</div>
        <div className="rq-matrix-row-label"><span>已经掌握</span></div>
        {knownKnownPanel}
        {unknownKnownPanel}
        <div className="rq-matrix-row-label"><span>尚未掌握</span></div>
        {knownUnknownPanel}
        {unknownUnknownPanel}
      </div>
    </section>
  );
}

export function MetricsPanel({ state }: Pick<QuestDashboardProps, "state">) {
  const metrics = state.metrics;
  const rows: Array<[string, number | null]> = [
    ["Verified 知识", metrics.new_verified_known_knowns],
    ["Known Unknown", state.known_unknowns.filter((item) => item.status !== "resolved").length],
    ["Unknown Known", state.unknown_knowns.filter((item) => item.status !== "resolved").length],
    ["Unknown Unknown", state.unknown_unknowns.filter((item) => item.status !== "resolved").length],
    ["应用次数", metrics.applied_knowledge_count],
    ["纠正误解", metrics.corrected_misconceptions],
    ["正式理解分", metrics.formal_understanding_score],
  ];
  return <section className="rq-panel rq-metrics" aria-labelledby="metrics-title"><p className="rq-eyebrow">可解释指标</p><h2 id="metrics-title">四象限与 Verified 计分</h2>{state.interaction_mode === "auto-demo" ? <p className="rq-muted">自动演示只展示流程，不计入用户正式理解分。</p> : null}<dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? "—"}</dd></div>)}</dl></section>;
}

function FinalExamGoal({ state, onStartExam, onAnswerExam, onSubmitExam, onForgeGoal }: Pick<QuestDashboardProps, "state" | "onStartExam" | "onAnswerExam" | "onSubmitExam" | "onForgeGoal">) {
  if (state.phase !== "final-exam" && state.phase !== "goal-forge" && state.phase !== "completed") return null;
  const canAnswer = state.exam.status === "in-progress";
  return <section className="rq-panel rq-final" aria-labelledby="final-title"><p className="rq-eyebrow">结业关</p><h2 id="final-title">最终考试与真实试点 Goal</h2>
    {state.exam.status === "not-started" || state.exam.status === "failed" ? <div><p className="rq-muted">{state.exam.status === "failed" ? "本次未达到通关线。只回到最薄弱的一关补证据，不重新完成整套题。" : "最终考试只包含三个关键问题：决策应用、核心理解和新项目迁移。"}</p><button type="button" className="rq-button rq-button--primary" onClick={onStartExam}>{state.exam.status === "failed" ? "重新参加最终考试" : "开始最终考试"}</button></div> : null}
    {canAnswer ? <div className="rq-exam-questions"><p className="rq-muted">公开网页使用确定性规则展示流程；正式 Skill 会根据当前 Context 和四象限动态生成三道应用题。</p>{state.exam.questions.map((question) => <label key={question.question_id}><span>{question.prompt}</span><input maxLength={1000} onChange={(event) => onAnswerExam(question.question_id, event.target.value)} placeholder="输入你的研究判断" /></label>)}<button type="button" className="rq-button rq-button--primary" onClick={onSubmitExam}>提交考试</button></div> : null}
    {state.exam.status === "passed" || state.phase === "goal-forge" || state.phase === "completed" ? <div className="rq-goal"><p>考试状态：<strong>{state.exam.status}</strong>；得分：{state.exam.score ?? "待计算"}</p>{state.phase === "goal-forge" ? <button type="button" className="rq-button rq-button--primary" onClick={onForgeGoal}>锻造真实试点 Codex Goal</button> : null}{state.goal_versions.length ? <><section className="rq-knowledge-card" aria-label="Codex Goal 摘要"><strong>可执行科研任务合同</strong><p>目标：用 10 个公开酶目标评估 AlphaFold2 是否足以支持活性位点几何初筛，至少完成 8 个有效配对分析。</p><p>资料：AlphaFold DB 预测、匹配 PDB 结构和可追溯催化残基注释。</p><p>评价：整体结构、活性位点附近的局部误差、置信度分层和成功率。</p><p>认知 Context：记录四象限中的已验证认识、开放未知、隐含偏好和执行中新发现的风险。</p><p>结果范围：不把结构或置信度结果写成催化、结合或药物发现结论。</p><p>退出：同一关键问题经过 3–5 轮不同尝试仍失败时，输出根因分析。</p></section><details><summary>展开完整 Codex Goal</summary><pre aria-label="Codex Goal 预览">{state.goal_versions.at(-1)?.goal_text}</pre></details></> : null}</div> : null}
  </section>;
}

function DemoControls({ state, onStartAutoDemo, onRestart, onExportState, onExportGoal }: Pick<QuestDashboardProps, "state" | "onStartAutoDemo" | "onRestart" | "onExportState" | "onExportGoal">) {
  return <section className="rq-controls" aria-label="演示控制"><div><strong>自动演示</strong><span>{state.auto_demo.duration_seconds} 秒，{state.auto_demo.status}</span></div><button type="button" className="rq-button rq-button--primary" onClick={onStartAutoDemo}>75 秒看真实需求如何变成 Goal（不计正式得分）</button><button type="button" className="rq-button" onClick={onRestart}>重新开始</button><button type="button" className="rq-button" onClick={onExportState}>导出 game-state</button><button type="button" className="rq-button" onClick={onExportGoal} disabled={state.phase !== "completed"}>导出 Codex Goal</button></section>;
}

function ActualCasePanel() {
  return <section className="rq-case-study" aria-labelledby="actual-case-title"><div className="rq-case-study__intro"><p className="rq-eyebrow">真实公开科研需求 · 无预设结果</p><h2 id="actual-case-title">AlphaFold2 预测能否支持酶活性位点几何初筛？</h2><p>Research Quest 先读公开材料和已有讨论，再用 Known–Unknown 四象限找到当前最重要的空缺；每轮默认只问一个问题，最后把确认内容整理成 Context 和 Codex Goal。</p></div><div className="rq-case-study__grid" aria-label="先沟通再执行流程"><article><strong>先读材料</strong><p>不重复询问文档中已经有答案的内容。</p></article><article><strong>建立认知地图</strong><p>用四象限决定为什么问、问多深和何时停止。</p></article><article><strong>交给 Codex</strong><p>把选择、边界和完成标准保存为可追溯 Context。</p></article></div><p className="rq-case-study__sources">公开背景：<a href="https://www.nature.com/articles/s41586-021-03819-2" target="_blank" rel="noreferrer">AlphaFold2 Nature 论文</a> · <a href="https://alphafold.ebi.ac.uk/" target="_blank" rel="noreferrer">AlphaFold DB</a> · <a href="https://www.ebi.ac.uk/pdbe/" target="_blank" rel="noreferrer">PDBe</a></p><a className="rq-case-study__link" href="./case-study-alphafold-casp14.html">查看完整案例：认知地图怎样决定每轮问题</a></section>;
}

function Disclosure({ state }: Pick<QuestDashboardProps, "state">) {
  const auditStatus = state.privacy.sanitization.review_status === "approved" ? "已通过公开审查" : "待公开审查";
  return <aside className="rq-disclosure" aria-label="公开演示边界"><strong>演示边界</strong><p>本页只使用公开或脱敏内容，输入仅保存在当前页面并在主动导出时本地下载；不要输入凭据、私有路径或未公开资料。{auditStatus}。</p></aside>;
}

export function QuestDashboard(props: QuestDashboardProps) {
  const { state, view } = props;
  return <main className="rq-app" aria-labelledby="quest-title"><a className="rq-skip-link" href="#quest-main">跳至主要内容</a><header className="rq-hero"><p className="rq-eyebrow">Research Quest｜完整机制 Dashboard</p><h1 id="quest-title">先读资料、建立认知地图，再让 Codex 执行</h1><p>{view.projectGoal.summary}</p><p className="rq-muted">核心逻辑固定为 Known–Unknown 四象限 + grill-me-with-docs：材料先回答能回答的问题，AI 只追问最关键的空缺。</p><ProgressBar value={view.overallProgress} label="总进度" /><p className="rq-muted">预计剩余 {view.estimatedRemainingTime.min}–{view.estimatedRemainingTime.max} 分钟 · 当前阶段：{view.phase}</p></header><ActualCasePanel /><DemoControls {...props} /><div id="quest-main" className="rq-layout" tabIndex={-1}><div className="rq-primary"><DecisionCard {...props} /><FinalExamGoal {...props} /></div><div className="rq-side"><MetricsPanel state={state} /><Disclosure state={state} /></div></div><section className="rq-campaign-grid" aria-label="双战役地图"><CampaignMap campaign={state.campaigns.learning_cognition} activeCampaign={state.current_campaign} /><CampaignMap campaign={state.campaigns.research_decision} activeCampaign={state.current_campaign} /></section><CognitionMap state={state} /></main>;
}

export function QuestShell({ children }: { children: ReactNode }) { return <div className="rq-shell">{children}</div>; }
