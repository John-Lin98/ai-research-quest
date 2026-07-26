# Research Quest 网页通关演示视频

## 成品

- 文件：`public/research-quest-demo-75s.webm`
- 在线播放：https://john-lin98.github.io/ai-research-quest/research-quest-demo-75s.webm
- 时长：76.6 秒（符合 60–90 秒要求）
- 分辨率：1440 × 900
- 容器与编码：WebM（Chromium 原生网页录制）
- 内容：真实网页的 75 秒确定性自动演示；呈现双战役、关卡选择、Candidate → Confirmed → Verified、最终考试与 Goal 导出准备。

视频只使用公开 Demo 的合成或改编内容。自动演示是流程展示，不代表用户已经掌握知识，也不构成科研或学习效果声明。

## 生成方式

本机未发现可用的 FFmpeg 二进制，因此使用 Playwright Chromium 的原生 WebM 录制能力，避免额外安装依赖。录制前在仓库根目录运行：

```powershell
npm run dev --prefix app -- --host 127.0.0.1 --port 4174
```

录制命令（为便于阅读，已将临时录制目录写成环境变量）：

```powershell
node --input-type=module -e "import { chromium } from '@playwright/test'; const browser=await chromium.launch({headless:true}); const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:process.env.TEMP,size:{width:1440,height:900}}}); const page=await context.newPage(); await page.goto('http://127.0.0.1:4174/',{waitUntil:'networkidle'}); await page.getByRole('button',{name:'播放自动演示'}).click(); const moments=[[5000,.18],[13000,.36],[21000,.54],[30000,.70],[39000,.46],[48000,.78],[57000,1],[65000,.12]],started=Date.now(); for(const [at,ratio] of moments){const wait=at-(Date.now()-started);if(wait>0)await page.waitForTimeout(wait);await page.evaluate(r=>window.scrollTo({top:document.documentElement.scrollHeight*r,behavior:'smooth'}),ratio)} const wait=76000-(Date.now()-started);if(wait>0)await page.waitForTimeout(wait); const video=page.video(); await context.close(); await video.saveAs('../public/research-quest-demo-75s.webm'); await browser.close();"
```

正式录制在时间轴上分段滚动页面，以便在一个视频里展示地图、关卡、认知地图、考试与导出区域；不会输入、展示或传输任何个人资料、凭据、私有路径或未公开研究素材。

## 验证

- 浏览器读取到的媒体元数据：`duration=76.6`、`width=1440`、`height=900`。
- 本地静态服务请求视频返回 `HTTP 200` 和 `Content-Type: video/webm`。
- 成品位于 Vite 配置的 `publicDir`，构建后会随静态站点进入 `app/dist/`，可由 GitHub Pages 提供访问。
