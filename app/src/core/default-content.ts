import type {
  CampaignContent,
  CampaignId,
  CognitionDelta,
  LevelContent,
  LevelId,
  QuestContent,
  ScenarioProvenance,
} from "../types/index.ts";

const SIMULATED_PROVENANCE: ScenarioProvenance = {
  data_classification: "simulated",
  display_label: "模拟数据",
  public_safe: true,
  contains_real_research_results: false,
  source_traceability: "Research Quest 公开演示用合成场景；不对应真实项目、人员或科研结果。",
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

const LEARNING_LEVELS = [
  ["目标罗盘", "把模糊学习愿望改写为可检查的理解目标。"],
  ["已知盘点", "区分候选认识、已确认认识与仍待验证的认识。"],
  ["盲区雷达", "把关键未知显式写入 Known Unknown 清单。"],
  ["证据阶梯", "为认识安排 Candidate → Confirmed → Verified 的证据链。"],
  ["应用试炼", "在改编场景中应用已学概念，不把复述当作掌握。"],
  ["纠错工坊", "记录误解、修正依据与修正后的适用边界。"],
  ["迁移之门", "把方法迁移到新的模拟任务并声明失效条件。"],
] as const;

const RESEARCH_LEVELS = [
  ["问题边界", "把模拟研究任务的范围、非目标与停止条件写清楚。"],
  ["证据地图", "区分公开事实、合理推断与待验证假设。"],
  ["方案岔路", "比较候选路线的收益、成本、风险和可逆性。"],
  ["验证协议", "先定义成功指标、失败信号与最小可执行检查。"],
  ["安全闸门", "识别凭据、隐私、未公开结果和不可逆操作风险。"],
  ["独立复核", "安排与实现者分离的审查及缺陷关闭证据。"],
  ["退出决策", "依据冻结门槛继续、转向或停止模拟路线。"],
] as const;

function cognitionDelta(
  campaignId: CampaignId,
  levelId: LevelId,
): CognitionDelta {
  return {
    candidate_added: [`knowledge-${campaignId}-${levelId}`],
    confirmed_added: [],
    verified_added: [],
    known_unknowns_added: [`unknown-${campaignId}-${levelId}`],
    misconceptions_corrected:
      levelId === "level-6"
        ? [`misconception-${campaignId}-${levelId}`]
        : [],
  };
}

function makeLevels(
  campaignId: CampaignId,
  definitions: ReadonlyArray<readonly [string, string]>,
): CampaignContent["levels"] {
  const levels = definitions.map(([title, task], index): LevelContent => {
    const levelId = LEVEL_IDS[index]!;
    const nextLevelId =
      index < LEVEL_IDS.length - 1 ? LEVEL_IDS[index + 1]! : "final-exam";
    return {
      level_id: levelId,
      order: index + 1,
      title,
      task: `${task}（模拟案例）`,
      knowledge_card: `${title}知识卡：内容为公开演示用模拟说明，不代表真实科研结论。`,
      estimated_time: { min: 2, max: 4, unit: "minutes" },
      question: {
        question_id: `question-${campaignId}-${levelId}`,
        prompt: `在“${title}”中，哪项选择最能改变下一步方案？`,
        purpose: "一次只确认一个会改变后续方案的高价值决策。",
      },
      choices: [
        {
          choice_id: `choice-${campaignId}-${levelId}-evidence`,
          label: "先定义证据与边界",
          impact_preview: "后续优先建立可验证证据，并保留停止条件。",
        },
        {
          choice_id: `choice-${campaignId}-${levelId}-speed`,
          label: "先做最小可逆试验",
          impact_preview: "后续优先做低成本、可回退的模拟验证。",
        },
        {
          choice_id: `choice-${campaignId}-${levelId}-review`,
          label: "先安排独立复核",
          impact_preview: "后续优先补齐独立审查和缺陷关闭证据。",
        },
      ],
      goal_preview: `目标预览：完成${title}，保留证据状态与安全边界。`,
      cognition_map_delta: cognitionDelta(campaignId, levelId),
      reward: {
        title: `${title}决策记录`,
        artifact_ids: [`artifact-${campaignId}-${levelId}`],
      },
      next_level_id: nextLevelId,
    };
  });

  if (levels.length !== 7) {
    throw new Error("每个战役必须且只能包含 7 个主线关卡。");
  }
  return levels as CampaignContent["levels"];
}

function makeCampaign(
  campaignId: CampaignId,
  title: string,
  description: string,
  definitions: ReadonlyArray<readonly [string, string]>,
): CampaignContent {
  return {
    campaign_id: campaignId,
    title,
    description: `${description} 所有内容均为模拟、改编或脱敏示例。`,
    provenance: SIMULATED_PROVENANCE,
    levels: makeLevels(campaignId, definitions),
  };
}

export function createDefaultQuestContent(): QuestContent {
  return {
    project_goal: {
      summary: "在公开安全的模拟场景中完成双战役，并锻造可执行的 Codex Goal。",
      success_criteria: [
        "完成学习认知与科研决策两个战役的各 7 个主线关卡",
        "知识仅按 Candidate → Confirmed → Verified 单向迁移",
        "通过包含应用、概念理解和迁移的最终考试",
        "导出符合冻结合同的完整 Codex Goal 与 game-state",
      ],
      constraints: [
        "纯前端运行，不依赖后端、API Key 或私有数据",
        "所有示例均显式标注为模拟、改编或脱敏",
        "不把演示得分或游戏化体验表述为科研效果证据",
      ],
    },
    prologue: {
      task: "选择本次任务的首要控制原则。",
      estimated_time: { min: 1, max: 2, unit: "minutes" },
      question: {
        question_id: "question-prologue-control",
        prompt: "哪项原则应成为本次模拟任务的第一道闸门？",
        purpose: "冻结贯穿双战役的首要控制原则。",
      },
      choices: [
        {
          choice_id: "choice-prologue-evidence",
          label: "证据先行",
          impact_preview: "先区分事实、推断和待验证假设。",
        },
        {
          choice_id: "choice-prologue-safety",
          label: "安全先行",
          impact_preview: "先排除敏感信息和不可逆操作。",
        },
      ],
      goal_preview: "目标预览：建立公开、安全、可验证的受控闭环。",
      cognition_map_delta: {
        candidate_added: [],
        confirmed_added: [],
        verified_added: [],
        known_unknowns_added: [],
        misconceptions_corrected: [],
      },
      reward: {
        title: "受控闭环通行证",
        artifact_ids: ["artifact-prologue-pass"],
      },
    },
    campaigns: {
      learning_cognition: makeCampaign(
        "learning-cognition",
        "学习认知战役",
        "把输入转为可验证的认知地图。",
        LEARNING_LEVELS,
      ) as QuestContent["campaigns"]["learning_cognition"],
      research_decision: makeCampaign(
        "research-decision",
        "科研决策战役",
        "把候选路线转为有边界、有验证和退出条件的决策。",
        RESEARCH_LEVELS,
      ) as QuestContent["campaigns"]["research_decision"],
    },
    prompt_clues: [
      {
        clue_id: "clue-controlled-loop",
        clue_type: "workflow-clue",
        text: "一次只提出一个会改变后续方案的高价值问题。",
        source_kind: "public-context",
        evidence_status: "verified",
      },
      {
        clue_id: "clue-effect-unknown",
        clue_type: "failure-clue",
        text: "游戏化是否提升长期理解仍待用户研究验证。",
        source_kind: "sanitized-context",
        evidence_status: "retrieval-limited",
      },
    ],
    exam: {
      pass_threshold: 80,
      questions: [
        {
          question_id: "exam-decision-application",
          category: "decision-application",
          prompt: "在新的模拟分歧中，应用已冻结的决策并说明停止条件。",
          question_type: "application",
        },
        {
          question_id: "exam-concept-understanding",
          category: "concept-understanding",
          prompt: "解释为何 Confirmed 知识不能直接计入 Verified 正式得分。",
          question_type: "short-answer",
        },
        {
          question_id: "exam-transfer",
          category: "transfer",
          prompt: "把受控闭环迁移到另一个脱敏任务，并指出至少一个失效边界。",
          question_type: "application",
        },
      ],
    },
  };
}
