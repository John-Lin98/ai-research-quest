# Research Quest Self-Improvement Protocol

## 目标

让 Research Quest 随真实使用持续改善，同时把**个人适应**与**全局 Skill 进化**严格分离。

核心原则：

> Personal Evolution 可以非常快、非常个性化；Global Evolution 必须来自跨用户共同痛点，并经过更严格的独立评测。

系统同时有两条轴：

1. **进化范围**：Personal / Global；
2. **变更权限**：Mutable / Protected。

---

## 1. Two-Level Evolution

### Level 1｜Personal Evolution

目标：先让 Research Quest 对当前用户越来越好用。

```text
单个用户真实使用
→ Experience Ledger
→ 发现纠错 / 偏好 / 重复失败 / 有效模式
→ local-policy.md
→ 下一次 Quest 立即读取
→ 个性化行为持续优化
```

允许强个性化：
- 表达风格；
- Grill 深度；
- 是否偏好表格、方案比较或直接执行；
- 常见项目类型；
- 搜索/验证节奏；
- do-not-repeat；
- 已验证有效的工作习惯。

默认私有路径：

```text
<project>/.research-quest/experience-ledger.jsonl
<project>/.research-quest/local-policy.md
```

Personal Evolution **不要求跨用户一致性**，只要求：
- 对该用户有明确证据；
- 不违反 Protected Layer；
- 可以随时回滚；
- 不把个人偏好自动写入公共 Skill。

### Level 2｜Global Evolution

目标：只把**多个不同用户共同遇到的问题**固化进公共 Research Quest。

```text
多个用户 / 多来源的脱敏反馈
→ 语义 pattern_key
→ 跨用户聚合
→ Common Pain Gate
→ Candidate Mutation
→ Champion–Challenger Replay
→ Risk Gate
→ PR
→ Auto-promote or Human Approval
```

Personal Experience 不能直接升级为 Global Rule。

一个个人事件最多只能成为：

```text
personal lesson
→ global candidate signal
```

只有出现跨用户重复证据后才进入 Global Evolution。

---

## 2. Experience Event

推荐事件类型：

- `user_correction`
- `repeated_question`
- `goal_drift`
- `excessive_scaffolding`
- `duplicate_search`
- `repeated_failure`
- `unverified_claim`
- `bad_grill`
- `tool_or_workflow_failure`
- `successful_pattern`
- `user_override`

推荐字段：

```text
id
event_type
pattern_key
symptom
evidence_summary
impact
root_cause_candidate
lesson
do_not_repeat
proposed_change_scope
privacy_status
```

### pattern_key

`pattern_key` 是可跨会话比较的语义问题签名，例如：

```text
grill.low_value.choice_over_blind_spot
ui.dashboard.over_scaffolded
search.duplicate_parallel_routes
memory.repeated_same_root_cause
verification.self_judge_promoted_fact
```

Personal Ledger 可以暂时只有 coarse pattern；但 **Global auto-promotion 必须使用明确 pattern_key**，不能只按宽泛的 `event_type` 合并。

---

## 3. Privacy Firewall

默认不上传完整聊天。

不得自动进入公共反馈：
- 私有代码；
- 未公开科研结果；
- 路径、凭据、身份信息；
- 用户文件原文；
- 可以反推出具体项目的信息。

Global Evolution 默认采用 **opt-in sanitized feedback**。

推荐导出的公共信号只包含：

```text
pattern_key
event_type
impact
proposed_change_scope
optional sanitized lesson
anonymous source bucket
```

默认不包含完整 `symptom` / `evidence_summary`。

---

## 4. Personal Fast Loop

有文件写入能力时：

1. 关键纠错、失败或成功模式 → 写入 Experience Ledger；
2. 聚类本地事件；
3. 生成 `local-policy.md`；
4. 下一次 Quest 启动时读取；
5. 若本地策略导致新问题，立即回滚相关规则。

本地策略优先服务当前用户，不要求“对所有人都好”。

