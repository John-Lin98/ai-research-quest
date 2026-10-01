# Research Quest Self-Improvement Protocol

## 目标

让 Research Quest 随真实使用不断改善，同时避免“AI 自己觉得自己更好”或把用户私有内容直接写回公共仓库。

默认采用受控 RSI：

```text
Observe → Diagnose → Propose → Replay/Eval → PR → Promote/Rollback
```

## 1. Experience Event

只记录会改变未来 Skill 行为的高价值事件，不保存完整聊天。

推荐事件类型：

- `user_correction`：用户纠正了错误理解或事实；
- `repeated_question`：已知信息被重复询问；
- `goal_drift`：Skill 把任务带离用户真实目标；
- `excessive_scaffolding`：固定 UI / 流程妨碍任务推进；
- `duplicate_search`：多 Agent 或多轮重复同类探索；
- `repeated_failure`：同因失败被机械重试；
- `unverified_claim`：外部事实未经验证就升级；
- `bad_grill`：问题没有改变决策，或退化成低价值问卷；
- `tool_or_workflow_failure`：工具/工作流设计导致失败；
- `successful_pattern`：新的交互/搜索/验证模式明显有效；
- `user_override`：用户跳过 Skill 流程并给出更有效路线。

每条事件至少包含：

```text
id
event_type
symptom
evidence_summary
impact
root_cause_candidate
lesson
do_not_repeat
proposed_change_scope
privacy_status
```

### 隐私

默认只允许保存**脱敏摘要**。不得自动把以下内容写入公共仓库：

- 私有代码；
- 未公开科研结果；
- 服务器路径、凭据、个人身份信息；
- 用户上传文件的原文；
- 可反推出敏感项目的信息。

## 2. Meta-review 触发

满足任一条件即可触发：

1. 用户明确要求“优化/改进这个 Skill”；
2. 同类摩擦事件累计 ≥3；
3. 一次 Quest 出现关键失败或用户强制纠错；
4. 完成一个重要项目/战役；
5. 达到维护者设定的会话或事件批次。

Meta-review 输出不超过 3 个候选修改，优先高影响、低风险改动。

## 3. Mutation Contract

每个候选修改必须写清：

- 当前问题；
- 支持证据；
- 要修改的文件或规则；
- 预期改善的行为；
- 可能回归；
- 如何验证；
- 回滚条件。

允许修改：
- `SKILL.md`；
- references / templates；
- agent prompt；
- fixtures / eval；
- 非敏感公开 Demo 行为。

Protected，不得由普通 Self-Improvement 自动放宽：
- 隐私/安全边界；
- Candidate → Confirmed → Verified 的证据原则；
- 外部事实需要验证；
- 用户最新指令优先；
- 公开仓库不得泄露私有项目内容。

## 4. Eval Gate

至少检查六类行为：

1. **No-repeat**：材料已有答案时不再询问；
2. **High-value Grill**：问题会改变 Goal/路线/验收/风险；
3. **Evidence discipline**：AI 自评不能把外部事实升级为 Verified；
4. **Search diversity**：并行路线具有实质差异；
5. **Failure memory**：同因失败触发 do-not-repeat / route switch；
6. **User agency**：用户要求直接执行时 Skill 不得阻塞。

建议附加指标：

- 重复问题率；
- 用户纠错率；
- Goal 大改次数；
- 重复失败率；
- 首次可执行动作所需轮数；
- 每单位成本获得的新有效证据；
- held-out replay 成功率。

## 5. Promotion Gate

默认三档：

### Observe
只收集脱敏 Experience Events，不修改 Skill。

### Propose（默认）
自动：
- 聚类问题；
- 生成 1–3 个 mutation；
- 更新候选分支；
- 运行 eval；
- 创建 PR。

不自动合并。

### Promote
仅在维护者显式允许，并满足：
- 所有必需测试通过；
- 无安全/隐私回归；
- 至少一个目标指标改善；
- 无关键 held-out 回归；
- PR 可回滚。

才允许自动合并/发布。

## 6. Rollback

以下任一情况立即回滚候选升级：

- 公开安全扫描失败；
- Verified 证据纪律被削弱；
- 用户控制权下降；
- held-out replay 出现关键退化；
- 自动化无法解释为什么新版更好。

## 7. Quest 内反馈闭环

普通 Quest 结束或重大纠错发生时，Skill 可内部生成一条脱敏 Experience Event。

不要每轮打断用户展示 Self-Improvement 细节。只有：
- 用户要求查看；
- 问题影响当前任务；
- 准备升级 Skill；
才展示。

## 8. 推荐维护流程

```text
真实使用
→ Experience Ledger
→ Meta-review
→ Candidate mutation
→ v1/v2 replay
→ safety + contract eval
→ PR
→ maintainer / protected gate
→ merge
→ release
→ 继续收集新证据
```

这是一种**受控 RSI**：系统可以发现自身问题并提出改进，但“是否真的更好”由独立 eval 与受保护规则决定。
