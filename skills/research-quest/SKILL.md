---
name: research-quest
description: 将真实公开科研需求、公开来源材料或已脱敏项目上下文转换为双战役七关 Research Quest、Known–Unknown 认知地图、Candidate→Confirmed→Verified 证据链、最终考试和可执行 Codex Goal。用于科研规划、软件开发规划、个人学习规划，或需要把零散上下文变成可追溯选择、验证门、Agent 分工与失败根因分析的 controlled-loop 会话。
---

# Research Quest

把真实需求编译成可追溯的认知与执行闭环。最终交付不是泛泛建议，而是一份能让 Codex 或多 Agent 直接执行的目标合同。

只把 `Verified` 知识计入正式理解得分；不要把 AI 提取、用户复述、公开背景事实或尚未执行的试点计划直接当成实验结果。

## 开始前

1. 输入可以是：
   - 真实且可公开的科研需求；
   - 带原始来源的公开论文、数据库和文档；
   - 已脱敏的项目 Context；
   - 纯模拟教学场景。
2. 发现凭据、个人标识、私有代码、未公开结果、服务器信息、绝对私有路径、数据集或 checkpoint 时，移除或改写为占位符，不要进入公开状态或 Goal。
3. 对真实公开需求，必须区分：
   - `public fact`：来源可追溯的公开事实；
   - `research need`：用户真正希望解决的问题；
   - `planned protocol`：通过闯关冻结的试点设计；
   - `observed result`：只有实际执行后才允许出现的结果。
4. 从本 Skill 目录读取仓库内唯一 Canonical Schema：[`../../shared/game-state.schema.json`](../../shared/game-state.schema.json)。要求 `schema_version` 为 `1.0.0` 且 SHA-256 与[发行清单](references/release-manifest.md)一致；找不到、版本不符或哈希漂移时停止生成状态，报告 Schema blocker。不要在 Skill 内复制 Schema。
5. 阅读[规则与模板](references/rules-and-templates.md)。真实科研需求示例见[AlphaFold2 酶活性位点公开试点](references/real-research-case.md)；需要 fixture 或交叉验证时，再读[Schema 对齐说明](references/schema-alignment.md)和[三个完整测试会话](references/test-sessions.md)。

## 执行 controlled loop

1. **提取真实需求**：不要从工具、模型或新闻标题开始。先问用户最终要作出什么科研决定、产生什么产物、接受什么风险。
2. **清点输入**：列出公开材料、来源类别、许可、可访问性和检索限制；无法读取的正文保持未知，不补全。
3. **提取 Prompt Clues**：按目标、约束、工作流、验收、失败、偏好与产物七类登记线索，并记录来源与证据状态。
4. **建立序章**：给出目标预览，只提出一个会改变后续路线的高价值问题，提供 2–4 个影响可见的选择。
5. **建立双战役**：
   - `learning-cognition`：建立任务、概念、公开输入、指标和结论边界；
   - `research-decision`：冻结规模、纳入规则、分析步骤、Agent 分工、验收与退出条件。
   每个战役严格七关。
6. **逐关输出**：每关写明任务、知识卡、预计时间、总进度、剩余时间、单一问题、选择影响、Goal 预览、认知变化、小测、奖励和下一入口。
7. **逐关更新**：选择后追加 `player_choices` 与 `decisions`，更新 Goal 版本和 Known–Unknown 地图；被取代决定保留为 superseded，不静默覆盖。
8. **执行三级认证**：仅沿 `Candidate → Confirmed → Verified` 单向晋级，并保存各级独立凭据。没有应用、小测、考试、迁移或纠错证据时，不得晋级为 `Verified`。
9. **运行最终考试**：题目必须针对当前真实需求，覆盖决策应用、概念理解和迁移，默认权重 `60/20/20`、通过线 `80`。不得使用与任务无关的通用口号题。
10. **锻造 Codex Goal**：考试通过后，生成包含以下内容的完整 Goal：
    - 真实研究问题；
    - 公开输入和来源；
    - 数据与分析合同；
    - 指标和结论边界；
    - 多 Agent 分工与交接；
    - 执行步骤；
    - 测试与独立审查；
    - 中文 Git/PR/合并；
    - 3–5 轮失败后的根因分析退出。
