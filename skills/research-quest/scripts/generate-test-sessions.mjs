#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(scriptDir, "..");

function arg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index < 0 ? fallback : resolve(process.cwd(), process.argv[index + 1]);
}

const schemaPath = arg("--schema", resolve(skillDir, "../../shared/game-state.schema.json"));
const outputDir = arg("--output-dir", resolve(skillDir, "references"));
const checkOnly = process.argv.includes("--check-only");
const expectedSchemaSha256 = "c7deaf33007782476723169827c9fbb92a5dbd904d3fe34687caed8e3768e77b";

if (!existsSync(schemaPath)) {
  throw new Error(`Canonical Schema not found: ${schemaPath}. Pass --schema <canonical-schema>.`);
}
const schemaSource = readFileSync(schemaPath, "utf8");
const actualSchemaSha256 = createHash("sha256").update(schemaSource).digest("hex");
if (actualSchemaSha256 !== expectedSchemaSha256) {
  throw new Error(
    `Canonical Schema SHA-256 mismatch: expected ${expectedSchemaSha256}, got ${actualSchemaSha256}.`,
  );
}
const schema = JSON.parse(schemaSource);
if (schema?.properties?.schema_version?.const !== "1.0.0") {
  throw new Error("Canonical Schema version must be 1.0.0.");
}

const now = "2026-07-26T08:00:00.000Z";
const clueTypes = [
  "goal-clue",
  "constraint-clue",
  "workflow-clue",
  "acceptance-clue",
  "failure-clue",
  "preference-clue",
  "artifact-clue",
];
const goalSections = [
  "冻结 Context",
  "任务边界",
  "多 Agent 分工",
  "模型路由",
  "执行步骤",
  "验证与验收",
  "安全",
  "独立审查",
  "Git、PR 与合并",
  "退出条件",
];
const campaigns = {
  "learning-cognition": [
    "冻结学习目标",
    "区分事实与假设",
    "绘制认知地图",
    "评估证据质量",
    "完成情境应用",
    "纠正关键误解",
    "完成新情境迁移",
  ],
  "research-decision": [
    "冻结问题与成功条件",
    "划定数据与安全边界",
    "选择 baseline 与对照",
    "冻结指标与验收门",
    "设计受控执行",
    "设置失败门与退出条件",
    "冻结执行与独立审查",
  ],
};
const scenarios = [
  {
    id: "research",
    title: "合成数据教学干预可行性实验",
    active: "research-decision",
    goal: "用合成记录设计可证伪、可复验的教学干预可行性实验。",
    criteria: ["预注册问题、baseline、指标与停止门", "只使用合成记录", "独立审查后才形成结论"],
    constraints: ["不接触真实学生数据", "不把演示结果写成科研结论", "失败时保留负结果"],
    unknown: "最小样本量与效应阈值仍需预注册计算。",
    transfer: "把受控实验框架迁移到一个新的模拟问卷场景。",
    artifact: "合成数据实验协议与审查包",
  },
  {
    id: "software",
    title: "离线阅读清单 CLI",
    active: "research-decision",
    goal: "实现支持 CSV 导入导出的离线阅读清单 CLI。",
    criteria: ["最小命令合同可测试", "重复导入保持幂等", "单元、集成与安全检查通过"],
    constraints: ["无网络与遥测", "不覆盖用户文件", "未知 CSV 方言必须显式报错"],
    unknown: "不同 CSV 方言和编码边界仍需 fixture 验证。",
    transfer: "把幂等导入策略迁移到 JSONL 输入。",
    artifact: "离线 CLI、fixture 与验证记录",
  },
  {
    id: "learning",
    title: "四周概率论学习计划",
    active: "learning-cognition",
    goal: "用公开教材和自制练习完成四周概率论学习闭环。",
    criteria: ["每周有无提示复述与应用题", "最终迁移题达到 80 分", "错误类型可追踪"],
    constraints: ["不记录个人敏感信息", "不把自信度当掌握度", "只使用公开材料"],
    unknown: "条件概率与贝叶斯公式在文字题中的适用边界仍需练习验证。",
    transfer: "把条件概率方法迁移到一个未见过的质量检测题。",
    artifact: "四周学习计划、错题地图与迁移考试",
  },
];

