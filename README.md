# Research Quest｜AI Research Game

Research Quest 不是一款要求用户学习操作的独立游戏，而是一个**改造人与 AI 科研聊天方式的 Skill**：AI 先通过少量游戏化问题理解项目和用户认知，再冻结 Context 与 Goal 交给 Codex 或多 Agent 执行。

> **核心流程：先沟通，再执行。** Research Quest 先通过聊天式关卡了解项目背景、已有材料、约束、用户偏好与 Known–Unknown 四象限；关键信息确认后，再冻结 `Context + Goal` 并交给 Codex 执行。Codex 不必从一句模糊命令猜测需求，而是依据更完整、精确、可追溯的上下文工作。

当前默认聊天 Demo 围绕一个真实公开需求展开：

> **设计一个 10 个公开酶目标的试点，评估 AlphaFold2 / AlphaFold DB 预测是否足以支持酶活性位点几何初筛。**

访问者看到的是一段类似 ChatGPT 的科研对话，而不是大型游戏地图：每轮只处理 1–3 个关键问题，同时展示四象限、认知分、目标进度、预计时间和 Goal 变化。原完整 Dashboard、案例博文、视频和 Skill Release 全部保留。

## 核心定位：先沟通，再执行

```text
真实科研需求与项目材料
→ 沟通阶段：聊天式关卡 + Known–Unknown 四象限 + 用户偏好
→ Context Freeze：冻结目标、证据、边界、验收与失败规则
→ Goal Forge：生成引用冻结 Context 的 Codex 目标提示词
→ 执行阶段：Codex / 多 Agent 开发、测试、审查与交付
→ 结果回写：更新四象限、修订 Goal 或完成任务
```

Research Quest 将复杂科研协作分成三个清晰环节：

- **Game Loop｜聊天与认知对齐**：AI 用每轮 1–3 个关键问题了解项目事实、用户理解、隐含经验和偏好；
- **Context Freeze｜冻结执行依据**：只把已经确认或验证的信息写入任务 Context，同时保留开放未知和证据边界；
- **Execution Loop｜Codex 执行**：Codex 读取冻结 Context 和 Goal 后直接开发、测试、审查与交付，不再重复猜测已经确认的需求。

## 默认聊天 Demo 与完整 Dashboard

### 默认入口：聊天式演示

