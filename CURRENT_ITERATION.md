# 当前迭代：v1.0.0 正式发布版

开始日期：2026-05-26

## 迭代目标

把本地小说工坊整理为可公开发布的本地化 AI 小说创作工作台，补齐 GitHub Release、Windows x64 发布清单、教程和安全检查。

## 权重排序

| 权重 | 工作项 | 状态 |
| ---: | --- | --- |
| 100 | README、使用教程和版本路线同步到 v1.0.0 | 已完成 |
| 96 | GitHub Release 模板和发布说明 | 已完成 |
| 94 | Windows x64 安装包发布清单 | 已完成 |
| 92 | 发布检查确认不包含本地项目数据和敏感配置 | 已完成 |

## 本轮已完成

- 新增 `RELEASE_NOTES.md`。
- 新增 `GITHUB_RELEASE_TEMPLATE.md`。
- 新增 `V1_RELEASE_CHECKLIST.md`。
- 版本号提升到 `1.0.0`。

## 出口标准

必须全部通过：

```powershell
npm run check
npm run smoke
npm run regression
npm run e2e
npm run prepare:github
```
