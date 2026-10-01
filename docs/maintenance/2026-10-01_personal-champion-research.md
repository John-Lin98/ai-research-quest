# Personal Champion / Challenger 调研与架构判断

日期：2026-10-01

## 结论

Personal Evolution 不应简单复制一份完整 Global Skill 后无限分叉，而应优先采用三层结构：

1. Global Champion：公共、稳定、通用；
2. Personal Overlay：用户偏好、do-not-repeat、项目习惯、工具/汇报偏好，快速更新；
3. Personal Challenger：只有当 Overlay 无法解决的重复/高影响问题出现时，才允许修改更深层 scaffold（Grill/Search/Memory/Workflow），并通过个人历史任务 replay 后晋升为 Personal Champion。

Global Evolution 只吸收跨多个用户重复出现的共同痛点，而且 Common Pain Gate 只决定“值得研究”，Champion–Challenger 才决定“值得晋升”。

## 关键研究依据

### Personalized Agents from Human Feedback (PAHF, 2026)

- 持续个性化需要显式 per-user memory；
- pre-action clarification + memory-grounded action + post-action feedback 能适应偏好变化；
- 个性化不是一次性 profile，而是在线更新循环。

参考：https://arxiv.org/abs/2602.16173

### Personalized LLM-Powered Agents Survey (2026)

- 个性化贯穿 profile modeling、memory、planning、action execution；
- 因此 Personal Evolution 不应只改回答风格，而应允许逐层影响计划与动作策略；
- 但不同层应有不同风险和验证门。

参考：https://arxiv.org/abs/2602.22680

### User-Governed Personalization (2026)

- 用户是唯一能够整合跨平台、跨项目和线下信息的一方；
- Personal state 应由用户控制，而不是默认成为平台/公共模型数据；
- 支持 Research Quest 将 Personal Ledger 默认保持本地、Global feedback 只在 opt-in 后脱敏导出。

参考：https://arxiv.org/abs/2605.09794

### SelfMem (2026)

- memory strategy 本身也可以成为优化对象；
- 固定存储/检索/压缩策略会限制长期 Agent；
- 因此 Personal Challenger 后续可以把 memory retrieval/compression policy 作为 Mutable Layer，而不仅是积累更多 memory。

参考：https://arxiv.org/abs/2607.03726

### Darwin Gödel Machine (DGM)

- 自我改进不仅维护单一路径，而是保留不同 agent lineage/stepping stones；
- 改进必须通过下游 benchmark 验证；
- 泛化到不同模型/任务比单一 benchmark 提升更可信。

参考：https://arxiv.org/abs/2505.22954

### AIDE² (2026)

- research agent 可以连续修改自己的代码并通过 hidden evaluation 选择；
- 8 天自主运行产生 7 次连续改进；
- 重要的是改进还迁移到 held-out tasks，而不是只在 selection tasks 上变好。

参考：https://arxiv.org/abs/2609.26457

### REUSE (2026)

- RSI 反复使用同一个 benchmark 会产生 adaptive overfitting；
- promotion eval 不应把全部细节反馈给 mutation search；
- 需要保留真正 held-out / limited-feedback promotion set。

参考：https://arxiv.org/abs/2609.33180

### Efficient Benchmarking in Production (2026)

- 不必每次 mutation 都重跑全部 benchmark；
- 可用代表性小集合做 cheap gate，再对最终候选运行完整/held-out 验证；
- 这支持 Research Quest 使用“快速个人 replay → 最终完整 promotion”的漏斗。

参考：https://arxiv.org/abs/2609.21267

### Personal Agent Sycophancy Benchmark (PASB, 2026)

- 长期个性化 Agent 的迎合风险不仅发生在回答阶段，还会发生在 memory/state write 阶段；
- 错误或用户中心的断言一旦被写入持久状态，后续中立任务也会继续受到影响；
- 因此 Personal Champion 必须加入 Memory Write Gate：事实、偏好和行为规则分层存储，事实必须保留来源、归属、范围与证据状态。

参考：https://arxiv.org/abs/2607.10526

## 推荐 Personal Evolution 架构

```text
Global Champion
      |
      +--> Personal Overlay (fast, frequent, reversible)
      |       - preferences
      |       - do-not-repeat
      |       - project/workflow habits
      |       - preferred tools / reporting
      |
      +--> Personal Champion
              |
              +--> Personal Challenger
                       - Grill policy
                       - Search policy
                       - Memory strategy
                       - Tool routing
                       - Workflow
                       |
                  Personal Replay
                       |
                  Promote / Rollback
```

## 推荐评测拆分

Personal Challenger 不应只看“用户更满意”，至少分四类：

- Task Success：任务是否完成得更好；
- User Fit：是否更符合该用户的工作方式；
- Efficiency：轮数、成本、人工纠错是否下降；
- Safety / Evidence：是否保持 Protected Layer。

Global Challenger 还必须增加：

- Cross-user generalization；
- Cross-task generalization；
- held-out promotion set；
- adaptive benchmark reuse 防护。

## 关键设计判断

Personal Champion 可以有意“过拟合”当前用户，但应主要发生在用户层 scaffold；Global Champion 必须以跨用户泛化为目标。两者通过显式反馈信号连接，而不是共享原始私人会话。

## 当前未决问题

Personal Challenger 的晋升指标应该怎样组合：是让“用户满意/符合偏好”拥有最高权重，还是让“客观任务成功/效率”拥有否决权？这个决定会直接决定 Personal RSI 会不会逐渐变成迎合用户的 sycophantic agent。