# Research Quest 最终发布文案

## 公开入口

- 聊天式 Demo：https://john-lin98.github.io/ai-research-quest/
- 案例博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html
- GitHub 与 Skill：https://github.com/John-Lin98/ai-research-quest
- 认知地图参考：https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns
- grill-me / grill-with-docs 参考：https://github.com/mattpocock/skills
- grill-with-docs 源文件：https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
- 认知地图参考：https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns
- grill-me / grill-with-docs 参考：https://github.com/mattpocock/skills
- grill-with-docs 源文件：https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md

## 一句话定位

> Research Quest 先用 Known–Unknown 认知地图和 grill-me-with-docs，把科研任务通过游戏式小步交互聊清楚，再把完整 Context 与 Goal 交给 Codex 或 Agent 执行。

## 简短项目介绍

Research Quest 是一个开源科研游戏 Skill。AI 先阅读文档与已有讨论，通过 Known–Unknown 四象限找到当前最重要的认知空缺，每轮默认只问一个关键问题，并用克制、针对性的回答降低用户阅读长文的负担。用户可以回答、追问，也可以主动补充资料、约束、偏好和纠错；确认后的内容持续写入 Context 与 Goal，最后交给 Codex 或 Agent 执行。

这套方法也可以用于制作你自己的游戏 Skill：选择喜欢的 RPG、侦探、卡牌、经营或冒险风格，再让 Sol、Fable、Kimi 等你常用的模型帮助设计角色、剧情、关卡、反馈和交互文案，并根据用户反馈持续调整游戏体验。

欢迎体验，也欢迎在 GitHub Star 项目并 Follow 后续更新。

## X 单帖版（主帖 + 参考资料回复）

### 主帖

我做了一个开源科研游戏 Skill：Research Quest。

AI 先读文档，用 Known–Unknown 认知地图 + grill-me-with-docs 每轮只问一个关键问题，并克制回答，降低用户阅读长文和 AI 错误 Context 累积的负担。最后生成 Context + Goal 交给 Codex。

Demo：https://john-lin98.github.io/ai-research-quest/
GitHub：https://github.com/John-Lin98/ai-research-quest
欢迎 Star & Follow。

### 参考资料回复

方法参考：
认知地图：https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns
grill-me / grill-with-docs：https://github.com/mattpocock/skills

也欢迎参考这套思路，用 Sol / Fable / Kimi 做成你喜欢的 RPG、侦探或卡牌 Skill。

## X Thread 版

### 1/5

我把科研需求澄清做成了一个开源游戏 Skill：Research Quest。

它不是在聊天上加经验值，而是先通过游戏式小步交互理解用户，再把足够完整的 Context 与 Goal 交给 Codex 或 Agent 执行。🧵

### 2/5

核心是两件事：

1. Known–Unknown 四象限认知地图；
2. grill-me-with-docs：先读文档，再问材料无法回答、又最影响结果的一个问题。

用户可以回答、追问，也可以主动补充资料、约束、偏好、截止时间和纠错。

### 3/5

为什么强调“每轮一个问题”和“克制回答”？

对用户：不用一次理解十几个问题和一大段答案。

对 AI：避免长 Context 持续膨胀，也减少错误假设进入后续推理和 Goal。

目标不是少说话，而是每次只解决当前最有价值的不确定性。

### 4/5

游戏风格不是固定的。你可以参考这套认知地图与小步对齐方法，制作自己的游戏 Skill：RPG、侦探、卡牌、经营、冒险都可以。

也可以让 Sol、Fable、Kimi 等你喜欢的模型参与角色、剧情、关卡、奖励和交互设计，再根据用户反馈持续优化。

### 5/5

试玩：https://john-lin98.github.io/ai-research-quest/
源码与 Skill：https://github.com/John-Lin98/ai-research-quest
博文：https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html
认知地图参考：https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns
grill-me / grill-with-docs：https://github.com/mattpocock/skills

这是一个仍待真实用户验证的产品假设，不声称已经证明提升科研能力或效率。

欢迎 Star、Follow，也欢迎做出你自己的 Research Quest。

## 小红书标题

**我把科研需求澄清做成了游戏 Skill：先聊清楚，再交给 Codex**

备选：

