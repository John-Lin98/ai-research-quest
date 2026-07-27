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

export function CampaignMap({
  campaign,
  activeCampaign,
}: {
  campaign: CampaignState;
  activeCampaign: CampaignId | null;
}) {
  return (
    <section className="rq-panel rq-campaign" aria-labelledby={`campaign-${campaign.campaign_id}`}>
      <header className="rq-panel__header">
        <div>
          <p className="rq-eyebrow">7 关战役</p>
          <h2 id={`campaign-${campaign.campaign_id}`}>{campaign.title}</h2>
        </div>
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

function campaignFromState(
  state: GameState,
  campaignId: CampaignId,
): CampaignState {
  return campaignId === "learning-cognition"
    ? state.campaigns.learning_cognition
    : state.campaigns.research_decision;
}

function DecisionCard({
  state,
  onAnswerPrologue,
  onChooseLevel,
  onSubmitLevelQuiz,
}: Pick<QuestDashboardProps, "state" | "onAnswerPrologue" | "onChooseLevel" | "onSubmitLevelQuiz">) {
  const level = state.current_campaign && state.current_level.startsWith("level-")
    ? campaignFromState(state, state.current_campaign).levels.find(
        (item) => item.level_id === state.current_level,
      ) ?? null
    : null;
  const prompt = state.phase === "prologue" ? state.prologue.question : level?.question;
  const choices = state.phase === "prologue" ? state.prologue.choices : level?.choices;
  const task = state.phase === "prologue" ? state.prologue.task : level?.task;
  const estimate = state.phase === "prologue" ? state.prologue.estimated_time : level?.estimated_time;
  const selectedChoice = level?.choices.find(
    (choice) => choice.choice_id === level.selected_choice_id,
  );
  const latestChoice = state.player_choices.at(-1);
  const completedLevel = latestChoice
    ? campaignFromState(state, latestChoice.campaign_id).levels.find(
        (item) => item.level_id === latestChoice.level_id,
      )
    : null;
  if (!prompt || !choices) return null;
  const title = state.phase === "prologue" ? "序章：冻结真实科研问题" : `${level!.order}. ${level!.title}`;
  return (
    <section className="rq-panel rq-decision" aria-labelledby="decision-title">
      <p className="rq-eyebrow">当前决策</p>
      <h2 id="decision-title">{title}</h2>
      <p className="rq-task">{task}</p>
      {estimate ? <p className="rq-muted">预计用时：{estimate.min}–{estimate.max} 分钟</p> : null}
      <p className="rq-question-budget">本回合认知测试：1 个主问题；只有必要时追加最多 2 个证据或边界问题。</p>
      <p className="rq-question">{prompt.prompt}</p>
      <p className="rq-muted">{prompt.purpose}</p>
      {level ? <aside className="rq-knowledge-card"><strong>本关目标预览</strong><p>{level.goal_preview}</p><p className="rq-muted">四象限变化：Known Knowns 候选 +{level.cognition_map_delta.candidate_added.length}；Known Unknowns +{level.cognition_map_delta.known_unknowns_added.length}；潜在 Unknown Knowns 与 Unknown Unknowns 将由解释、反例和真实执行继续暴露。</p></aside> : null}
      {!level?.selected_choice_id ? <div className="rq-choice-list" role="group" aria-label="选择一个下一步">
        {choices.map((choice) => (
          <button
            className="rq-choice"
            key={choice.choice_id}
            type="button"
            onClick={() => state.phase === "prologue"
              ? onAnswerPrologue(choice.choice_id)
              : onChooseLevel(state.current_campaign!, level!.level_id, choice.choice_id)}
          >
            <span>{choice.label}</span><small>{choice.impact_preview}</small>
          </button>
        ))}
      </div> : null}
      {level?.knowledge_card ? <aside className="rq-knowledge-card"><strong>知识卡</strong><p>{level.knowledge_card}</p></aside> : null}
      {level?.selected_choice_id && level.quiz.status !== "passed" ? <aside className="rq-knowledge-card" aria-label="关卡小测"><strong>关卡小测：{level.title}</strong><p>根据“{level.task}”与本关知识卡，哪项做法能把你选择的“{selectedChoice?.label}”落实为下一步可审查的科研行动？</p><div className="rq-choice-list" role="group" aria-label="回答关卡小测"><button className="rq-choice" type="button" onClick={() => onSubmitLevelQuiz(state.current_campaign!, level.level_id, 1)}><span>执行“{level.choice_impact}”，并记录依据、边界和失败信号。</span><small>把本关选择转化为可复核的执行合同</small></button><button className="rq-choice" type="button" onClick={() => onSubmitLevelQuiz(state.current_campaign!, level.level_id, 0)}><span>跳过“{level.task}”的具体边界，只把模型输出当作结论。</span><small>错误答案只停留在误解记录，不进入后续 Goal</small></button></div>{level.quiz.status === "failed" ? <p className="rq-muted">本次未通过；该回答不会写入后续 Goal。回看知识卡后，用一个更直接的问题重试。</p> : null}</aside> : null}
      {completedLevel ? <aside className="rq-knowledge-card"><strong>最近奖励：{completedLevel.reward.title}</strong><p>{completedLevel.choice_impact}</p><p className="rq-muted">已更新的 Goal 线索：{completedLevel.goal_preview}</p></aside> : null}
    </section>
  );
}

export function CognitionMap({
  state,
  onConfirmKnowledge,
  onVerifyKnowledge,
}: Pick<QuestDashboardProps, "state" | "onConfirmKnowledge" | "onVerifyKnowledge">) {
  const knownKnownStages: Array<{ title: string; hint: string; items: GameState["known_knowns"][keyof GameState["known_knowns"]]; action?: (id: string) => void; actionLabel?: string }> = [
    { title: "Candidate", hint: "AI 或材料提取的候选认识，不计分", items: state.known_knowns.candidate, action: onConfirmKnowledge, actionLabel: "升为 Confirmed" },
    { title: "Confirmed", hint: "用户已确认，仍需应用或小测", items: state.known_knowns.confirmed, action: onVerifyKnowledge, actionLabel: "升为 Verified" },
    { title: "Verified", hint: "已在任务中正确应用，唯一计分层", items: state.known_knowns.verified },
  ];
  const knowledgeFrozen = state.phase === "completed" || state.project_goal.status === "frozen";
  const unresolvedKnownUnknowns = state.known_unknowns.filter((item) => item.status !== "resolved");
  const unresolvedUnknownKnowns = state.unknown_knowns.filter((item) => item.status !== "resolved");
  const unresolvedUnknownUnknowns = state.unknown_unknowns.filter((item) => item.status !== "resolved");

  const knownKnownPanel = <article className="rq-quadrant rq-quadrant--known-knowns" aria-labelledby="quadrant-known-knowns">
    <h3 id="quadrant-known-knowns">Known Knowns</h3>
    <p>用户知道自己知道。内部按 Candidate → Confirmed → Verified 认证。</p>
    <div className="rq-known-known-stages">
      {knownKnownStages.map((stage) => <section className="rq-cognition-column" key={stage.title} aria-label={stage.title}>
        <h4>{stage.title}</h4><p>{stage.hint}</p>
        <ul>{stage.items.length ? stage.items.map((item) => {
          const source = campaignFromState(state, item.campaign_id).levels.find((level) => level.level_id === item.introduced_level_id);
          const canVerify = stage.title !== "Confirmed" || source?.quiz.status === "passed";
          const canAct = !knowledgeFrozen && canVerify;
          const disabledLabel = knowledgeFrozen ? "Goal 已冻结" : "完成小测后验证";
          return <li key={item.knowledge_id}><span>{item.statement}</span>{stage.action ? <button type="button" disabled={!canAct} onClick={() => stage.action?.(item.knowledge_id)}>{canAct ? stage.actionLabel : disabledLabel}</button> : <em>已验证</em>}</li>;
        }) : <li className="rq-empty">暂无条目</li>}</ul>
      </section>)}
    </div>
  </article>;

  const unknownKnownPanel = <article className="rq-quadrant rq-quadrant--unknown-knowns" aria-labelledby="quadrant-unknown-knowns">
    <h3 id="quadrant-unknown-knowns">Unknown Knowns</h3>
    <p>用户实际上知道，但还没有明确表达或意识到。</p>
    <ul className="rq-quadrant-list">{unresolvedUnknownKnowns.length ? unresolvedUnknownKnowns.map((item) => <li key={item.item_id}>{item.statement}<small>{item.status}</small></li>) : <li className="rq-empty">等待从理由、经验、偏好和迁移题中发现。</li>}</ul>
  </article>;

  const knownUnknownPanel = <article className="rq-quadrant rq-quadrant--known-unknowns" aria-labelledby="quadrant-known-unknowns">
    <h3 id="quadrant-known-unknowns">Known Unknowns</h3>
    <p>用户知道自己不知道；每项都需要关闭条件和对应关卡。</p>
    <ul className="rq-quadrant-list">{unresolvedKnownUnknowns.length ? unresolvedKnownUnknowns.map((item) => <li key={item.item_id}>{item.statement}<small>{item.status}</small></li>) : <li className="rq-empty">尚未发现明确的待回答问题。</li>}</ul>
  </article>;

  const unknownUnknownPanel = <article className="rq-quadrant rq-quadrant--unknown-unknowns" aria-labelledby="quadrant-unknown-unknowns">
    <h3 id="quadrant-unknown-unknowns">Unknown Unknowns</h3>
    <p>用户尚未意识到自己不知道，由反例、失败、冲突证据或真实执行暴露。</p>
    <ul className="rq-quadrant-list">{unresolvedUnknownUnknowns.length ? unresolvedUnknownUnknowns.map((item) => <li key={item.item_id}>{item.statement}<small>{item.status}</small></li>) : <li className="rq-empty">尚未触发隐藏风险；后续执行与 Boss 题会继续探索。</li>}</ul>
  </article>;

  return (
    <section className="rq-panel" aria-labelledby="cognition-title">
      <header className="rq-panel__header"><div><p className="rq-eyebrow">认知地图</p><h2 id="cognition-title">Known–Unknown 四象限</h2><p className="rq-muted">横轴：用户是否已经意识到这个问题；纵轴：用户实际上是否已经掌握相关知识。四个象限共同决定下一关的问题、难度和 Goal 更新。</p></div></header>
      <div className="rq-matrix-axis-title rq-matrix-axis-title--x">横轴：用户是否已经意识到这个问题</div>
      <div className="rq-quadrant-matrix">
        <div className="rq-matrix-corner" aria-hidden="true"></div>
        <div className="rq-matrix-column-label">用户已经意识到</div>
        <div className="rq-matrix-column-label">用户尚未意识到</div>
        <div className="rq-matrix-row-label"><span>已经掌握</span></div>
        {knownKnownPanel}
        {unknownKnownPanel}
        <div className="rq-matrix-row-label"><span>尚未掌握</span><small>纵轴：用户实际上是否已经掌握</small></div>
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
  return <section className="rq-panel rq-metrics" aria-labelledby="metrics-title"><p className="rq-eyebrow">可解释指标</p><h2 id="metrics-title">四象限与 Verified 计分</h2>{state.interaction_mode === "auto-demo" ? <p className="rq-muted">当前为自动演示轨迹：只展示流程，不计入用户正式理解分。</p> : null}<dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? "—"}</dd></div>)}</dl></section>;
}

