# Research Quest v2｜规则与模板

本文件是 `SKILL.md` 的渐进披露参考。若与 `SKILL.md` 冲突，以 `SKILL.md` 为准。

## 1. 核心状态机

```text
Goal
→ Recover Context
→ Known–Unknown Map
→ High-value Grill
→ Search (when needed)
→ Verify
→ Select / Prune
→ Experience Memory
→ Meta-review
→ Goal / Search-policy Update
```

Research Quest 有三层循环：

- **Understanding Loop**：关闭会改变决策的认知空缺；
- **Execution Loop**：真实执行并用 evaluator 验证；
- **Evolution Loop**：从轨迹中更新 Skill / Agent / workflow / search policy。

## 2. 文档与 Context 优先

每轮先判断：

```markdown
- 当前用户真正要求什么：
- 已有材料已经回答什么：
- 已验证事实：
- 当前最大开放未知：
- 这个未知会改变什么：
- AI 能否通过工具/执行自己验证：
```

规则：

- 文档已有答案，不再询问；
- AI 能通过工具验证的事实，不把验证工作推回用户；
- 用户最新指令 > 当前真实执行状态 > Frozen Context > Skill 默认流程；
- 只读取当前任务需要的材料，不为“完整”无条件遍历全部 references。

## 3. Known–Unknown

### Known Knowns｜已知的已知

证据链：

```text
Candidate → Confirmed → Verified
```

- Candidate：新线索、未经核验的事实或初步解释；
- Confirmed：用户明确确认自己的目标/偏好/约束，或多个可靠来源一致；
- Verified：通过可靠来源、测试、实验、迁移或真实执行验证。

### Unknown Knowns｜未知的已知

用户可能已有但尚未表达的：
- 经验；
- 判断；
- 偏好；
- 隐含停止规则；
- 过去失败教训。

优先通过“为什么”“过去发生过什么”“如果 A/B 冲突你选什么”暴露，而不是问抽象偏好。

### Known Unknowns｜已知的未知

每项至少包含：

| 字段 | 内容 |
| --- | --- |
| 问题 | 仍缺少什么 |
| 决策影响 | 会改变什么 |
| 关闭方式 | 用户 / 文档 / 工具 / 执行 |
| 关闭条件 | 什么证据足够 |

### Unknown Unknowns｜未知的未知

来自：
- 反例；
- 冲突证据；
- 失败；
- 现实执行；
- evaluator 被利用；
- 用户纠错。

发现后不扣分，直接决定是否插入风险关或改变路线。

## 4. Grill 选择规则

默认每轮一个主问题。

价值近似：

```text
Decision Impact × Uncertainty × Risk / Cost-to-answer
```

高价值 Grill 应该至少改变一项：
- Goal；
- evaluator / success criteria；
- 方法路线；
- 资源分配；
- 风险边界；
- 下一轮搜索空间。

### 高掌握度用户

优先：
- 反例；
- 边界条件；
- failure mode；
- conflicting evidence；
- route tradeoff；
- evaluator 是否可信。

不要退化成基础定义题或机械 A/B/C。

### 选项何时使用

只有在选项能显著降低表达成本时使用。用户始终可以：
- 自由回答；
- 反问；
- 补充 Context；
- 要求直接执行。

## 5. 默认 Chat Mode

普通回合：

```markdown
## Research Quest｜第 N 回合：<Boss>

**Goal**：<一句话>
**已确认**：<1–3 条>
**地图变化**：<只展示变化的象限>
**进度**：<粗粒度>

### 为什么现在处理它
<1–3 句>

### Grill
<一个会改变决策的问题>
```

不要每轮重复：
- 完整四象限；
- 伪精确百分比；
- 认知分；
- 固定五个选项。

只有以下情况展示完整 Dashboard：
- 用户要求；
- 路线切换；
- Goal Forge 前；
- Context 漂移；
- 线程交接。

## 6. Search Mode

当任务需要创造性突破、方法设计或开放搜索时：

### 路线多样化

可分：
- first-principles；
- literature；
- simplest baseline；
- counterexample / red team；
- transfer / analogy；
- failure-driven；
- wildcard。

多 Agent 必须对应不同假设，而不是 N 次相同 prompt。

### 预算漏斗

```text
cheap broad search
→ novelty / feasibility filter
→ small verification
→ prune
→ allocate to positive signal
→ deep verification
```

推荐优化：

```text
Useful Novel Evidence / (Compute + Time + Human Attention)
```

## 7. Verification

优先最便宜、最快、可靠的外部 evaluator。

| 领域 | 优先 evaluator |
| --- | --- |
| Coding | tests / benchmark |
| 数学 | proof / verifier |
| 科研 | 数据 / 模拟 / 实验 / 独立复现 |
| Agent | held-out task / success rate / cost |
| 产品 | 真实任务完成率 / 用户行为 |

AI 自评只能作为 Candidate 证据。

## 8. Experience Memory

