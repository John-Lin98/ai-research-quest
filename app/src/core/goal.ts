import type { GameState } from "../types/index.ts";

function list(items: string[], fallback: string): string {
  return (items.length > 0 ? items : [fallback])
    .map((item) => `- ${item}`)
    .join("\n");
}

export function generateCodexGoal(state: GameState): string {
  const frozenDecisions = state.decisions
    .filter((decision) => decision.status !== "superseded")
    .map((decision) => decision.summary);
  const verifiedKnowledge = state.known_knowns.verified.map(
    (knowledge) => knowledge.statement,
  );
  const pendingKnowledge = [
    ...state.known_knowns.candidate,
    ...state.known_knowns.confirmed,
  ].map((knowledge) => `${knowledge.status}: ${knowledge.statement}`);
  const knownUnknowns = state.known_unknowns
    .filter((item) => item.status !== "resolved")
    .map((item) => item.statement);
  const unknownKnowns = state.unknown_knowns
    .filter((item) => item.status !== "resolved")
    .map((item) => item.statement);
  const unknownUnknowns = state.unknown_unknowns
    .filter((item) => item.status !== "resolved")
    .map((item) => item.statement);
  const demoBoundary = state.interaction_mode === "auto-demo"
    ? "当前为自动演示轨迹；其中的状态迁移只用于展示流程，不构成用户 Verified 或正式理解分。"
    : "当前为用户互动轨迹；只有完成小测并经 Candidate → Confirmed → Verified 的知识可计入正式理解分。";

  return `# Codex Goal：AlphaFold2 酶活性位点几何公开试点

## 1. 真实科研问题

设计并执行一个公开、可复现的 10 个酶目标试点，评估 AlphaFold2 / AlphaFold DB 预测是否足以支持酶活性位点几何的初步筛选。

本任务不验证催化活性、配体结合、药物发现效果或实验成功率。所有结果只解释公开试点中局部结构几何的适用性、覆盖率与失败模式。

- 当前目标：${state.project_goal.summary}
- 工作模式：Goal-driven Research Quest；游戏循环负责建立认知地图，Goal 循环负责继续执行真实任务。
- 交互原则：一次只处理一个会改变后续方案的关键问题，同时完成当前可安全执行的工作。
- 认知规则：Known Knowns 内部使用 Candidate → Confirmed → Verified，只有 Verified 计入正式理解。
- 演示边界：${demoBoundary}

## 2. Known–Unknown 四象限

### Q1｜Known Knowns：已验证认识

${list(verifiedKnowledge, "尚无来自真实执行的 Verified 结果；不要把计划或演示轨迹当成实验结论。")}

### Q1｜Known Knowns：待补证认识

${list(pendingKnowledge, "没有待补证的 Candidate 或 Confirmed。")}

### Q2｜Known Unknowns：用户明确知道还缺少的答案

${list(knownUnknowns, "执行中持续记录数据可得性、映射失败、构象差异与局部误差边界。")}

### Q3｜Unknown Knowns：用户可能已掌握但尚未表达的经验与偏好

${list(unknownKnowns, "通过解释理由、方案比较、过去经验和迁移题继续提取用户的隐含知识与偏好。")}

### Q4｜Unknown Unknowns：用户和 AI 起初都未预见的问题

${list(unknownUnknowns, "通过失败样本、冲突证据、真实执行和独立审查继续暴露隐藏风险与机会。")}

四个象限必须在每轮执行后更新，并用于调整下一轮问题难度、Agent 分工和 Goal 版本。

## 3. 公开输入合同

每个候选目标必须同时具备：

- AlphaFold DB 可下载预测模型与逐残基 pLDDT；
- 可公开下载且与目标序列可可靠映射的实验 PDB 结构；
- 可追溯的催化或活性位点残基注释；
- 明确的链、残基编号、序列覆盖率、缺失残基与结构状态；
- 允许公开复现和再分发分析结果的来源说明。

所有纳入、排除和映射失败都必须写入 manifest，不得静默删除失败样本。

## 4. 冻结成功标准

${list(state.project_goal.success_criteria, "完成 10 个公开酶目标的试点分析。")}

额外量化要求：

- 计划纳入 10 个公开酶目标；
- 至少 8 个目标完成有效序列映射、结构对齐和局部几何分析；
- 每个目标都有来源、输入哈希、处理状态、结果路径和失败码；
- 结果必须同时包含全局结构、局部活性位点、pLDDT 分层与有效覆盖率；
- 最终报告必须区分事实、分析结果、合理解释和仍待验证的问题。

## 5. 已冻结决策

${list(frozenDecisions, "按照本 Goal 的默认公开试点合同执行，不重新扩大任务范围。")}

## 6. 数据与区域定义

1. 从公开来源建立 10 个目标的候选清单。
2. 优先选择单体酶、序列可精确映射、有实验结构且有公开催化残基注释的目标。
3. 记录 AlphaFold DB 版本、模型文件、实验 PDB、链、实验方法和公开注释来源。
4. 先做序列映射，再进行结构对齐；不得只按残基编号或坐标最近邻直接配对。
5. 在实验结构中以公开催化残基为锚点，冻结催化残基及固定 6 Å 邻域作为局部分析区域。
6. 对存在配体、辅因子、缺失残基、突变、寡聚状态或构象差异的目标单独记录，不强行混入同一结论。

## 7. 分析指标

每个有效目标至少报告：

- 序列映射覆盖率；
- 全局 TM-score；
- 全局 Cα RMSD；
- 催化残基 Cα / 主链局部 RMSD；
- 固定 6 Å 邻域 Cα / 主链局部 RMSD；
- 活性位点区域平均与最低 pLDDT；
- pLDDT 与局部几何误差的配对关系；
- 纳入、排除、映射失败和解析失败状态。

侧链、配体和对接结果只能作为明确标注的补充探索；不得在缺少配体准备、质子化、搜索框和实验基线控制时作为主结论。

## 8. 多 Agent 并行执行

- Orchestrator：维护 Goal、Known–Unknown 四象限、依赖、任务板和最终集成。
- Source Agent：检索公开目标，维护来源、许可、manifest、哈希与失败码。
- Mapping Agent：完成序列映射、链选择、覆盖率和残基对应审计。
- Analysis Agent：实现全局与局部结构指标，生成逐目标结果和可复现命令。
- Visualization Agent：生成主结果表、pLDDT-局部误差图和逐目标 QA 页面。
- Independent Reviewer：从公开输入和 manifest 重新抽查映射、指标和结论边界，不复用实现者的未验证判断。
- Integrator：精确集成文件、测试与文档，不带入无关或私有资产。

各 Agent 必须使用明确文件所有权，交接内容包含输入、输出、决定、验证、blocker、attempt_round 和下一动作。

## 9. 认知自适应与用户偏好

- Known Knowns 较少时，减少术语，先给具体对比与二选一问题。
- Known Knowns 较多时，使用冲突证据、失败案例、迁移题和方法取舍。
- Known Unknowns 决定下一关要回答的核心问题。
- Unknown Knowns 通过解释理由、过去经验和用户主动追问暴露，并转入 Candidate / Confirmed。
- Unknown Unknowns 通过真实执行、反例和失败发现；发现它们视为认知进展，不视为玩家失败。
- 用户主动提出的新问题应先被回答或运行，再归入四象限并更新 Goal。

## 10. 执行步骤

1. 建立公开数据源与目标候选表。
2. 冻结纳入、排除、序列一致性和结构状态规则。
3. 先对 2 个目标运行端到端 smoke，验证下载、映射、对齐、局部区域与指标。
4. smoke 通过后扩展至 10 个目标。
5. 对每个目标生成机器可读 JSON/CSV 与人类可读 QA 摘要。
6. 汇总全局结构、局部位点、pLDDT、覆盖率和失败码。
7. 对“全局表现良好但局部位点误差较大”的目标单独进行失败分析。
8. 启动独立 Reviewer，复核至少 3 个有效目标和全部失败目标。
9. 将执行结果回写四象限：关闭已回答的 Known Unknown，暴露新的 Unknown Known / Unknown Unknown，并升级有证据的 Known Known。
10. 修复 P0/P1 后重新运行测试与结果生成。
11. 创建中文 PR，列出数据来源、实现、指标、实际结果、四象限变化、边界和复现命令；检查通过后安全合并。

## 11. 验证

至少验证：

- 下载文件可追溯且哈希稳定；
- 序列映射和链选择有测试；
- 全局与局部指标有合成 fixture 或已知结构对照；
- 6 Å 区域定义在分析前冻结；
- 失败样本不会被静默丢弃；
- 汇总表可从逐目标结果重新生成；
- 图表数字与 CSV 一致；
- README 可让新用户复现 smoke；
- 公开安全扫描不含个人信息、凭据、私有路径或未公开资产。

## 12. 结果与结论边界

允许回答：

- 在本公开试点中，哪些目标的活性位点局部几何与实验参考较一致；
- 哪些目标出现整体折叠合理但局部区域不适合直接使用；
- pLDDT 与局部误差是否在本试点中呈现可观察关系；
- 数据覆盖、映射和结构状态造成了哪些失败。

不得回答：

- AlphaFold2 已证明目标酶具有正确催化活性；
- 高 pLDDT 证明配体位置、辅因子状态或化学构型正确；
- 本试点证明预测结构可以替代湿实验；
- 页面演示分数或自动测试证明 Research Quest 提升科研能力。

## 13. 失败重试与根因分析

不得因第一次数据、映射、构建、测试或权限失败而停止。

对同一关键问题执行 3–5 轮实质不同的修复尝试，每轮记录：

- 根因假设；
- 执行动作；
- 实际结果；
- 新证据；
- 下一轮假设。

连续 3–5 轮仍失败时，生成 root_cause_analysis.md，包含最小复现、日志、已排除原因、最可能根因、置信度、最大可交付子集与恢复条件，然后安全退出该问题。其他不依赖该 blocker 的工作继续完成。

## 14. Goal-driven 执行与交付

Goal Forge 后默认继续执行，而不是只输出提示词：

```text
Goal Forge
→ Agent 分工
→ 工具与代码执行
→ 实际验证
→ 四象限回写
→ Goal 修订或最终交付
```

除非用户明确只要求 Goal 文本，否则不得在生成 Goal 后停止。

交付物：

- 公开目标 manifest；
- 下载与来源记录；
- 序列映射和结构对齐脚本；
- 全局与局部指标实现；
- 逐目标结果 JSON/CSV；
- 主结果表与校准图；
- 覆盖率和失败码报告；
- 至少 3 个代表目标的 QA 页面；
- 四象限认知地图变化报告；
- 独立审查报告；
- root cause 报告（如发生）；
- 中文 PR、测试记录、合并提交和完成报告。

---

生成状态：schema ${state.schema_version}；revision ${state.revision}；正式理解分 ${
    state.metrics.formal_understanding_score ?? "待最终考试"
  }。`;
}
