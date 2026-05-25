# 本地小说工坊 v1.0.0

本地小说工坊是一个免费、本地化、离线优先的中文长篇小说 AI 创作工作台。

## 适合谁

- 已经在本机使用 Codex / cc-switch 的用户。
- 希望用 Ollama、LM Studio 等本地模型写小说的用户。
- 希望把小说资料、正文、设定、记忆、发布稿保存在本机的作者。

## v1.0.0 包含

- 多阶段写作流水线。
- 长期记忆、召回调试、故事圣经和记忆冲突修复。
- 文风模仿、文稿质量增强、发布质检和修订发布。
- 任务中心、失败重试、Codex 取消和自动刷新。
- 发布前总检查、发布包清单、完整备份包和项目迁移包。
- 项目损坏诊断、记忆 JSON 自动修复和故障诊断报告。
- 一键创建演示小说项目。

## Windows x64 安装包

安装包文件名：

```text
本地小说工坊 Setup 1.0.0.exe
```

构建命令：

```powershell
npm install
npm run pack:win
```

## 验证

```powershell
npm run check
npm run smoke
npm run regression
npm run e2e
npm run prepare:github
```

## 隐私说明

项目默认保存在本机，不使用数据库，不默认上传云端。仓库发布不包含 `projects/`、`.env`、`.codex/`、`.cc-switch/`、`release/`。
