# Canonical Schema 1.0.0 对齐说明

## 权威引用

- Skill 根目录到唯一 Schema：[`../../shared/game-state.schema.json`](../../../shared/game-state.schema.json)
- 本参考文件到唯一 Schema：[`../../../shared/game-state.schema.json`](../../../shared/game-state.schema.json)
- 冻结版本：`1.0.0`
- 冻结 SHA-256：`c7deaf33007782476723169827c9fbb92a5dbd904d3fe34687caed8e3768e77b`
- Draft：JSON Schema 2020-12

Skill 不包含 Schema 副本。仓库布局变化、外部安装或打包解压后，必须保留根布局，或用 `--schema <canonical-schema>` 指向权威文件；解析失败、版本不等于 `1.0.0` 或 SHA-256 漂移时停止。

## 工作流到字段映射

| Skill 语义 | Canonical 字段 |
| --- | --- |
| controlled loop 与会话生命周期 | `mode`、`interaction_mode`、`phase`、`session` |
| 目标与版本 | `project_goal`、`goal_versions` |
| 序章与单一问题 | `prologue`、`next_question` |
| 双战役七关 | `campaigns.learning_cognition`、`campaigns.research_decision`、`levels` |
| 选择与决定 | `player_choices`、`decisions` |
| 三级知识认证 | `known_knowns.candidate/confirmed/verified` |
| 四类认知地图 | `known_knowns`、`known_unknowns`、`unknown_knowns`、`unknown_unknowns` |
| Prompt Clues | `prompt_clues` |
| 正式理解指标 | `metrics`，尤其 `verified_only_for_knowledge_count: true` |
| 最终考试 | `exam` |
| 60–90 秒演示 | `auto_demo` |
| 状态与 Goal 导出 | `exports.state`、`exports.goal` |
| 模拟/改编/脱敏与公开安全 | `provenance`、`privacy`、`public_safe` |

## 运行时不变量

1. 两个战役各有且仅有七关；序章和最终考试不计入七关。
2. 当前互动问题最多一个；完成态 `next_question` 为 `null`。
3. Confirmed 必须含确认凭据；Verified 必须同时含确认和验证凭据。
4. `formal_understanding_score` 的知识数量来源仅限 Verified。
5. 考试权重字段算术和必须为 100；Schema 的 `weight_total: 100` 不能替代运行时求和检查。
6. 所有 fixture 和公开案例都必须显式标注 simulated/adapted/deidentified，且不含真实科研结果。
7. 导出内容不得通过自包含递归无限嵌套；状态导出快照可以把自身 payload 置空，但必须保留全部合同字段。

## Fixture 与验证

| 会话 | Fixture |
| --- | --- |
| 科研规划 | [fixture-research.json](fixture-research.json) |
| 软件开发 | [fixture-software.json](fixture-software.json) |
| 个人学习 | [fixture-learning.json](fixture-learning.json) |

生成器先读取 Canonical Schema，断言版本与根必填字段，再生成/自检三个 fixture：

```text
node skills/research-quest/scripts/generate-test-sessions.mjs
node skills/research-quest/scripts/generate-test-sessions.mjs --check-only
```

完整实例验证应由集成测试使用 Draft 2020-12 validator 并加载 `date-time` format 支持。示例：

```text
npx --yes --package ajv-cli@5 --package ajv-formats ajv validate --spec=draft2020 --strict=true --allow-union-types -c ajv-formats -s shared/game-state.schema.json -d "skills/research-quest/references/fixture-*.json"
```

若 validator 暂时未加载 format 插件，只能把结果描述为“结构与合同验证”，不能宣称日期格式也已验证。
