# Research Quest v2.2｜风险分级 Promotion Gate

日期：2026-10-01

## 已批准并完成

- 采用方案 C：Risk-Tiered Non-Inferiority Gate；
- Critical / Protected = zero tolerance；
- High / Medium 必须显式声明 non-inferiority margin；
- Low 只在 Objective Gates 通过后优化 utility；
- 未声明 margin 时默认 0；
- held-out evidence 不足时标记 insufficient_evidence，不允许自动晋升；
- Personal Fit 不能抵消任何 Objective Gate FAIL；
- 新增 promotion-policy.json、risk-tiered-promotion.md 和 validate-promotion-policy.mjs；
- Promotion Policy validator 已接入合同测试。

## 暂未写死的数值

以下需要基于真实 replay 分布再审批：
- high-risk 默认 margin 上限；
- 最小样本量；
- confidence interval / bootstrap 水平；
- 多指标 gate 的组合规则；
- 重复评测触发条件。

## 下一步架构决策

需要用户审批：
1. hidden promotion set 是否对 mutation agent 完全不可见；
2. evolution unit 是单模块 mutation 还是允许整套 Skill 大改；
3. promotion 是否采用 shadow/canary 后再替换 Champion；
4. replay 数据是否采用长期固定集、轮换集或两层 hidden set；
5. memory 是否正式拆成 Fact / Preference / Strategy 三类存储。