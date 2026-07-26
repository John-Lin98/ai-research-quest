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
  const title = state.phase === "prologue" ? "序章：选择控制原则" : `${level!.order}. ${level!.title}`;
  return (
    <section className="rq-panel rq-decision" aria-labelledby="decision-title">
      <p className="rq-eyebrow">当前决策</p>
      <h2 id="decision-title">{title}</h2>
      <p className="rq-task">{task}</p>
      {estimate ? <p className="rq-muted">预计用时：{estimate.min}–{estimate.max} 分钟</p> : null}
      <p className="rq-question">{prompt.prompt}</p>
      <p className="rq-muted">{prompt.purpose}</p>
      {level ? <aside className="rq-knowledge-card"><strong>本关目标预览</strong><p>{level.goal_preview}</p><p className="rq-muted">认知变化：Candidate +{level.cognition_map_delta.candidate_added.length}，待验证问题 +{level.cognition_map_delta.known_unknowns_added.length}，待纠正误解 +{level.cognition_map_delta.misconceptions_corrected.length}</p></aside> : null}
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
      {level?.selected_choice_id && level.quiz.status !== "passed" ? <aside className="rq-knowledge-card" aria-label="关卡小测"><strong>关卡小测：{level.title}</strong><p>根据“{level.task}”与本关知识卡，哪项做法能把你选择的“{selectedChoice?.label}”落实为下一步可审查的模拟行动？</p><div className="rq-choice-list" role="group" aria-label="回答关卡小测"><button className="rq-choice" type="button" onClick={() => onSubmitLevelQuiz(state.current_campaign!, level.level_id, 1)}><span>执行“{level.choice_impact}”，并记录依据、边界和失败信号。</span><small>把本关任务转化为可复核行动</small></button><button className="rq-choice" type="button" onClick={() => onSubmitLevelQuiz(state.current_campaign!, level.level_id, 0)}><span>跳过“{level.task}”的具体边界，只把 AI 输出当作结论。</span><small>没有应用本关知识，也无法复核</small></button></div>{level.quiz.status === "failed" ? <p className="rq-muted">本次未通过；回看本关任务和知识卡后可重试。</p> : null}</aside> : null}
      {completedLevel ? <aside className="rq-knowledge-card"><strong>最近奖励：{completedLevel.reward.title}</strong><p>{completedLevel.choice_impact}</p><p className="rq-muted">已更新的 Goal 线索：{completedLevel.goal_preview}</p></aside> : null}
    </section>
  );
}

export function CognitionMap({
  state,
  onConfirmKnowledge,
  onVerifyKnowledge,
}: Pick<QuestDashboardProps, "state" | "onConfirmKnowledge" | "onVerifyKnowledge">) {
  const columns: Array<{ title: string; hint: string; items: GameState["known_knowns"][keyof GameState["known_knowns"]]; action?: (id: string) => void; actionLabel?: string }> = [
    { title: "Candidate", hint: "候选，不计入正式得分", items: state.known_knowns.candidate, action: onConfirmKnowledge, actionLabel: "升为 Confirmed" },
    { title: "Confirmed", hint: "已确认，仍需要应用验证", items: state.known_knowns.confirmed, action: onVerifyKnowledge, actionLabel: "升为 Verified" },
    { title: "Verified", hint: "有应用证据，唯一计分层", items: state.known_knowns.verified },
  ];
  const knowledgeFrozen = state.phase === "completed" || state.project_goal.status === "frozen";
  return (
    <section className="rq-panel" aria-labelledby="cognition-title">
      <header className="rq-panel__header"><div><p className="rq-eyebrow">认知地图</p><h2 id="cognition-title">Candidate → Confirmed → Verified</h2></div></header>
      <div className="rq-cognition-grid">
        {columns.map((column) => <div className="rq-cognition-column" key={column.title}>
          <h3>{column.title}</h3><p>{column.hint}</p>
          <ul>{column.items.length ? column.items.map((item) => {
            const source = campaignFromState(state, item.campaign_id).levels.find((level) => level.level_id === item.introduced_level_id);
            const canVerify = column.title !== "Confirmed" || source?.quiz.status === "passed";
            const canAct = !knowledgeFrozen && canVerify;
            const disabledLabel = knowledgeFrozen ? "Goal 已冻结" : "完成小测后验证";
            return <li key={item.knowledge_id}><span>{item.statement}</span>{column.action ? <button type="button" disabled={!canAct} onClick={() => column.action?.(item.knowledge_id)}>{canAct ? column.actionLabel : disabledLabel}</button> : <em>已验证</em>}</li>;
          }) : <li className="rq-empty">暂无条目</li>}</ul>
        </div>)}
      </div>
      <div className="rq-known-unknown"><strong>Known Unknowns</strong>{state.known_unknowns.length ? <ul>{state.known_unknowns.map((item) => <li key={item.item_id}>{item.statement}</li>)}</ul> : <span>尚未发现待验证边界。</span>}</div>
    </section>
  );
}

