import type {
  CampaignContent,
  CampaignId,
  CognitionDelta,
  LevelContent,
  LevelId,
  QuestContent,
  ScenarioProvenance,
} from "../types/index.ts";

const PUBLIC_RESEARCH_NEED_PROVENANCE: ScenarioProvenance = {
  data_classification: "adapted",
  display_label: "改编场景",
  public_safe: true,
  contains_real_research_results: false,
  source_traceability:
    "基于 AlphaFold2/CASP14 与 AlphaFold DB 公开资料改编的真实科研需求；只设计公开试点，不包含尚未执行的实验结果。",
};

const LEVEL_IDS: LevelId[] = [
  "level-1",
  "level-2",
  "level-3",
  "level-4",
  "level-5",
  "level-6",
  "level-7",
];

interface LevelDefinition {
  campaignId: CampaignId;
  order: number;
  title: string;
  task: string;
  knowledgeCard: string;
  question: string;
  purpose: string;
  choices: Array<{ id: string; label: string; impact: string }>;
  goalPreview: string;
  candidateId: string;
  unknownId: string;
  misconceptionId?: string;
  reward: string;
}

function makeLevel(definition: LevelDefinition): LevelContent {
  const levelId = LEVEL_IDS[definition.order - 1]!;
  const nextLevelId = definition.order < 7
    ? LEVEL_IDS[definition.order]!
    : "final-exam";
  const cognition: CognitionDelta = {
    candidate_added: [definition.candidateId],
    confirmed_added: [],
    verified_added: [],
    known_unknowns_added: [definition.unknownId],
    misconceptions_corrected: definition.misconceptionId
      ? [definition.misconceptionId]
      : [],
  };
  return {
    level_id: levelId,
    order: definition.order,
    title: definition.title,
    task: definition.task,
    knowledge_card: definition.knowledgeCard,
    estimated_time: { min: 3, max: 6, unit: "minutes" },
    question: {
      question_id: `question-${definition.campaignId}-${levelId}`,
      prompt: definition.question,
      purpose: definition.purpose,
    },
    choices: definition.choices.map((choice) => ({
      choice_id: choice.id,
      label: choice.label,
      impact_preview: choice.impact,
    })),
    goal_preview: definition.goalPreview,
    cognition_map_delta: cognition,
    reward: {
      title: definition.reward,
      artifact_ids: [`artifact-${definition.campaignId}-${levelId}`],
    },
    next_level_id: nextLevelId,
  };
}

