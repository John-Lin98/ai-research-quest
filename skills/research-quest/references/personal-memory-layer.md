# Personal Memory Layer｜Research Quest Companion Architecture

## 结论

个人记忆不应存进公共 Research Quest Skill 包。推荐：

```text
ChatGPT Personal Project  = Control Plane
Library / user-controlled files = Canonical Store
Personal Memory Skill     = Read/Write Controller
ChatGPT built-in Memory   = Soft Cache / Retrieval Layer
Research Quest            = Consumer
```

## 为什么这样拆

- Project 适合长期会话、文件与指令管理；
- Library 文件可集中管理、复用，并在支持时被自动检索；
- ChatGPT 内置 Memory 是相关性驱动的个性化系统，不保证保存每个细节，也不是结构化数据库；
- Skill 适合规则与脚本，不适合把会频繁变化的个人状态直接烘焙进版本包。

## 推荐 ChatGPT 侧设置

### Personal Intelligence Memory Project

用途：只管理个人长期状态、纠错、审计和策略更新。

建议：
- 如果希望 Research Quest 在其他普通聊天/项目中也能利用个人状态：使用 Default memory（前提是账号/工作空间允许）；
- 如果某类敏感任务必须隔离：单独建立 project-only 项目，不向全局 Personal Memory 推送事实；
- 不要把 project-only Personal Memory Project 当作跨项目全局记忆源，因为项目外无法引用其聊天。

### Library

建议维护三个 canonical 文件：

```text
personal-memory/preferences.yaml
personal-memory/strategies.yaml
personal-memory/facts.jsonl
```

可选：

```text
personal-memory/index.md
personal-memory/change-log.jsonl
personal-memory/conflicts.jsonl
```

如果 ChatGPT 提供 Library search，可在 Settings → Personalization → Advanced 中开启，以便相关文件可被自动检索。

## 三类状态必须分离

### Fact Memory

保存可被证伪的事实。字段至少包括：

```text
id
statement
attribution
source_ref
scope
evidence_status: candidate | confirmed | verified
valid_from / valid_until
updated_at
```

规则：重复出现不等于 Verified；冲突事实并存，直到有证据解决。

### Preference Memory

保存用户对自己的偏好、目标、约束和协作方式。

```text
id
preference
scope
priority
status
source
updated_at
```

用户本人是自己偏好的权威来源，因此明确陈述可以直接 Confirm，但不能被扩大到未声明的范围。

### Strategy Memory

保存真实工作轨迹中验证过的策略：

```text
id
context_pattern
strategy
evidence
outcome
cost
do_not_repeat
status
updated_at
```

只有实际结果支持的策略才进入长期 Strategy。

## Personal Memory Skill 的职责

1. Retrieve：只取当前 Goal 相关记忆；
2. Classify：Fact / Preference / Strategy；
3. Verify：事实保持证据状态，不靠用户重复自动升级；
4. Write：满足 write gate 才写入 canonical store；
5. Conflict：不静默覆盖冲突；
6. Audit：输出本轮 memory delta；
7. Compact：定期合并重复状态，但保留 provenance；
8. Export：只在明确 opt-in 后导出脱敏 global pattern。

## Research Quest 如何消费

Research Quest 不直接维护用户 profile，只提出查询：

```text
Goal → relevant memory query
     → preference/strategy context
     → scoped fact references
     → task execution
     → new experience delta
     → Personal Memory Skill
```

这样可以让 Research Quest 自身保持通用，同时允许每个用户拥有自己的长期 Personal Champion。

## 重要边界

- ChatGPT 内置 Memory 不是 canonical truth store；
- Project memory 也不是可完全枚举的数据库；
- Personal Memory Skill 不应把完整个人状态提交到公共 GitHub；
- 公共 Skill 仓库只保存 schema、workflow 和测试，不保存真实用户数据；
- 删除 Personal Memory Store 中的数据，与删除 ChatGPT 账户级 Memory 是两件事；账户级 Memory 仍需使用 ChatGPT 的 Personalization/Memory 控制完成。

## Skills 可用性

ChatGPT Skills 是否可创建/上传取决于账号/工作空间可用性。若当前侧边栏存在 Plugins → Skills → Create，可安装私有 Personal Memory Skill；否则先用 Project instructions + Library canonical files 实现同一协议，后续再切换到 Skill。

## 推荐第一版

先只实现 Preference + Strategy 的全局用户层；Fact 默认保持 project-scoped，只有跨项目确实有价值且经过验证的事实才进入用户级 Fact Memory。

原因：Preference / Strategy 最能减少重复协作成本，而全局 Fact 最容易造成过期、冲突和错误传播。