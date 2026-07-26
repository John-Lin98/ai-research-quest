# AI Research Quest

把“读过了”变成一条可检查的证据链：在两个七关战役中作出选择、标记未知项、完成应用与迁移，再导出可执行的 Codex Goal。

> 这是一个纯前端、公开安全的教学 Demo。所有内置场景都是模拟、改编或脱敏材料，不代表真实科研结果，也不证明游戏化能够提升理解、创造力或研究表现。

## 三分钟看懂

1. 点击“播放自动演示”，用 75 秒走完一条确定性路径；或手动逐关选择。
2. 观察认识如何沿 `Candidate → Confirmed → Verified` 单向升级。
3. 查看 Known Unknown、选择记录和 Goal 预览如何随关卡变化。
4. 完成最终考试后，在浏览器本地导出 game-state JSON 与 Codex Goal Markdown。

只有带应用、测验、迁移或纠错证据的 `Verified` 项会计入正式理解分。`Candidate` 是候选认识，`Confirmed` 只是已确认陈述，两者都不会因为 AI 摘要或一次选择而自动升级。

## 功能

- 学习认知、科研决策两条战役，各七个主线关卡。
- 单一高价值问题、可见选择影响、知识卡、认知地图和奖励。
- 决策应用 60%、概念理解 20%、迁移 20% 的透明演示评分。
- 固定 seed、75 秒、不循环的自动演示。
- 符合 [Canonical Schema 1.0.0](shared/game-state.schema.json) 的状态与 Goal 导出。
- 桌面和移动端布局，以及键盘可访问的交互控件。

## 隐私模型

- 页面加载静态文件后，不上传用户输入、不发送遥测，也没有分析、账户或服务端 API。
- 运行状态只保存在当前页面内存；刷新或关闭页面即丢失。
- 考试中的自由文本只进入本地内存，并且只会随用户主动点击导出，经浏览器 `Blob` 下载到本机。
- 导出前会阻止邮箱、常见密钥/令牌、私人绝对路径和过长文本。
- 不要输入邮箱、API Key、Token、密码、私人路径、未公开结果、私有代码、数据集或 checkpoint。

更完整的边界见 [PRIVACY.md](PRIVACY.md)；漏洞报告方式见 [SECURITY.md](SECURITY.md)。

## 本地运行

需要 Node.js 20 或更高版本。

```powershell
npm ci --prefix app
npm run dev --prefix app
```

生产构建与本地预览：

```powershell
npm run build --prefix app
npm run preview --prefix app -- --host 127.0.0.1
```

构建输出位于 `app/dist`。完整测试：

```powershell
npm run lint --prefix app
npm run test:contract --prefix app
npx --prefix app playwright install chromium
npm run test:e2e --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

更多细节见[新手指南](docs/usage/getting-started.md)、[Demo 数据说明](docs/usage/demo-data.md)、[75 秒网页通关视频](docs/usage/demo-video.md)与[发布社交文案](docs/usage/social-copy.md)。

## Research Quest Skill

Skill 位于 `skills/research-quest/`，并读取仓库根目录唯一的 `shared/game-state.schema.json`。为了保留这个相对布局，首选克隆仓库后创建 junction/symlink；发布 ZIP 也必须同时包含 Skill、Schema、许可证和第三方 notices。

标准“只复制 Skill 目录”的安装方式不会带上仓库外 Schema，因此不是受支持的独立安装路线。可复现的 Windows、macOS/Linux 和 ZIP 步骤见 [Skill 安装指南](docs/usage/skill-installation.md)。

## GitHub Pages

工作流会在 Pull Request 和 `main` 上运行质量检查；只有仓库已公开、事件不是 Pull Request 且分支为 `main` 时，部署 job 才能使用最小 `pages: write` / `id-token: write` 权限。首次发布仍需维护者在仓库 Settings → Pages 中选择 **GitHub Actions**。

在线项目地址为 <https://john-lin98.github.io/ai-research-quest/>；同一静态站点提供 [76 秒网页演示视频](https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm)。

## 公开数据与边界

- 默认状态：[public/demo-data/default-game-state.json](public/demo-data/default-game-state.json)
- 唯一 Schema：[shared/game-state.schema.json](shared/game-state.schema.json)
- 三个完整 Skill fixture：[skills/research-quest/references/test-sessions.md](skills/research-quest/references/test-sessions.md)
- 数据分类和审批状态：[docs/usage/demo-data.md](docs/usage/demo-data.md)

默认状态的 `privacy.sanitization.review_status` 只有在独立候选快照审计通过后才能设为 `approved`。CI 会把未审批状态视为发布 blocker。

## 许可证

项目采用 [MIT License](LICENSE)。第三方软件及其许可证见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)。
