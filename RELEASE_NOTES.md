# Release Notes

## v1.0.0

本地小说工坊 v1.0.0 是第一个正式发布版，定位为免费、本地化、离线优先的中文长篇小说 AI 创作工作台。

### 核心能力

- 本地小说项目管理，项目文件保存为 Markdown / JSON。
- Codex 直连，读取本机 Codex 和 cc-switch 配置。
- 本地模型接口备用，支持 Ollama、LM Studio 等本地服务。
- 多阶段写作流水线：规划、编排、写作、审计、修订、状态同步。
- 长期记忆、召回调试、故事圣经、记忆冲突修复。
- 文风模仿、文稿质量增强、发布质检和 AI 深度复核。
- 任务中心、任务重试、Codex 取消、自动刷新和任务详情。
- 发布前总检查、发布包清单、完整备份包和项目迁移包。
- JSON schema 校验、记忆 JSON 自动修复、项目损坏诊断和故障诊断报告。
- 内置演示小说项目，用于体验 10 章规划和完整创作链路。

### 发布验证

发布前运行：

```powershell
npm run check
npm run smoke
npm run regression
npm run e2e
npm run prepare:github
```

Windows x64 安装包：

```powershell
npm run pack:win
```
