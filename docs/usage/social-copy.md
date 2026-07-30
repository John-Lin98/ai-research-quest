# Research Quest 最终发布文案

以下文案用于介绍 Research Quest 的产品思想与公开 Demo，不把游戏分数、自动演示或尚未执行的科研试点写成科研能力或学习效果结论。

## 公开入口

- 聊天式 Demo：https://john-lin98.github.io/ai-research-quest/
- 完整博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html
- GitHub 与 Skill：https://github.com/John-Lin98/ai-research-quest
- 最新 Skill Release：https://github.com/John-Lin98/ai-research-quest/releases/latest

## 一句话定位

> Research Quest 先用 Known–Unknown 认知地图和 grill-me-with-docs 把科研任务聊清楚，再把完整 Context 与 Goal 交给 Codex 或 Agent 执行。

## 简短项目介绍

Research Quest 是一个开源的科研游戏 Skill。它不是在聊天上简单增加积分，而是通过游戏式、回合式交互逐步对齐用户的真实需求：AI 先读取文档和已有 Context，用 Known–Unknown 四象限定位最关键的认知空缺，再借鉴 grill-me-with-docs 每轮只问一个最高价值问题，并允许用户随时回答、追问、补充资料、约束、偏好或纠错。

有针对性的提问与克制性回答可以减少用户阅读长篇回复的负担，也能避免 AI 在冗长、噪声较多的上下文中持续沿着错误前提推演。关键问题得到确认后，Research Quest 会生成可追溯的 Frozen Context 与 Codex Goal，交给 Codex、ChatGPT 或多 Agent 队伍执行、测试和交付。

Research Quest 的认知地图与任务逻辑可以和不同游戏风格组合。你可以让 Sol、Fable、Kimi 或其他擅长创意、叙事和交互设计的模型担任 Game Designer，迭代关卡、角色、奖励和措辞；也可以参考这套方法，制作一款属于自己的 RPG、侦探、卡牌、模拟经营或 Boss 战游戏 Skill。

## X 单条推荐版

开源科研游戏 Skill：Research Quest。

AI 先读文档，用认知地图 + grill-me-with-docs 每轮只问 1 个关键问题，把模糊需求变成 Context 与 Codex Goal，再交给 Codex / Agent。也可让 Sol / Fable / Kimi 设计你喜欢的游戏风格。

Demo：https://john-lin98.github.io/ai-research-quest/
Skill：https://github.com/John-Lin98/ai-research-quest

欢迎 Star / Follow。

## X Thread 推荐版

### 1/5

我把“人与 AI 对齐科研需求”做成了一款开源游戏 Skill：Research Quest。

它不是给聊天加一层积分，而是先把任务聊清楚，再把完整 Context 与 Goal 交给 Codex / Agent 执行。🧵

### 2/5

核心是两件事：

1. Known–Unknown 四象限认知地图；
2. grill-me-with-docs：先读材料，再默认只问一个最高价值问题。

AI 不重复问文档已有答案，也不一次抛出十几个问题。

### 3/5

为什么要逐步提问、克制回答？

对用户：不用从长篇回答里寻找真正影响决策的几句话。

对 AI：减少噪声上下文、错误前提和过早方案不断累积，更容易及时纠错并对齐真实需求。

### 4/5

用户可以回答主问题，也可以随时追问，或主动补充资料、约束、偏好、截止时间和纠错。

AI 每轮更新认知地图、进度、预计时间和 Goal vN；满足交接条件后生成 Frozen Context + Codex Goal。

### 5/5

你还可以让 Sol、Fable、Kimi 或其他模型担任 Game Designer，改造成 RPG、侦探、卡牌、模拟经营或 Boss 战；也可以参考这套逻辑，制作自己的游戏 Skill。

Demo：https://john-lin98.github.io/ai-research-quest/
博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html
GitHub / Skill：https://github.com/John-Lin98/ai-research-quest

欢迎 Star、Follow 和反馈。

## 小红书推荐版

### 标题

**我把 ChatGPT 科研对话做成了游戏：先把需求聊清楚，再让 Codex 执行**

### 正文