但不得覆盖：
- 用户最新指令；
- 隐私与安全；
- Candidate → Confirmed → Verified；
- 外部事实必须验证；
- 用户对最终决策的控制权。

---

## 5. Global Common-Pain Gate

Global mutation 至少需要满足：

### 5.1 跨用户证据

默认：
- 同一明确 `pattern_key`；
- 来自多个 distinct source buckets；
- 最低阈值建议 ≥3 个独立来源；
- 单个用户重复 20 次不能伪装成 20 个用户的共同痛点。

### 5.2 不是个人偏好

以下通常保持 Personal：
- 喜欢更长/更短回答；
- 特定学科术语偏好；
- 项目路径、工具、GPU 习惯；
- 个人审批节奏。

以下更可能进入 Global：
- 已知信息被重复询问；
- 高级用户仍被迫做基础选择题；
- 多 Agent 重复同一路线；
- AI 自评把事实错误升级；
- 失败经验没有阻止重复失败；
- Skill 阻塞用户明确执行请求。

### 5.3 多样性要求

Global replay 必须覆盖不同用户类型 / 任务类型，避免只对最近几次会话过拟合。

---

## 6. Champion–Challenger

公共 Skill 永远保留当前稳定版 **Champion**。

候选修改是 **Challenger**。

```text
Champion
   vs
Challenger
   ↓
historical replay
+ held-out tasks
+ different user/task cohorts
+ safety regression
+ cost / latency
   ↓
Challenger truly better?
```

Challenger 只有在：
- 目标问题明显改善；
- 关键能力无回归；
- 成本没有不可接受恶化；
- 安全/隐私/证据纪律通过；

才允许进入 Promotion Gate。

---

## 7. Risk-Based Autonomy｜已批准方案 B

### Mutable Layer｜低风险，可自动晋升

示例：
- Prompt / wording；
- Grill 选题启发式；
- Search policy；
- Memory 格式；
- tool routing；
- workflow efficiency；
- 非敏感 UI 行为；
- 测试与文档增强。

满足全部条件时，可以：

```text
auto mutation
→ eval
→ Champion–Challenger PASS
→ PR
→ required checks PASS
→ auto merge
→ auto release
```

### Protected Layer｜高风险，必须人工审批

包括：
- 隐私策略；
- 安全规则；
- Candidate / Confirmed / Verified 证据纪律；
- 外部事实验证要求；
- evaluator integrity；
- telemetry / 用户数据收集范围；
- Promotion Gate 本身；
- 用户 agency / 最终控制权。

任何触及 Protected Layer 的 mutation：

```text
自动发现
→ 自动提出
→ 自动测试
→ PR
→ 人类审批
→ 才可 merge
```

系统不得自行降低自己的保护门。

---

## 8. Personal Champion Constitution

Personal Evolution 允许高度个性化，但采用**硬门 + 优化目标**，而不是把所有指标加权成一个总分。

### Objective Hard Gates

Personal Challenger 必须全部通过：

1. **Truth Gate**：事实正确性、事实核验和不确定性校准不低于 Champion；
2. **Task Success Gate**：核心任务成功率不低于 Champion；
3. **Evidence Integrity Gate**：不能降低证据门槛、隐藏负结果或把 Candidate 伪装成 Verified；
4. **Independent Judgment Gate**：在用户假设存在问题时，仍应提出必要反例、冲突证据和风险；
5. **Protected Layer Gate**：隐私、安全、evaluator integrity、telemetry 范围、Promotion Gate 和 user agency 无回归。

任何一个 Hard Gate FAIL：

```text
Personal Challenger → REJECT / ROLLBACK
```

不允许用更高的满意度、风格匹配或更少摩擦抵消。

### Risk-Tiered Non-Inferiority｜已批准方案 C

Hard Gates 的比较方式按风险分级：

| 风险 | 典型对象 | 晋升规则 |
| --- | --- | --- |
| Critical / Protected | privacy, safety, evidence integrity, evaluator integrity, memory write gate, user agency | zero tolerance |
| High | 科研事实、研究 claim、independent judgment | 明确的小 non-inferiority margin + held-out evidence |
| Medium | 一般 task success、workflow、tool routing | 任务级显式 margin + held-out evidence |
| Low | formatting、verbosity、noncritical UX | Objective Gates 通过后再优化 utility |