function FinalExamGoal({
  state,
  onStartExam,
  onAnswerExam,
  onSubmitExam,
  onForgeGoal,
}: Pick<QuestDashboardProps, "state" | "onStartExam" | "onAnswerExam" | "onSubmitExam" | "onForgeGoal">) {
  if (state.phase !== "final-exam" && state.phase !== "goal-forge" && state.phase !== "completed") return null;
  const canAnswer = state.exam.status === "in-progress";
  return <section className="rq-panel rq-final" aria-labelledby="final-title"><p className="rq-eyebrow">结业关</p><h2 id="final-title">最终考试与真实试点 Goal</h2>
    {state.exam.status === "not-started" || state.exam.status === "failed" ? <div><p className="rq-muted">{state.exam.status === "failed" ? "本次未达到通关线。只回到最薄弱的一关补证据，不重新完成整套题。" : "最终考试只包含三个关键问题：决策应用、核心理解和新项目迁移。"}</p><button type="button" className="rq-button rq-button--primary" onClick={onStartExam}>{state.exam.status === "failed" ? "重新参加最终考试" : "开始最终考试"}</button></div> : null}
    {canAnswer ? <div className="rq-exam-questions"><p className="rq-muted">只输入公开且非敏感的研究判断；邮箱、绝对路径、密钥或令牌会在本地导出前被拦截。本 Demo 使用透明关键词 rubric，不代表真实学习或科研效果。</p>{state.exam.questions.map((question) => <label key={question.question_id}><span>{question.prompt}</span><input maxLength={1000} onChange={(event) => onAnswerExam(question.question_id, event.target.value)} placeholder="输入你的研究判断" /></label>)}<button type="button" className="rq-button rq-button--primary" onClick={onSubmitExam}>提交考试</button></div> : null}
    {state.exam.status === "passed" || state.phase === "goal-forge" || state.phase === "completed" ? <div className="rq-goal"><p>考试状态：<strong>{state.exam.status}</strong>；得分：{state.exam.score ?? "待计算"}</p>{state.phase === "goal-forge" ? <button type="button" className="rq-button rq-button--primary" onClick={onForgeGoal}>锻造真实试点 Codex Goal</button> : null}{state.goal_versions.length ? <><section className="rq-knowledge-card" aria-label="Codex Goal 摘要"><strong>可执行科研任务合同</strong><p>目标：用 10 个公开酶目标评估 AlphaFold2 是否足以支持活性位点几何初筛，至少完成 8 个有效配对分析。</p><p>输入：AlphaFold DB 预测、匹配 PDB 结构和可追溯催化残基注释。</p><p>指标：全局 TM-score/Cα RMSD、局部催化残基与 6 Å 邻域误差、pLDDT 分层和覆盖率。</p><p>认知 Context：Goal 同时记录固定四象限中的已验证认识、开放未知、隐含偏好和执行中新发现的风险。</p><p>边界：不把结构或置信度结果写成催化、结合或药物发现结论。</p><p>退出：同一关键问题经过 3–5 轮不同尝试仍失败时，输出根因分析。</p></section><details><summary>展开完整 Codex Goal</summary><pre aria-label="Codex Goal 预览">{state.goal_versions.at(-1)?.goal_text}</pre></details></> : null}</div> : null}
  </section>;
}