export function MetricsPanel({ state }: Pick<QuestDashboardProps, "state">) {
  const metrics = state.metrics;
  const rows: Array<[string, number | null]> = [
    ["Verified 知识", metrics.new_verified_known_knowns],
    ["应用次数", metrics.applied_knowledge_count],
    ["纠正误解", metrics.corrected_misconceptions],
    ["已知未知", metrics.new_known_unknowns],
    ["正式理解分", metrics.formal_understanding_score],
  ];
  return <section className="rq-panel rq-metrics" aria-labelledby="metrics-title"><p className="rq-eyebrow">可解释指标</p><h2 id="metrics-title">只对 Verified 计分</h2>{state.interaction_mode === "auto-demo" ? <p className="rq-muted">当前为自动演示轨迹：只展示流程，不计入用户正式理解分。</p> : null}<dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? "—"}</dd></div>)}</dl></section>;
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
  return <section className="rq-panel rq-final" aria-labelledby="final-title"><p className="rq-eyebrow">结业关</p><h2 id="final-title">最终考试与 Codex Goal</h2>
    {state.exam.status === "not-started" || state.exam.status === "failed" ? <div><p className="rq-muted">{state.exam.status === "failed" ? "本次未达到通关线。请回看已有证据后重新作答；重试会清空本次考试答案。" : "最终考试包含应用、概念理解与迁移题。"}</p><button type="button" className="rq-button rq-button--primary" onClick={onStartExam}>{state.exam.status === "failed" ? "重新参加最终考试" : "开始最终考试"}</button></div> : null}
    {canAnswer ? <div className="rq-exam-questions"><p className="rq-muted">只输入模拟且非敏感的回答；邮箱、绝对路径、密钥或令牌会在本地导出前被拦截。本公开 Demo 使用透明关键词 rubric，不代表真实学习或科研效果。</p>{state.exam.questions.map((question) => <label key={question.question_id}><span>{question.prompt}</span><input onChange={(event) => onAnswerExam(question.question_id, event.target.value)} placeholder="输入你的模拟回答" /></label>)}<button type="button" className="rq-button rq-button--primary" onClick={onSubmitExam}>提交考试</button></div> : null}
    {state.exam.status === "passed" || state.phase === "goal-forge" || state.phase === "completed" ? <div className="rq-goal"><p>考试状态：<strong>{state.exam.status}</strong>；得分：{state.exam.score ?? "待计算"}</p>{state.phase === "goal-forge" ? <button type="button" className="rq-button rq-button--primary" onClick={onForgeGoal}>锻造 Codex Goal</button> : null}{state.goal_versions.length ? <><section className="rq-knowledge-card" aria-label="Codex Goal 摘要"><strong>可执行任务合同</strong><p>目标：完成双战役、最终考试与可审查交付。</p><p>证据边界：仅 Verified 知识计入正式理解。</p><p>退出条件：证据不足、风险越界或依赖不可得时停止或转向。</p></section><details><summary>展开完整 Codex Goal</summary><pre aria-label="Codex Goal 预览">{state.goal_versions.at(-1)?.goal_text}</pre></details></> : null}</div> : null}
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
    <button type="button" className="rq-button rq-button--primary" onClick={onStartAutoDemo}>75 秒看完整流程（不计正式得分）</button>
    <button type="button" className="rq-button" onClick={onRestart}>重新开始</button>
    <button type="button" className="rq-button" onClick={onExportState}>导出 game-state</button>
    <button type="button" className="rq-button" onClick={onExportGoal} disabled={state.phase !== "completed"}>导出 Codex Goal</button>
  </section>;
}

function Disclosure({ state }: Pick<QuestDashboardProps, "state">) {
  const auditStatus = state.privacy.sanitization.review_status === "approved"
    ? "已通过独立公开审计"
    : "待独立公开审计";
  return <aside className="rq-disclosure" aria-label="公开演示数据说明"><strong>公开演示与隐私声明</strong><p>{state.privacy.public_demo_disclosure}</p><ul><li>仅使用模拟、改编或脱敏场景。</li><li>不包含真实研究结果、私人路径、凭据或未公开资料。</li><li>体验与得分为说明用途，不构成科研或学习效果证据。</li></ul><section className="rq-local-boundary" aria-label="本地处理边界"><strong>本地处理边界</strong><ul><li>不上传、不埋点，也不会向网络发送你的输入或游戏状态。</li><li>交互内容只保存在当前页面内存；刷新或重新开始后不会保留。</li><li>你输入的自由文本只会在你主动点击导出时，通过浏览器本地 Blob 文件下载；导出前会在本地拦截邮箱、绝对路径、密钥和令牌。</li><li>不要输入邮箱、密钥、token、本机或服务器私有路径，或未公开科研资料。</li></ul><p className="rq-muted">脱敏审核状态：{auditStatus}（{state.privacy.sanitization.review_status}）。</p></section></aside>;
}

export function QuestDashboard(props: QuestDashboardProps) {
  const { state, view } = props;
  return <main className="rq-app" aria-labelledby="quest-title">
    <a className="rq-skip-link" href="#quest-main">跳至主要内容</a>
    <header className="rq-hero"><p className="rq-eyebrow">Research Quest · 公开互动 Demo</p><h1 id="quest-title">把决策变成可验证的学习闭环</h1><p>{view.projectGoal.summary}</p><p className="rq-muted">完成后将获得一份可执行、可审查、带退出条件的任务合同。</p><ProgressBar value={view.overallProgress} label="总进度" /><p className="rq-muted">预计剩余 {view.estimatedRemainingTime.min}–{view.estimatedRemainingTime.max} 分钟 · 当前阶段：{view.phase}</p></header>
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
