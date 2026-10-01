# Research Quest v2｜完成情况与下一步

日期：2026-10-01

## 已完成

- 重写 `skills/research-quest/SKILL.md`，从固定七关/固定 UI 倾向升级为轻量状态机；
- 保留 Known–Unknown 与 Candidate → Confirmed → Verified；
- 新增 Understanding / Execution / Evolution 三层循环；
- 新增 Search Mode：多样化假设、并行搜索、预算漏斗、剪枝；
- 新增外部 evaluator 优先级，限制 AI 自评；
- 新增 Experience Memory 与 do-not-repeat；
- 新增 Meta-review，使 workflow / skill / agent / search policy 可受控进化；
- 优化 GPT-6 Sol / Astra 使用：短描述、渐进披露、按需读文件、减少过度脚手架；
- 更新 OpenAI Agent 默认提示词；
- 保留现有 schema、fixtures、隐私与公开安全约束。

## 设计判断

本轮不直接修改 `shared/game-state.schema.json` 和三个大型 fixture。原因是 v2 首先是 Agent 行为协议升级；在没有新 eval 证明 schema 需要破坏性迁移前，保持数据合同稳定更安全。

## 下一步建议

1. 增加 v2 行为 eval，而不是只依赖旧 fixture：
   - 文档已有答案时不得重复提问；
   - 高掌握度用户应收到反例/边界 Grill；
   - 多 Agent 路线必须具有语义多样性；
   - 同因失败必须触发 do-not-repeat；
   - AI 自评不能把 Candidate 升为 Verified；
   - 用户要求直接执行时 Skill 不得阻塞。
2. 用 5–10 个真实历史会话做回放，对比 v1/v2：
   - 用户轮数；
   - 重复问题数；
   - Goal 大改次数；
   - 有效新未知数；
   - 重复失败率；
   - 最终执行成功率。
3. 只有 v2 eval 明确更好后，再更新公开 Demo 的 UI/schema。
