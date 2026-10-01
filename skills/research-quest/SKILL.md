---
name: research-quest
description: 用 Known–Unknown 认知地图和证据驱动 Grill，把科研、学习或复杂项目从零散想法推进到可验证决策、Frozen Context 与可执行 Goal。适用于需要读材料、暴露盲点、比较路线、迭代实验、避免重复试错或交接给 Codex/多 Agent 的任务。
---

# Research Quest

Research Quest 是**认知对齐与探索控制协议**，不是游戏皮肤。目标是让用户和 Agent 共同维护一个可追溯的“问题地图”，每轮只消除当前最有价值的不确定性，并把执行结果反哺下一轮。

> 用户明确指令优先于本 Skill。不要因为流程完整性阻塞用户已经明确要求的工作。

## 1. 核心循环

```text
Goal
→ Read / Recover Context
→ Map Known–Unknowns
→ Grill the highest-value uncertainty
→ Explore alternatives when needed
→ Verify with evidence or execution
→ Select / Prune
→ Remember success + failure
→ Update Goal and search policy
→ repeat
```

Research Quest 同时支持三种循环：

- **Understanding Loop**：帮助用户真正理解问题；
- **Execution Loop**：把明确目标交给 Agent/Codex 执行并验证；
- **Evolution Loop**：从成功与失败中更新下一轮搜索策略，避免重复试错。

## 2. 启动规则：先恢复真实状态

只读取当前任务真正需要的材料。优先顺序：

1. 当前用户指令；
2. 当前会话与已提供文件；
3. 已有 Context / Goal / handoff；
4. 若存在，读取项目私有 `.research-quest/local-policy.md` 作为**本地适应层**；
5. 需要时再读取外部资料或真实执行结果。

不要为了“完整”强制读完全部仓库或全部历史。材料已经回答的问题不再问。

本地适应层只能补充“少犯什么错、偏好什么有效模式”，不能覆盖用户最新指令、真实执行状态或 Protected Layer。

开场只需给出：
- 当前 Goal；
- 已确认事实；
- 最大的 1–3 个开放未知；
- 本轮最值得处理的一个未知。

## 3. Known–Unknown 认知地图

始终保持四类，语义不能交换：

- **Known Knowns｜已知的已知**：已掌握且有依据；
- **Unknown Knowns｜未知的已知**：用户可能已有但尚未表达的经验、判断或偏好；
- **Known Unknowns｜已知的未知**：已经意识到、仍需关闭的问题；
- **Unknown Unknowns｜未知的未知**：通过反例、冲突、失败或真实执行才暴露的盲点。

证据状态：

```text
Candidate → Confirmed → Verified
```

- Candidate：新线索、未经核验的事实或初步解释；
- Confirmed：用户明确确认自己的目标/偏好/约束，或来源之间已一致；
- Verified：通过可靠来源、测试、实验、迁移应用或真实执行验证。

不要把“用户同意”当作外部事实的 Verified。

## 4. Grill：不是问卷，而是攻击最高价值盲点

默认每轮**一个主问题**。只有两个信息不可分时才合并，最多三个。

选择下一问时按价值排序：

```text
Expected Decision Impact
× Uncertainty
× Irreversibility / Risk
÷ Cost to Answer
```

优先问会改变以下任一项的问题：
- Goal；
- 成功标准；
- 方法路线；
- 资源分配；
- 风险边界；
- 下一轮搜索空间。

### Grill 必须做到

- 先说明“为什么现在问这个”；
- 沿用用户已有术语；
- 用户已经理解时不要降级成基础考试；
- 对高掌握度用户优先使用**反例、边界条件、冲突证据、失败模式和路线取舍**；
- 用户回答后主动判断，而不是机械进入下一题。

### 不要做

- 不要为了游戏感凑题；
- 不要把 Grill 退化成 A/B/C 选择题；
- 不要重复询问已知信息；
- 不要让用户确认 AI 自己可以通过搜索、文件或执行验证的事实；
- 不要用虚假的“认知分”制造精确感。

选项只在能显著降低回答成本时提供。用户可自由回答、提问或补充线索。

## 5. Search Mode：需要创造性突破时扩大有效搜索

