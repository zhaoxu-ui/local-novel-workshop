import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "server.mjs",
  "public/index.html",
  "public/app.js",
  "public/styles.css",
  "public/icons/open-book.svg",
  "public/icons/app-icon.ico",
  "electron/main.mjs",
  "README.md",
  "使用教程.md",
  "ROADMAP.md",
  "CURRENT_ITERATION.md",
  ".gitignore"
];

const missing = [];
for (const file of required) {
  try {
    await fs.access(path.join(root, file));
  } catch {
    missing.push(file);
  }
}

const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
const scripts = ["start", "desktop", "pack:win", "check", "smoke", "regression", "prepare:github"];
const missingScripts = scripts.filter((name) => !pkg.scripts?.[name]);

const indexHtml = await fs.readFile(path.join(root, "public/index.html"), "utf8");
const appJs = await fs.readFile(path.join(root, "public/app.js"), "utf8");
const stylesCss = await fs.readFile(path.join(root, "public/styles.css"), "utf8");
const serverMjs = await fs.readFile(path.join(root, "server.mjs"), "utf8");
const electronMainMjs = await fs.readFile(path.join(root, "electron/main.mjs"), "utf8");
const readmeMd = await fs.readFile(path.join(root, "README.md"), "utf8");
const tutorialMd = await fs.readFile(path.join(root, "使用教程.md"), "utf8");
const roadmapMd = await fs.readFile(path.join(root, "ROADMAP.md"), "utf8");
const currentIterationMd = await fs.readFile(path.join(root, "CURRENT_ITERATION.md"), "utf8");