const LEARNING_LEVELS = [
  makeLevel({
    campaignId: "learning-cognition",
    order: 1,
    title: "真实需求定位",
    task: "把“AlphaFold2 很准”改写为一个能执行、能被证伪的科研需求。",
    knowledgeCard:
      "知识卡：本试点只回答 AlphaFold2 预测是否足以支持酶活性位点几何初筛，不直接证明催化、结合或药物发现结论。",
    question: "第一版公开试点最应该服务哪个下游决定？",
    purpose: "把传播话题收敛为真实研究问题。",
    choices: [
      {
        id: "lc-l1-local-site",
        label: "判断活性位点几何是否值得继续验证",
        impact: "聚焦可公开复现的局部结构比较，并保留后续实验门槛。",
      },
      {
        id: "lc-l1-function-claim",
        label: "直接判断催化或结合功能是否可靠",
        impact: "超出单体结构预测能直接支持的证据范围。",
      },
    ],
    goalPreview:
      "研究问题：在无实验结构可用的情境下，AlphaFold2 是否足以支持酶活性位点几何的初步判断？",
    candidateId: "af-need-scope",
    unknownId: "af-downstream-decision",
    misconceptionId: "af-fold-equals-function",
    reward: "真实需求卡",
  }),
  makeLevel({
    campaignId: "learning-cognition",
    order: 2,
    title: "公开证据三联表",
    task: "确定一个目标进入试点前必须具备的公开输入。",
    knowledgeCard:
      "知识卡：每个目标至少需要 AlphaFold DB 预测、匹配的实验 PDB 结构，以及可追溯的活性/催化残基注释。",
    question: "哪种输入合同更适合公开复现？",
    purpose: "确保每个样本都有预测、参考与位点定义。",
    choices: [
      {
        id: "lc-l2-public-triplet",
        label: "只纳入公开三联数据齐全的目标",
        impact: "预测、实验参考和位点注释均可追溯。",
      },
      {
        id: "lc-l2-partial",
        label: "缺少参考结构也先纳入",
        impact: "无法计算真实局部误差，只能停留在置信度描述。",
      },
    ],
    goalPreview:
      "输入合同：AlphaFold DB 模型 + 匹配 PDB 结构 + 公开活性位点注释。",
    candidateId: "af-public-inputs",
    unknownId: "af-source-availability",
    reward: "公开输入清单",
  }),
  makeLevel({
    campaignId: "learning-cognition",
    order: 3,
    title: "置信度不等于正确性",
    task: "区分 pLDDT 的含义与本试点真正要测量的局部误差。",
    knowledgeCard:
      "知识卡：pLDDT 是逐残基局部置信度；高 pLDDT 不能自动证明活性位点化学构型、配体位置或生物功能正确。",
    question: "看到活性位点残基 pLDDT > 90，下一步最合理的判断是什么？",
    purpose: "避免把模型自信当作实验真值。",
    choices: [
      {
        id: "lc-l3-compare-reference",
        label: "与实验结构的局部几何做配对比较",
        impact: "把模型置信度与可观测局部误差放在同一张表中。",
      },
      {
        id: "lc-l3-trust-score",
        label: "直接认定活性位点准确",
        impact: "把内部置信度误写成外部验证结论。",
      },
    ],
    goalPreview:
      "同时报告 pLDDT 与实验参考的局部误差，不用单一置信度替代验证。",
    candidateId: "af-confidence-boundary",
    unknownId: "af-plddt-calibration",
    misconceptionId: "af-confidence-is-truth",
    reward: "置信度边界卡",
  }),
  makeLevel({
    campaignId: "learning-cognition",
    order: 4,
    title: "局部区域定义",
    task: "把“活性位点”转成可复现的残基集合。",
    knowledgeCard:
      "知识卡：使用公开注释的催化残基作为锚点，并在实验结构中定义固定邻域；区域规则必须在分析前冻结。",
    question: "第一版局部比较应该如何定义区域？",
    purpose: "避免事后挑选表现最好的残基。",
    choices: [
      {
        id: "lc-l4-fixed-neighborhood",
        label: "催化残基加固定 6 Å 邻域",
        impact: "每个目标使用同一、可复现的局部区域规则。",
      },
      {
        id: "lc-l4-best-looking",
        label: "分析后挑选最接近的残基",
        impact: "会引入事后选择偏差。",
      },
    ],
    goalPreview:
      "区域合同：公开催化残基及其在实验结构中的固定 6 Å 邻域。",
    candidateId: "af-site-definition",
    unknownId: "af-residue-mapping",
    misconceptionId: "af-pick-best-residues",
    reward: "位点区域合同",
  }),
  makeLevel({
    campaignId: "learning-cognition",
    order: 5,
    title: "指标与问题匹配",
    task: "选择能回答局部几何需求、而不是只展示全局折叠的指标。",
    knowledgeCard:
      "知识卡：全局 TM-score 或 RMSD 可以描述整体折叠，但活性位点任务还需要催化残基和局部邻域的配对误差。",
    question: "哪组指标最能回答本试点问题？",
    purpose: "让指标直接对应真实下游需求。",
    choices: [
      {
        id: "lc-l5-local-global",
        label: "全局结构 + 局部位点误差 + pLDDT 分层",
        impact: "能区分“整体正确但局部不适用”的目标。",
      },
      {
        id: "lc-l5-global-only",
        label: "只报告全局平均分",
        impact: "可能掩盖活性位点局部错误。",
      },
    ],
    goalPreview:
      "指标：全局 TM-score/Cα RMSD、催化残基与邻域局部 RMSD、pLDDT 分层和有效覆盖率。",
    candidateId: "af-metric-contract",
    unknownId: "af-sidechain-metric",
    reward: "指标组合卡",
  }),
  makeLevel({
    campaignId: "learning-cognition",
    order: 6,
    title: "覆盖与选择偏差",
    task: "决定如何处理无法匹配、低置信度或结构状态不同的目标。",
    knowledgeCard:
      "知识卡：真实试点必须报告排除样本和失败原因；只保留高置信度、易对齐目标会夸大适用性。",
    question: "遇到无法稳定映射的目标时怎么办？",
    purpose: "把失败样本也变成结论边界。",
    choices: [
      {
        id: "lc-l6-report-failures",
        label: "保留失败码并报告覆盖率",
        impact: "结果同时展示成功样本与方法适用边界。",
      },
      {
        id: "lc-l6-drop-silently",
        label: "静默删除失败目标",
        impact: "无法判断结果是否来自选择偏差。",
      },
    ],
    goalPreview:
      "所有纳入、排除和映射失败均进入 manifest 与覆盖率报告。",
    candidateId: "af-coverage-reporting",
    unknownId: "af-exclusion-bias",
    misconceptionId: "af-failures-are-noise",
    reward: "覆盖率收据",
  }),
  makeLevel({
    campaignId: "learning-cognition",
    order: 7,
    title: "可写结论边界",
    task: "冻结试点完成后允许写出的最强结论。",
    knowledgeCard:
      "知识卡：本试点最多评估活性位点几何初筛的适用性；它不直接验证催化活性、配体结合或药物发现效果。",
    question: "哪种结论与本试点证据相匹配？",
    purpose: "防止真实任务在传播时重新变成口号。",
    choices: [
      {
        id: "lc-l7-triage-claim",
        label: "说明哪些局部结构适合或不适合继续分析",
        impact: "结论限定在公开试点、位点几何和覆盖范围内。",
      },
      {
        id: "lc-l7-function-claim",
        label: "宣称预测证明酶功能正确",
        impact: "超出结构比较可以支持的范围。",
      },
    ],
    goalPreview:
      "结论边界：只讨论公开试点中的局部几何适用性和失败模式。",
    candidateId: "af-claim-boundary",
    unknownId: "af-external-generalization",
    misconceptionId: "af-geometry-proves-function",
    reward: "结论边界章",
  }),
] as CampaignContent["levels"];