const hash = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const minutes = (min, max) => ({ min, max, unit: "minutes" });
const prov = (s) => ({
  data_classification: "simulated",
  display_label: "模拟数据",
  public_safe: true,
  contains_real_research_results: false,
  source_traceability: `fixture:${s.id}:synthetic-only`,
});
const question = (id, prompt, purpose) => ({ question_id: id, prompt, purpose });
const options = (prefix, s) => [
  {
    choice_id: `${prefix}.a`,
    label: `先冻结“${s.goal}”的证据边界`,
    impact_preview: "后续关卡优先建立可验证条件与停止门。",
  },
  {
    choice_id: `${prefix}.b`,
    label: "先扩展方案范围",
    impact_preview: "探索面更宽，但必须增加未知项且不得跳过验证。",
  },
];

function levels(s, campaignId) {
  return campaigns[campaignId].map((title, i) => {
    const order = i + 1;
    const prefix = `${s.id}.${campaignId}.level-${order}`;
    const knowledgePrefix = `${s.id}.${campaignId}`;
    return {
      level_id: `level-${order}`,
      order,
      title,
      status: "completed",
      task: `${title}：围绕“${s.goal}”产出可复验记录。`,
      knowledge_card: "陈述不等于 Verified；记录来源、选择影响和下一步证据。",
      estimated_time: minutes(3, 5),
      progress: Number(((order / 7) * 100).toFixed(2)),
      question: question(
        `${prefix}.question`,
        `本关哪项选择最能改变“${s.title}”的后续方案？`,
        "只询问一个会改变路线的高价值问题。",
      ),
      choices: options(`${prefix}.choice`, s),
      selected_choice_id: `${prefix}.choice.a`,
      choice_impact: "冻结证据边界，并把未解决项保留为 Known Unknown。",
      goal_preview: `${s.goal} 当前已完成 ${order}/7 个决策门。`,
      cognition_map_delta: {
        candidate_added: order === 1 ? [`${knowledgePrefix}.knowledge.candidate`] : [],
        confirmed_added: order === 3 ? [`${knowledgePrefix}.knowledge.confirmed`] : [],
        verified_added: order === 5 ? [`${knowledgePrefix}.knowledge.verified`] : [],
        known_unknowns_added: order === 2 ? [`${knowledgePrefix}.known-unknown`] : [],
        misconceptions_corrected: order === 6 ? [`${knowledgePrefix}.misconception`] : [],
      },
      quiz: { status: "passed", question_ids: [`${prefix}.quiz`], accuracy: 1 },
      reward: { title: `${title}徽章`, artifact_ids: [] },
      next_level_id: order < 7 ? `level-${order + 1}` : "final-exam",
    };
  });
}

function evidence(id, type, source, score) {
  const result = { evidence_id: id, evidence_type: type, source_ref: source, recorded_at: now };
  if (score !== undefined) result.score = score;
  return result;
}

function knowledge(s, status) {
  const id = `${s.id}.knowledge.${status}`;
  const item = {
    knowledge_id: id,
    statement:
      status === "candidate"
        ? `候选陈述：${s.goal}`
        : status === "confirmed"
          ? `已确认边界：${s.constraints[0]}`
          : `已验证应用：${s.criteria[0]}`,
    status,
    campaign_id: s.active,
    introduced_level_id: status === "candidate" ? "level-1" : status === "confirmed" ? "level-3" : "level-5",
    provenance: prov(s),
    candidate_evidence: [
      evidence(`${id}.candidate`, "ai-extraction", `fixture:${s.id}:sanitized-input`),
    ],
  };
  if (status !== "candidate") {
    item.confirmation_evidence = [
      evidence(`${id}.confirmation`, "restatement", `fixture:${s.id}:user-restatement`),
    ];
  }
  if (status === "verified") {
    item.verification_evidence = [
      evidence(`${id}.application`, "choice-application", `fixture:${s.id}:level-5`, 90),
      evidence(`${id}.exam`, "final-exam", `fixture:${s.id}:final-exam`, 90),
    ];
  }
  return item;
}