const requiredUiMarkers = [
  ["index.html", "id=\"toggleAiConfig\""],
  ["index.html", "rel=\"icon\""],
  ["index.html", "/icons/open-book.svg"],
  ["index.html", "brand-icon"],
  ["index.html", "id=\"topAiConfig\""],
  ["index.html", "id=\"toggleNewProject\""],
  ["index.html", "id=\"newProjectBody\""],
  ["index.html", "sidebar-idea-panel"],
  ["index.html", "id=\"toggleLeftPane\""],
  ["index.html", "id=\"toggleRightPane\""],
  ["index.html", "top-pane-toggle"],
  ["index.html", "id=\"autosaveStatus\""],
  ["index.html", "id=\"compareLatestVersion\""],
  ["index.html", "id=\"globalSearchInput\""],
  ["index.html", "id=\"taskCenterPanel\""],
  ["index.html", "id=\"taskKindFilter\""],
  ["index.html", "id=\"taskStatusFilter\""],
  ["index.html", "id=\"taskAutoRefresh\""],
  ["index.html", "id=\"taskDetailPanel\""],
  ["index.html", "Codex 运行历史"],
  ["index.html", "id=\"narrativeRadarPanel\""],
  ["index.html", "id=\"toggleMoreTools\""],
  ["index.html", "id=\"moreToolMenu\""],
  ["index.html", "data-toolbox-group=\"write\""],
  ["index.html", "data-tool-panel"],
  ["index.html", "data-tool-panel=\"global-search\""],
  ["index.html", "data-tool-panel=\"task-center\""],
  ["index.html", "data-tool-panel=\"narrative-radar\""],
  ["index.html", "data-tool-panel=\"revision-publish\""],
  ["index.html", "data-tool-panel=\"project-maintenance\""],
  ["index.html", "data-tool-panel=\"style-lab\""],
  ["index.html", "data-tool-panel=\"memory-recall\""],
  ["index.html", "data-tool-panel=\"story-bible\""],
  ["index.html", "id=\"storyBiblePanel\""],
  ["index.html", "data-tool-group=\"project quality\" data-tool-panel=\"style-lab\""],
  ["index.html", "data-tool-group=\"project quality\" data-tool-panel=\"memory-recall\""],
  ["index.html", "data-tool-group=\"write revision quality\" data-tool-panel=\"sync-review\""],
  ["index.html", "本章必读"],
  ["index.html", "id=\"previewMemoryRecall\""],
  ["index.html", "id=\"analyzeStyleProfile\""],
  ["index.html", "id=\"runFinalPublishCheck\""],
  ["index.html", "id=\"createReleaseBackup\""],
  ["index.html", "id=\"generateReleasePackage\""],
  ["index.html", "id=\"generateReleaseNotes\""],
  ["app.js", "function previewSelectedSyncReview"],
  ["app.js", "data-sync-preview"],
  ["app.js", "sync-diff-preview"],
  ["server.mjs", "buildStateSyncDiffPreview"],
  ["server.mjs", "parts[4] === \"preview\""],
  ["index.html", "项目维护"],
  ["app.js", "function toggleNewProjectPanel"],
  ["app.js", "function togglePane"],
  ["app.js", "function setActiveToolPanel"],
  ["app.js", "function scheduleAutosave"],
  ["app.js", "function runGlobalSearch"],
  ["app.js", "function renderTaskCenter"],
  ["app.js", "function filteredTasks"],
  ["app.js", "function renderTaskDetail"],
  ["app.js", "function loadTaskDetail"],
  ["app.js", "function retryTask"],
  ["app.js", "function cancelTask"],
  ["app.js", "function setTaskAutoRefresh"],
  ["app.js", "function renderNarrativeRadar"],
  ["app.js", "function runNarrativeRadar"],
  ["app.js", "function pinMemoryRecallItem"],
  ["app.js", "function excludeMemoryRecallItem"],
  ["app.js", "function loadStoryBible"],
  ["app.js", "function saveStoryBibleEntry"],
  ["app.js", "function firstRepairableConflict"],
  ["app.js", "function createConflictRepairPlan"],
  ["app.js", "function applyConflictRepair"],
  ["app.js", "function runFinalPublishCheck"],
  ["app.js", "function createReleaseBackup"],
  ["app.js", "function generateReleasePackage"],
  ["app.js", "function generateReleaseNotes"],
  ["app.js", "data-memory-pin"],
  ["app.js", "data-memory-exclude"],
  ["app.js", "data-conflict-repair-plan"],
  ["app.js", "data-conflict-repair-apply"],
  ["server.mjs", "memory-pins"],
  ["server.mjs", "memory-exclusions"],
  ["server.mjs", "story-bible"],
  ["server.mjs", "parts[4] === \"repair-plan\""],
  ["server.mjs", "parts[4] === \"apply\""],
  ["server.mjs", "image/svg+xml"],
  ["server.mjs", "image/x-icon"],
  ["server.mjs", "function readStoryBible"],
  ["server.mjs", "MEMORY_PINS_FILE"],
  ["server.mjs", "MEMORY_EXCLUSIONS_FILE"],
  ["server.mjs", "parts[3] === \"search\""],
  ["server.mjs", "parts[3] === \"tasks\""],
  ["server.mjs", "function filterProjectTasks"],
  ["server.mjs", "function readProjectTaskDetail"],
  ["server.mjs", "function retryProjectTask"],
  ["server.mjs", "function cancelProjectTask"],
  ["server.mjs", "function runFinalPublishCheck"],
  ["server.mjs", "function createReleaseBackup"],
  ["server.mjs", "function generateReleasePackage"],
  ["server.mjs", "function generateReleaseNotes"],
  ["server.mjs", "parts[3] === \"publish-final-check\""],
  ["server.mjs", "parts[3] === \"release-backup\""],
  ["server.mjs", "parts[3] === \"release-package\""],
  ["server.mjs", "parts[3] === \"release-notes\""],
  ["server.mjs", "parts[5] === \"retry\""],
  ["server.mjs", "parts[5] === \"cancel\""],
  ["server.mjs", "TASK_INDEX_FILE"],
  ["server.mjs", "function recordProjectTask"],
  ["server.mjs", "function analyzeStyleProfile"],
  ["server.mjs", "function recallStructuredMemory"],
  ["server.mjs", "recalledMemory.ranked"],
  ["server.mjs", "memory-recall"],
  ["server.mjs", "style-profile"],
  ["README.md", "09_运行时/tasks.json"],
  ["README.md", "任务取消"],
  ["README.md", "失败任务一键重试"],
  ["README.md", "发布前总检查"],
  ["README.md", "完整备份包"],
  ["README.md", "v0.3.0"],
  ["README.md", "memory_pins.json"],
  ["README.md", "memory_exclusions.json"],
  ["README.md", "故事圣经"],
  ["README.md", "记忆冲突修复"],
  ["README.md", "ROADMAP.md"],
  ["ROADMAP.md", "v0.2.0"],
  ["ROADMAP.md", "v0.4.0"],
  ["ROADMAP.md", "失败任务一键重试。已完成。"],
  ["ROADMAP.md", "发布前总检查：章节连续、标题、字数、简介、标签、封面描述。已完成。"],
  ["ROADMAP.md", "召回结果手动钉选：把人物、伏笔、承诺固定为本章必读。已完成。"],
  ["CURRENT_ITERATION.md", "当前迭代：v0.5.0"],
  ["CURRENT_ITERATION.md", "发布前总检查"],
  ["CURRENT_ITERATION.md", "完整备份包"],
  ["CURRENT_ITERATION.md", "发布包清单"],
  ["server.mjs", "parts[3] === \"narrative-radar\""],
  ["server.mjs", "function analyzeNarrativeRadar"],
  ["electron/main.mjs", "app-icon.ico"],
  ["styles.css", ".app-shell.left-collapsed"],
  ["styles.css", ".brand-icon"],
  ["styles.css", ".app-shell.left-collapsed .workspace"],
  ["styles.css", ".app-shell.right-collapsed"],
  ["styles.css", ".top-pane-toggle"],
  ["styles.css", ".top-ai-config"],
  ["styles.css", ".more-tool-menu"],
  ["styles.css", ".tool-panel-toggle"]
];

