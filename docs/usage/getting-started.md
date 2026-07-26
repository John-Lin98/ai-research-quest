# 新手指南

## 先理解边界

Research Quest 是离线优先的公开教学 Demo，不是科研结果展示页。内置文字、题目、分数与奖励均为模拟、改编或脱敏素材；它们不构成产品效果、学习效果或科研结论。

`Candidate → Confirmed → Verified` 只能单向推进：

- Candidate：从材料或回答中提取出的候选认识。
- Confirmed：用户已确认，但还没有应用证据。
- Verified：已经通过应用、测验、迁移或纠错验证；只有这一层计入正式理解分。

## 75 秒体验

1. 在页面顶部点击“播放自动演示”。
2. 自动路线以固定 seed 依次完成序章、双战役、最终考试与导出准备，不循环。
3. 观察关卡进度、Known Unknown、三层认知地图和 Goal 预览。
4. 演示完成后点击“导出 game-state”或“导出 Codex Goal”。
5. 点击“重新开始”可以切回手动交互。

手动模式中，每一步只显示一个会改变路线的高价值问题。两个战役各有七关；最终考试不是第八关。

## 本地运行

要求 Node.js 20 或更高版本。在仓库根目录运行：

```powershell
npm ci --prefix app
npm run dev --prefix app
```

生产构建和预览：

```powershell
npm run build --prefix app
npm run preview --prefix app -- --host 127.0.0.1
```

默认预览地址由 Vite 输出；构建文件位于 `app/dist`。

## 验证

```powershell
npm run lint --prefix app
npm run test:contract --prefix app
npx --prefix app playwright install chromium
npm run test:e2e --prefix app
npm run build --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

契约测试覆盖 Schema、三层认证、Verified-only 计分、考试权重、导出和安全拒绝；Playwright 同时覆盖桌面 Chromium 与移动端 Chromium。

## 本地数据行为

- 页面没有账户、遥测、分析或服务端 API。
- 静态页面加载后不会把输入发往网络。
- 当前状态和自由文本只存在页面内存，不写入 localStorage、sessionStorage 或 IndexedDB。
- 只有用户主动点击导出时，浏览器才用本地 `Blob` 生成下载。
- 导出前会拒绝邮箱、常见密钥/令牌、私人绝对路径和过长文本。

不要输入真实邮箱、密钥、Token、密码、私人路径、私有代码、未公开结果、数据集或 checkpoint。若误输敏感内容，请不要导出，直接刷新或关闭页面以清空内存。

## 部署到 GitHub Pages

1. 先在 Pull Request 中等待质量检查通过。
2. 独立隐私审计通过后，确认默认 Demo 和三份 fixture 的审批状态均为 `approved`。
3. 仓库公开后，在 Settings → Pages 中选择 **GitHub Actions**。
4. 合并到 `main` 或手动运行工作流。
5. 只有 deploy job 成功并返回实际地址后，才能声明站点已上线。

构建 job 只有 `contents: read`；Pages 写权限只存在于最终 deploy job，且 Pull Request、私有仓库或非 `main` 分支不会执行部署。

预期项目路径为 <https://john-lin98.github.io/ai-research-quest/>；首次部署前把它视为目标地址，而不是上线证据。

## Skill

Skill 的安装和发布包需要保留仓库根布局，详见 [Skill 安装指南](skill-installation.md)。不要只复制 `skills/research-quest/`，否则唯一 Schema 不在预期位置。
