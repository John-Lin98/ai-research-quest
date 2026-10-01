# Research Quest v2｜GPT-6 Sol 优化记录（2026-10-01）

## 目标

基于真实使用反馈，把 Research Quest 从“文档驱动的问答游戏”升级为“认知对齐 + 高价值 Grill + 搜索/验证/记忆/进化”的复杂任务协议。

## 本轮观察

历史使用中保留价值最高的机制：
- Known–Unknown 四象限；
- Candidate → Confirmed → Verified；
- 文档优先，不重复询问；
- 每轮默认一个关键问题；
- Frozen Context → Goal → Agent/Codex 执行；
- 用户可随时追问、补充线索和纠错。

需要修正的行为：
1. 完整四象限、进度、分数、选项每轮重复，容易挤占真正的推理内容；
2. Grill 有时退化成选择题，缺少对反例、失败模式和关键假设的主动攻击；
3. 多 Agent 容易等价于“多次生成”，没有强制搜索多样性；
4. 失败虽被记录，但没有明确的 do-not-repeat 条件和搜索策略更新；
5. 对强推理模型的指令过密，容易限制模型主动验证和工具使用；
6. Goal Forge 偏向一次性交接，没有把执行结果系统地反馈给下一轮。

## v2 设计

### 核心状态机

```text
Goal
→ Context Recovery
→ Known–Unknown Map
→ High-value Grill
→ Diverse Search
→ External Verification
→ Select / Prune
→ Experience Memory
→ Meta-review
→ Goal / Search-policy Update
```

### 三层循环

- Understanding Loop：消除认知空缺；
- Execution Loop：真实执行并用 evaluator 验证；
- Evolution Loop：从轨迹中更新 workflow / skill / agent / search policy。

### 搜索效率

优先优化：

```text
Useful Novel Evidence / (Compute + Time + Human Attention)
```

而不是 Agent 数量或总 trial 数。

### Grill 升级

Grill 的目标从“补齐字段”改成“攻击最可能改变决策的未知”。高掌握度用户优先：
- 反例；
- 边界条件；
- 冲突证据；
- 失败模式；
- 路线取舍；
- evaluator 是否可信。

### 记忆升级

重要尝试新增：
- Why it worked / failed；
- Cost；
- Reusable lesson；
- Do-not-repeat condition；
- Next search implication。

### GPT-6 Sol 优化原则

依据 OpenAI 2026 年 Skills 与 GPT-6 系列指导：
- description 短且触发明确；
- SKILL.md 只保留不可缺失的行为协议；
- references 渐进披露；
- 不要求无条件读全仓库；
- 不把模型能自己验证的事实推给用户确认；
- 用户最新指令和真实执行状态优先；
- 避免过度规定逐步思考，让强推理模型自行规划。

## 验收

至少检查：
- 旧的 Candidate/Confirmed/Verified 与四象限语义未破坏；
- 普通回合可以轻量输出；
- Search Mode 强制路线多样性；
- 同因重复失败会触发停止/根因分析；
- 外部事实必须验证；
- Goal Forge 包含 evaluator、预算、剪枝、记忆和停止条件；
- 现有 fixture/schema 测试不因文档协议修改而失效。
