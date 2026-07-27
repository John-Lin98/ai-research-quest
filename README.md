# Research Quest｜AI Research Game

把一个真实科研需求变成一场可玩的回合制游戏，并让 ChatGPT、Codex 或多 Agent 队伍依据用户的认知地图持续执行，直到生成可验证的科研交付。

当前默认 Demo 围绕一个真实公开需求展开：

> **设计一个 10 个公开酶目标的试点，评估 AlphaFold2 / AlphaFold DB 预测是否足以支持酶活性位点几何初筛。**

玩家不是回答泛泛的“AI 是否有用”，而是逐关冻结公开输入、活性位点区域、全局与局部指标、覆盖率、多 Agent 分工、验收和失败退出条件。页面不会预设试点结果，也不会把 pLDDT、结构相似性或游戏得分写成催化、结合、药物发现或科研能力结论。

## 核心定位：Game Loop + Goal Loop

```text
真实科研目标
→ Game Loop：建立 Known–Unknown 四象限
→ 自适应关卡、提问与正反馈
→ Goal Loop：持续精炼并执行目标任务
→ Agent 分工、工具调用与验证
→ 四象限回写、Goal 修订或最终交付
```

Research Quest 不是“游戏结束后导出一段提示词”这么简单：

- **Game Loop** 帮助用户理解项目、发现未知、表达隐含经验并获得持续正反馈；
- **Goal Loop** 把每轮选择写入目标合同，并让 Agent 继续执行真实任务；
- 除非用户只要求目标提示词，否则 Goal Forge 后默认继续执行、验证和交付。

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

四个象限共同决定下一关的问题、难度、Agent 分工和 Goal 版本。

## 三分钟看懂

1. 先查看完整关卡路线、预计轮次和最终 Goal 预览；
2. 选择真实试点要服务的下游判断；
3. 每回合通常只回答 1 个主问题，必要时最多追加 2 个证据或边界问题；
4. 在两条七关战役中冻结研究问题、公开数据、局部区域、指标、Agent 分工和验收；
5. 观察 Known–Unknown 四象限和 Goal vN 如何随每次选择变化；
6. 完成针对同一真实科研任务的应用、概念和迁移考试；
7. 锻造 Goal 后继续进入 Agent 执行，或导出可直接复用的 Codex Goal。

## 每回合的正反馈

每一关都应展示：

- 本关完成状态；
- 总进度和预计剩余时间；
- Known Knowns 的 Candidate / Confirmed / Verified 变化；
- Known Unknowns 的新增、关闭和剩余；
- Unknown Knowns 本轮暴露的隐含知识或偏好；
- Unknown Unknowns 新发现的隐藏风险或机会；
- 认知分数变化；
- 科研目标达成状态；
- Goal vN 相比上一版的变化；
- 解锁的知识卡、决策卡、实验卡或 Agent；
- 下一关为什么会更简单或更困难。

## 真实需求怎样进入游戏

### 战役一：理解真实需求与证据边界

七关依次处理：

- 真实需求定位；
- AlphaFold DB、PDB 与催化残基注释三类公开输入；
- pLDDT 与外部正确性的区别；
- 催化残基和固定 6 Å 邻域；
- 全局与局部指标；
- 覆盖率与选择偏差；
- 可写结论边界。

### 战役二：冻结公开试点与执行合同

七关依次处理：

- 10 个目标、至少 8 个有效结果的试点规模；
- 纳入与排除合同；
- 序列映射和结构对齐；
- 活性位点局部几何计算；
- 主表、校准图、逐目标 QA 与失败码；
- 数据、分析、复审与集成 Agent 分工；
- 3–5 轮实质不同尝试失败后的根因分析退出。

完整说明见[真实科研需求案例](public/case-study-alphafold-casp14.html)和[设计说明](docs/usage/real-research-task.md)。

## 功能

- 同一真实科研需求贯穿序章、双战役、考试、Goal 和后续执行；
- 每回合通常 1 个主问题，必要时最多追加 2 个证据或边界问题；
- 用户主动提出的问题会先被回答或运行，再写入四象限和 Goal；
- 错误或未验证回答不会进入后续 Goal；
- 根据四象限、正确率和用户偏好自动调整下一关难度，并在每关明确显示调整原因；
- 展示本关时间、总进度、预计剩余时间、目标变化和认知分；
- Candidate、Confirmed、Verified 三级认证及 Verified-only 计分；
- 决策应用 60%、概念理解 20%、迁移 20% 的透明演示评分；
- 固定 seed、约 75 秒、不循环的自动演示；
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

1. 读取用户真实目标和材料；
2. 展示完整关卡路线与预计时间；
3. 建立固定坐标的 Known–Unknown 四象限；
4. 以每轮 1–3 个关键问题进行小步对齐；
5. 逐关提问、执行和更新 Goal；
6. 根据认知地图调整难度；
7. 运行最终考试；
8. 生成并继续执行多 Agent Goal。

Skill 读取仓库根目录唯一的 `shared/game-state.schema.json`。安装与 ZIP 步骤见 [Skill 安装指南](docs/usage/skill-installation.md)。

## 隐私模型

- 页面加载静态文件后，不上传用户输入、不发送遥测，也没有账户或服务端 API；
- 状态只保存在当前页面内存，刷新或关闭页面即丢失；
- 自由文本只会在用户主动导出时通过浏览器本地 `Blob` 下载；
- 导出前会阻止邮箱、常见密钥/令牌、私人绝对路径和过长文本；
- 不要输入邮箱、API Key、Token、密码、私人路径、未公开结果、私有代码、数据集或 checkpoint。

更完整的边界见 [PRIVACY.md](PRIVACY.md)；漏洞报告方式见 [SECURITY.md](SECURITY.md)。

## 在线入口

- [GitHub Pages 互动 Demo](https://john-lin98.github.io/ai-research-quest/)
- [真实科研需求案例页](https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html)
- [四象限目标驱动演示视频](https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm)
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
