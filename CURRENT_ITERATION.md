# 当前迭代：v0.4.0 任务队列版

开始日期：2026-05-26

## 迭代目标

让 AI 任务中心从“产物列表”升级为可操作队列：能筛选、能自动刷新、能看详情、能重试失败任务、能取消运行中的 Codex 任务。

## 权重排序

| 权重 | 工作项 | 状态 |
| ---: | --- | --- |
| 86 | 运行中自动刷新任务状态 | 已完成 |
| 84 | 失败任务一键重试 | 已完成 |
| 82 | Codex 任务取消 | 已完成 |
| 78 | 按任务类型、状态筛选任务中心 | 已完成 |
| 74 | 任务详情抽屉，集中查看日志、产物、错误和下一步 | 已完成 |

## 本轮已完成

- `GET /api/projects/:id/tasks` 支持 `kind` 和 `status` 筛选，并返回任务统计摘要。
- 新增 `GET /api/projects/:id/tasks/:taskId`，可读取任务详情、产物预览、错误与下一步建议。
- 新增 `POST /api/projects/:id/tasks/:taskId/retry`，支持失败质检、发布资料和 Codex 任务重试；无法自动复现的任务会生成待人工重跑记录。
- 新增 `POST /api/projects/:id/tasks/:taskId/cancel`，支持运行中的 Codex 任务取消并写回状态。
- AI 任务中心新增类型筛选、状态筛选、自动刷新、详情、重试和取消按钮。

## 出口标准

必须全部通过：

```powershell
npm run check
npm run smoke
npm run regression
npm run prepare:github
```
