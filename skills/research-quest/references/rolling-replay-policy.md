# Rolling Three-Tier Replay Policy

## 已批准 D-E1-C

Research Quest 的 evolution evaluation 使用三层滚动 replay：

```text
Dev Replay      → visible, detailed feedback
Audit Pool      → hidden tasks, limited metric feedback
Promotion Vault → strict hidden, pass/fail/insufficient_evidence
```

## Personal / Global 分离

- Personal Replay 只评估“是否更适合当前用户且保持 Truth-first”；
- Global Replay 必须覆盖多个用户、任务类型和领域；
- Personal Replay 不能单独证明 Global mutation 更好。

## Hidden Set Rotation

- Promotion Vault 不是永久固定集合；
- 每个 hidden item / cohort 有 evaluation budget；
- 达到预算后 retire 到 Audit Archive；
- 新 hidden tasks 持续补入；
- Mutation Agent 不得读取 Promotion Vault 内容或逐题反馈。

## Replay Object

每个任务至少包含：

```yaml
id:
scope: personal | global
task_type:
risk_tier:
goal:
context_ref:
expected_behavior:
must_not_do:
objective_evaluator:
personal_fit_evaluator:
memory_dependencies:
tool_dependencies:
failure_modes:
replay_tier: dev | audit | promotion
feedback_policy: detailed | limited | outcome-only
usage_budget:
usage_count:
retired:
```

## Benchmark Audit

Replay benchmark 本身也要审计：
- User / Goal 是否清楚；
- Environment / tools 是否可复现；
- Ground truth / evaluator 是否有效；
- task 是否被最近 mutation 反复利用；
- 是否过度代表某一用户或领域。

## Promotion Rules

- Dev 提升只能产生候选；
- Audit FAIL → reject / revise；
- Promotion Vault 仅输出 pass / fail / insufficient_evidence；
- hidden feedback 不得直接用于下一次定向修补；
- repeated promotion attempts 消耗 hidden evaluation budget。

## Efficient Evaluation

不要求每个 mutation 重跑完整 benchmark：

```text
cheap dev subset
→ audit subset
→ only promising candidate
→ hidden promotion
```

完整或更昂贵 evaluation 留给最有希望的 Challenger。