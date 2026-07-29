# Research Quest｜AI Research Game

Research Quest 是一个**改造人与 AI 科研聊天方式的 Skill**。它不要求用户学习一款独立游戏，而是让 AI 先读项目文档和已有 Context，再通过 Known–Unknown 四象限找到最关键的认知空缺，每轮默认只问一个真正影响最终结果的问题。

> **核心逻辑：认知地图 + grill-me-with-docs。** 文档先回答能回答的问题，AI 不重复追问；四象限决定本轮为什么问、问多深、何时停止，以及 Goal 应怎样变化。

```text
真实科研需求 + 文档 + 历史讨论
→ 先读材料
→ 建立 Known–Unknown 四象限
→ 每轮默认只问一个关键问题
→ 用户可随时暂停并提问
→ 生成关卡线索、更新地图、重写当前问题
→ 保存选择、问答与 Goal vN
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

|  | 用户已经意识到 | 用户尚未意识到 |
| --- | --- | --- |
| **已经掌握** | **Known Knowns｜已知的已知** | **Unknown Knowns｜未知的已知** |
| **尚未掌握** | **Known Unknowns｜已知的未知** | **Unknown Unknowns｜未知的未知** |

Known Knowns 内部使用：

```text
Candidate → Confirmed → Verified
```

只有能在选择、小测、方案、迁移或真实执行中正确应用的 Verified 项计入正式认知分。

四象限决定：

- 下一轮问什么；
- 是否先补基础；
- 是否需要反例或失败检查；
- 当前目标如何变化；
- 用户追问后如何重写问题；
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

## 每轮聊天结构

```text
一句话回顾上一轮选择
→ 说明选择或问答保存到哪里
→ 为什么这一步最值得问
→ 完整但紧凑的四象限
→ 目标进度条 + 百分比
→ 认知分 + 预计剩余时间
→ 当前目标变化 (Goal vN)
→ 一个关键问题
→ 回答选项
→ 最后一个选项：暂不闯关，我还有一些问题
```

紧凑界面不重复显示横轴和纵轴文字，但四象限位置和含义保持固定。

## 用户可以随时暂停闯关提问

每个关键问题的最后一个选项固定为：

> **暂不闯关，我还有一些问题**

用户也可以直接输入任何问题。此时 Research Quest：

1. 暂停当前主问题，不推进进度、不扣分；
2. 先查文档、会话和 Context；
3. 回答用户问题，材料不足时明确说明无法确认；
4. 把问题和答案保存为“关卡线索”；
5. 更新 Known–Unknown 四象限；
6. 只把确认过的内容写入 Goal；
7. 根据新地图重新生成当前 grill-me 问题；
8. 用户继续闯关或再次提问。

```text
用户问题
→ 文档检索与回答
→ 关卡线索
→ 四象限更新
→ 当前 Goal 保持或回滚
→ 重写 grill-me 问题
→ 恢复主线
```

公开 Demo 为保证可复验，每轮使用固定问题和固定答案；真实 Skill 允许用户提出任意问题，不能照搬 Demo 答案。

## 点击选项怎样成为输入

- 支持按钮时：点击选项后直接生成用户聊天气泡，并写入 Context 和 Goal；
- 不支持按钮时：每个选项提供完整复制文本，用户复制并发送；
- 用户始终可以不用选项，直接输入自己的回答或问题。

## Context 怎样保存

每轮开场会说明保存状态。

- 有文件或知识库能力时，写入明确项目路径；
- 只有浏览器内存或会话状态时，如实说明“导出后保存为 `research-quest-context.md`”，不假装已经写入磁盘。

完整 Context 包含：

- 原始需求和最终产物；
- 已读取的文档和来源；
- 主问题、用户选择、额外问题与答案；
- 四象限完整状态；
- Candidate / Confirmed / Verified 证据；
- 用户偏好和术语；
- Goal vN 版本记录；
- 开放未知和关闭条件；
- 结果范围、完成标准和退出规则。

## 默认 Demo

聊天式 Demo 使用一个公开科研需求：

> 设计一个小规模公开试点，判断 AlphaFold2 / AlphaFold DB 预测是否适合用于酶活性位点附近结构的初步筛选。

5 轮聊天依次处理目标、现有资料、结果范围、完成标准和 Goal Forge。用户可以在前四轮打开固定关卡线索，观察追问如何改变认知地图和下一问。

该案例不会预设实验结果，也不会把 pLDDT 或结构相似性直接写成催化活性、底物结合或药物发现结论。

## 自定义科研需求

网页提供两步本地整理：描述科研需求；补充最终产物和现有资料或限制。随后生成初始四象限、`research-quest-initial-context.md` 和启动提示词。

网页不冒充大模型推理。真正的文档读取、自由追问、动态认知建图和 grill-me-with-docs 由安装 Skill 的 ChatGPT / Agent 完成。

## Goal Forge

最终 Goal 至少包含 Frozen Context 路径、真实目标与非目标、已读文档、四象限、关卡线索、用户偏好、输入、步骤、完成标准、多 Agent 分工、测试审查以及 3–5 轮失败后的根因分析。

## 完整 Dashboard

完整 Dashboard 保留两条七关战役、全局认知地图、计分、考试和 Goal 历史，适合项目复盘、教学和机制展示。默认入口仍是聊天式 Demo。

Dashboard 只用一句话提示公开与本地处理边界；详细规则见 [PRIVACY.md](PRIVACY.md) 和 [SECURITY.md](SECURITY.md)。

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