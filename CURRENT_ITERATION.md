# 当前迭代：v0.3.0 可控记忆版

开始日期：2026-05-25

## 迭代目标

让 AI 写作前读取什么、写作后同步什么，都可视、可控、可回退。当前版本只处理“记忆可控”相关能力，不继续扩展新的写作入口。

## 权重排序

| 权重 | 工作项 | 状态 |
| ---: | --- | --- |
| 92 | 召回结果手动钉选：把人物、伏笔、承诺固定为本章必读 | 已完成 |
| 90 | 状态同步写入前差异预览：显示将修改哪些文件和字段 | 已完成 |
| 88 | 故事圣经编辑器：人物、剧情线、读者承诺、世界规则表单化维护 | 已完成 |
| 84 | 召回结果手动排除：临时禁止某条记忆参与本章生成 | 已完成 |
| 80 | 记忆冲突修复闭环：冲突报告到修复方案再到应用 | 已完成 |

## 当前版本允许做

- 增强召回调试、长期记忆读取和状态同步审核。
- 增加小型控制入口，但优先复用“召回调试”和“状态同步审核”，不新增右侧大面板。
- 修复阻断使用的 bug、测试失败、文档错误和发布风险。
- 补充与记忆控制相关的 README、使用教程和回归测试。

## 当前版本不做

- 不新增新的 AI 写作入口。
- 不引入云服务、数据库、账号系统或外部依赖。
- 不做向量检索和大型故事圣经编辑器，除非先完成当前高权重项。
- 不做任务队列取消、失败重试和后台刷新，这些进入 v0.4.0。
- 不做大规模前后端文件拆分，这些进入 v0.6.0。

## 本轮已完成

- 新增 `04_连续性/memory_pins.json`，保存按章节绑定的本章必读记忆。
- 新增 `POST /api/projects/:id/memory-pins`、`GET /api/projects/:id/memory-pins`、`DELETE /api/projects/:id/memory-pins`。
- `memory-recall` 和运行时 `context.json` 都会返回 `recalledMemory.pinned`。
- “召回调试”面板支持把召回结果钉选为本章必读，也支持取消钉选。
- 新增 `POST /api/projects/:id/sync-review/preview`，在应用状态同步前预览目标文件、追加/合并方式和写入前后数量。
- “状态同步审核”面板支持先点“预览差异”，再决定是否应用选中内容。
- 新增 `04_连续性/memory_exclusions.json`，保存按章节绑定的本章不读记忆。
- 新增 `POST /api/projects/:id/memory-exclusions`、`GET /api/projects/:id/memory-exclusions`、`DELETE /api/projects/:id/memory-exclusions`。
- `memory-recall` 和运行时 `context.json` 都会返回 `recalledMemory.excluded`，并从本章结构化召回中过滤排除项。
- “召回调试”面板支持把召回结果标为本章不读，也支持取消排除。
- 新增 `GET /api/projects/:id/story-bible` 和 `POST /api/projects/:id/story-bible`。
- “故事圣经”面板支持表单化维护人物、剧情线、读者承诺和世界规则，并写回对应长期记忆 JSON。
- 新增 `POST /api/projects/:id/conflicts/repair-plan` 和 `POST /api/projects/:id/conflicts/apply`。
- “记忆冲突看板”支持从报告卡片生成修复方案，并对“人物状态重复”应用自动修复。
- 应用记忆冲突修复前会自动创建安全快照，修复后生成 `04_连续性/记忆冲突修复_时间.md`。

## 出口标准

必须全部通过：

```powershell
npm run check
npm run smoke
npm run regression
npm run prepare:github
```

同时确认：

- `README.md` 与当前界面一致。
- `使用教程.md` 能说明召回钉选的使用方式。
- `ROADMAP.md` 标记 v0.3.0 当前完成项。
- `项目审阅报告.md` 不再把召回结果手动钉选和记忆冲突修复列为缺失能力。
