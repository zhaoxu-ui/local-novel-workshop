# 当前迭代：v0.5.0 发布准备版

开始日期：2026-05-26

## 迭代目标

从“能生成小说”推进到“能放心整理发布”：发布前能总检查、能备份、能打包清单、能生成安装包发布说明。

## 权重排序

| 权重 | 工作项 | 状态 |
| ---: | --- | --- |
| 78 | 发布前总检查：章节连续、标题、字数、简介、标签、封面描述 | 已完成 |
| 76 | 项目完整备份包：导出项目资料和正文，排除本地敏感配置 | 已完成 |
| 72 | 发布包清单：TXT/MD、简介、标签、封面提示词、注意事项统一打包 | 已完成 |
| 70 | Windows 安装包版本号、更新日志和发布模板规范化 | 已完成 |

## 本轮已完成

- 新增 `POST /api/projects/:id/publish-final-check`，生成发布前总检查报告。
- 新增 `POST /api/projects/:id/release-backup`，生成项目完整备份包和备份清单。
- 新增 `POST /api/projects/:id/release-package`，统一生成发布包清单、TXT、MD、发布资料和总检查。
- 新增 `POST /api/projects/:id/release-notes`，生成 Windows 安装包发布说明。
- “修订发布”区域新增发布前总检查、发布包清单、完整备份包和安装包发布说明按钮。

## 出口标准

必须全部通过：

```powershell
npm run check
npm run smoke
npm run regression
npm run prepare:github
```
