import type { GameState } from "../types/index.ts";

function list(items: string[], fallback: string): string {
  return (items.length > 0 ? items : [fallback])
    .map((item) => `- ${item}`)
    .join("\n");
}

export function generateCodexGoal(state: GameState): string {
  const frozenDecisions = state.decisions
    .filter((decision) => decision.status !== "superseded")
    .map((decision) => decision.summary);
  const verifiedKnowledge = state.known_knowns.verified.map(
    (knowledge) => knowledge.statement,
  );
  const openUnknowns = state.known_unknowns
    .filter((item) => item.status !== "resolved")
    .map((item) => item.statement);

  return `# Codex Goal：Research Quest 受控闭环交付

## 1. 冻结 Context

- 目标：${state.project_goal.summary}
- 模式：controlled-loop；一次只处理一个会改变后续方案的高价值问题。
- 证据边界：Candidate → Confirmed → Verified，只允许 Verified 进入正式知识得分。
- 演示边界：${state.interaction_mode === "auto-demo" ? "当前为自动演示轨迹；其中的状态迁移只用于展示流程，不构成用户 Verified 或正式理解分。" : "当前为用户互动轨迹；仅完成小测并经 Candidate → Confirmed → Verified 的知识可计入正式理解分。"}
- 数据边界：所有案例仅为模拟、改编或脱敏内容，不代表真实科研结果。
- 产品效果边界：游戏化是否提升创造力、长期理解或转化仍待用户研究验证。

## 2. 成功标准

${list(state.project_goal.success_criteria, "完成冻结验收矩阵中的 P0 条目。")}

## 3. 任务边界与非目标

${list(state.project_goal.constraints, "保持公开、安全、可复现。")}
- 不复制或推断私有代码、论文全文、服务器细节、绝对路径、凭据、数据集、checkpoint、个人标识或未公开结果。
- 不把模拟输出、自动测试通过或演示得分表述为科研性能或真实世界效果。
- 未获明确授权时，不执行登录、付费、外部发布、删除、覆盖或其他不可逆操作。

## 4. 已冻结决策

${list(frozenDecisions, "尚无玩家决策；执行前先完成受控选择。")}

## 5. 已验证认识与开放未知

### Verified（可进入正式理解）

${list(verifiedKnowledge, "尚无 Verified 认识；Candidate/Confirmed 不得替代。")}

### Known Unknown（必须保留）

${list(openUnknowns, "尚未登记开放未知；执行时持续补充。")}

## 6. 多 Agent 分工

- Planner：拆解目标、声明依赖、风险、输入输出和退出条件，不直接把推断升级为事实。
- Worker：只在明确所有权范围实现最小可验证变更，产出可审查 artifact 与命令日志。
- Reviewer：与实现者分离，检查产品合同、正确性、可访问性、隐私安全、可复现性和证据边界。
- Integrator：按所有权顺序精确集成，解决接口兼容；不得使用批量暂存带入无关或敏感文件。
- Orchestrator：维护单一控制面，分派修复并依据退出条件决定继续、转向或停止。

## 7. 模型路由

- 低风险、边界清晰的整理与机械检查使用日常模型。
- 跨模块设计、歧义消解和高风险审查使用高推理模型。
- 独立 Reviewer 不复用 Worker 的未证实结论；必要时从冻结 Context 和实际 artifact 重新验证。
- 不以更强模型替代缺失授权、证据、凭据或安全门槛。

## 8. 执行与验证

1. 读取冻结 Context、Canonical Schema、验收矩阵和文件所有权。
2. 对每项工作明确输入、输出、Owner、可执行验证和失败信号。
3. 先做最小、可逆、无密钥的实现；每次只推进一个可观察状态转换。
4. 运行类型检查、单元测试、构建、端到端流程、Schema 校验和隐私扫描。
5. 保存实际命令、退出码与关键输出；“已完成”不构成验收证据。
6. 修复 P0/P1 后由独立 Reviewer 复验；未关闭项保持显式 blocker。

## 9. 安全与发布门

- 仅消费公开、模拟、改编或已脱敏输入；默认纯前端且不依赖 API Key。
- 对敏感信息、绝对私有路径、凭据、私有资产、未公开结果执行 fail-closed。
- 外部发布前必须通过隐私/安全审查和独立六维审查，且无未关闭 P0/P1。
- Git 仅精确暂存授权路径；提交、PR、合并说明使用中文。

## 10. 独立审查

Reviewer 至少核对：合同一致性、功能闭环、状态与 Schema、可访问性、隐私安全、可复现部署。每个发现记录严重级别、证据、影响验收项、Owner、修复与复验结果。

## 11. PR、合并与交接

- 提交和 PR 内容使用中文，列出 artifact、Schema 依赖、验证命令、结果、风险和 blocker。
- 按 Owner 顺序集成；同一文件冲突或 Schema 歧义交由对应 Owner 处理，不私自分叉语义。
- 交接必须包含 from、to、artifact、status、decision、assumptions、validation、blockers、requested_action。

## 12. 退出条件

- 成功退出：全部 P0 有实际证据，最终考试通过，Goal/state 可导出，安全与独立审查无未关闭 P0/P1。
- 暂停：需要登录/授权/付费，发现敏感信息，涉及删除/覆盖，或冻结 Context 存在无法消解的实质冲突。
- 转向：同一路线连续验证失败且替代路线更可逆、证据更强。
- 停止：达到预设预算/轮次上限、关键依赖不可获得，或继续执行会越过安全/所有权边界。

---

生成状态：schema ${state.schema_version}；revision ${state.revision}；正式理解分 ${
    state.metrics.formal_understanding_score ?? "待最终考试"
  }。`;
}
