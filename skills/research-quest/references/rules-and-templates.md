# Research Quest 规则与模板

## 目录

- [关卡设计](#关卡设计)
- [Known–Unknown 模板](#knownunknown-模板)
- [Prompt Clue 分类](#prompt-clue-分类)
- [三级认证规则](#三级认证规则)
- [最终考试](#最终考试)
- [Codex Goal 模板](#codex-goal-模板)
- [完成检查单](#完成检查单)

## 关卡设计

两个战役都严格使用七个有序主线关卡；序章、最终考试和 Goal Forge 单独建模。

| 关卡 | 学习认知战役 | 科研决策战役 | 必须产生 |
| --- | --- | --- | --- |
| 1 | 明确学习目标 | 冻结问题与成功条件 | 目标 v1、首个 Candidate |
| 2 | 区分事实与假设 | 划定数据与隐私边界 | Known Unknown、约束 |
| 3 | 绘制认知地图 | 选择 baseline 与对照 | Confirmed 凭据、决定 |
| 4 | 评估证据质量 | 冻结指标与验收 | 验收门、小测 |
| 5 | 在情境中应用 | 设计受控执行 | Verified 应用凭据 |
| 6 | 纠正误解 | 设置失败门与退出条件 | 纠错记录、风险 |
| 7 | 完成迁移 | 冻结执行与审查计划 | 迁移题、Goal 候选 |

每关使用以下模板：

```markdown
### level-N｜<标题>

- 任务：
- 知识卡：
- 预计时间：<min>–<max> 分钟
- 当前/总进度：
- 单一高价值问题：
- 选择：
  - A：<选择>；影响：<对后续路线的可见影响>
  - B：<选择>；影响：<对后续路线的可见影响>
- 选中项与理由：
- Goal 预览：
- 认知变化：Candidate / Confirmed / Verified / Known Unknown / 纠错
- 小测：状态、题目、正确率
- 奖励：
- 下一入口：
```

## Known–Unknown 模板

```markdown
## Known Known

| ID | 陈述 | 认证级别 | 来源类别 | 当前凭据 | 下一步凭据 |
| --- | --- | --- | --- | --- | --- |
| kk-001 |  | Candidate | public/sanitized/simulated | AI 提取记录 | 用户确认 |

## Known Unknown

| ID | 待回答问题 | 状态 | 引入关卡 | 关闭条件 |
| --- | --- | --- | --- | --- |
| ku-001 |  | open | level-2 |  |

## Unknown Known

| ID | 可能已隐含掌握但未表达的知识 | 状态 | 暴露方法 |
| --- | --- | --- | --- |
| uk-001 |  | under-investigation | 复述、情境选择或小测 |

## Unknown Unknown

| ID | 由反例/失败暴露的新未知 | 状态 | 探索动作 |
| --- | --- | --- | --- |
| uu-001 |  | open | 迁移题或边界案例 |
```

四类条目必须区分。不能因为一个问题被记录，就推断答案已经存在。

## Prompt Clue 分类

| Schema 值 | 提取内容 | 例子 | 常见反模式 |
| --- | --- | --- | --- |
| `goal-clue` | 目标、受众、价值 | “生成可执行计划” | 把愿景当验收 |
| `constraint-clue` | 时间、资源、安全、范围 | “不接触真实个人数据” | 忽略否定约束 |
| `workflow-clue` | 顺序、审批、协作 | “先验证再执行” | 省略关卡依赖 |
| `acceptance-clue` | 可复验通过条件 | “三份 fixture 均通过 Schema” | 用“已完成”替代证据 |
| `failure-clue` | 失败模式、停止门 | “两轮无进展则升级” | 无限重试 |
| `preference-clue` | 格式、语言、交互偏好 | “一次只问一个问题” | 当成客观事实 |
| `artifact-clue` | 输入/输出与引用 | “导出 Goal Markdown” | 猜测未读取内容 |

每条线索同时记录：

- `source_kind`：`public-context`、`sanitized-context` 或 `simulated`；
- `evidence_status`：`candidate`、`confirmed`、`verified` 或 `retrieval-limited`；
- 原文无法读取时保留限制，不补写“合理正文”。

## 三级认证规则

```text
Candidate --确认凭据--> Confirmed --验证凭据--> Verified
```

| 级别 | 最低要求 | 可用 evidence_type | 禁止 |
| --- | --- | --- | --- |
| Candidate | 明确陈述、provenance、至少一条候选凭据 | `ai-extraction` | 计入正式理解得分 |
| Confirmed | Candidate 全部要求 + 至少一条确认凭据 | `user-confirmation`、`restatement` | 仅凭 AI 自评晋级 |
| Verified | Confirmed 全部要求 + 至少一条独立验证凭据 | `choice-application`、`level-quiz`、`final-exam`、`transfer-task`、`misconception-correction` | 把确认等同应用 |

认证只单向晋级；证据不足时保持原级或降回待补证状态。正式知识数量只读 `known_knowns.verified`，并保持 `verified_only_for_knowledge_count: true`。

## 最终考试

默认配置：

```yaml
pass_threshold: 80
weights:
  decision_application: 60
  concept_understanding: 20
  transfer: 20
  weight_total: 100
```

考试至少包含三类题：

1. `decision-application`：给出受控情境，要求应用已冻结决定；
2. `concept-understanding`：解释关键概念和证据边界；
3. `transfer`：把方法迁移到未出现的新情境。

评分前检查三项权重算术和为 100。未达到 80 时，将薄弱类别映射回相关关卡，新增补证任务；不得修改答案或阈值来伪造通过。

## Codex Goal 模板

```markdown
# Codex Goal｜<名称>

## 冻结 Context
- 已确认事实：
- 待验证假设：
- 不可推断内容：

## 任务边界
- 目标：
- 成功条件：
- 范围内：
- 范围外：

## 多 Agent 分工
- Planner：
- Worker：
- Reviewer：
- 唯一文件 Owner 与交接格式：

## 模型路由
- 机械检索/转换：
- 语义、架构、证据判断：
- 升级条件：

## 执行步骤
1.

## 验证与验收
- 命令/检查：
- 证据：
- 失败处理：

## 安全
- 输入分级与脱敏：
- 禁止内容：
- 权限/审批边界：

## 独立审查
- 审查者：
- P0/P1 关闭条件：

## Git、PR 与合并
- 精确暂存：
- 中文提交与中文 PR：
- 集成 Owner：

## 退出条件
- 成功退出：
- blocker 退出：
- 不再继续的路线：
```

## 完成检查单

- [ ] Canonical Schema 可读取，且版本严格为 `1.0.0`。
- [ ] 输入只含公开、模拟或已脱敏内容；无凭据、个人标识、私有路径/代码、未公开结果、服务器细节、数据集或 checkpoint。
- [ ] 双战役都存在，且每个战役严格七关。
- [ ] 每关包含任务、知识卡、时间、进度、单一问题、选择影响、Goal 预览、认知变化、小测、奖励和下一入口。
- [ ] 七类 Prompt Clue 已分类，来源与证据状态齐全；检索限制未被猜测填补。
- [ ] Candidate、Confirmed、Verified 各有合法凭据；仅 Verified 计入正式得分。
- [ ] 四类 Known–Unknown 已显式区分。
- [ ] 最终考试覆盖应用、理解、迁移；权重和为 100；达到通过线后才进入 Goal Forge。
- [ ] Goal 覆盖 Context、边界、分工、模型路由、步骤、验证、安全、独立审查、中文 Git/PR/合并和退出条件。
- [ ] game-state 与 Goal 导出记录含版本、公开安全状态、时间与 SHA-256。
- [ ] 重新开始可用；自动演示为固定 seed、60–90 秒、非循环。
- [ ] JSON 实例通过仓库内唯一 Canonical Schema；未保存 Schema 副本。
- [ ] 产品效果仍标记为待验证假设，没有把模拟案例写成真实结论。
