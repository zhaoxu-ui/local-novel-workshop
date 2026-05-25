# v1.0.0 正式发布检查清单

## 代码验证

- [x] `npm run check`
- [x] `npm run smoke`
- [x] `npm run regression`
- [x] `npm run e2e`
- [x] `npm run prepare:github`

## 发布资产

- [x] README 已同步 v1.0.0。
- [x] 使用教程已覆盖核心流程。
- [x] ROADMAP 已标记到 v1.0.0。
- [x] GitHub Release 模板已准备。
- [x] Release notes 已准备。
- [x] Windows x64 安装包命令已记录。

## 安全检查

- [x] `projects/` 被 `.gitignore` 忽略。
- [x] `release/` 被 `.gitignore` 忽略。
- [x] `.env` 被 `.gitignore` 忽略。
- [x] `.codex/` 被 `.gitignore` 忽略。
- [x] `.cc-switch/` 被 `.gitignore` 忽略。

## 建议发布命令

```powershell
npm install
npm run pack:win
```