const RESEARCH_LEVELS = [
  makeLevel({
    campaignId: "research-decision",
    order: 1,
    title: "试点规模",
    task: "冻结首轮真实公开试点的规模和完成信号。",
    knowledgeCard:
      "知识卡：首轮目标是验证流程是否可复现，而不是追求大而全；建议选择 10 个公开酶目标，并要求至少 8 个完成有效配对分析。",
    question: "第一版试点采用哪种规模更容易形成可信闭环？",
    purpose: "在可执行性与代表性之间做出明确取舍。",
    choices: [
      {
        id: "rd-l1-ten-targets",
        label: "10 个目标，至少 8 个有效完成",
        impact: "规模足以暴露映射问题，又能在短周期内完成复核。",
      },
      {
        id: "rd-l1-hundreds",
        label: "直接扩展到数百个目标",
        impact: "数据清洗和失败诊断会掩盖核心方法验证。",
      },
    ],
    goalPreview: "试点规模：10 个公开酶目标，至少 8 个形成有效结果。",
    candidateId: "af-pilot-size",
    unknownId: "af-target-availability",
    reward: "试点规模卡",
  }),
  makeLevel({
    campaignId: "research-decision",
    order: 2,
    title: "纳入与排除",
    task: "定义一个目标进入 benchmark 的最低资格。",
    knowledgeCard:
      "知识卡：优先纳入单体酶、序列可精确映射、存在实验结构且有公开催化残基注释的目标；所有排除原因必须记录。",
    question: "哪种纳入规则能保证结果可解释？",
    purpose: "避免把不同序列、构象或无注释目标混在一起。",
    choices: [
      {
        id: "rd-l2-strict-contract",
        label: "冻结序列、结构和位点三项资格",
        impact: "每个目标都能回答同一个局部几何问题。",
      },
      {
        id: "rd-l2-any-protein",
        label: "只要有 AlphaFold 模型就纳入",
        impact: "缺少实验参考或位点定义时无法完成主分析。",
      },
    ],
    goalPreview:
      "纳入合同：公开单体酶、可映射序列、匹配 PDB、可追溯催化残基注释。",
    candidateId: "af-inclusion-contract",
    unknownId: "af-conformation-state",
    reward: "纳入排除表",
  }),
  makeLevel({
    campaignId: "research-decision",
    order: 3,
    title: "结构映射与对齐",
    task: "确定 AlphaFold 模型与 PDB 参考之间的序列映射和对齐方式。",
    knowledgeCard:
      "知识卡：必须记录链、残基编号、缺失残基、覆盖率和构象差异；对齐失败不能静默修补。",
    question: "结构比较前必须先冻结哪项合同？",
    purpose: "让局部误差来自真实对应残基，而不是编号错位。",
    choices: [
      {
        id: "rd-l3-sequence-map",
        label: "先做序列映射和覆盖率审计",
        impact: "只有一一对应残基进入结构误差计算。",
      },
      {
        id: "rd-l3-coordinate-only",
        label: "只按坐标最近邻直接匹配",
        impact: "可能把缺失残基和编号差异误当成结构误差。",
      },
    ],
    goalPreview:
      "对齐合同：序列映射、链选择、覆盖率、缺失残基和结构状态均可追溯。",
    candidateId: "af-alignment-contract",
    unknownId: "af-missing-residues",
    reward: "映射审计表",
  }),
  makeLevel({
    campaignId: "research-decision",
    order: 4,
    title: "局部几何计算",
    task: "冻结活性位点及其邻域的具体计算方式。",
    knowledgeCard:
      "知识卡：在全局对齐后，分别计算催化残基和固定邻域的 Cα/主链误差；侧链结果单列并说明配体、辅因子和构象限制。",
    question: "主分析应该以哪种局部结果为核心？",
    purpose: "获得可重复、不过度依赖侧链构象的首轮指标。",
    choices: [
      {
        id: "rd-l4-backbone-first",
        label: "催化残基与 6 Å 邻域的主链误差",
        impact: "首轮结果更稳定，侧链和配体问题作为补充分析。",
      },
      {
        id: "rd-l4-docking-score",
        label: "直接用对接分数作为主指标",
        impact: "会引入配体、质子化、口袋准备和搜索框等额外变量。",
      },
    ],
    goalPreview:
      "主分析：全局对齐后计算催化残基和固定邻域的局部主链误差。",
    candidateId: "af-local-analysis",
    unknownId: "af-sidechain-state",
    reward: "局部分析协议",
  }),
  makeLevel({
    campaignId: "research-decision",
    order: 5,
    title: "指标与报告",
    task: "冻结输出表格、图和失败分析。",
    knowledgeCard:
      "知识卡：结果应同时报告全局结构、局部位点、pLDDT 分层、有效覆盖和失败码，避免用单个平均值讲完整故事。",
    question: "最终结果包必须包含什么？",
    purpose: "让结论可复查并能解释失败样本。",
    choices: [
      {
        id: "rd-l5-full-report",
        label: "主表、校准图、逐目标 QA 和失败清单",
        impact: "读者能追溯每个目标为何成功、失败或被排除。",
      },
      {
        id: "rd-l5-one-number",
        label: "只发布一个总体平均值",
        impact: "无法判断覆盖率、异常值和局部失败。",
      },
    ],
    goalPreview:
      "输出：manifest、主结果表、pLDDT-局部误差图、逐目标 QA、失败码和结论边界。",
    candidateId: "af-report-contract",
    unknownId: "af-uncertainty-interval",
    reward: "结果包清单",
  }),
  makeLevel({
    campaignId: "research-decision",
    order: 6,
    title: "多 Agent 执行",
    task: "把公开数据整理、分析实现和独立复审拆给不同角色。",
    knowledgeCard:
      "知识卡：Data Agent 维护来源与映射，Analysis Agent 实现计算，Reviewer 从 manifest 和结果重新核验；三者共享同一合同但不能互相自证。",
    question: "哪种分工最能减少同源错误？",
    purpose: "把科研计划直接转换为可执行团队结构。",
    choices: [
      {
        id: "rd-l6-separated-agents",
        label: "数据、分析和复审角色分离",
        impact: "每条结果都有独立来源检查和实现复验。",
      },
      {
        id: "rd-l6-one-agent",
        label: "同一 Agent 找数据、计算并自审",
        impact: "速度更快，但映射错误和结论偏差更难发现。",
      },
    ],
    goalPreview:
      "Agent 结构：数据与来源、分析实现、独立复审、总控集成四类职责。",
    candidateId: "af-agent-plan",
    unknownId: "af-review-disagreement",
    reward: "Agent 任务图",
  }),
  makeLevel({
    campaignId: "research-decision",
    order: 7,
    title: "验收与失败退出",
    task: "冻结什么算完成，以及流程连续失败时如何退出。",
    knowledgeCard:
      "知识卡：至少 8/10 个目标完成有效分析；若同一映射或数据问题经过 3–5 轮实质不同的修复仍失败，必须输出根因分析，而不是无限重试。",
    question: "哪种退出规则更适合真实科研试点？",
    purpose: "让自动执行既不轻易停，也不无限消耗资源。",
    choices: [
      {
        id: "rd-l7-root-cause",
        label: "3–5 轮不同尝试后输出根因分析",
        impact: "保留失败证据、最大可交付子集和恢复条件。",
      },
      {
        id: "rd-l7-first-failure",
        label: "第一次失败就停止",
        impact: "无法区分暂时工程问题与真实不可行条件。",
      },
    ],
    goalPreview:
      "验收：至少 8/10 个目标有效；关键问题 3–5 轮失败后生成根因报告并安全退出。",
    candidateId: "af-acceptance-exit",
    unknownId: "af-minimum-valid-count",
    misconceptionId: "af-first-failure-stop",
    reward: "试点执行合同",
  }),
] as CampaignContent["levels"];

