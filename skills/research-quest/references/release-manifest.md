# Skill 发行清单

## 必需根条目

```text
skills/research-quest/**
shared/game-state.schema.json
LICENSE
THIRD_PARTY_NOTICES
```

禁止加入输入材料、用户导出、凭据、缓存、测试报告、浏览器 profile、真实项目数据或仓库历史。

## Canonical Schema

- 版本：`1.0.0`
- SHA-256：`c7deaf33007782476723169827c9fbb92a5dbd904d3fe34687caed8e3768e77b`

`generate-test-sessions.mjs` 会同时检查版本与哈希。Schema 合法变更必须更新 Schema、脚本和本清单，并重新执行独立合同审查。

## 创建发行包

```powershell
git archive --format=zip --output=research-quest-skill-bundle.zip HEAD -- `
  skills/research-quest `
  shared/game-state.schema.json `
  LICENSE `
  THIRD_PARTY_NOTICES
Get-FileHash -Algorithm SHA256 research-quest-skill-bundle.zip
```

发布页必须同时记录源提交 SHA 和 ZIP SHA-256。不要把尚未生成的归档哈希写成占位值。

## 解包 smoke

在空目录解压并运行：

```powershell
node .\skills\research-quest\scripts\generate-test-sessions.mjs --check-only
npx --yes --package ajv-cli@5 --package ajv-formats ajv validate `
  --spec=draft2020 --strict=true --allow-union-types -c ajv-formats `
  -s shared/game-state.schema.json `
  -d "skills/research-quest/references/fixture-*.json"
```

三份 fixture 必须全部通过；`review_status` 必须为 `approved`，且 `real_research_results_included` 必须为 `false`。
