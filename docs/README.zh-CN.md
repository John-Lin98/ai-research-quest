[English](README.md) | **简体中文**

# Research Quest 文档索引

本索引列出需要长期保持中英文双语的公开资料。

## 产品资料

| 主题 | English | 中文 |
| --- | --- | --- |
| GitHub 项目介绍 | [README](../README.md) | [README.zh-CN](../README.zh-CN.md) |
| 聊天式 Demo | [English Demo](https://john-lin98.github.io/ai-research-quest/en/) | [中文 Demo](https://john-lin98.github.io/ai-research-quest/) |
| 案例博文 | [English article](https://john-lin98.github.io/ai-research-quest/en/case-study-alphafold-casp14.html) | [中文博文](https://john-lin98.github.io/ai-research-quest/case-study-alphafold-casp14.html) |
| Demo 数据合同 | [demo-data.en.md](usage/demo-data.en.md) | [demo-data.md](usage/demo-data.md) |
| 社媒发布文案 | [social-copy.en.md](usage/social-copy.en.md) | [social-copy.md](usage/social-copy.md) |
| 隐私说明 | [PRIVACY.md](../PRIVACY.md) | [PRIVACY.zh-CN.md](../PRIVACY.zh-CN.md) |
| 安全说明 | [SECURITY.md](../SECURITY.md) | [SECURITY.zh-CN.md](../SECURITY.zh-CN.md) |

## 核心项目文件

- Skill 规则：[`skills/research-quest/SKILL.md`](../skills/research-quest/SKILL.md)
- 唯一状态 Schema：[`shared/game-state.schema.json`](../shared/game-state.schema.json)
- Skill 模拟会话：[`skills/research-quest/references/test-sessions.md`](../skills/research-quest/references/test-sessions.md)
- 公开默认状态：[`public/demo-data/default-game-state.json`](../public/demo-data/default-game-state.json)

## 双语维护规则

公开产品声明、链接、安全边界、Context / Goal 术语和 Known–Unknown 四象限语义必须在中英文之间保持一致。翻译可以为可读性调整句式，但不能增加原版本没有的证据、性能结论或功能声明。

每次修改公开资料时：

1. 在同一个 PR 中同步修改中英文版本；
2. 在页面或文档顶部保留明显的语言切换入口；
3. 同时检查桌面端和移动端的中英文页面；
4. 验证内部链接、构建和公开安全扫描；
5. 若某个内部文件暂不翻译，必须在 PR 描述中明确记录原因。
