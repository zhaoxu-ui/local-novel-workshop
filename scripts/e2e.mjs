import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "local-novel-studio-e2e-"));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.env.PROJECTS_DIR = path.join(tmpRoot, "projects");
process.env.PORT = "0";

const { startServer } = await import("../server.mjs");
const started = await startServer(0);
const base = `http://127.0.0.1:${started.port}`;

try {
  const health = await fetch(`${base}/api/health`).then((res) => res.json());
  const html = await fetch(`${base}/`).then((res) => res.text());
  const appJs = await fs.readFile(path.join(root, "public", "app.js"), "utf8");
  const required = [
    "本地小说工坊",
    "experienceMode",
    "data-experience-mode=\"beginner\"",
    "taskKindFilter",
    "runFinalPublishCheck",
    "runMemorySchemaCheck",
    "generateDiagnosticsReport",
    "/icons/open-book.svg"
  ];
  const requiredAppMarkers = [
    "function setExperienceMode",
    "function renderExperienceMode",
    "function toggleActiveToolPanel",
    "state.activeToolPanel === panelId",
    "state.activeToolPanel = \"\""
  ];
  const missing = required.filter((marker) => !html.includes(marker));
  const missingAppMarkers = requiredAppMarkers.filter((marker) => !appJs.includes(marker));
  if (!health.ok || missing.length || missingAppMarkers.length) {
    console.error(JSON.stringify({ ok: false, missing, missingAppMarkers, health }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, checkedMarkers: required.length + requiredAppMarkers.length, url: base }, null, 2));
} finally {
  started.server.close();
}
