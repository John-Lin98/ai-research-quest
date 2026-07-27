# Research Quest 规则与模板

## 目录

- [核心循环](#核心循环)
- [每回合问题预算](#每回合问题预算)
- [关卡设计](#关卡设计)
- [Known–Unknown 四象限](#knownunknown-四象限)
- [Prompt Clue 分类](#prompt-clue-分类)
- [三级认证与防错传播](#三级认证与防错传播)
- [认知自适应难度](#认知自适应难度)
- [每回合正反馈](#每回合正反馈)
- [最终考试](#最终考试)
- [Codex Goal 模板](#codex-goal-模板)
- [完成检查单](#完成检查单)

## 核心循环

Research Quest 同时运行两条循环：

```text
Game Loop：提问 → 四象限更新 → 难度调整 → 正反馈
Goal Loop：目标更新 → AI/Agent 执行 → 验证 → 结果回写
```

Game Loop 负责让用户理解项目并形成认知地图；Goal Loop 负责真正完成科研任务。除非用户明确只要求目标提示词，否则 Goal Forge 后继续执行，不在“生成提示词”处停止。

## 每回合问题预算

每回合认知测试最多提出三个关键问题：

1. **主问题**：决定当前目标、路线或关键科研选择；
2. **证据问题**：只有需要判断用户是否真正理解时才提出；
3. **偏好或边界问题**：只有答案会改变难度、风险或执行方式时才提出。

通常只问一个问题，最多三个。采用类似 grill-me-with-docs 的快速小步思路：只询问最影响最终设计和任务完成的问题，不为了显得完整而凑题。

```text
1–3 个关键问题
→ 用户回答
→ AI 立即回答或执行可执行工作
→ 更新四象限
→ 只冻结已确认内容
→ 更新 Goal vN
→ 下一回合继续降低一个关键不确定性
```

禁止：

- 一次列出大量问题让用户批量作答；
- 重复询问已经确认的信息；
- 用低价值题目换取“完成感”；
- 在主问题尚未回答时展开多个无关分支；
- 把一次错误回答直接写入后续 Goal。

用户主动提出额外问题时：先回答或执行，再判断它属于哪个象限；必要时最多反问一个高价值问题，然后回到主线。

## 关卡设计

默认使用两个七关战役；序章、最终考试和 Goal Forge 单独建模。关卡可根据认知地图合并、跳过或加深，但最终状态必须映射到 Schema。

| 关卡 | 学习认知战役 | 科研决策战役 | 必须产生 |
| --- | --- | --- | --- |
| 1 | 真实需求与目标 | 冻结问题与成功条件 | 目标 v1、首个 Candidate |
| 2 | 任务、概念与输入 | 数据、split 与隐私边界 | Known Unknown、约束 |
| 3 | 证据与认知地图 | baseline 与公平比较 | Confirmed 凭据、决定 |
| 4 | 指标与结论边界 | 验收和失败信号 | 验收门、小测 |
| 5 | 情境应用 | 实验或执行方案 | Verified 应用凭据 |
| 6 | 失败、偏差与纠错 | 多 Agent 分工与通信 | 纠错记录、Agent 图 |
| 7 | 迁移与故事线 | 3–5 轮失败与根因退出 | 迁移题、Goal 候选 |

每关使用以下模板：

```markdown
### level-N｜<标题>

- 任务：
- 知识卡：
- 预计时间：<min>–<max> 分钟
- 当前/总进度：
- 本回合问题预算：1–3
- 主问题：
- 必要补充问题：最多 2 个
- 选择及其可见影响：
- 用户回答与证据级别：Candidate / Confirmed / Verified
- Goal 预览：
- 四象限变化：
- 认知分变化：
- 科研目标达成状态：
- 奖励：
- 下一关难度与原因：
```

## Known–Unknown 四象限

认知地图必须固定展示为二维四象限。

- **横轴：用户是否已经意识到这个问题**；
- **纵轴：用户实际上是否已经掌握相关知识**。

|  | 用户已经意识到 | 用户尚未意识到 |
| --- | --- | --- |
| **已经掌握** | **Known Knowns**：用户知道自己知道 | **Unknown Knowns**：用户实际上知道，但还没有明确表达或意识到 |
| **尚未掌握** | **Known Unknowns**：用户知道自己不知道 | **Unknown Unknowns**：用户尚未意识到自己不知道 |

固定视觉位置：

```text
                         横轴：用户是否已经意识到
                  已经意识到                     尚未意识到
纵轴  已经掌握    Known Knowns                  Unknown Knowns
用户  尚未掌握    Known Unknowns                Unknown Unknowns
是否
掌握
```

不得把四象限按列表顺序随意排列，也不得将 Unknown Knowns 与 Known Unknowns 对调。

### Known Knowns

| ID | 陈述 | 认证级别 | 来源类别 | 当前凭据 | 下一步凭据 |
| --- | --- | --- | --- | --- | --- |
| kk-001 |  | Candidate | public/sanitized/simulated | AI 提取记录 | 用户确认 |

Known Knowns 内部使用 Candidate → Confirmed → Verified。只有 Verified 计入正式认知分。

### Known Unknowns

| ID | 用户明确知道自己缺少的答案 | 状态 | 引入关卡 | 关闭条件 |
| --- | --- | --- | --- | --- |
| ku-001 |  | open | level-2 |  |

### Unknown Knowns

| ID | 用户实际掌握但尚未明确表达或意识到的知识/偏好 | 状态 | 暴露方法 |
| --- | --- | --- | --- |
| uk-001 |  | under-investigation | 理由解释、方案比较、过去经验、迁移题 |

Unknown Known 被表达后，先进入 Known Knowns 的 Candidate 或 Confirmed，不能直接成为 Verified。

### Unknown Unknowns

| ID | 用户尚未意识到自己不知道的问题 | 状态 | 探索动作 |
| --- | --- | --- | --- |
| uu-001 |  | open | 反例、失败、冲突证据、真实执行、独立审查 |

发现 Unknown Unknown 视为“解锁隐藏地图”，不是玩家失败。

## Prompt Clue 分类

| Schema 值 | 提取内容 | 例子 | 常见反模式 |
| --- | --- | --- | --- |
| `goal-clue` | 目标、受众、价值 | “生成可执行计划” | 把愿景当验收 |
| `constraint-clue` | 时间、资源、安全、范围 | “不接触真实个人数据” | 忽略否定约束 |
| `workflow-clue` | 顺序、审批、协作 | “先验证再执行” | 省略关卡依赖 |
| `acceptance-clue` | 可复验通过条件 | “三份 fixture 均通过 Schema” | 用“已完成”替代证据 |
| `failure-clue` | 失败模式、停止门 | “3–5 轮后根因退出” | 首次失败即停止或无限重试 |
| `preference-clue` | 格式、语言、交互偏好 | “每轮最多三个问题” | 当成客观事实 |
| `artifact-clue` | 输入/输出与引用 | “导出 Goal Markdown” | 猜测未读取内容 |

每条线索同时记录来源和证据状态；原文无法读取时保留限制，不补写“合理正文”。

## 三级认证与防错传播

```text
Candidate --确认凭据--> Confirmed --验证凭据--> Verified
```

| 级别 | 最低要求 | 可用 evidence_type | 禁止 |
| --- | --- | --- | --- |
| Candidate | 明确陈述、provenance、至少一条候选凭据 | `ai-extraction` | 计入正式理解得分 |
| Confirmed | Candidate 全部要求 + 至少一条确认凭据 | `user-confirmation`、`restatement` | 仅凭 AI 自评晋级 |
| Verified | Confirmed 全部要求 + 至少一条独立验证凭据 | `choice-application`、`level-quiz`、`final-exam`、`transfer-task`、`misconception-correction` | 把确认等同应用 |

当用户回答错误或 AI 发现题目设置有误时：

1. 标记为误解或无效题目；
2. 说明为什么不能继续使用；
3. 回滚受影响的 Goal 草案；
4. 用一个更简单的问题重新验证；
5. 不把错误传入后续关卡、Agent 任务或最终 Goal。

## 认知自适应难度

- Known Knowns 较少：减少术语，使用具体示例和二选一；
- Known Knowns 较多：加入冲突证据、失败案例和迁移题；
- Known Unknowns 决定下一关需要回答的核心问题；
- Unknown Knowns 通过理由、偏好和经验追问暴露；
- Unknown Unknowns 触发隐藏支线或 Boss 关；
- 连续两关高分：允许跳过重复基础关；
- 连续两关低分：只回到一个最薄弱关卡补证据，不重做整个游戏。

## 每回合正反馈

每轮结算必须展示：

- 本关完成状态；
- 总进度与预计剩余时间；
- Known Knowns 的 Candidate / Confirmed / Verified 变化；
- Known Unknowns 的新增、关闭和剩余；
- Unknown Knowns 本轮暴露的隐含知识或偏好；
- Unknown Unknowns 新发现的隐藏风险或机会；
- 认知分数变化；
- 科研目标达成状态；
- Goal vN 相比上一版的变化；
- 解锁奖励；
- 下一关难度与原因。

反馈必须具体说明用户掌握了什么以及这如何改变下一步。

## 最终考试

默认只设置三个关键问题：

1. 决策应用，权重 60%；
2. 核心概念理解，权重 20%；
3. 新项目迁移，权重 20%。

通过线默认 80。未通过时只回到最薄弱的一个关卡补证据，不重新完成整套题，不修改答案或阈值伪造通关。

## Codex Goal 模板

```markdown
# Codex Goal｜<名称>

## 冻结 Context
- 已确认事实：
- 待验证假设：
- 用户偏好：
- 不可推断内容：

## Known–Unknown 四象限
- Known Knowns（含 Candidate / Confirmed / Verified）：
- Known Unknowns：
- Unknown Knowns：
- Unknown Unknowns：

## 任务边界
- 目标：
- 成功条件：
- 范围内：
- 范围外：

## 多 Agent 分工与模型路由

## 执行步骤

## 验证与验收

## 安全与结论边界

## 独立审查、中文 Git/PR/合并

## 3–5 轮失败与根因分析

## Goal Forge 后继续执行
```

## 完成检查单

- [ ] Canonical Schema 可读取，且版本严格为 `1.0.0`。
- [ ] 输入只含公开、模拟或已脱敏内容。
- [ ] 同一真实需求贯穿关卡、考试、Goal 和执行。
- [ ] 每回合最多 1–3 个关键问题，通常只有 1 个。
- [ ] 四象限按固定横轴/纵轴和固定位置展示。
- [ ] Known Knowns 内部三级认证合法，仅 Verified 计分。
- [ ] 错误回答或错误题目不会传播到后续 Goal。
- [ ] 每回合显示进度、时间、四象限变化、认知分、目标状态和 Goal 变化。
- [ ] 最终考试只有三个关键题型，权重和为 100。
- [ ] Goal 覆盖 Context、四象限、边界、分工、步骤、验证、安全、审查和根因退出。
- [ ] Goal Forge 后默认继续执行，除非用户只要求 Goal 文本。
- [ ] 自动演示固定 seed、60–90 秒、非循环且不计正式得分。
- [ ] JSON 实例通过唯一 Canonical Schema。
- [ ] 未把计划、模拟案例或游戏得分写成真实科研结论。
