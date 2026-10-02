# Research Quest v2.3｜Personal Memory Layer 执行记录

日期：2026-10-02

## 已批准

- North Star：Truth-first Personal Problem Solver；
- 用户级长期记忆应与公共 Skill 解耦；
- Personal Memory 应优先方便用户个人持续更新，同时不污染 Global Skill。

## 产品调研结论

- ChatGPT Projects 可保存长期聊天、文件与项目指令，并支持默认记忆或 project-only memory；
- project-only memory 无法被项目外聊天引用，因此不适合作为唯一跨项目 Personal Memory 源；
- ChatGPT Library 可集中管理和复用文件，在支持时 Memory/Library search 可引用相关文件；
- ChatGPT Skills 更适合存工作流和代码，而不是频繁变化的用户状态；
- Skills 的可创建/上传范围取决于账号/工作空间，若当前没有 Skills 入口，可先用 Project instructions 实现同一协议。

## 推荐架构

```text
Project = Control Plane
Library/files = Canonical Store
Personal Memory Skill = Read/Write Controller
Built-in Memory = Soft Cache
Research Quest = Consumer
```

## 本轮实现

- Research Quest SKILL.md 加入 Truth-first North Star；
- 新增 personal-memory-layer.md；
- 新增 skills/personal-memory/SKILL.md；
- 新增 Personal Memory agent config；
- 新增 Fact / Preference / Strategy schema；
- 新增 ChatGPT Project / Library setup；
- 新增公开安全 fixture；
- 新增 Personal Memory contract validator；
- 主合同测试接入 Personal Memory validator；
- public-safety allowlist 纳入 skills/personal-memory/。

## 当前最大风险

用户级全局 Fact Memory 很容易产生过期、冲突和跨项目污染。Preference / Strategy 的跨项目收益更直接，风险更低。

## Memory Scope Constitution｜已批准 Scope B

Preference 和已验证 Strategy 默认跨项目，Fact 默认项目级；只有已验证且明确跨项目有价值的 Fact 才允许受控提升为 user-global。显式 scope / memory_scope 与结构性晋升检查仍保留，验证器不补默认值。

## Memory Governance 已批准；文档与静态契约已实现

- D-M1-C：Typed Freshness + Verify-on-use；
- D-M2-C：Typed Conflict Adjudication；
- D-M3-C：Memory Portfolio Retrieval；
- D-M4-C：Hot / Warm / Archive + provenance-preserving compaction。

对应内容已经写入：
- Personal Memory SKILL；
- memory schema；
- public fixture；
- contract validator；
- Research Quest Personal Memory reference。

此处“实现”仅指上述文档、示例和静态 guards；live verification、冲突裁决、检索排序/coverage、生命周期迁移及压缩控制器尚未运行时实现。兼容更新保留旧快照必填格式，严格 fixture 要求不自动成为真实状态要求。

## 剩余大 Boss

Memory 子系统核心治理策略已批准；运行时工程与验证仍待完成。另有三项 Evolution Engine 决策：
1. Replay Benchmark Architecture；
2. Mutation Trigger + Evolution Budget；
3. Personal ↔ Global Rebase / Compatibility。

三项通过后建议冻结 v3 架构，转入真实 replay 数据构建、工程实现和长期使用验证。