function goal(s) {
  return `# Codex Goal｜${s.title}

## 冻结 Context
- 场景标签：模拟数据；仅用于流程验证。
- 已确认目标：${s.goal}
- 待验证假设：controlled loop 的真实效果尚无用户证据。
- 不可推断内容：未提供来源正文、真实结果或个人信息。

## 任务边界
- 目标：${s.goal}
- 成功条件：${s.criteria.join("；")}。
- 范围内：${s.artifact}。
- 范围外：真实个人数据、私有代码、未公开结果与未经审查的效果声明。

## 多 Agent 分工
- Planner 冻结范围、依赖、文件 Owner 和验收矩阵。
- Worker 按单一 Owner 边界产生产物与原始验证记录。
- Reviewer 独立复验，不读取实现者的预期结论。
- 交接使用 artifact、status、validation、blockers、requested_action。

## 模型路由
- 机械检索、分类与格式检查使用低成本模型。
- 语义、架构、证据边界和失败恢复使用高能力模型。
- 同一明确 blocker 两轮未解时升级，不以增加成本掩盖缺证据。

## 执行步骤
1. 清点并脱敏输入，登记七类 Prompt Clue。
2. 完成双战役七关，逐关记录选择、决定和 Goal 版本。
3. 只沿 Candidate → Confirmed → Verified 补齐凭据。
4. 运行小测、应用题与迁移题。
5. 通过最终考试后导出状态、Goal 与哈希。

## 验证与验收
- 用 Canonical Schema 1.0.0 验证完整 game-state。
- 验证两个战役各七关、考试权重和为 100、正式得分只含 Verified。
- 证据使用命令日志、fixture、测试结果或独立审查记录，不能只写“已完成”。

## 安全
- 仅使用公开、模拟或已脱敏输入；${s.constraints.join("；")}。
- 禁止凭据、个人标识、私有路径/代码、服务器细节、数据集、checkpoint 和未公开结果。
- 登录、付费、发布、删除、覆盖或实质 Context 冲突必须等待明确授权。

## 独立审查
- Reviewer 独立检查功能、证据、隐私、可复现性与宣传边界。
- 未关闭 P0/P1 阻止公开发布；修复后重新运行同一验收。

## Git、PR 与合并
- 只精确暂存 Owner 范围，不使用广泛暂存。
- 提交、PR 与合并说明使用中文。
- 仅集成 Owner 合并共享 Schema、根配置与跨模块变更。

## 退出条件
- 成功退出：全部 P0 有可复验证据，考试通过，状态与 Goal 可安全导出。
- blocker 退出：两轮同一问题无进展时提交最小复现并升级。
- 路线退出：安全边界无法满足、关键证据缺失或独立审查仍有未关闭 P0/P1 时停止。`;
}

function exam(s) {
  return {
    status: "passed",
    pass_threshold: 80,
    weights: {
      decision_application: 60,
      concept_understanding: 20,
      transfer: 20,
      weight_total: 100,
    },
    questions: [
      {
        question_id: `${s.id}.exam.application`,
        category: "decision-application",
        prompt: `在范围扩张请求出现时，如何应用“${s.constraints[0]}”这一决定？`,
        question_type: "application",
        answer: "保留冻结边界，将扩张项登记为待验证假设并重新走审批。",
        is_correct: true,
        score: 90,
      },
      {
        question_id: `${s.id}.exam.concept`,
        category: "concept-understanding",
        prompt: "为什么 Confirmed 不能直接计入正式理解得分？",
        question_type: "short-answer",
        answer: "Confirmed 只有确认凭据，尚缺应用、小测、考试、迁移或纠错形成的验证凭据。",
        is_correct: true,
        score: 90,
      },
      {
        question_id: `${s.id}.exam.transfer`,
        category: "transfer",
        prompt: s.transfer,
        question_type: "application",
        answer: "冻结新情境边界并复用验证门；新增未知项，不把旧结论直接外推。",
        is_correct: true,
        score: 90,
      },
    ],
    score: 90,
    passed: true,
    completed_at: now,
  };
}