const forbiddenUiMarkers = [
  ["index.html", "data-tool-panel=\"ai-settings\""],
  ["index.html", "data-tool-panel=\"idea\""],
  ["index.html", "data-toolbox-group=\"all\""],
  ["index.html", "pane-edge-toggle"],
  ["styles.css", ".pane-edge-toggle"],
  ["index.html", ["造", "梦", "工", "坊"].join("")],
  ["app.js", ["造", "梦", "工", "坊"].join("")],
  ["server.mjs", ["造", "梦", "工", "坊"].join("")],
  ["README.md", ["造", "梦", "工", "坊"].join("")],
  ["使用教程.md", ["造", "梦", "工", "坊"].join("")],
  ["server.mjs", ["I", "n", "k", "O", "S"].join("")],
  ["README.md", ["I", "n", "k", "O", "S"].join("")],
  ["使用教程.md", ["I", "n", "k", "O", "S"].join("")]
];

function sourceFor(file) {
  if (file === "index.html") return indexHtml;
  if (file === "app.js") return appJs;
  if (file === "server.mjs") return serverMjs;
  if (file === "electron/main.mjs") return electronMainMjs;
  if (file === "README.md") return readmeMd;
  if (file === "使用教程.md") return tutorialMd;
  if (file === "ROADMAP.md") return roadmapMd;
  if (file === "CURRENT_ITERATION.md") return currentIterationMd;
  return stylesCss;
}

const missingUiMarkers = requiredUiMarkers
  .filter(([file, marker]) => {
    return !sourceFor(file).includes(marker);
  })
  .map(([file, marker]) => `${file}:${marker}`);

const presentForbiddenUiMarkers = forbiddenUiMarkers
  .filter(([file, marker]) => {
    return sourceFor(file).includes(marker);
  })
  .map(([file, marker]) => `${file}:${marker}`);

if (missing.length || missingScripts.length || missingUiMarkers.length || presentForbiddenUiMarkers.length) {
  console.error(JSON.stringify({ ok: false, missing, missingScripts, missingUiMarkers, presentForbiddenUiMarkers }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checkedFiles: required.length, checkedScripts: scripts.length, checkedUiMarkers: requiredUiMarkers.length, checkedForbiddenUiMarkers: forbiddenUiMarkers.length }, null, 2));