function DemoControls({
  state,
  onStartAutoDemo,
  onRestart,
  onExportState,
  onExportGoal,
}: Pick<QuestDashboardProps, "state" | "onStartAutoDemo" | "onRestart" | "onExportState" | "onExportGoal">) {
  return <section className="rq-controls" aria-label="演示控制">
    <div><strong>自动演示</strong><span>{state.auto_demo.duration_seconds} 秒，{state.auto_demo.status}</span></div>
    <button type="button" className="rq-button rq-button--primary" onClick={onStartAutoDemo}>75 秒看真实需求如何变成 Goal（不计正式得分）</button>
    <button type="button" className="rq-button" onClick={onRestart}>重新开始</button>
    <button type="button" className="rq-button" onClick={onExportState}>导出 game-state</button>
    <button type="button" className="rq-button" onClick={onExportGoal} disabled={state.phase !== "completed"}>导出 Codex Goal</button>
  </section>;
}

function ActualCasePanel() {
  return <section className="rq-case-study" aria-labelledby="actual-case-title">
    <div className="rq-case-study__intro">
      <p className="rq-eyebrow">真实公开科研需求 · 无预设结果</p>
      <h2 id="actual-case-title">AlphaFold2 预测能否支持酶活性位点几何初筛？</h2>
      <p>CASP14 证明了 AlphaFold2 在公开盲测中的结构预测能力，但真实科研使用还需要回答更具体的问题：整体折叠看起来合理时，局部活性位点是否也足够准确，能否支持下一步分析？本 Demo 不预设答案，而是通过固定坐标的 Known–Unknown 四象限把这个需求编译成可执行试点。</p>
    </div>
    <div className="rq-case-study__grid">
      <article><strong>真实输入</strong><p>AlphaFold DB 预测、匹配的实验 PDB 结构和公开催化残基注释；所有目标、排除和映射失败均需可追溯。</p></article>
      <article><strong>快速小步</strong><p>每回合通常只问 1 个、最多 3 个关键问题；错误回答停留在 Candidate 或误解记录，不进入后续 Goal。</p></article>
      <article><strong>最终获得什么</strong><p>一份可直接交给 Codex 的科研任务合同，包含数据、步骤、指标、验收、用户偏好、根因分析和结论边界。</p></article>
    </div>
    <p className="rq-case-study__sources">公开背景：<a href="https://www.nature.com/articles/s41586-021-03819-2" target="_blank" rel="noreferrer">AlphaFold2 Nature 论文</a> · <a href="https://alphafold.ebi.ac.uk/" target="_blank" rel="noreferrer">AlphaFold DB</a> · <a href="https://www.ebi.ac.uk/pdbe/" target="_blank" rel="noreferrer">PDBe</a></p>
    <a className="rq-case-study__link" href="./case-study-alphafold-casp14.html">查看完整真实需求：从 CASP14 到活性位点公开试点</a>
  </section>;
}

