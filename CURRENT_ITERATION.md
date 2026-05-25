# 当前迭代：v0.9.0 项目安全与迁移版

开始日期：2026-05-26

## 迭代目标

让项目能跨电脑迁移，并能在损坏时自检和修复。

## 权重排序

| 权重 | 工作项 | 状态 |
| ---: | --- | --- |
| 64 | 项目导入/导出 | 已完成 |
| 62 | 备份恢复向导清单 | 已完成 |
| 60 | 记忆 JSON 自动修复 | 已完成 |
| 58 | 项目损坏诊断 | 已完成 |

## 本轮已完成

- 新增 `POST /api/projects/:id/portable-export`。
- 新增 `POST /api/projects/:id/memory-repair`。
- 新增 `POST /api/projects/:id/integrity-check`。
- “项目维护”区域新增导出迁移包、记忆 JSON 自动修复和项目损坏诊断。

## 出口标准

必须全部通过：

```powershell
npm run check
npm run smoke
npm run regression
npm run e2e
npm run prepare:github
```
