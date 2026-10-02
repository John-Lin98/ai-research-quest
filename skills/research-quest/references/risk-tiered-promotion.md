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