function Disclosure({ state }: Pick<QuestDashboardProps, "state">) {
  const auditStatus = state.privacy.sanitization.review_status === "approved"
    ? "已通过独立公开审计"
    : "待独立公开审计";
  return <aside className="rq-disclosure" aria-label="公开演示数据说明"><strong>公开演示与隐私声明</strong><p>{state.privacy.public_demo_disclosure}</p><ul><li>互动关卡围绕真实公开科研需求设计，但不包含尚未执行的实验结果。</li><li>公开事实均链接原始来源；任务选择、10 个目标规模和指标属于教学试点设计。</li><li>四象限记录的是当前会话的认知状态，不构成对用户科研能力的评价。</li><li>错误或未验证回答不会直接进入后续 Goal。</li><li>不包含私人路径、凭据、私有代码或未公开资料。</li></ul><section className="rq-local-boundary" aria-label="本地处理边界"><strong>本地处理边界</strong><ul><li>不上传、不埋点，也不会向网络发送你的输入或游戏状态。</li><li>交互内容只保存在当前页面内存；刷新或重新开始后不会保留。</li><li>你输入的自由文本只会在你主动点击导出时，通过浏览器本地 Blob 文件下载；导出前会在本地拦截邮箱、绝对路径、密钥和令牌。</li><li>不要输入邮箱、密钥、token、本机或服务器私有路径，或未公开科研资料。</li></ul><p className="rq-muted">脱敏审核状态：{auditStatus}（{state.privacy.sanitization.review_status}）。</p></section></aside>;
}