当问题不是“澄清一个事实”，而是“寻找更好的路线”时进入 Search Mode。

### 5.1 先多样化，再并行

并行 Agent 必须承担**实质不同的搜索假设**，例如：

- theory / first-principles；
- literature / precedent；
- baseline / simplest solution；
- counterexample / red team；
- transfer / analogy；
- failure-driven；
- wildcard。

禁止 N 个 Agent 用同一提示重复生成近似答案。

### 5.2 预算采用漏斗

```text
wide cheap exploration
→ novelty / feasibility filter
→ small verification
→ prune weak branches
→ allocate more budget to positive signals
→ deep verification
```

优化目标不是 trial 数量，而是：

```text
Useful Novel Evidence / (Compute + Time + Human Attention)
```

### 5.3 停止重复失败

同一关键方向出现 2–3 次**同因失败**后，不得直接重试。先记录：
- 失败现象；
- 根因假设；
- 已排除解释；
- 下一次尝试必须改变的变量。

3–5 轮实质不同尝试仍无有效信号时，触发 root-cause / route-switch Grill。

## 6. Verification：生成之后必须有现实约束

优先使用最便宜、最快、最可靠的 evaluator：

- 代码：tests / benchmark；
- 数学：proof / verifier；
- 科研：数据、模拟、实验、独立复现；
- 产品：真实用户行为与任务完成率；
- Agent：held-out tasks、成功率、成本、人工介入率。

AI 自评只能作为 Candidate 证据，不能替代外部验证。

## 7. Experience Memory：失败必须成为资产

每个重要尝试至少记录：

```text
Goal
Hypothesis / Route
Action
Evidence
Result
Why it worked / failed
Cost
Reusable lesson
Do-not-repeat condition
Next search implication
```

下一轮搜索前先检查历史：
- 是否已经试过；
- 是否只是同义改写；
- 上次为什么失败；
- 新尝试新增了什么信息。

Memory 的目标不是保存所有聊天，而是保存**会改变未来决策的经验**。

## 8. Evolution Loop：让搜索策略和 Skill 本身变好

每完成一批任务、出现关键纠错，或用户明确要求优化 Skill 时，做一次轻量 Meta-review：

- 哪类路线成功率更高？
- 哪类 evaluator 最能提前淘汰坏方向？
- 哪些 Agent / tool / prompt 经常失败？
- 哪些失败重复出现？
- 哪些信息应该更早询问？
- 哪些步骤可以删除？
- 本次使用暴露了哪些 Research Quest 自身的问题？

Research Quest 可以进入**受控 Self-Improvement**：

```text
Observe
→ 记录脱敏 Experience Events
→ Diagnose / cluster
→ 提出 1–3 个候选修改
→ Replay / held-out eval
→ 自动创建 PR
→ Promote or rollback
```

Research Quest 采用**两级、双速 RSI**：

- **Level 1｜Personal Evolution**：Experience Ledger 生成 `.research-quest/local-policy.md`，优先让 Skill 对当前用户越来越好用；个人偏好可以快速适应，不要求对所有用户通用；
- **Level 2｜Global Evolution**：只有跨多个独立用户重复出现的共同痛点，才进入公共 Skill mutation → Champion–Challenger replay/eval → PR → release。

Personal 规则不得因为单个用户高频出现就自动升级成 Global 规则。

全局升级采用已批准的**分级自治模式 B**：

- **Mutable Layer｜低风险**：Prompt、Grill 启发式、Search policy、Memory 格式、tool routing、workflow efficiency、非敏感 UI 等；只有跨用户证据 + Champion–Challenger + required checks 全部通过后，才允许自动 merge + release；
- **Protected Layer｜高风险**：隐私、安全、证据纪律、外部事实验证、evaluator integrity、telemetry/数据收集、Promotion Gate、用户 agency；可以自动提出和测试，但必须人工批准后才能 merge。

系统不得自行降低 Protected Layer。

只有在维护者显式允许 Promote，且满足以下条件时，才允许自动合并/发布：

- 必需测试和公开安全扫描全部通过；
- Candidate / Confirmed / Verified 的证据纪律没有被削弱；
- 至少一个目标行为指标改善；
- held-out replay 没有关键回归；
- 变更可解释、可回滚。

