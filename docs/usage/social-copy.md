# Research Quest 发布文案

以下内容围绕一个真实公开科研需求展示产品逻辑，不把游戏分数、自动演示或尚未执行的试点写成科研或学习效果结论。

公开入口：

- Demo：https://john-lin98.github.io/ai-research-quest/
- GitHub 与 Skill：https://github.com/John-Lin98/ai-research-quest
- 真实科研需求案例：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html

## 一句话定位

> Research Quest 让 AI 先用更有趣的 1–3 个关键问题与你对齐目标，再用 Known–Unknown 四象限建立认知地图，最后整理任务 Context 和 Goal，交给 ChatGPT、Codex 或多 Agent 队伍持续执行到交付。

## 五条核心价值

1. **更有趣地弄清目标**：把枯燥命令改成任务地图、关卡、Boss、奖励和进度反馈。
2. **建立四象限认知地图**：横轴是用户是否意识到，纵轴是用户是否掌握；固定展示 Known Knowns、Unknown Knowns、Known Unknowns、Unknown Unknowns。
3. **小步快速对齐**：每回合通常 1 个、最多 3 个最影响最终任务的问题，减少认知负担和错误传播。
4. **从理解走向执行**：AI 不只提问，还整理 Context、设计方案、生成 Goal，并交给 Codex/Agent 执行、验证和交付。
5. **持续正反馈**：每轮展示四象限变化、认知分、科研目标进度、预计剩余时间和 Goal 版本变化。

## 小红书：把 ChatGPT 科研变成玩游戏

### 标题

**把 ChatGPT 科研变成玩游戏：AI 不只回答问题，而是陪你通关真实任务**

### 正文

我发现，和 AI 做科研最累的地方，往往不是模型不会回答，而是：

- 我自己还没完全想清楚目标；
- 一次对话里问题太多，认知负担很大；
- AI 很容易把不确定回答继续传到后面；
- 聊了很久，最后还是没有形成可执行任务。

所以我做了 **Research Quest**。

它把人与 AI 的协作改造成一场回合制科研游戏：

> 真实目标 → 关卡提问 → 四象限认知地图 → Goal 更新 → Agent 执行 → 验证与交付

每回合通常只问 **1 个主问题**，只有真正影响证据或执行边界时，才追加最多 2 个问题。这种方式类似 grill-me-with-docs 的小步追问：不一次轰炸十几个问题，而是每轮只消除一个最关键的不确定性。

认知地图固定为 Known–Unknown 四象限：

|  | 用户已经意识到 | 用户尚未意识到 |
| --- | --- | --- |
| 已经掌握 | Known Knowns | Unknown Knowns |
| 尚未掌握 | Known Unknowns | Unknown Unknowns |

其中 Known Knowns 还要经过：

> Candidate → Confirmed → Verified

只有真正能应用的 Verified 才计入认知分。错误回答不会直接进入后续 Goal。

这次 Demo 使用一个真实科研需求：

> AlphaFold2 / AlphaFold DB 预测能否支持酶活性位点几何初筛？

玩家会逐关决定公开输入、局部区域、指标、覆盖率、Agent 分工、验收和失败退出规则。最终得到的不只是“建议”，而是一份可以交给 Codex 或多 Agent 执行的完整科研任务合同。

每轮还会告诉你：

- 总进度和预计剩余时间；
- 四象限解锁了什么；
- 认知分提升了多少；
- 科研目标达成到哪里；
- Goal vN 相比上一版发生了什么变化。

我想验证的产品假设是：

> 当人与 AI 的交互更像共同闯关，而不是不断输入命令时，用户可能更愿意持续理解问题、表达偏好，并把科研任务真正做完。

这仍然是一个等待验证的假设，不是已经证明的效果。

在线试玩：`https://john-lin98.github.io/ai-research-quest/`

GitHub 与可安装 Skill：`https://github.com/John-Lin98/ai-research-quest`

### 建议标签

`#AI科研 #ChatGPT #Codex #科研工具 #Agent #学习方法 #GitHub #独立开发`

## 小红书 8 张卡片脚本

### 卡片 1｜痛点

**标题：为什么和 AI 做科研还是很累？**

文案：长对话、目标模糊、问题太多、错误向后传播，最后没有形成可执行任务。

### 卡片 2｜核心想法

**标题：把科研对话变成闯关游戏**

文案：任务地图、关卡、Boss、奖励、进度条，让每次交互都有清晰目标和正反馈。

### 卡片 3｜四象限

**标题：AI 先建立你的认知地图**

文案：横轴看你是否意识到，纵轴看你是否掌握；固定得到 Known Knowns、Unknown Knowns、Known Unknowns、Unknown Unknowns。

### 卡片 4｜小步提问

**标题：每轮只问 1–3 个关键问题**