export function QuestDashboard(props: QuestDashboardProps) {
  const { state, view } = props;
  return <main className="rq-app" aria-labelledby="quest-title">
    <a className="rq-skip-link" href="#quest-main">跳至主要内容</a>
    <header className="rq-hero"><p className="rq-eyebrow">Research Quest · 真实科研任务 Demo</p><h1 id="quest-title">把一个真实科研需求玩成可执行 Goal</h1><p>{view.projectGoal.summary}</p><p className="rq-muted">每回合只处理 1–3 个关键问题，并更新固定坐标的 Known–Unknown 四象限；通关后得到可直接交给 Agent 的科研任务合同。</p><ProgressBar value={view.overallProgress} label="总进度" /><p className="rq-muted">预计剩余 {view.estimatedRemainingTime.min}–{view.estimatedRemainingTime.max} 分钟 · 当前阶段：{view.phase}</p></header>
    <ActualCasePanel />
    <DemoControls {...props} />
    <div id="quest-main" className="rq-layout" tabIndex={-1}>
      <div className="rq-primary"><DecisionCard {...props} /><FinalExamGoal {...props} /></div>
      <div className="rq-side"><MetricsPanel state={state} /><Disclosure state={state} /></div>
    </div>
    <section className="rq-campaign-grid" aria-label="双战役地图"><CampaignMap campaign={state.campaigns.learning_cognition} activeCampaign={state.current_campaign} /><CampaignMap campaign={state.campaigns.research_decision} activeCampaign={state.current_campaign} /></section>
    <CognitionMap {...props} />
  </main>;
}

export function QuestShell({ children }: { children: ReactNode }) { return <div className="rq-shell">{children}</div>; }