约束：
- margin 必须预先声明并记录 `margin_source`；
- 未声明 margin → 0；
- Challenger 不得修改自己的 promotion margin；
- evidence 不足 → `insufficient_evidence`，不能自动晋升；
- Protected 指标不允许用统计波动作为放宽理由。

具体数值阈值需要基于真实 replay 分布单独审批，不在基础 Skill 中拍脑袋写死。

### Personal Utility Optimization

Hard Gates 全部 PASS 后，再优化：

- user fit；
- fewer unnecessary questions；
- fewer manual corrections；
- preferred workflow；
- lower cost / latency；
- better tool routing；
- clearer reporting；
- better continuity across projects。

```text
PROMOTE
=
all Objective Hard Gates PASS
AND
Personal Utility > Champion
```

### Anti-sycophancy rule

“更懂用户”不等于“更赞同用户”。

当用户偏好与事实、实验结果或独立判断冲突时：

> Truth / Task Success / Evidence Integrity 优先。

该规则属于 **Protected Layer**，Personal 或 Global Self-Improvement 都不得自动放宽。

### Personal Memory Write Gate

Personal Agent 的“记住”也是一次高风险状态更新。

- `local-policy.md` 只能写行为偏好、协作经验、do-not-repeat 与验证过的有效模式；
- 事实性内容必须保留 source / attribution / scope / evidence status，并存入 Context/Memory，而不是 behavioral policy；
- `policy_kind=factual` 的 Experience Event 不得进入 local-policy；
- 重复出现不能自动把 Candidate 事实升级为 Confirmed/Verified；
- 用户偏好和用户事实必须区分：偏好可由用户直接 Confirm，外部事实仍需验证。

---

## 9. Mutation Contract

每个 mutation 必须写清：

- evolution_scope: personal / global；
- risk_class: mutable / protected；
- 当前问题；
- 支持证据；
- cross-user support（global only）；
- 修改文件 / 规则；
- 预期改善；
- 回归风险；
- replay / held-out 设计；
- promotion criteria；
- rollback criteria。

---

## 10. Eval Gate

至少检查：

1. No-repeat；
2. High-value Grill；
3. Evidence discipline；
4. Search diversity；
5. Failure memory；
6. User agency；
7. Personal-fit（Personal Evolution）；
8. Cross-user generalization（Global Evolution）。

推荐指标：

- 重复问题率；
- 用户纠错率；
- Goal 大改次数；
- 重复失败率；
- 首次可执行动作所需轮数；
- Useful Novel Evidence / cost；
- held-out replay 成功率；
- 不同 user/task cohort 的回归率。

---

## 11. Global Feedback Pipeline

默认不开启隐式遥测。

推荐：

```text
local private ledger
→ explicit opt-in export
→ sanitized feedback bundle
→ aggregate multiple source buckets
→ common-pain report
→ global mutation candidate
```

仓库可提供工具来：
- 导出脱敏 bundle；
- 聚合多个 bundle；
- 统计 distinct sources；
- 生成 common-pain candidate。

但是否上传由用户/部署环境明确决定。

---

## 12. Rollback

以下任一情况立即回滚：
- safety / privacy 回归；
- 证据纪律削弱；
- user agency 下降；
- held-out 关键退化；
- Global change 只改善单一用户群；
- 自动化无法解释新版为什么更好。

---

## 13. 推荐维护流程

```text
Personal:
use → ledger → local-policy → immediate adaptation

Global:
opt-in sanitized signals
→ common-pain clustering
→ mutation
→ champion–challenger
→ risk gate
→ PR
→ auto-promote mutable / human-approve protected
→ release
```

这使 Research Quest 形成真正的两级进化：

> **先为每个用户变得更懂他，再只把所有用户共同受益的部分升级成公共能力。**