export function createDefaultQuestContent(): QuestContent {
  return {
    project_goal: {
      summary:
        "设计一个公开可复现的 10 个酶目标试点，评估 AlphaFold2 预测是否足以支持活性位点几何初筛，并生成可直接执行的 Codex Goal。",
      success_criteria: [
        "完成围绕同一真实科研需求的学习认知与科研决策两条七关战役",
        "冻结公开数据来源、纳入规则、局部区域、指标、Agent 分工和失败退出条件",
        "至少规划 10 个公开酶目标，并要求不少于 8 个目标形成有效配对分析",
        "通过应用、概念理解和迁移三类最终考试",
        "导出包含输入、步骤、指标、验收、根因分析和多 Agent 分工的完整 Codex Goal",
      ],
      constraints: [
        "只使用公开 AlphaFold DB、PDB 和可追溯活性位点注释",
        "不包含尚未执行的实验结果，也不把 pLDDT 或结构相似性写成催化、结合或药物发现结论",
        "所有纳入、排除、映射失败和覆盖率必须可追溯",
        "关键问题只有在 3–5 轮实质不同的尝试仍失败后才允许退出，并必须生成根因分析",
      ],
    },
    prologue: {
      task: "选择真实科研试点首先要服务的下游判断。",
      estimated_time: { min: 1, max: 2, unit: "minutes" },
      question: {
        question_id: "question-prologue-control",
        prompt: "这个公开试点最先应该回答哪一个问题？",
        purpose: "把 AlphaFold2 的传播话题冻结为可执行的科研需求。",
      },
      choices: [
        {
          choice_id: "choice-prologue-active-site",
          label: "能否支持酶活性位点几何初筛",
          impact_preview: "后续围绕局部结构、公开参考和实验边界生成 Goal。",
        },
        {
          choice_id: "choice-prologue-global-fold",
          label: "只复述 CASP14 的全局成绩",
          impact_preview: "可以解释历史成绩，但不能展示如何解决一个新的科研需求。",
        },
      ],
      goal_preview:
        "目标预览：把一个真实公开科研需求逐关编译为数据、分析、验收和多 Agent 执行合同。",
      cognition_map_delta: {
        candidate_added: [],
        confirmed_added: [],
        verified_added: [],
        known_unknowns_added: ["af-real-need"],
        misconceptions_corrected: [],
      },
      reward: {
        title: "真实科研任务入口",
        artifact_ids: ["artifact-prologue-real-task"],
      },
    },
    campaigns: {
      learning_cognition: {
        campaign_id: "learning-cognition",
        title: "战役一：理解真实需求与证据边界",
        description:
          "围绕 AlphaFold2 是否足以支持酶活性位点几何初筛，建立任务、公开输入、置信度、局部区域、指标和结论边界。",
        provenance: PUBLIC_RESEARCH_NEED_PROVENANCE,
        levels: LEARNING_LEVELS,
      },
      research_decision: {
        campaign_id: "research-decision",
        title: "战役二：冻结公开试点与执行合同",
        description:
          "把同一需求转化为 10 个公开酶目标的可复现试点，冻结纳入规则、结构映射、指标、Agent 分工、验收和失败退出。",
        provenance: PUBLIC_RESEARCH_NEED_PROVENANCE,
        levels: RESEARCH_LEVELS,
      },
    },
    prompt_clues: [
      {
        clue_id: "clue-real-need",
        clue_type: "goal-clue",
        text: "Demo 必须从真实科研需求出发，并最终生成能执行该需求的 Codex Goal。",
        source_kind: "public-context",
        evidence_status: "verified",
      },
      {
        clue_id: "clue-public-sources",
        clue_type: "constraint-clue",
        text: "试点只使用 AlphaFold DB、PDB 与可追溯公开注释，不包含未公开结果。",
        source_kind: "public-context",
        evidence_status: "verified",
      },
      {
        clue_id: "clue-controlled-loop",
        clue_type: "workflow-clue",
        text: "一次只提出一个会改变后续方案的高价值问题。",
        source_kind: "public-context",
        evidence_status: "verified",
      },
      {
        clue_id: "clue-root-cause-exit",
        clue_type: "failure-clue",
        text: "同一关键问题经过 3–5 轮不同尝试仍失败时，输出根因分析再退出。",
        source_kind: "public-context",
        evidence_status: "verified",
      },
    ],
    exam: {
      pass_threshold: 80,
      questions: [
        {
          question_id: "exam-decision-application",
          category: "decision-application",
          prompt:
            "一个目标的全局结构很接近实验参考，但催化残基邻域误差明显偏大。你会如何处理这个目标和结论？",
          question_type: "application",
        },
        {
          question_id: "exam-concept-understanding",
          category: "concept-understanding",
          prompt:
            "为什么活性位点残基 pLDDT 很高，仍不能直接证明催化几何或配体结合正确？",
          question_type: "short-answer",
        },
        {
          question_id: "exam-transfer",
          category: "transfer",
          prompt:
            "如果把本试点迁移到分子对接任务，至少需要新增哪两类证据或控制？",
          question_type: "application",
        },
      ],
    },
  };
}
