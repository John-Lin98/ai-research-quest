# AI Research Quest

把一个真实科研需求变成一场可玩的决策游戏，并在通关后导出可直接交给 Codex 的执行合同。

当前默认 Demo 围绕一个真实公开需求展开：

> **设计一个 10 个公开酶目标的试点，评估 AlphaFold2 / AlphaFold DB 预测是否足以支持酶活性位点几何初筛。**

玩家不是回答泛泛的“AI 是否有用”，而是逐关冻结公开输入、活性位点区域、全局与局部指标、覆盖率、多 Agent 分工、验收和失败退出条件。页面不会预设试点结果，也不会把 pLDDT、结构相似性或游戏得分写成催化、结合、药物发现或科研能力结论。

## 三分钟看懂

1. 先选择真实试点要服务的下游判断。
2. 在两条七关战役中冻结研究问题、公开数据、局部区域、指标、Agent 分工和验收。
3. 观察认知如何沿 `Candidate → Confirmed → Verified` 单向升级。
4. 完成针对同一科研任务的应用、概念和迁移考试。
5. 导出包含数据、步骤、指标、验收、根因分析和多 Agent 分工的 Codex Goal。

只有带应用、小测、迁移或纠错证据的 `Verified` 项会计入正式理解分。`Candidate` 是候选认识，`Confirmed` 是已确认陈述，两者不会因为 AI 摘要或一次点击而自动成为已验证知识。

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

- 同一真实科研需求贯穿序章、双战役、考试和 Goal；
- 每关只提出一个会改变后续方案的关键问题；
- 展示本关时间、总进度、预计剩余时间、目标变化和认知地图；
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
- [约 75 秒网页演示视频](https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm)
- [Research Quest Skill Release](https://github.com/John-Lin98/ai-research-quest/releases/tag/v1.0.0)

## 本地运行

需要 Node.js 20 或更高版本。

```powershell
npm ci --prefix app
npm run dev --prefix app
```

生产构建与完整测试：

```powershell
npm run lint --prefix app
npm run test:contract --prefix app
npx --prefix app playwright install chromium
npm run test:e2e --prefix app
npm run build --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

更多细节见[新手指南](docs/usage/getting-started.md)、[Demo 数据说明](docs/usage/demo-data.md)、[演示视频说明](docs/usage/demo-video.md)与[发布社交文案](docs/usage/social-copy.md)。

## Research Quest Skill

Skill 位于 `skills/research-quest/`，并读取仓库根目录唯一的 `shared/game-state.schema.json`。首选克隆仓库后，将 `skills/research-quest/` junction/symlink 到 Agent skills 目录；发布 ZIP 保留 Skill、Schema、许可证和第三方 notices 的相对布局。

完整 Windows、macOS/Linux 和 ZIP 步骤见 [Skill 安装指南](docs/usage/skill-installation.md)。

## GitHub Pages

工作流在 Pull Request 和 `main` 上运行质量检查。只有公开仓库 `main` 的已验证构建才会上传和部署 Pages；发布权限仅授予最终 deploy job。

## 公开数据与边界

- 默认状态：[public/demo-data/default-game-state.json](public/demo-data/default-game-state.json)
- 唯一 Schema：[shared/game-state.schema.json](shared/game-state.schema.json)
- 三个 Skill fixture：[skills/research-quest/references/test-sessions.md](skills/research-quest/references/test-sessions.md)
- 数据分类与审批状态：[docs/usage/demo-data.md](docs/usage/demo-data.md)

默认状态的 `privacy.sanitization.review_status` 只有在独立公开审计通过后才能设为 `approved`。CI 会把未审批状态视为发布 blocker。

## 许可证

项目采用 [MIT License](LICENSE)。第三方软件及其许可证见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)。