我发现，和 AI 做科研最累的地方，很多时候不是 AI 不会回答，而是：

- 我自己还没完全想清楚目标；
- AI 一次给出很长的回答，我很难抓住真正影响决策的部分；
- 一次追问十几个问题，沟通负担很大；
- 一个错误前提进入长上下文后，AI 可能继续沿着错误方向往下做；
- 聊了很久，最后还是没有形成一份可以直接执行的任务。

所以我做了一个开源科研游戏 Skill：**Research Quest**。

它的核心不是“给聊天加经验值”，而是用游戏式、回合式交互帮助人与 AI 对齐需求，并积累足够准确的 Context：

> 读取文档 → 建立 Known–Unknown 认知地图 → 每轮只问一个关键问题 → 更新 Context 与 Goal → 交给 Codex / Agent 执行

Research Quest 主要结合了两个思路：

### 1. Known–Unknown 四象限认知地图

它持续记录：

- Known Knowns（已知的已知）：已经明确并能使用的内容；
- Unknown Knowns（未知的已知）：用户可能会，但还没有表达的经验和偏好；
- Known Unknowns（已知的未知）：用户已经意识到还缺答案的问题；
- Unknown Unknowns（未知的未知）：需要通过失败、反例或真实执行才暴露的隐藏风险。

认知地图不是摆设，它会决定 AI 下一轮为什么问、问题问多深，以及什么时候应该停止提问。

### 2. grill-me-with-docs 式小步沟通

AI 先读资料，不重复问文档里已经能回答的问题。默认每轮只问一个最影响最终任务的问题，必要时才增加少量补充问题。

这样做有两个直接好处：

- 用户不用从长篇回复中寻找真正重要的信息；
- AI 也不必在越来越长、越来越嘈杂的上下文中继续推理，减少错误前提向后传播。

用户不只能选择答案，还可以随时：

- 暂停主线向 AI 提问；
- 主动补充文件、数据和结果；
- 增加约束、偏好和截止时间；
- 纠正 AI 对目标的理解。

每轮结束后，界面会显示：目标进度、认知分、预计剩余时间，以及“当前目标变化（Goal vN）”。当核心未知已经关闭，系统会同时生成：

- **Frozen Context**：用户真实需求、文档来源、四象限、选择、追问、任务线索、冲突和开放未知；
- **Codex Goal**：执行步骤、输入、指标、完成标准、失败规则、测试和审查要求。

然后再让 Codex、ChatGPT 或多 Agent 队伍开始执行。

我也很喜欢这个思路的可扩展性：你可以让 **Sol / Fable / Kimi** 或其他擅长创意、叙事和交互设计的模型担任 Game Designer，持续优化关卡、角色、奖励与措辞；也可以保留认知地图和 Context / Goal 逻辑，把它改造成你喜欢的 RPG、侦探、卡牌、模拟经营、Boss 战，做一款属于自己的游戏 Skill。

目前项目已经公开：

- Demo：https://john-lin98.github.io/ai-research-quest/
- 完整博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html
- GitHub 与 Skill：https://github.com/John-Lin98/ai-research-quest

这个项目仍在持续迭代。欢迎大家体验后提出修改意见，也欢迎 **Star 项目、Follow 作者**，或者分享你基于这套思路制作的游戏 Skill。

### 建议标签

`#AI科研 #ChatGPT #Codex #Agent #科研工具 #游戏化学习 #GitHub #独立开发 #Kimi #AI工作流`

## 对外表述边界

可以表述：

- Research Quest 旨在通过游戏式小步交互帮助用户表达需求、积累 Context，并形成更清楚的 Codex Goal；
- 认知地图与 grill-me-with-docs 决定提问顺序和难度；
- Sol、Fable、Kimi 等模型可以作为可选的创意与交互设计搭档；
- 用户可以参考该逻辑制作自己的游戏 Skill。

暂不表述：

- 已经通过对照实验证明 Research Quest 必然提升科研能力、任务准确率或完成效率；
- 某个模型在所有游戏设计任务上必然优于其他模型；
- AlphaFold2 公开试点已经产生具体实验结论。
