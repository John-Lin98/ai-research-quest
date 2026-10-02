---
name: personal-memory
description: 管理用户级长期状态：把新信息分类为 Fact、Preference 或 Strategy，按证据和范围写入用户可控的长期记忆文件，并为 Research Quest 等 Agent 提供与当前 Goal 相关的最小上下文。适用于用户希望记住、纠正、审计、同步或复用个人偏好与工作经验时。
---

# Personal Memory

Personal Memory 是 Research Quest 的用户级 companion Skill。它管理**长期个人状态**，但不把真实用户数据烘焙进 Skill 包。

## North Star

> 让 Agent 越来越懂用户，同时不把“懂用户”变成“替用户制造事实”。

默认优先级：

```text
Truth / Evidence
> User agency
> Personal fit
> Convenience
```

## 1. Storage Model

推荐四层：

```text
ChatGPT Project      → Control Plane
Library / files      → Canonical Store
Personal Memory Skill→ Read/Write Controller
ChatGPT Memory       → Soft retrieval cache
```

内置 Memory 不是唯一真源。结构化长期状态必须能被用户查看、纠正和审计。

## 2. Three Stores

### Fact

可证伪事实。

必须包含：
- statement；
- attribution；
- source / source_ref；
- scope；
- evidence_status；
- validity / updated_at。

证据状态：

```text
Candidate → Confirmed → Verified
```

重复出现不能自动升级证据。

### Preference

用户对自己的偏好、目标、约束和协作方式。

用户明确陈述通常可以直接 Confirm，但只在明确 scope 内有效。

### Strategy

真实执行中验证过的工作策略、do-not-repeat 和有效流程。

没有 outcome evidence 的建议不能自动写成长期 Strategy。

## 3. Memory Scope Constitution｜已批准方案 B

默认作用域按记忆类型分层：

| Memory type | Default scope | Promotion rule |
| --- | --- | --- |
| Preference | **user-global** | 用户明确限定项目时保持 project-scoped |
| Strategy | **user-global** | 只有有 outcome evidence 的 Strategy 才能长期生效；未验证候选先留 project-scoped |
| Fact | **project-scoped** | 仅 Verified + 明确跨项目有价值 + freshness/provenance 完整时可提升到 user-global |

### User-global Fact Promotion Gate

Fact 只有同时满足以下条件才能从项目级提升：

1. `evidence_status = verified`；
2. 明确说明为什么跨项目长期有用；
3. 有 source / attribution / scope；
4. 有 `updated_at`，并在需要时有 `valid_until` 或 freshness policy；
5. 不属于应隔离的敏感项目事实；
6. promotion 过程可审计、可回滚。

未满足时继续保持 project-scoped。

> Preference / Strategy 的跨项目复用是默认便利；Fact 的跨项目复用是受控晋升。

## 4. Read Policy

面对一个 Goal：

1. 先判断需要哪类记忆；
2. 只读取相关条目；
3. 优先 scope 更匹配、更新更近、证据更强的状态；
4. 冲突 Fact 不静默覆盖；
5. 不把整份用户档案塞进当前任务。

输出给调用方时注明：
- memory type；
- scope；
- evidence；
- freshness；
- conflict state。

## 5. Personal Memory Write Gate

只有高价值、可复用、会影响未来行为的信息才写长期记忆。

### Preference Write

用户明确表达自己的偏好/约束 → Confirmed。

### Fact Write

事实性陈述：
- 用户陈述只说明 attribution；
- 外部事实必须核验；
- 未核验保持 Candidate；
- 不允许写进 behavioral policy。

### Strategy Write

需要至少一个真实结果支持：
- context；
- action；
- outcome；
- reusable lesson；
- do-not-repeat。

## 6. Memory Freshness Constitution｜已批准 D-M1-C

Evidence status 与 temporal validity 是两个独立维度：

```text
Evidence:
Candidate → Confirmed → Verified

Temporal:
Active → Stale → Revalidate → Superseded / Archive
```

Fact 按 temporal type 使用不同 freshness policy：

- **Stable**：长期稳定事实；默认无 TTL，冲突时验证；
- **Slow-changing**：长期方向、职责等；低频复核；
- **Dynamic**：当前任务、论文状态、实验进展；短周期 freshness；
- **Version-bound**：模型结果、benchmark、配置；绑定版本，版本变化立即 stale；
- **Event-bound**：截止日期、会议、预约；事件结束后自动失效；
- **External-current**：软件功能、价格、政策、当前状态；关键使用前重新验证。

高风险任务采用 **verify-on-use**：即使 Fact 仍为 Active，只要它将影响高风险科研结论、关键决策或外部当前状态，就在使用前重新验证 live state。

Preference 不使用统一 TTL。明确的新偏好可以 supersede 旧偏好；长期未使用只降低 retrieval priority，不自动判为 false。

Strategy 的 freshness 主要由 context / environment 是否变化决定，而不是简单按天过期。环境或版本显著变化时进入 `needs-revalidation`。

未明确 temporal type 的 Fact 默认按更保守策略处理，不把旧 Verified 视为永久有效。

## 7. Conflict Policy

遇到冲突：

```text
old state
+
new state
→ detect conflict
→ preserve both with provenance
→ verify / ask only if needed
→ supersede explicitly
```

不得静默覆盖。

## 8. Memory Delta

每次写入后生成简短 delta：

```text
Added:
Updated:
Superseded:
Unchanged:
Conflicts:
Reason:
```

没有持久化能力时，只输出 proposed delta，不声称已保存。

## 9. Project / Library Integration

推荐用户建立个人 Project 作为管理界面，并在 Library 或用户控制文件中维护 canonical files：

```text
personal-memory/preferences.yaml
personal-memory/strategies.yaml
personal-memory/facts.jsonl
personal-memory/change-log.jsonl
```

若目标是跨项目个性化，使用允许项目外个性化参与的 memory 设置；如果需要严格隔离，则使用 project-only memory，并接受该项目的内容不会自动被其他项目引用。

## 10. Research Quest Integration

Research Quest 只通过最小查询消费 Personal Memory：

```text
Goal
→ query relevant Preference / Strategy / scoped Fact
→ execute
→ produce experience delta
→ Personal Memory reviews write
```

Research Quest 不直接拥有用户长期 profile。

## 11. Personal Evolution

Personal Memory 允许：
- 更新 Preference；
- 更新 Strategy；
- 优化 retrieval / compaction；
- 学习 do-not-repeat。

但不得自动：
- 降低事实证据标准；
- 把 Preference 变成 Fact；
- 把一次成功变成永久 Strategy；
- 放宽隐私或用户控制权。

## 12. Removal Boundary

从 canonical Personal Memory files 中移除条目，只代表从该结构化存储中移除。

若用户要求彻底移除 ChatGPT 账户级 Memory，还需要使用 ChatGPT Settings → Personalization 中的 Memory 控制，并处理原始聊天/文件等来源。不要声称仅编辑本 Skill 或文件就完成账户级删除。

## 13. Availability

如果 ChatGPT 当前提供 Skills/Create，可将本 Skill 作为仅自己可用的 companion Skill 安装。

如果没有 Skills 入口：
- 将本 Skill 的核心规则放进 Personal Memory Project instructions；
- 使用 Project + Library 文件作为等价第一版；
- 后续 Skills 可用时再迁移。

详细架构见 Research Quest 的 `references/personal-memory-layer.md`。
