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
- scope / memory_scope；
- evidence_status；
- validity / updated_at；
- promotion_reason（项目级可为 null）。

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

默认作用域按记忆类型分层，由创建流程/读写控制器应用：

| Memory type | Default memory_scope | Scope rule |
| --- | --- | --- |
| Preference | **user-global** | 用户明确限定项目时使用 `project` |
| Verified Strategy | **user-global** | 有真实 outcome evidence；用户明确限定项目时可使用 `project` |
| Non-verified Strategy | **project** | `candidate` 和 `superseded` 均不能使用 `user-global` |
| Fact | **project** | 仅 Verified + 明确跨项目有价值 + freshness/provenance 完整时可受控提升到 `user-global` |

三类序列化条目均须显式提供非空自由文本 `scope`（具体适用范围）和独立的 `memory_scope`（只能为 `project` 或 `user-global`）。创建默认策略不等于验证器补值：缺失任一字段均拒绝结构验证，不从另一字段推断或自动填充。

### User-global Fact Promotion Gate

Fact 只有同时满足以下条件才能从项目级提升：

1. `evidence_status = verified`；
2. 用非空 `promotion_reason` 明确说明为什么跨项目长期有用；
3. 有 source / attribution / scope；
4. 有 `updated_at`，并在需要时有 `valid_until` 或 freshness policy；
5. 不属于应隔离的敏感项目事实；
6. promotion 过程可审计、可回滚。

未满足时继续保持 project-scoped。提升范围本身不能升级证据状态。每条 Fact 都必须显式提供 `promotion_reason`：`project` Fact 可为 null 或非空字符串；`user-global` Fact 必须为非空字符串且保持 Verified。

结构验证只检查可表达的字段、枚举和状态组合；跨项目 usefulness、freshness policy、敏感性及 promotion 的可审计/回滚性仍是控制器策略要求，不能从验证通过推断已满足，执行控制仍待设计审查。

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
- scope / memory_scope；
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

## 6. Conflict Policy

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

## 7. Memory Delta

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

## 8. Project / Library Integration

推荐用户建立个人 Project 作为管理界面，并在 Library 或用户控制文件中维护 canonical files：

```text
personal-memory/preferences.yaml
personal-memory/strategies.yaml
personal-memory/facts.jsonl
personal-memory/change-log.jsonl
```

若目标是跨项目个性化，使用允许项目外个性化参与的 memory 设置；如果需要严格隔离，则使用 project-only memory，并接受该项目的内容不会自动被其他项目引用。

## 9. Research Quest Integration

Research Quest 只通过最小查询消费 Personal Memory：

```text
Goal
→ query relevant Preference / Strategy / scoped Fact
→ execute
→ produce experience delta
→ Personal Memory reviews write
```

Research Quest 不直接拥有用户长期 profile。

## 10. Personal Evolution

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

## 11. Removal Boundary

从 canonical Personal Memory files 中移除条目，只代表从该结构化存储中移除。

若用户要求彻底移除 ChatGPT 账户级 Memory，还需要使用 ChatGPT Settings → Personalization 中的 Memory 控制，并处理原始聊天/文件等来源。不要声称仅编辑本 Skill 或文件就完成账户级删除。

## 12. Availability

如果 ChatGPT 当前提供 Skills/Create，可将本 Skill 作为仅自己可用的 companion Skill 安装。

如果没有 Skills 入口：
- 将本 Skill 的核心规则放进 Personal Memory Project instructions；
- 使用 Project + Library 文件作为等价第一版；
- 后续 Skills 可用时再迁移。

详细架构见 Research Quest 的 `references/personal-memory-layer.md`。

## 13. Contract Validation Boundary

`scripts/memory-state-validator.mjs` 提供纯函数 `validateMemoryState(state)`，检查传入快照的必需字段、类型、状态、日期、唯一 ID、来源字段、显式自由文本 `scope` 与 `memory_scope` 枚举，以及上述 Strategy/Fact 的结构性跨项目限制。它不修改输入，也不自动补默认值。CLI 无参数时仍检查公共 fixture；`--state path/to/state.json` 只读验证显式输入。

验证通过只说明结构合格，不能证明来源真实、Strategy 有真实结果、已获跨项目复用授权或真实写入已受 gate 控制。公共 illustrative Strategy 必须保持 Candidate；synthetic 负例和正例不构成真实策略证据。冲突、撤回、supersession 与 provenance-preserving delta 的执行控制仍待批准设计，详见 `references/memory-schema.md`。