11. **导出并检查**：导出 game-state JSON 与 Goal；核对公开安全、Schema、完成检查单和重启能力。计划不得伪装成结果，产品效果仍标记为待验证假设。

## 真实科研需求的设计规则

- **一个 Demo 只围绕一个核心科研需求。** 两条战役必须共同修改同一份目标，而不是展示互不相关的知识题。
- **每个选择必须改变 Goal。** 选择应冻结数据、指标、规模、边界、Agent、验收或退出方式之一。
- **公开事实必须有来源。** 不要把来源文章本身当作互动任务；要把事实转成一个尚待解决的下游需求。
- **允许真实任务，不允许虚构结果。** `contains_real_research_results` 仍保持 `false`，因为 Demo 展示的是试点设计，不是实验结果。
- **考试检验迁移和应用。** 题目应要求用户处理失败案例、解释指标边界，并将流程迁移到邻近任务。
- **Goal 必须可执行。** 最终文本应能让新的 Agent 在不重做需求访谈的前提下开始工作。

## 交互规则

- 互动模式保持一个当前问题；只有答案会改变路线时才提问。
- 自动演示固定 seed、60–90 秒、至少七步且不循环；不得把自动轨迹当成用户验证。
- 真实公开需求标记为“改编场景”或等价公开标签，并在 `source_traceability` 中说明来源和“无预设结果”。
- 模拟或脱敏案例继续使用相应标签。
- 无法访问的来源标记 `retrieval-limited`；它不能自动转成 `verified`。
- 只从 `known_knowns.verified` 计算知识数量与正式理解得分。
- 同一关键 blocker 不得第一次失败即退出；应执行 3–5 轮实质不同的尝试，仍失败时生成根因分析。

## 安装、运行与打包

- **仓库内使用**：保持 `skills/research-quest/` 与 `shared/game-state.schema.json` 的相对位置，直接调用 `$research-quest`。
- **Codex 安装**：先克隆仓库，再把 `skills/research-quest/` junction/symlink 到 Agent skills 目录。若目标已存在，不覆盖、不删除。完整 Windows 与 macOS/Linux 命令见[安装指南](../../docs/usage/skill-installation.md)。
- **不支持的复制路线**：只复制 Skill 目录会丢失仓库外唯一 Schema；除非安装器同时保留根布局，否则不要把 `npx skills add ... --copy` 描述为可直接运行。
- **生成/复验 fixtures**：

  ```text
  node skills/research-quest/scripts/generate-test-sessions.mjs --check-only
  ```

- **打包**：发行 ZIP 必须保留根布局，并且只包含 `skills/research-quest/**`、`shared/game-state.schema.json`、`LICENSE` 与 `THIRD_PARTY_NOTICES`。发布页提供 ZIP SHA-256；解包后先运行 `--check-only`。精确清单见[发行清单](references/release-manifest.md)。
- **隐私**：本 Skill 不上传输入、不发送遥测；Node 脚本只在本地读取 Schema 和 fixture。不要把真实私有项目材料、凭据、缓存或用户导出加入发行包。

## 交付条件

按[完成检查单](references/rules-and-templates.md#完成检查单)逐项通过，并用 Canonical Schema 验证状态实例。

交付至少证明：

- 一个真实需求贯穿关卡、考试和最终 Goal；
- 公开事实、计划与结果边界清楚；
- Goal 包含真实输入、步骤、指标、验收、多 Agent 和根因退出；
- Candidate/Confirmed/Verified 凭据链完整；
- 三个通用 fixture 仍能通过；
- 公开发行候选通过敏感内容扫描和 ZIP 解包 smoke。
