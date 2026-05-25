# 当前迭代：v0.6.0 工程治理版

开始日期：2026-05-26

## 迭代目标

降低维护成本，给大型文件拆分建立边界，同时补齐最小 E2E、长期记忆 JSON schema 校验和故障诊断报告。

## 权重排序

| 权重 | 工作项 | 状态 |
| ---: | --- | --- |
| 70 | 拆分 `server.mjs` 为 project、memory、pipeline、quality、export、codex-runner | 已完成 |
| 68 | 拆分 `public/app.js` 为 api、state、render、actions、panels | 已完成 |
| 66 | 增加浏览器 E2E 测试 | 已完成 |
| 64 | JSON schema 校验长期记忆文件 | 已完成 |
| 60 | 错误日志面板和故障诊断报告 | 已完成 |

## 本轮已完成

- 新增 `server/modules/*` 模块边界文件，并把长期记忆 schema 校验落到 `server/modules/memory.mjs`。
- 新增 `public/modules/*` 前端边界文件，为后续拆分 `app.js` 固定 state、api、render、actions、panels 方向。
- 新增 `npm run e2e`，启动临时本地服务并检查首页关键交互入口和健康接口。
- 新增 `GET /api/projects/:id/memory-schema-check`。
- 新增 `POST /api/projects/:id/diagnostics-report`。
- 配置诊断面板新增“长期记忆校验”和“生成故障诊断报告”。

## 出口标准

必须全部通过：

```powershell
npm run check
npm run smoke
npm run regression
npm run e2e
npm run prepare:github
```
