# Risk-Tiered Promotion Gate

## 已批准原则 C

Personal / Global Challenger 的 Objective Gates 使用风险分级 non-inferiority，而不是统一加权总分。

```text
Critical / Protected → zero tolerance
High risk → very small, explicitly approved non-inferiority margin
Medium risk → explicit task-level non-inferiority margin
Low risk → optimize utility only after objective gates pass
```

## 为什么不直接固定一个统一百分比

不同指标尺度、样本量和任务风险不同；统一 1% 或 0.5% 会制造伪精确。具体 margin 必须由任务协议定义并记录 margin_source。未定义 margin 时默认为 0。

## Promotion 逻辑

1. Protected / Critical 任一 FAIL → reject；
2. High / Medium objective metrics 必须在 held-out 上满足各自 non-inferiority contract；
3. evidence 不足 → insufficient_evidence，不允许自动晋升；
4. 只有 Objective Gates 全 PASS 后，才比较 Personal Utility；
5. Personal Utility 改善不能抵消任何 Objective Gate 失败。

## 下一步需要单独审批的数值策略

- High-risk 默认 margin 的上限；
- 每类 metric 的最小样本量；
- confidence interval / bootstrap 的置信水平；
- 多指标 gate 是 all-pass 还是关键指标 all-pass + 次要指标 budget；
- 何时需要重复评测。

这些数值不应在未经真实 replay 分布分析前写死。

## 当前机器校验边界｜Fail-closed execution boundary

`validate-promotion-policy.mjs` 校验四级 policy 的结构、已批准的 margin policy / human approval 枚举、必要字段与决策枚举。这个结构检查通过**不代表** Challenger 已通过评测，更不代表可以 merge / release。

`validateMutationPromotion(mutation, policy)` 是供 self-improvement validator 调用的只读校验 hook。`candidate`、`rejected` 和 `rolled-back` 不因尚无晋升证据而失败；`accepted` 必须被阻止，直到另行批准并实现可执行、冻结的 evidence-sufficiency / aggregation contract。当前仓库没有这份 contract。单独声明 `held_out=true`、`approved=true`、`frozen=true`，给出很大的 sample size，或提供一组全部标为 pass 的指标，都不能解除这个阻止。

`promotion_evidence.metrics` 若存在，仅用于输出更具体的诊断，**不是新批准的评测格式或证据协议**。诊断覆盖现有必要字段、finite numeric values、critical margin=0、held-out 必须是真布尔值、FAIL / insufficient_evidence 不得被 personal utility 抵消。方向诊断支持 `higher_is_better` / `lower_is_better`；非零 margin 在缺少可验证、预先批准的来源与适用范围时无法通过。缺失 margin 在回归检查中仍按 0 处理，同时报告必要字段缺失，不能借此获得容差。

后续解除阻止需要独立审批并实现：evidence 的来源与 held-out 资格验证、metric/gate 对应关系、margin 的来源与范围、sufficiency / uncertainty / aggregation 与相应冻结记录。这里没有选择数值阈值、最小样本量、置信水平、指标组合策略、benchmark 或数据划分；不能由 mutation 自己补几个字段来替代审批。

`promotion-policy.test.mjs` 中的数据全部是 **synthetic validator inputs**。这些测试只能证明错误输入被阻止、既有 candidate fixture 仍兼容，不能证明研究结果改善、held-out 充分或某个 Challenger 可以晋升。

English summary: policy validation is a structural check, never evidence of improvement. Accepted mutations currently fail closed because an approved, frozen executable evidence-sufficiency and aggregation contract is unavailable. Candidate fixtures remain valid. Optional metric records supply diagnostics only; self-declared approval, held-out or frozen flags cannot authorize acceptance. No statistical threshold, minimum sample size, confidence level, aggregation rule, benchmark or split is established by this implementation. Synthetic regression tests exercise validation behavior only and cannot serve as promotion evidence.