重要尝试记录：

```markdown
- Goal:
- Hypothesis / Route:
- Action:
- Evidence:
- Result:
- Why worked / failed:
- Cost:
- Reusable lesson:
- Do-not-repeat:
- Next search implication:
```

同因失败 2–3 次后禁止机械重试；必须先做 root-cause 或改变变量。

## 9. Self-Improvement｜两级进化

详细协议见 [self-improvement-protocol.md](self-improvement-protocol.md)。

### Level 1｜Personal Evolution

默认私有路径：

```text
<project>/.research-quest/experience-ledger.jsonl
<project>/.research-quest/local-policy.md
```

目标是优先让 Skill 对当前用户越来越好用。个人偏好、项目习惯和 do-not-repeat 可以快速进入 local policy，但不得自动写入公共 Skill。

### Level 2｜Global Evolution

Global Evolution 只吸收跨多个独立用户重复出现的共同痛点。

```text
opt-in sanitized signals
→ pattern_key
→ distinct-source aggregation
→ common-pain gate
→ Champion–Challenger
→ risk gate
→ PR
→ accepted blocked until an approved, frozen executable evidence contract exists
```

单一用户重复很多次不能等价为“很多用户都需要”。

默认不开启隐式遥测；全局反馈必须是明确 opt-in 的脱敏 bundle。

### 分级自治

当前实现 fail-closed：缺少另行批准、冻结且可执行的 evidence-sufficiency / aggregation contract 时，`accepted` 一律以 `insufficient_evidence` 拒绝。以下自治路径是该 contract 落地后的目标；测试通过本身不构成晋升或发布授权。详见 [risk-tiered-promotion.md](risk-tiered-promotion.md)。

- Mutable：Prompt、Grill、Search policy、Memory 格式、tool routing、workflow、非敏感 UI；该 contract、跨用户证据、eval 与 required checks 全通过后才可能自动晋升，merge / release 仍需适当授权；
- Protected：隐私、安全、证据纪律、外部验证、evaluator integrity、telemetry、Promotion Gate、user agency；必须人工审批。

### Personal Champion 真值优先

Personal Challenger 只能在以下 Hard Gates 全部 PASS 后比较个性化收益：

- Truth；
- Task Success；
- Evidence Integrity；
- Independent Judgment；
- Protected Layer。

```text
PROMOTE
=
all hard gates PASS
AND
personal utility improves
```

禁止用“更符合用户偏好 / 更让用户满意”补偿正确性、证据质量或必要反驳能力的下降。

## 10. Context Checkpoint

只保存未来会用到的信息：

```markdown
# Research Quest Context

## Goal / Non-goal
## Success criteria
## Hard constraints
## Verified evidence
## Active hypotheses
## Tried-and-failed routes
## Do-not-repeat
## Known Unknowns
## Unknown Unknowns
## Current best route
## Next Grill / next executable action
## Experience events worth retaining
```

有写入能力时写明确路径；没有则如实说明仅在会话中。

## 11. Goal Forge

当剩余未知不会改变首轮执行时停止追问。

```markdown
# Goal｜<名称>

## Objective / Non-goal
## Verified Context
## Inputs
## Active hypotheses / routes
## Evaluator
## Success criteria
## Exploration budget
## Pruning rules
## Memory / Do-not-repeat
## Agent roles (only if useful)
## Tests / independent review
## Stop / rollback / escalation
## Outputs / Handoff
## Authorization boundaries (approved actions / data / destination; pending approvals)
```

Goal / Frozen Context 不产生额外执行或分享权限。交接必须携带用户已有审批边界；公开导出或对外交接前检查实际输出是否含私有原文、未公开结果、身份、凭据、私有路径或内部 URL。`sanitized` 标记与模式检查不能证明任意文本安全；不确定内容留在本地。

不要为了多 Agent 而多 Agent。确定性工作优先代码或固定 workflow。

## 12. Self-Improvement Mutation Contract

每次 Skill 升级候选必须回答：

```markdown
## Problem
<真实摩擦>

## Evidence
<脱敏事件 / replay / test>

## Mutation
<修改哪些规则/文件>

## Expected improvement
<目标行为>

## Regression risks
<可能变差的地方>

## Eval
<如何证明>

## Promotion gate
<何时合并>

## Rollback
<何时撤回>
```

## 13. 完成检查

- [ ] 没有重复询问已有答案；
- [ ] Grill 会改变实际决策；
- [ ] AI 可验证的内容没有推回给用户；
- [ ] 外部事实没有仅靠自评升为 Verified；
- [ ] 并行搜索具有路线多样性；
- [ ] 重复失败形成 do-not-repeat；
- [ ] Context 只保留未来有价值的信息；
- [ ] Self-Improvement 只保存脱敏事件；
- [ ] Mutation 有 eval、回归风险和回滚条件；
- [ ] 用户要求直接执行时没有被 Skill 阻塞；
- [ ] 保存状态真实可核验。
