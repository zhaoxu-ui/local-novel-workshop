import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "local-novel-studio-e2e-"));
process.env.PROJECTS_DIR = path.join(tmpRoot, "projects");
process.env.PORT = "0";

const { startServer } = await import("../server.mjs");
const started = await startServer(0);
const base = `http://127.0.0.1:${started.port}`;

try {
  const health = await fetch(`${base}/api/health`).then((res) => res.json());
  const html = await fetch(`${base}/`).then((res) => res.text());
  const required = [
    "本地小说工坊",
    "taskKindFilter",
    "runFinalPublishCheck",
    "runMemorySchemaCheck",
    "generateDiagnosticsReport",
    "/icons/open-book.svg"
  ];
  const missing = required.filter((marker) => !html.includes(marker));
  if (!health.ok || missing.length) {
    console.error(JSON.stringify({ ok: false, missing, health }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, checkedMarkers: required.length, url: base }, null, 2));
} finally {
  started.server.close();
}
