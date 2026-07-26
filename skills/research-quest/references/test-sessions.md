# 三个完整测试会话

三个会话均为模拟、公开安全的验收 fixture，不代表真实项目、真实用户或产品效果。每份 JSON 都包含序章、双战役各七关、选择与决定、Prompt Clues、三级认证、四类 Known–Unknown、最终考试、状态/Goal 导出和隐私信封。

## 科研规划会话

- Fixture：[fixture-research.json](fixture-research.json)
- 输入：设计一个只使用合成记录的教学干预可行性实验。
- 序章选择：优先冻结可证伪问题和成功条件。
- 七关主线：问题 → 数据边界 → baseline → 指标 → 受控执行 → 失败门 → 独立审查。
- 认证轨迹：AI 提取形成 Candidate；用户复述形成 Confirmed；情境应用与最终考试形成 Verified。
- Known Unknown：最小样本量与效应阈值仍需预注册计算。
- 考试：决策应用、概念理解、迁移三类均完成，总分 90，通过线 80。
- Goal 结果：生成只允许合成数据、Planner/Worker/Reviewer 分离、先小规模验证、独立审查、中文 Git/PR 与停止门齐全的执行 Goal。

## 软件开发会话

- Fixture：[fixture-software.json](fixture-software.json)
- 输入：构建一个离线阅读清单 CLI，支持 CSV 导入导出。
- 序章选择：先冻结最小可用命令与兼容边界。
- 七关主线：需求 → 数据格式 → baseline → 验收 → 增量实现 → 失败门 → 发布审查。
- 认证轨迹：需求提取为 Candidate；用户复述 CLI 合同为 Confirmed；测试场景应用与迁移题形成 Verified。
- Known Unknown：不同 CSV 方言和编码边界需用 fixture 验证。
- 考试：要求处理重复记录、解释幂等性，并迁移到 JSONL 导入；总分 90。
- Goal 结果：生成离线、无遥测、精确文件 Owner、低风险模型路由、单元/集成/安全检查和回滚门齐全的实现 Goal。

## 个人学习会话

- Fixture：[fixture-learning.json](fixture-learning.json)
- 输入：制定四周概率论学习计划，只使用公开教材与自制练习。
- 序章选择：用可测迁移题定义学习成功。
- 七关主线：目标 → 先验盘点 → 认知地图 → 证据质量 → 应用 → 纠错 → 新情境迁移。
- 认证轨迹：自述知识为 Candidate；无提示复述为 Confirmed；解题、纠错和迁移题形成 Verified。
- Known Unknown：条件概率与贝叶斯公式在文字题中的适用边界仍需练习验证。
- 考试：要求解释概念、解决新情境题并制定纠错动作；总分 90。
- Goal 结果：生成四周节奏、每周验证、失败降级、隐私边界和完成条件明确的学习 Goal。

## 完整性断言

运行：

```text
node skills/research-quest/scripts/generate-test-sessions.mjs --check-only
```

每个 fixture 必须同时满足：

- 根必填字段无缺失；
- 双战役各七关且全部完成；
- 七类 Prompt Clue 齐全；
- Candidate、Confirmed、Verified 凭据链完整；
- 三类最终考试题齐全且得分达到阈值；
- Goal 包含十个合同章节；
- 导出 SHA-256 长度为 64；
- `privacy.research_claim_status` 为 `illustrative-only`；
- `real_research_results_included` 为 `false`。