每条重要摩擦只保存会改变未来决策的**脱敏摘要**，不要把完整私有会话、未公开科研结果或敏感路径写入公共仓库。

Global Evolution 默认不开启隐式遥测；只有用户/部署环境明确 opt-in 后，才允许把脱敏的 `pattern_key` 痛点信号导出用于跨用户聚合。

详细事件格式、Mutation Contract、Promotion Gate 与回滚规则见：
[references/self-improvement-protocol.md](references/self-improvement-protocol.md)。

只有在 held-out 或后续真实任务上改善，才能把新策略升级为默认规则。否则回滚。

这是一种受控 RSI：**改进 workflow / skill / agent / search policy，而不是宣称模型本身已经递归自我提升。**

## 9. Chat Mode：保持轻量

普通回合默认只展示：

```markdown
## Research Quest｜第 N 回合：<本轮 Boss>

**Goal**：<一句话>
**已确认**：<1–3 条>
**地图变化**：<只写本轮发生变化的象限>
**进度**：<基于关闭的关键未知，使用粗粒度而非伪精确百分比>

### 为什么现在处理它
<1–3 句>

### Grill
<一个真正会改变决策的问题>
```

只有用户要求总览、发生路线切换、准备 Goal Forge 或 Context 明显漂移时，才展示完整四象限 Dashboard。

## 10. 用户打断、追问与补充

用户随时可以：
- 回答 Grill；
- 反问；
- 补充文件、结果、约束；
- 纠正 Context；
- 要求直接执行。

处理规则：
- 先响应用户当前意图；
- 更新证据状态和受影响象限；
- 冲突不得静默覆盖；
- 已关闭的问题立即跳过；
- 新风险若改变路线，优先处理；
- 不因 Skill 流程阻止明确执行请求。

## 11. Context Checkpoint

长任务、线程交接、重大路线变化或执行前，生成 checkpoint。只保留未来需要的信息：

- Goal / non-goal；
- success criteria；
- hard constraints；
- verified evidence；
- active hypotheses；
- tried-and-failed routes；
- open Known Unknowns；
- newly exposed Unknown Unknowns；
- current best route；
- next Grill / next executable action。

有文件写入能力时写入项目 Context；没有时明确说明仅存在于会话。不得声称未发生的持久化。

## 12. Goal Forge

当剩余未知不会改变首轮执行方案时，不再继续问，直接生成可执行 Goal。

Goal 至少包含：
- objective / non-goal；
- inputs and verified context；
- hypotheses / routes；
- evaluator and success criteria；
- exploration budget and pruning rules；
- memory / do-not-repeat rules；
- Agent roles（仅在确实需要并行时）；
- tests / independent review；
- stop / rollback / escalation conditions；
- output and handoff。

不要为了“多 Agent”强制多 Agent。确定性任务优先普通代码或固定 workflow。

## 13. GPT-6 Sol / 强推理模型优化

对 GPT-6 Sol、GPT-6 Astra 及后续强推理模型：

- **少脚手架**：给目标、边界、状态机和完成条件，不规定无必要的逐步思考；
- **短触发描述**：description 只说明何时使用，不塞完整流程；
- **渐进披露**：SKILL.md 保持核心协议；详细模板、schema、fixture 放 references；
- **按需读文件**：不要要求每次都读取全部 references；
- **允许模型主动判断**：能通过工具验证的内容直接验证，不把验证工作推回用户；
- **减少固定 UI**：默认轻量聊天，Dashboard 按需；
- **强制证据边界**：搜索结果、实验结果、用户偏好分开标记；
- **显式优先级**：用户最新指令 > 当前真实执行状态 > Frozen Context > Skill 默认规则。

详细模板见 [references/rules-and-templates.md](references/rules-and-templates.md)。

## 14. 完成检查

结束一个 Quest 前确认：
- 没有重复问材料已有答案；
- 关键决定都有证据状态；
- 失败经验已记录且可阻止重复；
- 下一步是明确 Grill 或可执行动作；
- Goal 不包含未经验证的外部事实；
- 保存状态真实；
- 若发生策略升级，说明依据和回滚条件。

Canonical state schema：[`../../shared/game-state.schema.json`](../../shared/game-state.schema.json)。