[GitHub Pages 首页](https://john-lin98.github.io/ai-research-quest/)默认展示使用 Skill 后的人机交互效果：

- 固定 5 轮 AlphaFold2 真实需求案例；
- 每条 AI 回复都包含完整但紧凑的四象限快照；
- 根据上一轮认知状态解释为什么下一轮更基础或更深入；
- 最终生成并下载 `context.md` 与 Codex Goal；
- 页面顶部和底部始终提供 Skill 安装、完整 Dashboard、案例博文和视频入口。

### 输入自己的科研需求

网页提供两步聊天式输入：

1. 描述真实科研需求；
2. 补充最终产物、已有材料或约束。

网页只在浏览器本地生成：

- 初始任务摘要；
- Known–Unknown 四象限初始草图；
- Research Quest 启动提示词；
- `context.md`。

这些内容明确标记为**尚未经过 AI 访谈与认证的启动材料**。真正的动态提问、认知认证和 Goal Forge 由安装 Research Quest Skill 的 ChatGPT / Agent 完成。

### 完整机制演示

原双战役 Dashboard 继续保留：

- [完整 Dashboard](https://john-lin98.github.io/ai-research-quest/?view=full)
- [兼容入口 `/full-demo/`](https://john-lin98.github.io/ai-research-quest/full-demo/)

它适合项目复盘、教学、展示全部关卡和查看完整认知地图，不再承担首次解释产品的任务。

## Known–Unknown 四象限

认知地图严格使用四象限。横轴表示用户是否已经意识到这个问题，纵轴表示用户实际上是否已经掌握相关知识。

|  | 用户已经意识到 | 用户尚未意识到 |
| --- | --- | --- |
| **已经掌握** | **Known Knowns**：用户知道自己知道 | **Unknown Knowns**：用户实际上知道，但还没有明确表达或意识到 |
| **尚未掌握** | **Known Unknowns**：用户知道自己不知道 | **Unknown Unknowns**：用户尚未意识到自己不知道 |

### Known Knowns 内部认证

```text
Candidate → Confirmed → Verified
```

只有能够在小测、选择、纠错、实验设计或迁移题中正确应用的 `Verified` 项计入正式认知分。

四个象限共同决定下一轮的问题、难度、Agent 分工和 Goal 版本。

## 三分钟看懂

1. AI 先读取真实需求、项目材料和已有提示词，展示预计轮次、时间和最终产物；
2. 每轮只用 1–3 个关键问题补齐项目信息、用户偏好和 Known–Unknown 四象限；
3. 每条 AI 回复展示完整迷你四象限、本轮进度、认知分和 Goal vN 变化；
4. 只有经过确认或验证的信息才进入 Frozen Context，开放未知和证据边界同时保留；
5. AI 将 Frozen Context 编译成包含输入、步骤、验收、Agent 分工和退出规则的 Codex Goal；
6. Codex 依据 Context + Goal 直接执行，减少重复询问、误解和目标漂移；
7. 执行结果回写四象限和 Goal，直到形成可验证交付。

## 每回合的正反馈

每一轮聊天都应展示：

- 当前回合和完成状态；
- 总进度与预计剩余时间；
- 完整 Known–Unknown 四象限快照；
- Candidate / Confirmed / Verified 变化；
- 认知分数变化；
- 科研目标达成状态；
- Goal vN 相比上一版的变化；
- 下一轮为什么会更简单或更困难；
- 1 个主问题，必要时最多 2 个补充问题。

## 真实需求怎样进入聊天

固定案例用 5 轮展示：

1. 冻结真实下游判断；
2. 确认可用输入与材料；
3. 冻结证据边界；
4. 定义可验收完成信号；
5. Context Freeze 与 Goal Forge。

原完整 Dashboard 仍保留两条七关战役，用于深入展示数据、指标、覆盖率、Agent 分工和根因分析。完整说明见[真实科研需求案例](public/case-study-alphafold-casp14.html)和[设计说明](docs/usage/real-research-task.md)。

## 功能

- 默认以聊天界面展示使用 Skill 后的人机科研交互；
- 固定 5 轮真实案例和自定义两步需求入口；
- 每轮通常 1 个主问题，必要时最多追加 2 个证据或边界问题；
- 每条 AI 回复显示完整迷你四象限与本轮变化；
- 错误或未验证回答不会进入后续 Goal；
- 根据四象限、正确率和用户偏好自动调整下一轮难度，并显示调整原因；
- 本地生成启动提示词和 `context.md`，不上传输入；
- 原完整 Dashboard、考试、Goal 导出和自动演示继续保留；
- 符合 [Canonical Schema 1.0.0](shared/game-state.schema.json) 的状态与 Goal 导出；
- 桌面与移动端布局、键盘可访问交互；
- 纯前端、无账户、无遥测、无应用后端。

## 公开事实与尚未执行的部分

公开背景来自 AlphaFold2 论文、AlphaFold DB 和 PDB/PDBe。页面中“10 个酶目标”“6 Å 邻域”“至少 8 个有效结果”等是为展示需求编译过程而冻结的真实试点合同，**不是已经完成的实验结果**。

页面允许回答“应该如何设计并执行这项研究”，但不声称：

- AlphaFold2 已证明任何目标酶具有正确催化活性；
- 高 pLDDT 证明活性位点化学构型、配体或辅因子正确；
- 预测结构能够替代湿实验；
- Research Quest 已证明能够提高科研能力或创造力。

## Research Quest Skill

Skill 位于 `skills/research-quest/`，适用于论文投稿、实验规划、方向选择、数据集构建、方法改进和科研项目复盘。

Skill 会：

1. 读取用户真实目标、项目材料和历史提示词；
2. 以聊天式回合展示完整路线与预计时间；
3. 建立固定坐标的 Known–Unknown 四象限；
4. 以每轮 1–3 个关键问题补齐项目信息、认知状态和用户偏好；
5. 根据认知地图动态调整后续问题；
6. 将确认结果、开放未知、证据边界和验收规则冻结为任务 Context；
7. 基于 Frozen Context 生成可直接交给 Codex 的目标提示词；
8. 由 Codex 或多 Agent 队伍执行、测试、审查和交付，并将结果回写认知地图。

Skill 读取仓库根目录唯一的 `shared/game-state.schema.json`。安装与 ZIP 步骤见 [Skill 安装指南](docs/usage/skill-installation.md)。

## 隐私模型

- 页面加载静态文件后，不上传用户输入、不发送遥测，也没有账户或服务端 API；
- 状态只保存在当前页面内存，刷新或关闭页面即丢失；
- 自由文本只会在用户主动下载时通过浏览器本地 `Blob` 生成文件；
- 生成前会阻止邮箱、常见密钥/令牌和私人绝对路径；
- 不要输入邮箱、API Key、Token、密码、私人路径、未公开结果、私有代码、数据集或 checkpoint。

更完整的边界见 [PRIVACY.md](PRIVACY.md)；漏洞报告方式见 [SECURITY.md](SECURITY.md)。

## 在线入口

- [聊天式 Research Quest Demo](https://john-lin98.github.io/ai-research-quest/)
- [完整 Dashboard](https://john-lin98.github.io/ai-research-quest/?view=full)
- [真实科研需求案例页](https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html)
- [原完整机制演示视频](https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm)
- [Research Quest Skill v1.1.0](https://github.com/John-Lin98/ai-research-quest/releases/tag/v1.1.0)

## 本地运行与验证

需要 Node.js 20 或更高版本。

```powershell
npm ci --prefix app
npm run lint --prefix app
npm run test:contract --prefix app
npx --prefix app playwright install chromium
npm run test:e2e --prefix app
npm run build --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

## 公开数据与边界

- 默认状态：[public/demo-data/default-game-state.json](public/demo-data/default-game-state.json)
- 唯一 Schema：[shared/game-state.schema.json](shared/game-state.schema.json)
- 三个 Skill fixture：[skills/research-quest/references/test-sessions.md](skills/research-quest/references/test-sessions.md)
- 数据分类与审批状态：[docs/usage/demo-data.md](docs/usage/demo-data.md)

## 许可证

项目采用 [MIT License](LICENSE)。第三方软件及其许可证见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)。
