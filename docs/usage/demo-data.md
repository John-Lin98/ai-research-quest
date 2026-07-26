# Demo 数据说明

## 文件与唯一契约

| 文件 | 用途 | 修改边界 |
| --- | --- | --- |
| `public/demo-data/default-game-state.json` | 网页默认公开状态 | 内容更新；不得改变字段语义 |
| `shared/game-state.schema.json` | 唯一 Canonical Schema 1.0.0 | 合同变更必须独立评审 |
| `skills/research-quest/references/fixture-*.json` | 科研、软件、学习三个完整模拟会话 | Skill 合同与安装 smoke |

网页与 Skill 都必须消费同一份 Schema 语义。不得为了绕过验证而在任一模块维护手改的第二套字段定义。

## 公开分类

每条战役的 `provenance` 明确声明：

- `data_classification`：`simulated`、`adapted` 或 `deidentified`。
- `display_label`：面向用户的“模拟数据”“改编场景”或“脱敏场景”。
- `public_safe: true`。
- `contains_real_research_results: false`。
- `source_traceability`：只描述公开素材类型，不给出或推断私有来源。

根级 `privacy` 同时声明已移除个人标识、私人路径、凭据、私有代码、未公开结果、服务器信息、数据集和 checkpoint。

## 审批状态

`privacy.sanitization.review_status` 不是作者自证：

- `pending`：尚未完成独立候选快照审计，禁止发布。
- `reviewed`：已检查但仍未达到发布门槛。
- `approved`：独立审计已对当前候选快照给出可复验证据。

工作流要求默认状态和三份 fixture 均为 `approved`，并要求 `real_research_results_included === false`。任何内容修改都会使既有审批证据失效，应重新审计；不能仅修改字段值来“通过”门槛。

## 结构不变量

- 两个战役各有且仅有七关。
- 当前交互问题最多一个。
- Confirmed 必须含确认凭据；Verified 同时含确认与验证凭据。
- 正式理解指标只能从 Verified 计算。
- 最终考试权重为决策应用 60%、概念理解 20%、迁移 20%，总和 100。
- 状态和 Goal 导出都带 Schema 版本、SHA-256 与公开安全标记。
- 自动演示固定 seed、75 秒、不循环。

## 维护与检查

```powershell
node skills/research-quest/scripts/generate-test-sessions.mjs --check-only
npm run test:contract --prefix app
npm run build --prefix app
node skills/research-quest/scripts/public-safety-scan.mjs --include-dist
```

严格 Draft 2020-12 验证：

```powershell
npx --yes --package ajv-cli@5 --package ajv-formats ajv validate `
  --spec=draft2020 --strict=true --allow-union-types -c ajv-formats `
  -s shared/game-state.schema.json `
  -d "skills/research-quest/references/fixture-*.json"
```

公开安全扫描会覆盖 `app/`、`public/`、`shared/`、`skills/`、`docs/usage/`、根公开文档、workflow 和 `app/dist`。安全测试中的伪邮箱、伪令牌和伪绝对路径只按“文件路径 + 完整匹配值”精确放行。