function stateFor(s) {
  const levelSets = Object.fromEntries(Object.keys(campaigns).map((id) => [id, levels(s, id)]));
  const playerChoices = Object.keys(campaigns).flatMap((campaignId) =>
    levelSets[campaignId].map((level) => ({
      choice_record_id: `${s.id}.${campaignId}.${level.level_id}.choice-record`,
      campaign_id: campaignId,
      level_id: level.level_id,
      question_id: level.question.question_id,
      choice_id: level.selected_choice_id,
      impact: level.choice_impact,
      chosen_at: now,
    })),
  );
  const decisions = playerChoices.map((choice) => ({
    decision_id: choice.choice_record_id.replace("choice-record", "decision"),
    campaign_id: choice.campaign_id,
    level_id: choice.level_id,
    summary: choice.impact,
    status: "frozen",
    source_choice_record_id: choice.choice_record_id,
  }));
  const goalText = goal(s);
  const state = {
    schema_version: "1.0.0",
    state_id: `fixture.${s.id}`,
    revision: 14,
    session: { started_at: now, reset_count: 0, last_reset_at: null, can_restart: true },
    project_goal: {
      summary: s.goal,
      success_criteria: s.criteria,
      constraints: s.constraints,
      status: "executed",
    },
    mode: "controlled-loop",
    interaction_mode: "interactive",
    phase: "completed",
    prologue: {
      status: "completed",
      task: `选择“${s.title}”的第一条验证路线。`,
      estimated_time: minutes(2, 3),
      question: question(`${s.id}.prologue.question`, "哪项选择最能改变后续方案？", "冻结第一条高价值决策。"),
      choices: options(`${s.id}.prologue.choice`, s),
      selected_choice_id: `${s.id}.prologue.choice.a`,
      goal_preview: s.goal,
      cognition_map_delta: {
        candidate_added: [],
        confirmed_added: [],
        verified_added: [],
        known_unknowns_added: [],
        misconceptions_corrected: [],
      },
      reward: { title: "目标罗盘", artifact_ids: [] },
      next_level_id: "level-1",
    },
    current_campaign: null,
    current_level: "complete",
    overall_progress: 100,
    estimated_remaining_time: minutes(0, 0),
    campaigns: {
      learning_cognition: {
        campaign_id: "learning-cognition",
        title: "学习认知战役",
        description: "把陈述转为可验证、可迁移的知识。",
        status: "completed",
        progress: 100,
        provenance: prov(s),
        levels: levelSets["learning-cognition"],
      },
      research_decision: {
        campaign_id: "research-decision",
        title: "科研决策战役",
        description: "把范围、baseline、指标、停止门与审查转为可追溯决定。",
        status: "completed",
        progress: 100,
        provenance: prov(s),
        levels: levelSets["research-decision"],
      },
    },
    player_choices: playerChoices,
    goal_versions: [
      {
        version: 1,
        status: "superseded",
        goal_text: `草案：${s.goal}`,
        source_decision_ids: [decisions[0].decision_id],
        created_at: now,
      },
      {
        version: 2,
        status: "executed",
        goal_text: goalText,
        source_decision_ids: decisions.map((item) => item.decision_id),
        created_at: now,
      },
    ],
    known_knowns: {
      candidate: [knowledge(s, "candidate")],
      confirmed: [knowledge(s, "confirmed")],
      verified: [knowledge(s, "verified")],
    },
    known_unknowns: [
      {
        item_id: `${s.id}.known-unknown`,
        statement: s.unknown,
        campaign_id: s.active,
        introduced_level_id: "level-2",
        status: "under-investigation",
      },
    ],
    unknown_knowns: [
      {
        item_id: `${s.id}.unknown-known`,
        statement: "用户可能已掌握部分方法，但必须通过无提示复述或应用暴露。",
        campaign_id: "learning-cognition",
        introduced_level_id: "level-3",
        status: "resolved",
      },
    ],
    unknown_unknowns: [
      {
        item_id: `${s.id}.unknown-unknown`,
        statement: "迁移到新情境后可能出现尚未建模的边界失败。",
        campaign_id: "research-decision",
        introduced_level_id: "level-6",
        status: "open",
      },
    ],
    prompt_clues: clueTypes.map((clueType, i) => ({
      clue_id: `${s.id}.clue.${i + 1}`,
      clue_type: clueType,
      text:
        clueType === "goal-clue"
          ? s.goal
          : clueType === "constraint-clue"
            ? s.constraints.join("；")
            : clueType === "acceptance-clue"
              ? s.criteria.join("；")
              : clueType === "failure-clue"
                ? "证据不足或安全边界无法满足时停止。"
                : clueType === "artifact-clue"
                  ? s.artifact
                  : "按 controlled loop 一次处理一个高价值决定。",
      source_kind: "simulated",
      evidence_status: clueType === "artifact-clue" ? "retrieval-limited" : i < 2 ? "verified" : "confirmed",
    })),
    artifacts: ["cognition-map", "exam-result", "game-state-export", "codex-goal-export"].map((type) => ({
      artifact_id: `${s.id}.artifact.${type}`,
      artifact_type: type,
      title: `${s.title} ${type}`,
      uri: `artifact://${s.id}/${type}`,
      public_safe: true,
    })),
    decisions,
    metrics: {
      new_verified_known_knowns: 1,
      corrected_misconceptions: 1,
      new_known_unknowns: 1,
      applied_knowledge_count: 2,
      level_quiz_accuracy: 1,
      final_exam_accuracy: 0.9,
      transfer_task_score: 90,
      goal_revision_count: 1,
      formal_understanding_score: 90,
      verified_only_for_knowledge_count: true,
    },
    exam: exam(s),
    auto_demo: {
      enabled: true,
      duration_seconds: 75,
      status: "completed",
      deterministic_seed: 20260726,
      loop: false,
      current_step: 9,
      steps: [
        ["open-campaign", "learning-cognition"],
        ["open-level", "level-1"],
        ["select-choice", `${s.id}.learning-cognition.level-1.choice.a`],
        ["confirm-knowledge", `${s.id}.knowledge.confirmed`],
        ["verify-knowledge", `${s.id}.knowledge.verified`],
        ["answer-exam", `${s.id}.exam.application`],
        ["export-state", `${s.id}.artifact.game-state-export`],
        ["export-goal", `${s.id}.artifact.codex-goal-export`],
        ["complete", `fixture.${s.id}`],
      ].map(([action, target], i) => ({
        step_id: `${s.id}.demo.step-${i + 1}`,
        at_second: i * 9,
        action,
        target,
      })),
    },
    exports: {
      state: {
        kind: "game-state",
        status: "not-generated",
        media_type: "application/json",
        filename: null,
        generated_at: null,
        sha256: null,
        content: null,
        schema_version: "1.0.0",
        public_safe: true,
      },
      goal: {
        kind: "codex-goal",
        status: "ready",
        media_type: "text/markdown",
        filename: `${s.id}-codex-goal.md`,
        generated_at: now,
        sha256: hash(goalText),
        content: goalText,
        schema_version: "1.0.0",
        public_safe: true,
      },
    },
    privacy: {
      public_demo_disclosure: "本 fixture 为模拟数据，仅用于功能与合同验证，不代表真实科研或产品效果。",
      research_claim_status: "illustrative-only",
      real_research_results_included: false,
      sanitization: {
        applied: true,
        removed_categories: [
          "personal-identifiers",
          "private-paths",
          "credentials",
          "private-code",
          "unpublished-results",
          "server-details",
          "datasets",
          "checkpoints",
        ],
        review_status: "approved",
      },
    },
    next_question: null,
    updated_at: now,
  };
  const snapshot = JSON.stringify(state);
  state.exports.state = {
    kind: "game-state",
    status: "ready",
    media_type: "application/json",
    filename: `${s.id}-game-state.json`,
    generated_at: now,
    sha256: hash(snapshot),
    content: snapshot,
    schema_version: "1.0.0",
    public_safe: true,
  };
  return state;
}

