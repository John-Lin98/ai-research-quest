# Research Quest Skill 安装与发布

Skill 读取仓库根目录唯一的 `shared/game-state.schema.json`。标准“只复制 Skill 目录”的安装会丢失这份 Schema，因此当前支持以下两条保留根布局的路线。

## Windows：clone + junction

需要 Git、Node.js 20+。先克隆公开仓库：

```powershell
git clone --depth 1 https://github.com/John-Lin98/ai-research-quest.git
$questRepo = (Resolve-Path .\ai-research-quest).Path
$skillSource = Join-Path $questRepo 'skills\research-quest'
$skillTarget = Join-Path $env:USERPROFILE '.codex\skills\research-quest'
```

先检查目标；若已存在，停止并由用户选择新名称或手动处理，安装命令不会覆盖或删除已有 Skill：

```powershell
if (Test-Path $skillTarget) { throw "目标 Skill 已存在：$skillTarget" }
New-Item -ItemType Junction -Path $skillTarget -Target $skillSource
node (Join-Path $skillSource 'scripts\generate-test-sessions.mjs') --check-only
```

Junction 只链接到克隆目录；移动或删除克隆目录会使链接失效。

## macOS / Linux：clone + symlink

```bash
git clone --depth 1 https://github.com/John-Lin98/ai-research-quest.git
repo="$PWD/ai-research-quest"
target="${CODEX_HOME:-$HOME/.codex}/skills/research-quest"
test ! -e "$target" || { echo "target already exists: $target" >&2; exit 1; }
ln -s "$repo/skills/research-quest" "$target"
node "$repo/skills/research-quest/scripts/generate-test-sessions.mjs" --check-only
```

## 根布局 ZIP

维护者从已审计提交创建 ZIP，必须包含：

```text
skills/research-quest/**
shared/game-state.schema.json
LICENSE
THIRD_PARTY_NOTICES
```

PowerShell 示例：

```powershell
git archive --format=zip --output=research-quest-skill-bundle.zip HEAD -- `
  skills/research-quest `
  shared/game-state.schema.json `
  LICENSE `
  THIRD_PARTY_NOTICES
Get-FileHash -Algorithm SHA256 research-quest-skill-bundle.zip
```

发布页应同时提供 ZIP 的 SHA-256。用户下载后先对照哈希，再解压并保留目录层级：

```powershell
node .\skills\research-quest\scripts\generate-test-sessions.mjs --check-only
```

完整包清单和当前 Schema 哈希见 `skills/research-quest/references/release-manifest.md`。

## 负向说明

`npx skills add ... --copy` 只复制 `skills/research-quest/` 时，默认自检会因找不到仓库外 Schema 而 fail closed。这是预期保护，不是可以忽略的警告。除非安装器能同时保留上述根布局，否则不要把该命令宣传为可直接运行的安装方式。
