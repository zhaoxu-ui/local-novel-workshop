import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "local-novel-studio-acceptance-"));
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
  const html = await fetch(`${base}/`).then((res) => res.text());
  for (const marker of ["experienceMode", "data-experience-mode=\"beginner\"", "publishCenter", "writingQualityLoop"]) {
    if (!html.includes(marker)) throw new Error(`首页缺少验收标记：${marker}`);
  }

  const created = await api("/api/projects", {
    method: "POST",
    body: JSON.stringify({
      name: "验收流程小说",
      genre: "悬疑",
      premise: "雨停后，主角发现旧屋里传来一个不属于家人的笑声。"
    })
  });
  const id = created.project.id;

  const readiness = await api(`/api/projects/${encodeURIComponent(id)}/readiness`);
  if (!readiness.report?.items?.some((item) => item.key === "idea" && item.status === "ok")) {
    throw new Error("创作路径检查未识别立项信息");
  }

  const dashboard = await api(`/api/projects/${encodeURIComponent(id)}/dashboard`);
  if (!dashboard.dashboard?.firstChapterStarter?.brief) {
    throw new Error("项目仪表盘未生成第一章启动卡");
  }

  await api(`/api/projects/${encodeURIComponent(id)}/chapters`, {
    method: "POST",
    body: JSON.stringify({
      no: 1,
      title: "雨停后的门",
      status: "已规划",
      brief: dashboard.dashboard.firstChapterStarter.brief,
      hook: "门里的人是谁？"
    })
  });

  const chapter = await api(`/api/projects/${encodeURIComponent(id)}/chapter`, {
    method: "POST",
    body: JSON.stringify({
      chapterNo: 1,
      title: "雨停后的门",
      brief: dashboard.dashboard.firstChapterStarter.brief,
      content: "雨停以后，旧屋反而更暗。\n\n林岚把钥匙握在掌心，没急着开门。\n\n门里传来一声很轻的笑。\n\n那不是母亲的声音。\n\n“谁在里面？”她问。\n\n屋里安静了两秒。\n\n灯却自己亮了。"
    })
  });
  if (!chapter.file) throw new Error("第一章未保存成功");

  const quality = await api(`/api/projects/${encodeURIComponent(id)}/writing-quality-loop`, {
    method: "POST",
    body: JSON.stringify({ file: chapter.file })
  });
  if (!quality.reportFile || !quality.scores?.antiAiScore) {
    throw new Error("写作质检闭环未生成报告");
  }

  const publish = await api(`/api/projects/${encodeURIComponent(id)}/publish-center`, {
    method: "POST",
    body: JSON.stringify({ platform: "番茄", from: 1, to: 1 })
  });
  if (!publish.files?.materials || !publish.files?.template || !publish.files?.finalCheck || !publish.files?.export) {
    throw new Error("发布中心未生成完整发布产物");
  }

  const project = await api(`/api/projects/${encodeURIComponent(id)}`);
  const requiredFiles = [chapter.file, quality.reportFile, publish.files.materials, publish.files.template, publish.files.finalCheck, publish.files.export];
  const missing = requiredFiles.filter((file) => !project.project.files.includes(file));
  if (missing.length) throw new Error(`验收产物缺失：${missing.join(", ")}`);

  console.log(JSON.stringify({
    ok: true,
    url: base,
    project: id,
    generatedFiles: requiredFiles.length,
    mode: "beginner-to-publish"
  }, null, 2));
} finally {
  started.server.close();
}
