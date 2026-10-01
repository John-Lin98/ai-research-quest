# Research Quest v2.1｜Personal / Global 两级进化

日期：2026-10-01

## 目标

在 v2.0 受控 RSI 基础上，把“越用越好用”拆成两个互不混淆的层级：

1. Personal Evolution：优先服务单个用户，快速学习个人偏好、失败经验和高效工作习惯；
2. Global Evolution：只吸收多个独立用户共同遇到的痛点，避免把少数用户偏好误写成公共规则。

同时采用已批准的分级自治方案 B：

- Mutable Layer：满足跨用户证据、Champion–Challenger 和 required checks 后，可自动晋升；
- Protected Layer：只能自动提出和测试，必须人工审批。

## 本轮完成

- Self-Improvement Protocol 重写为 Personal / Global 两级进化；
- SKILL.md 同步两级进化和分级自治；
- Rules & Templates 同步；
- Experience Event 增加 pattern_key；
- record-experience 对旧事件自动生成 coarse pattern；
- 新增 export-global-feedback.mjs；
- 新增 aggregate-global-feedback.mjs；
- Self-Improvement fixture 增加 evolution_scope / risk_class；
- Validator 增加 Personal/Global smoke test，并验证至少 3 个 distinct source 才能形成 Global candidate。

## 隐私与泛化原则

- 默认无隐式遥测；
- Personal Ledger 与 local-policy 默认只保存在本地 .research-quest/；
- Global feedback 必须显式 opt-in；
- Global bundle 默认只导出 pattern_key、事件类型、影响和变更范围，不上传完整聊天；
- 单个用户重复很多次不能等价为多个用户共同痛点；
- distinct source 是最低门槛，不代表充分的防作弊身份验证；正式公共晋升还需要可信反馈渠道与 held-out replay。

## 当前最大风险

全局聚合只解决“这个痛点是否跨用户存在”，还没有解决“候选修改是否真的比 Champion 更好”。

## 下一步

实现 Champion–Challenger replay/eval：
- 同一批历史任务分别运行 Champion / Challenger；
- 增加 held-out user/task cohorts；
- 比较目标指标、回归、成本和安全；
- 输出机器可读 promotion report；
- 只允许 Mutable + Global + Promotion PASS 进入自动合并候选。