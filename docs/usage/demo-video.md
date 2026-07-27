# Research Quest 四象限目标驱动演示视频

## 成品目标

- 文件：`public/research-quest-demo-75s.webm`
- 在线播放：https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm
- 目标时长：60–90 秒
- 分辨率：1440 × 900
- 容器：WebM / VP9
- 内容：真实网页流程录制，不使用静态假页面。

新版视频围绕五条价值主张展开：

1. AI 用游戏化方式帮助用户澄清真实科研目标；
2. 认知地图固定为 Known–Unknown 四象限，横轴为是否意识到、纵轴为是否掌握；
3. 每回合通常 1 个、最多 3 个最关键问题；
4. AI 持续生成任务 Context、实现方案和 Goal vN；
5. Goal Forge 后交给 ChatGPT、Codex 或多 Agent 队伍继续执行、验证和交付。

视频还展示每轮正反馈：四象限变化、认知分、科研目标进度、预计剩余时间和 Goal 版本变化。

## 录制脚本

脚本：

```text
app/scripts/record-research-quest-demo.mjs
```

脚本使用 Playwright Chromium 原生录像，并在真实网页上叠加宣传字幕。主要时间线为：

```text
真实科研需求
→ 趣味化澄清目标
→ 固定四象限
→ 1–3 个关键问题
→ Context / Goal vN
→ Codex / 多 Agent 执行
→ 认知与任务进度反馈
→ Goal Forge 后继续交付
```

本地执行：

```powershell
npm ci --prefix app
npx --prefix app playwright install chromium
npm run dev --prefix app -- --host 127.0.0.1 --port 4174
node app/scripts/record-research-quest-demo.mjs
```

默认输出：

```text
public/research-quest-demo-75s.webm
```

可以通过环境变量覆盖：

```text
RESEARCH_QUEST_URL
RESEARCH_QUEST_VIDEO
```

## 自动生成与压缩

发布分支使用临时 GitHub Actions 工作流运行真实网页、录制 WebM，并用 FFmpeg 转为 VP9：

```text
ffmpeg -i input.webm -an -c:v libvpx-vp9 -crf 38 -b:v 0 output.webm
```

生成完成后，临时工作流必须删除，避免后续 PR 重复录制。

## 边界

- 自动演示只展示产品流程，不计入任何用户的正式认知分；
- AlphaFold2 活性位点任务是可执行试点设计，不是已经完成的科研结果；
- 视频不输入或展示邮箱、凭据、私有路径、私有代码、数据集、checkpoint 或未公开研究材料；
- 视频中的宣传表述是产品设计目标和待验证假设，不声称 Research Quest 已证明提高科研能力或创造力。

## 验证

发布前检查：

- 时长在 60–90 秒；
- 分辨率为 1440 × 900；
- 视频开场出现真实科研需求；
- 固定四象限、1–3 个问题、Context/Goal 与 Agent 执行均清晰可见；
- GitHub Pages 返回 `HTTP 200` 和 `Content-Type: video/webm`；
- 视频随 `publicDir` 进入 `app/dist/`；
- 公开安全扫描通过。
