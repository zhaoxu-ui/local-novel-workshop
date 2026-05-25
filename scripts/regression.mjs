import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "local-novel-studio-"));
process.env.PROJECTS_DIR = path.join(tmpRoot, "projects");
process.env.PORT = "0";

const { startServer } = await import("../server.mjs");
const started = await startServer(0);
const base = `http://127.0.0.1:${started.port}`;

async function api(url, options = {}) {
  const res = await fetch(base + url, { headers: { "content-type": "application/json" }, ...options });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  if (!res.ok) throw new Error(`${res.status} ${data.error || text}`);
  return data;
}

try {
  const created = await api("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name: "回归测试项目", genre: "悬疑", premise: "一个测试用的长篇小说项目。" })
  });
  const id = created.project.id;
  await api(`/api/projects/${encodeURIComponent(id)}/chapters`, {
    method: "POST",
    body: JSON.stringify({ no: 1, title: "测试章节", status: "已规划", brief: "开场、冲突、信息增量、结尾钩子。", hook: "门后是谁？" })
  });
  await api(`/api/projects/${encodeURIComponent(id)}/chapter`, {
    method: "POST",
    body: JSON.stringify({
      chapterNo: 1,
      title: "测试章节",
      brief: "开场、冲突、信息增量、结尾钩子。",
      content: "门外的雨停了。\n\n林岚把钥匙压在掌心，没有立刻开门。\n\n屋里传来一声很轻的笑。\n\n她知道，这不是母亲会发出的声音。\n\n“谁在里面？”她问。\n\n没人回答。\n\n灯却自己亮了。"
    })
  });

  const quality = await api(`/api/projects/${encodeURIComponent(id)}/quality-check`, {
    method: "POST",
    body: JSON.stringify({ scope: "all" })
  });
  const revisionTask = await api(`/api/projects/${encodeURIComponent(id)}/revision-task`, {
    method: "POST",
    body: JSON.stringify({ reportFile: quality.reportFile, chapterNo: 1, note: "保留悬念。" })
  });
  const materials = await api(`/api/projects/${encodeURIComponent(id)}/publish-materials`, {
    method: "POST",
    body: JSON.stringify({ platform: "通用" })
  });
  const batch = await api(`/api/projects/${encodeURIComponent(id)}/batch`, {
    method: "POST",
    body: JSON.stringify({ task: "quality", from: 1, to: 1 })
  });
  const exported = await api(`/api/projects/${encodeURIComponent(id)}/export`, {
    method: "POST",
    body: JSON.stringify({ format: "md", from: 1, to: 1, withTitles: true })
  });
  const conflicts = await api(`/api/projects/${encodeURIComponent(id)}/conflicts`, { method: "POST", body: JSON.stringify({}) });
  const presets = await api(`/api/projects/${encodeURIComponent(id)}/model-presets`, {
    method: "POST",
    body: JSON.stringify({ name: "回归测试预设", runner: "codex" })
  });
  const search = await api(`/api/projects/${encodeURIComponent(id)}/search?q=${encodeURIComponent("钥匙")}`);
  const tasks = await api(`/api/projects/${encodeURIComponent(id)}/tasks`);
  const radar = await api(`/api/projects/${encodeURIComponent(id)}/narrative-radar`);

  const requiredFiles = [
    quality.reportFile,
    revisionTask.taskFile,
    materials.file,
    batch.file,
    exported.file,
    conflicts.reportFile,
    "05_提示词/model-presets.json"
  ];
  const project = await api(`/api/projects/${encodeURIComponent(id)}`);
  const missing = requiredFiles.filter((file) => !project.project.files.includes(file));
  if (missing.length) throw new Error(`回归产物缺失：${missing.join(", ")}`);
  if (!presets.presets?.length) throw new Error("模型预设未保存");
  if (!search.results?.some((item) => item.file.includes("测试章节") && item.preview.includes("钥匙"))) {
    throw new Error("全局搜索未返回章节正文命中");
  }
  if (!tasks.tasks?.some((item) => item.kind === "revision" && item.files?.includes(revisionTask.taskFile))) {
    throw new Error("任务中心未返回修订任务单");
  }
  if (!radar.scores?.publishReadiness || !Array.isArray(radar.issues)) {
    throw new Error("创作雷达未返回评分和问题列表");
  }

  console.log(JSON.stringify({ ok: true, project: id, checkedArtifacts: requiredFiles.length, searchHits: search.results.length, tasks: tasks.tasks.length, radarScore: radar.scores.publishReadiness }, null, 2));
} finally {
  await new Promise((resolve) => started.server.close(resolve));
  await fs.rm(tmpRoot, { recursive: true, force: true });
}
