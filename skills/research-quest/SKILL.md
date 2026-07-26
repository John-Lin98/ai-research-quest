---
name: research-quest
description: 将公开、模拟或已脱敏的项目材料与历史提示词转换为双战役七关 Research Quest、Known–Unknown 认知地图、Candidate→Confirmed→Verified 证据链、最终考试和可执行 Codex Goal。用于科研规划、软件开发规划、个人学习规划，或需要把零散上下文变成可追溯选择、验证门与退出条件的 controlled-loop 会话。
---

# Research Quest

把输入编译成可追溯的认知与决策闭环。只把 `Verified` 知识计入正式理解得分；不要把 AI 提取、用户复述或模拟结果直接当成已验证事实。

## 开始前

1. 只接收公开、模拟或已脱敏材料。发现凭据、个人标识、私有代码、未公开结果、服务器信息、绝对私有路径、数据集或 checkpoint 时，先移除或改写为占位符。
2. 从本 Skill 目录读取仓库内唯一 Canonical Schema：[`../../shared/game-state.schema.json`](../../shared/game-state.schema.json)。要求 `schema_version` 为 `1.0.0` 且 SHA-256 与[发行清单](references/release-manifest.md)一致；找不到、版本不符或哈希漂移时停止生成状态，报告 Schema blocker。不要在 Skill 内复制 Schema。
3. 阅读[规则与模板](references/rules-and-templates.md)。需要字段映射、fixture 或交叉验证时，再读[Schema 对齐说明](references/schema-alignment.md)和[三个完整测试会话](references/test-sessions.md)。

## 执行 controlled loop

1. **清点输入**：列出材料、来源类别和检索限制；未知正文保持未知，不补全。
2. **提取 Prompt Clues**：按七类登记目标、约束、工作流、验收、失败、偏好与产物线索；分别记录来源和证据状态。
3. **建立序章**：给出目标预览，只提出一个会改变后续路线的高价值问题，并提供 2–4 个影响可见的选择。
4. **建立双战役**：同时建立 `learning-cognition` 与 `research-decision`；每个战役严格七关。每关写明任务、知识卡、时间、进度、单一问题、选择影响、Goal 预览、认知变化、小测、奖励和下一入口。
5. **逐关更新**：一次只问一个问题；选择后追加 `player_choices` 与 `decisions`，更新 Goal 版本、总进度、剩余时间和 Known–Unknown 地图。保留被取代决定，不静默覆盖。
6. **执行三级认证**：仅沿 `Candidate → Confirmed → Verified` 单向晋级，并保存各级独立凭据。没有应用、小测、考试、迁移或纠错证据时，不得晋级为 `Verified`。
7. **运行最终考试**：覆盖决策应用、概念理解和迁移，默认权重 `60/20/20`、总和 `100`，默认通过线 `80`。失败时回到薄弱关卡补证据，不伪造通过。
8. **锻造 Codex Goal**：考试通过后，生成包含冻结 Context、任务边界、多 Agent 分工、模型路由、步骤、验证、安全、独立审查、中文 Git/PR/合并和退出条件的完整 Goal。
9. **导出并检查**：导出 game-state JSON 与 Goal 文本；核对公开安全、Schema 版本、哈希、完成检查单和重启能力。产品效果只标为“待验证假设”，不得声称游戏化已证明提升理解或创造力。

## 交互规则

- 互动模式保持一个当前问题；只有答案会改变路线时才提问。
- 自动演示固定 seed、60–90 秒、至少七步且不循环；不得把演示轨迹当成用户验证。
- 所有案例明确标为“模拟数据”“改编场景”或“脱敏场景”，并保持 `contains_real_research_results: false`。
- 无法访问的来源标记 `retrieval-limited`；它不能自动转成 `verified`。
- 只从 `known_knowns.verified` 计算知识数量与正式理解得分。

## 安装、运行与打包

- **仓库内使用**：保持 `skills/research-quest/` 与 `shared/game-state.schema.json` 的相对位置，直接调用 `$research-quest`。
- **Codex 安装**：先克隆仓库，再把 `skills/research-quest/` junction/symlink 到 Agent skills 目录。若目标已存在就停止，不覆盖、不删除。完整 Windows 与 macOS/Linux 命令见[安装指南](../../docs/usage/skill-installation.md)。
- **不支持的复制路线**：只复制本 Skill 目录会丢失仓库外唯一 Schema；默认自检应 fail closed。除非安装器同时保留根布局，否则不要把 `npx skills add ... --copy` 描述为可直接运行。
- **生成/复验 fixtures**：

  ```text
  node skills/research-quest/scripts/generate-test-sessions.mjs --check-only
  ```

- **打包**：发行 ZIP 必须保留根布局，并且只包含 `skills/research-quest/**`、`shared/game-state.schema.json`、`LICENSE` 与 `THIRD_PARTY_NOTICES`。发布页同时提供 ZIP 的 SHA-256；解包后先运行 `--check-only`。精确清单与命令见[发行清单](references/release-manifest.md)。
- **隐私**：本 Skill 不上传输入、不发送遥测；Node 脚本只在本地读取 Schema 和 fixture。不要把真实项目材料、凭据、缓存或用户导出加入发行包。

## 交付条件

按[完成检查单](references/rules-and-templates.md#完成检查单)逐项通过，并用 Canonical Schema 验证状态实例。三个参考 fixture 分别覆盖科研、软件开发和个人学习；它们是模拟验证资产，不是产品效果或真实科研结论。公开发行前还必须对当前候选快照独立复核 `review_status=approved`、真实结果标志、敏感内容扫描和 ZIP 解包 smoke。
