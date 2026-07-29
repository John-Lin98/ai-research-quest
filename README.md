# Research Quest｜AI Research Game

Research Quest 是一个**改造人与 AI 科研聊天方式的 Skill**。它不要求用户学习一款独立游戏，而是让 AI 先读项目文档和已有 Context，再通过 Known–Unknown 四象限找到最关键的认知空缺，每轮默认只问一个真正影响最终结果的问题。

> **核心逻辑：认知地图 + grill-me-with-docs。** 文档先回答能回答的问题，AI 不重复追问；四象限决定本轮为什么问、问多深、何时停止，以及 Goal 应怎样变化。

```text
真实科研需求 + 文档 + 历史讨论
→ 先读材料
→ 建立 Known–Unknown 四象限
→ 每轮默认只问一个关键问题
→ 保存选择、认知变化与 Goal vN
→ Frozen Context
→ Codex / Agent 执行、验证和交付
```

## 在线入口

- [聊天式 Demo](https://john-lin98.github.io/ai-research-quest/)
- [完整 Dashboard](https://john-lin98.github.io/ai-research-quest/?view=full)
- [认知地图与 grill-me-with-docs 案例博文](https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html)
- [完整机制演示视频](https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm)
- [安装最新 Research Quest Skill](https://github.com/John-Lin98/ai-research-quest/releases/latest)

## 为什么不是直接给 Codex 一句话

例如：

> 帮我判断 AlphaFold2 能不能用于酶活性位点分析。

这句话没有说明：

- 最先要支持什么判断；
- 现在手里有什么资料；
- 结果最多能说明什么；
- 做到什么才算完成；
- 哪些问题需要执行才能回答。

Research Quest 先把这些信息整理成 Context，再生成 Codex Goal，减少重复询问、误解和目标漂移。

## 核心 1：Known–Unknown 四象限

四象限固定为：

|  | 用户已经意识到 | 用户尚未意识到 |
| --- | --- | --- |
| **已经掌握** | **Known Knowns｜已知的已知** | **Unknown Knowns｜未知的已知** |
| **尚未掌握** | **Known Unknowns｜已知的未知** | **Unknown Unknowns｜未知的未知** |

### Known Knowns 内部认证

```text
Candidate → Confirmed → Verified
```

只有能在选择、小测、方案、迁移或真实执行中正确应用的 Verified 项计入正式认知分。

四象限决定：

- 下一轮问什么；
- 是否先补基础；
- 是否需要反例或失败检查；
- 当前目标如何变化；
- 是否已经可以停止提问并交给 Codex。

## 核心 2：grill-me-with-docs

AI 提问前必须：

1. 读取用户提供的文档、会话、历史提示词和已有 Context；
2. 提取材料已经明确的事实和用户使用过的术语；
3. 不再询问文档中已经能够回答的问题；
4. 从四象限中选择最影响最终结果的一个空缺；
5. 每轮默认只问一个问题，确有必要时最多三个。

“为什么这一步最值得问”必须同时说明：

- 文档已经告诉了我们什么；
- 认知地图里最大的空缺是什么；
- 这个空缺会怎样改变最终 Goal。

## 默认聊天结构

每轮 AI 回复按以下顺序组织：

```text
一句话回顾上一轮选择
→ 说明选择保存到哪里
→ 为什么这一步最值得问
→ 完整但紧凑的四象限
→ 目标进度条 + 百分比
→ 认知分 + 预计剩余时间
→ 当前目标变化 (Goal vN)
→ 一个关键问题
→ 可点击或可复制的选项
```

紧凑界面不重复显示横轴和纵轴文字，但四象限位置和含义保持固定。

## 点击选项怎样成为输入

### 支持按钮的界面

用户点击选项后：

- 该选项立即成为用户本轮回答；
- 页面生成用户聊天气泡；
- 答案写入 Context、认知地图和 Goal vN；
- AI 进入下一轮。

### 不支持按钮的聊天宿主

每个选项都提供完整复制文本。用户复制并发送后，它会成为本轮输入，不需要重新组织同一答案。

## Context 怎样保存

每轮开场会说明保存状态。

- 有文件或知识库能力时，写入明确项目路径；
- 只有浏览器内存或会话状态时，如实说明“导出后保存为 `research-quest-context.md`”，不假装已经写入磁盘。

完整 Context 包含：

- 原始需求和最终产物；
- 已读取的文档和来源；
- 每轮问题、选择和理由；
- 四象限完整状态；
- Candidate / Confirmed / Verified 证据；
- 用户偏好和术语；
- Goal vN 版本记录；
- 开放未知和关闭条件；
- 结论范围、完成标准和退出规则。

## 默认 Demo

聊天式 Demo 使用一个公开科研需求：

> 设计一个小规模公开试点，判断 AlphaFold2 / AlphaFold DB 预测是否适合用于酶活性位点附近结构的初步筛选。

5 轮聊天依次处理：

1. 先说清楚要解决什么；
2. 看看手里有什么资料；
3. 确认结果最多能说明什么；
4. 约定做到什么才算完成；
5. 整理 Context，生成 Codex Goal。

该案例不会预设实验结果，也不会把 pLDDT 或结构相似性直接写成催化活性、底物结合或药物发现结论。

## 自定义科研需求

网页提供两步本地整理：

1. 描述科研需求；
2. 补充最终产物和现有资料或限制。

随后生成：

- 初始四象限草图；
- `research-quest-initial-context.md`；
- Research Quest 启动提示词。

网页不冒充大模型推理。真正的文档读取、动态认知建图和 grill-me-with-docs 由安装 Skill 的 ChatGPT / Agent 完成。

## Goal Forge

最终 Goal 至少包含：

- Frozen Context 路径；
- 真实目标和非目标；
- 已读文档和用户偏好；
- 四象限认知地图；
- 输入、方法、指标、步骤和完成标准；
- 多 Agent 分工与通信；
- 测试、独立审查、中文 PR 和安全合并；
- 同一关键问题 3–5 轮不同尝试失败后的根因分析。

## 完整 Dashboard

完整 Dashboard 保留两条七关战役、全局认知地图、计分、考试和 Goal 历史，适合项目复盘、教学和机制展示。默认用户入口仍是聊天式 Demo。

Dashboard 仅用一句话提示公开与本地处理边界；详细规则见 [PRIVACY.md](PRIVACY.md) 和 [SECURITY.md](SECURITY.md)。

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
- Skill 规则：[skills/research-quest/SKILL.md](skills/research-quest/SKILL.md)
- 三个测试会话：[skills/research-quest/references/test-sessions.md](skills/research-quest/references/test-sessions.md)
- 数据说明：[docs/usage/demo-data.md](docs/usage/demo-data.md)

项目采用 [MIT License](LICENSE)。第三方软件及其许可证见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)。
