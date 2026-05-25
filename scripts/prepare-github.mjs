import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checks = [
  { path: "projects", expectedIgnored: true, note: "用户小说项目数据" },
  { path: "release", expectedIgnored: true, note: "Windows 安装包输出" },
  { path: ".env", expectedIgnored: true, note: "本地环境变量" },
  { path: ".codex", expectedIgnored: true, note: "本地 Codex 配置" },
  { path: ".cc-switch", expectedIgnored: true, note: "本地 cc-switch 配置" }
];

const gitignore = await fs.readFile(path.join(root, ".gitignore"), "utf8").catch(() => "");
const rows = [];
for (const item of checks) {
  const exists = await fs.access(path.join(root, item.path)).then(() => true).catch(() => false);
  const ignored = gitignore.split(/\r?\n/).some((line) => line.trim().replace(/\/$/, "") === item.path);
  rows.push({ ...item, exists, ignored, ok: !item.expectedIgnored || ignored });
}

const report = [
  "# GitHub 发布检查",
  "",
  `生成时间：${new Date().toISOString()}`,
  "",
  "| 路径 | 存在 | 已忽略 | 说明 |",
  "| --- | --- | --- | --- |",
  ...rows.map((row) => `| ${row.path} | ${row.exists ? "是" : "否"} | ${row.ignored ? "是" : "否"} | ${row.note} |`),
  "",
  rows.every((row) => row.ok)
    ? "结论：可以发布代码。确认不要手动 git add 被忽略的本地数据目录。"
    : "结论：存在未被忽略的本地敏感/大文件路径，请先更新 .gitignore。"
].join("\n");

const out = path.join(root, "GITHUB_RELEASE_CHECK.md");
await fs.writeFile(out, report + "\n", "utf8");
console.log(`GitHub 发布检查已写入: ${out}`);
if (!rows.every((row) => row.ok)) process.exit(1);