- **别再让 AI 一次问你 20 个问题了：我做了一个科研闯关 Skill**
- **用认知地图和 grill-me-with-docs，把科研任务聊清楚**
- **Research Quest：一个能不断理解你的科研游戏 Skill**

## 小红书正文

和 AI 做科研时，我经常遇到一个问题：

不是 AI 完全不会回答，而是我还没有把需求想清楚，它却已经给了很长的方案。

接下来通常会发生几件事：

- 用户要一次理解大量问题和长篇回答；
- AI 根据不完整信息继续推理；
- 一个错误假设被带入越来越长的上下文；
- 聊了很久，最后仍然没有形成 Codex 可以执行的任务。

所以我做了一个开源科研游戏 Skill：**Research Quest**。

它的核心不是“把聊天做得像游戏”，而是用游戏式交互帮助人与 AI 逐步对齐需求，获得足够准确的 Context。

核心逻辑只有两部分：

### 1. Known–Unknown 认知地图

AI 持续维护四个区域：

- Known Knowns（已知的已知）：用户已经明确并能使用的内容；
- Unknown Knowns（未知的已知）：用户可能有经验或偏好，但还没说出来；
- Known Unknowns（已知的未知）：用户知道还缺答案的问题；
- Unknown Unknowns（未知的未知）：需要通过反例、失败或真实执行才会暴露的风险。

这张地图不是装饰。下一轮问什么、需要解释多深、是否补基础、何时停止提问，都由它决定。

### 2. grill-me-with-docs

AI 先读用户提供的文档、历史讨论和已有 Context，不重复询问材料里已有的答案。

然后每轮默认只问一个最影响最终结果的问题。用户回答后，AI 更新认知地图、Context 和 Goal，再决定下一步。

用户也可以随时：

- 暂停主线，向 AI 追问；
- 主动补充资料、限制、偏好、截止时间或实验结果；
- 指出 AI 的理解错误并要求回滚 Goal。

### 为什么要“有针对性地提问 + 克制地回答”？

这不是为了故意把内容切碎，而是同时降低人与 AI 的负担。

对用户来说，不需要一次理解十几个问题，也不必从长篇回答里自己寻找最关键的一句话。

对 AI 来说，可以避免 Context 无限增长，减少错误假设进入后续推理链路，更容易持续对齐用户真正想完成的任务。

最终，Research Quest 会生成两份内容：

- **Frozen Context**：真实目标、文档、用户选择、偏好、认知地图、冲突和开放未知；
- **Codex Goal**：输入、步骤、指标、完成标准、失败退出、测试和 Agent 分工。

然后把两者一起交给 Codex 或 Agent 执行。

### 你也可以做自己的游戏 Skill

Research Quest 的游戏风格不是固定的。

你可以保留“认知地图 + 小步对齐”的核心，然后换成自己喜欢的形式：RPG、侦探推理、卡牌构筑、经营养成、冒险探索都可以。

也可以充分利用 Sol、Fable、Kimi 等你常用模型的游戏化创作能力，让它们帮助设计角色、剧情、关卡、奖励和交互风格，并根据用户的选择、卡点和反馈持续优化体验。

目前项目已经开源：

Demo：`https://john-lin98.github.io/ai-research-quest/`

GitHub / Skill：`https://github.com/John-Lin98/ai-research-quest`

案例博文：`https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html`

方法参考：

认知地图文章：`https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns`

grill-me / grill-with-docs GitHub：`https://github.com/mattpocock/skills`

grill-with-docs 源文件：`https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md`

它目前仍是一个等待真实用户验证的产品假设，不代表已经证明能够提升科研能力或效率。

欢迎试玩，也欢迎大家多多 **Star 和 Follow**。更欢迎你参考这套思路，做出属于自己的游戏 Skill。

## 小红书建议标签

`#AI科研 #ChatGPT #Codex #科研工具 #Agent #游戏化学习 #提示词 #GitHub #独立开发 #Kimi`

## 发布边界

- 不把公开 AlphaFold2 试点写成已经完成的科研实验；
- 不声称游戏化已经被证明提高科研能力、效率或创造力；
- Sol、Fable、Kimi 在文案中作为用户可选择的游戏化创作模型示例，不代表完成了统一基准测试；
- 宣传时优先链接 GitHub `releases/latest`，确保安装包与当前主分支一致。
