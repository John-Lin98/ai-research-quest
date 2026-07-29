# Research Quest vNext：认知地图、grill-me-with-docs 与任务线索

本版本将产品核心冻结为：

- Known–Unknown 四象限认知地图；
- grill-me-with-docs 文档驱动提问；
- 每轮默认一个关键问题；
- 用户随时暂停闯关并提出任意问题；
- 用户随时主动追加资料、约束、偏好、截止时间、结果或纠错；
- AI 对新增线索进行分类、证据判断、去重和冲突检查；
- AI 更新四象限、Context、Goal vN，并缩小、跳过或重写当前问题；
- 完成后生成 Frozen Context 与 Codex Goal。

## 两种中断

### 关卡线索

用户希望 AI 回答问题。系统暂停主线，先查文档与 Context，回答后更新认知地图并重写问题。

### 上下文与任务线索

用户希望把新信息加入任务。系统记录原始表述和来源，区分 Candidate / Confirmed，检查与现有 Context 的重复或冲突，再调整 Goal 和当前问题。

公开 Demo 使用固定问题和固定任务线索以保证测试可复验；正式 Skill 支持真实用户任意问题、任意线索和文档上传。