function check(state) {
  const ok = (value, message) => {
    if (!value) throw new Error(`${state.state_id}: ${message}`);
  };
  for (const key of schema.required) ok(Object.hasOwn(state, key), `missing root field ${key}`);
  ok(state.schema_version === "1.0.0", "wrong schema version");
  ok(state.campaigns.learning_cognition.levels.length === 7, "learning campaign is not seven levels");
  ok(state.campaigns.research_decision.levels.length === 7, "research campaign is not seven levels");
  ok(state.campaigns.learning_cognition.levels.every((item) => item.status === "completed"), "learning campaign incomplete");
  ok(state.campaigns.research_decision.levels.every((item) => item.status === "completed"), "research campaign incomplete");
  ok(new Set(state.prompt_clues.map((item) => item.clue_type)).size === 7, "Prompt Clue coverage");
  ok(state.known_knowns.candidate[0].candidate_evidence.length, "candidate evidence");
  ok(state.known_knowns.confirmed[0].confirmation_evidence.length, "confirmation evidence");
  ok(state.known_knowns.verified[0].verification_evidence.length, "verification evidence");
  ok(state.metrics.verified_only_for_knowledge_count, "verified-only metric");
  ok(
    state.exam.weights.decision_application +
      state.exam.weights.concept_understanding +
      state.exam.weights.transfer ===
      100,
    "exam weight sum",
  );
  ok(new Set(state.exam.questions.map((item) => item.category)).size === 3, "exam categories");
  ok(state.exam.passed && state.exam.score >= state.exam.pass_threshold, "exam result");
  for (const section of goalSections) ok(state.exports.goal.content.includes(`## ${section}`), `Goal ${section}`);
  ok(state.exports.state.sha256.length === 64 && state.exports.goal.sha256.length === 64, "SHA-256");
  ok(hash(state.exports.state.content) === state.exports.state.sha256, "state export hash");
  ok(hash(state.exports.goal.content) === state.exports.goal.sha256, "Goal export hash");
  const exportedState = JSON.parse(state.exports.state.content);
  for (const key of schema.required) ok(Object.hasOwn(exportedState, key), `export missing root field ${key}`);
  ok(state.privacy.research_claim_status === "illustrative-only", "claim status");
  ok(state.privacy.real_research_results_included === false, "real result flag");
}

for (const scenario of scenarios) {
  const file = resolve(outputDir, `fixture-${scenario.id}.json`);
  const state = checkOnly ? JSON.parse(readFileSync(file, "utf8")) : stateFor(scenario);
  check(state);
  if (!checkOnly) writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  console.log(`FIXTURE_CONTRACT_OK ${scenario.id} ${file}`);
}
