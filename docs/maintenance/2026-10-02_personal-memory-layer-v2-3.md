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

## 下一项待审批

是否采用“Preference + Strategy 默认跨项目，Fact 默认项目级”的 Memory Scope Constitution；只有已验证且明确跨项目有价值的 Fact 才允许提升为 user-global Fact。