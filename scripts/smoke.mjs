import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "server.mjs",
  "public/index.html",
  "public/app.js",
  "public/styles.css",
  "electron/main.mjs",
  "README.md",
  "使用教程.md",
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
const readmeMd = await fs.readFile(path.join(root, "README.md"), "utf8");
const tutorialMd = await fs.readFile(path.join(root, "使用教程.md"), "utf8");

const requiredUiMarkers = [
  ["index.html", "id=\"toggleAiConfig\""],
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
  ["index.html", "id=\"narrativeRadarPanel\""],
  ["index.html", "data-tool-panel"],
  ["index.html", "data-tool-panel=\"global-search\""],
  ["index.html", "data-tool-panel=\"task-center\""],
  ["index.html", "data-tool-panel=\"narrative-radar\""],
  ["app.js", "function toggleNewProjectPanel"],
  ["app.js", "function togglePane"],
  ["app.js", "function setActiveToolPanel"],
  ["app.js", "function scheduleAutosave"],
  ["app.js", "function runGlobalSearch"],
  ["app.js", "function renderTaskCenter"],
  ["app.js", "function renderNarrativeRadar"],
  ["app.js", "function runNarrativeRadar"],
  ["server.mjs", "parts[3] === \"search\""],
  ["server.mjs", "parts[3] === \"tasks\""],
  ["server.mjs", "parts[3] === \"narrative-radar\""],
  ["server.mjs", "function analyzeNarrativeRadar"],
  ["styles.css", ".app-shell.left-collapsed"],
  ["styles.css", ".app-shell.left-collapsed .workspace"],
  ["styles.css", ".app-shell.right-collapsed"],
  ["styles.css", ".top-pane-toggle"],
  ["styles.css", ".top-ai-config"],
  ["styles.css", ".tool-panel-toggle"]
];

const forbiddenUiMarkers = [
  ["index.html", "data-tool-panel=\"ai-settings\""],
  ["index.html", "data-tool-panel=\"idea\""],
  ["index.html", "pane-edge-toggle"],
  ["styles.css", ".pane-edge-toggle"],
  ["index.html", ["造", "梦", "工", "坊"].join("")],
  ["app.js", ["造", "梦", "工", "坊"].join("")],
  ["server.mjs", ["造", "梦", "工", "坊"].join("")],
  ["README.md", ["造", "梦", "工", "坊"].join("")],
  ["使用教程.md", ["造", "梦", "工", "坊"].join("")]
];

const missingUiMarkers = requiredUiMarkers
  .filter(([file, marker]) => {
    const source = file === "index.html" ? indexHtml : file === "app.js" ? appJs : file === "server.mjs" ? serverMjs : stylesCss;
    return !source.includes(marker);
  })
  .map(([file, marker]) => `${file}:${marker}`);

const presentForbiddenUiMarkers = forbiddenUiMarkers
  .filter(([file, marker]) => {
    const source = file === "index.html"
      ? indexHtml
      : file === "app.js"
        ? appJs
        : file === "server.mjs"
          ? serverMjs
          : file === "README.md"
            ? readmeMd
            : file === "使用教程.md"
              ? tutorialMd
              : stylesCss;
    return source.includes(marker);
  })
  .map(([file, marker]) => `${file}:${marker}`);

if (missing.length || missingScripts.length || missingUiMarkers.length || presentForbiddenUiMarkers.length) {
  console.error(JSON.stringify({ ok: false, missing, missingScripts, missingUiMarkers, presentForbiddenUiMarkers }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checkedFiles: required.length, checkedScripts: scripts.length, checkedUiMarkers: requiredUiMarkers.length, checkedForbiddenUiMarkers: forbiddenUiMarkers.length }, null, 2));