文案：通常 1 个主问题，最多 2 个证据或边界问题；只解决当前最关键的不确定性。

### 卡片 5｜防错

**标题：错误回答不会进入后续任务**

文案：Candidate → Confirmed → Verified。只有经过应用验证的知识才进入正式 Goal。

### 卡片 6｜真实 Demo

**标题：AlphaFold2 能否支持酶活性位点初筛？**

文案：不是复述热点，而是把真实科研需求变成数据、指标、验收和 Agent 分工。

### 卡片 7｜从游戏到执行

**标题：通关不是结束，而是开始执行**

文案：AI 整理 Context、方案和 Goal，交给 Codex / Agent 开发、实验、验证和交付。

### 卡片 8｜最终价值

**标题：让 AI 帮你更清楚地想，也更准确地做**

文案：每轮展示认知分、目标进度、剩余时间和 Goal 变化，让科研协作更轻松、更有动力。

## 中文 X Thread

### 1/8

我把“和 ChatGPT 做科研”做成了一场回合制游戏：Research Quest。它不是给聊天加经验值，而是让 AI 用更有趣的方式帮你弄清目标、建立认知地图，再把任务交给 Agent/Codex 真正完成。🧵

### 2/8

核心是两条同步循环：Game Loop 负责提问、学习、奖励和认知地图；Goal Loop 负责整理 Context、更新任务合同、调用工具和 Agent 执行。通关不是只生成提示词，而是继续做到可验证交付。

### 3/8

认知地图固定为 Known–Unknown 四象限。横轴：你是否已经意识到这个问题；纵轴：你实际上是否掌握。四格分别是 Known Knowns、Unknown Knowns、Known Unknowns、Unknown Unknowns。

### 4/8

每回合通常只问 1 个、最多 3 个最关键问题。一个决定路线，必要时一个验证理解、一个确认偏好或边界。不是一次列出 20 个问题，而是快速、小步地与你对齐。

### 5/8

为了避免错误向后传播，Known Knowns 还要经过 Candidate → Confirmed → Verified。AI 总结只能产生 Candidate；只有能在选择、小测或迁移中正确应用，才进入 Verified 和最终 Goal。

### 6/8

默认 Demo 使用真实公开科研需求：AlphaFold2 / AlphaFold DB 预测能否支持酶活性位点几何初筛？玩家逐关冻结输入、局部区域、指标、覆盖率、多 Agent 分工和退出规则。

### 7/8

每一轮都会显示：总进度、预计剩余时间、四象限变化、认知分、科研目标达成状态，以及 Goal vN 相比上一版新增了什么。正反馈必须具体，而不是只说“做得很好”。

### 8/8

试玩：https://john-lin98.github.io/ai-research-quest/

源码与 Skill：https://github.com/John-Lin98/ai-research-quest

我想验证的是：游戏式小步协作，是否能让人与 AI 更准确地对齐，并更有动力把科研任务做完。

## English X Thread

### 1/8

I turned research collaboration with ChatGPT into a turn-based game: Research Quest. It is not a points layer on top of chat. AI first helps clarify your real goal, maps your cognition, then hands an executable Goal to Codex or an agent team. 🧵

### 2/8

It runs two synchronized loops. The Game Loop handles questions, learning, feedback, and progression. The Goal Loop builds context, updates the execution contract, invokes tools and agents, verifies outputs, and continues until delivery.

### 3/8

The cognition map is a fixed Known–Unknown 2×2 matrix. The x-axis is whether the user is aware of the issue. The y-axis is whether the user actually possesses the knowledge: Known Knowns, Unknown Knowns, Known Unknowns, and Unknown Unknowns.

### 4/8

Each turn asks one main question and at most two necessary follow-ups. Only the questions that materially change the final goal, evidence boundary, preference, or execution route are asked. The point is fast, low-load alignment—not a giant questionnaire.

### 5/8

To prevent error propagation, Known Knowns follow Candidate → Confirmed → Verified. An AI summary can only create a Candidate. Knowledge enters the formal Goal only after application, correction, a quiz, or a transfer task validates it.

### 6/8

The public demo uses a real research need: can AlphaFold2 / AlphaFold DB predictions support preliminary enzyme active-site geometry screening? Players freeze inputs, local regions, metrics, coverage, agent roles, acceptance criteria, and failure handling.

### 7/8

Every turn shows concrete positive feedback: progress, remaining time, quadrant changes, cognition score, research-goal status, and the exact difference between Goal vN and the previous version.

### 8/8

Try it: https://john-lin98.github.io/ai-research-quest/

Source and installable Skill: https://github.com/John-Lin98/ai-research-quest

The product hypothesis is still open: can playful, small-step AI collaboration improve alignment, engagement, and task completion?
