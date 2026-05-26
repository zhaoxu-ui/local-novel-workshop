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
  const demo = await api("/api/demo-project", {
    method: "POST",
    body: JSON.stringify({})
  });
  if (!demo.project?.id || !demo.acceptanceReport) {
    throw new Error("演示项目未创建验收报告");
  }
  const demoProject = await api(`/api/projects/${encodeURIComponent(demo.project.id)}`);
  if (!demoProject.project.chapters?.length || demoProject.project.chapters.length < 10 || !demoProject.project.files.includes("01_正文/第001章_雨停后的门.md")) {
    throw new Error("演示项目未包含 10 章规划和样章");
  }

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
  const overwrittenChapter = await api(`/api/projects/${encodeURIComponent(id)}/chapter`, {
    method: "POST",
    body: JSON.stringify({
      chapterNo: 1,
      title: "测试章节",
      brief: "覆盖章节时应该先自动快照。",
      content: "门外的雨停了。\n\n林岚第二次把钥匙压在掌心，确认自己没有听错。"
    })
  });
  if (overwrittenChapter.safetySnapshot?.reason !== "before_chapter_write") {
    throw new Error("覆盖章节前未自动创建安全快照");
  }
  const readinessBeforeQuality = await api(`/api/projects/${encodeURIComponent(id)}/readiness`);
  if (!readinessBeforeQuality.report?.items?.some((item) => item.key === "snapshot" && item.status === "ok")) {
    throw new Error("路径检查未识别自动安全快照");
  }
  const dashboard = await api(`/api/projects/${encodeURIComponent(id)}/dashboard`);
  if (!dashboard.dashboard?.metrics || dashboard.dashboard.metrics.chapters < 1 || !dashboard.dashboard.firstChapterStarter?.brief) {
    throw new Error("项目仪表盘未返回章节进度或第一章启动卡");
  }

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
  const finalPublishCheck = await api(`/api/projects/${encodeURIComponent(id)}/publish-final-check`, {
    method: "POST",
    body: JSON.stringify({ platform: "通用" })
  });
  const proseQuality = await api(`/api/projects/${encodeURIComponent(id)}/prose-quality`, {
    method: "POST",
    body: JSON.stringify({ file: "01_正文/第001章_测试章节.md" })
  });
  const writingQualityLoop = await api(`/api/projects/${encodeURIComponent(id)}/writing-quality-loop`, {
    method: "POST",
    body: JSON.stringify({ file: "01_正文/第001章_测试章节.md" })
  });
  if (!writingQualityLoop.scores?.styleAlignment || !writingQualityLoop.reportFile?.includes("写作质检闭环")) {
    throw new Error("写作质检闭环未返回文风贴合评分或报告");
  }
  const releaseBackup = await api(`/api/projects/${encodeURIComponent(id)}/release-backup`, {
    method: "POST",
    body: JSON.stringify({})
  });
  const releasePackage = await api(`/api/projects/${encodeURIComponent(id)}/release-package`, {
    method: "POST",
    body: JSON.stringify({ platform: "通用", from: 1, to: 1 })
  });
  const releaseNotes = await api(`/api/projects/${encodeURIComponent(id)}/release-notes`, {
    method: "POST",
    body: JSON.stringify({})
  });
  const memorySchemaCheck = await api(`/api/projects/${encodeURIComponent(id)}/memory-schema-check`);
  const diagnosticsReport = await api(`/api/projects/${encodeURIComponent(id)}/diagnostics-report`, {
    method: "POST",
    body: JSON.stringify({})
  });
  const portableExport = await api(`/api/projects/${encodeURIComponent(id)}/portable-export`, {
    method: "POST",
    body: JSON.stringify({})
  });
  const memoryRepair = await api(`/api/projects/${encodeURIComponent(id)}/memory-repair`, {
    method: "POST",
    body: JSON.stringify({})
  });
  const integrityCheck = await api(`/api/projects/${encodeURIComponent(id)}/integrity-check`, {
    method: "POST",
    body: JSON.stringify({})
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
  const styleProfile = await api(`/api/projects/${encodeURIComponent(id)}/style-profile`, {
    method: "POST",
    body: JSON.stringify({
      sample: "雨停以后，巷子反而更暗。林岚没急着说话，只把钥匙在指间转了一圈。门里的人笑得很轻，像怕惊醒什么。她忽然觉得，今晚不能再问第二遍。",
      note: "回归测试文风样本"
    })
  });
  const projectDir = path.join(process.env.PROJECTS_DIR, id);
  await fs.writeFile(path.join(projectDir, "04_连续性", "character_state.json"), JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    characters: [
      { id: "lin-lan", name: "林岚", goal: "查清门后的笑声", emotionalState: "警惕但强装镇定", currentLocation: "旧屋门口", secrets: ["钥匙来自母亲"] },
      { id: "lin-lan-copy", name: "林岚", goal: "重复记录，用于冲突修复测试", emotionalState: "重复状态", currentLocation: "旧屋门口" },
      { id: "red-herring", name: "假线索人物", goal: "用钥匙和门后笑声误导林岚", emotionalState: "刻意制造噪音", currentLocation: "旧屋门口" },
      { id: "neighbor", name: "邻居", goal: "避开旧屋", emotionalState: "恐惧", currentLocation: "楼下" }
    ]
  }, null, 2), "utf8");
  await fs.writeFile(path.join(projectDir, "04_连续性", "plot_threads.json"), JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    threads: [
      { id: "door-laugh", thread: "门后的笑声", status: "open", related: ["林岚", "钥匙", "旧屋"], next: "确认门内是谁" },
      { id: "rain-case", thread: "雨夜旧案", status: "open", related: ["母亲", "旧案"], next: "寻找档案" }
    ]
  }, null, 2), "utf8");
  await fs.writeFile(path.join(projectDir, "04_连续性", "reader_promises.json"), JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    promises: [
      { id: "who-behind-door", promise: "门后的人是谁", status: "open", related: ["门后", "笑声", "林岚"], payoffPlan: "下一章给出误导性线索" }
    ]
  }, null, 2), "utf8");
  await fs.writeFile(path.join(projectDir, "04_连续性", "world_state.json"), JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    rules: [
      { id: "door-rule", rule: "不存在的门只会在雨停后出现", status: "active" }
    ]
  }, null, 2), "utf8");
  const storyBible = await api(`/api/projects/${encodeURIComponent(id)}/story-bible`);
  if (!storyBible.sections?.characters?.items?.some((item) => item.id === "lin-lan")) {
    throw new Error("故事圣经未读取人物状态");
  }
  const updatedBible = await api(`/api/projects/${encodeURIComponent(id)}/story-bible`, {
    method: "POST",
    body: JSON.stringify({
      section: "characters",
      item: {
        id: "lin-lan",
        name: "林岚",
        status: "主动试探",
        summary: "确认钥匙异常后不再等待别人解释",
        note: "故事圣经回归测试更新"
      }
    })
  });
  if (!updatedBible.sections?.characters?.items?.some((item) => item.id === "lin-lan" && item.summary.includes("钥匙异常"))) {
    throw new Error("故事圣经未更新人物条目");
  }
  const updatedWorldBible = await api(`/api/projects/${encodeURIComponent(id)}/story-bible`, {
    method: "POST",
    body: JSON.stringify({
      section: "worldRules",
      item: {
        id: "sound-rule",
        name: "笑声规则",
        status: "active",
        summary: "门后笑声只回应持钥匙的人"
      }
    })
  });
  if (!updatedWorldBible.sections?.worldRules?.items?.some((item) => item.id === "sound-rule")) {
    throw new Error("故事圣经未更新世界规则");
  }
  const conflictReview = await api(`/api/projects/${encodeURIComponent(id)}/conflicts`, { method: "POST", body: JSON.stringify({}) });
  const duplicateCharacterConflict = conflictReview.conflicts?.find((item) => item.type === "人物状态重复" && item.key === "林岚");
  if (!duplicateCharacterConflict) {
    throw new Error("记忆冲突看板未识别重复人物状态");
  }
  const repairPlan = await api(`/api/projects/${encodeURIComponent(id)}/conflicts/repair-plan`, {
    method: "POST",
    body: JSON.stringify({ conflict: duplicateCharacterConflict })
  });
  if (!repairPlan.plan?.actions?.some((item) => item.action === "dedupe-character-state" && item.key === "林岚")) {
    throw new Error("记忆冲突修复方案未包含人物状态去重动作");
  }
  const repairApplied = await api(`/api/projects/${encodeURIComponent(id)}/conflicts/apply`, {
    method: "POST",
    body: JSON.stringify({ conflict: duplicateCharacterConflict })
  });
  if (!repairApplied.applied || !repairApplied.reportFile) {
    throw new Error("记忆冲突修复未应用");
  }
  const repairedCharacterState = JSON.parse(await fs.readFile(path.join(projectDir, "04_连续性", "character_state.json"), "utf8"));
  if (repairedCharacterState.characters.filter((item) => item.name === "林岚").length !== 1) {
    throw new Error("记忆冲突修复后仍存在重复人物状态");
  }
  await fs.writeFile(path.join(projectDir, "04_连续性", "伏笔回收表.md"), [
    "# 伏笔回收表",
    "",
    "| id | 伏笔 | 状态 | 相关 | 回收计划 |",
    "| --- | --- | --- | --- | --- |",
    "| key-001 | 林岚的钥匙能打开旧屋里不存在的门 | 未回收 | 林岚、钥匙、门后 | 第 2 章让钥匙第一次失效 |"
  ].join("\n"), "utf8");
  const pinnedMemory = await api(`/api/projects/${encodeURIComponent(id)}/memory-pins`, {
    method: "POST",
    body: JSON.stringify({
      chapterNo: 2,
      title: "风格测试",
      item: {
        type: "foreshadows",
        id: "key-001",
        label: "林岚钥匙伏笔",
        text: "林岚的钥匙能打开旧屋里不存在的门，本章必须保留这个异常。"
      }
    })
  });
  if (!pinnedMemory.pins?.some((item) => item.id === "key-001" && item.type === "foreshadows")) {
    throw new Error("记忆钉选接口未保存本章必读记忆");
  }
  const excludedMemory = await api(`/api/projects/${encodeURIComponent(id)}/memory-exclusions`, {
    method: "POST",
    body: JSON.stringify({
      chapterNo: 2,
      title: "风格测试",
      item: {
        type: "characters",
        id: "red-herring",
        label: "假线索人物",
        text: "假线索人物会用钥匙和门后笑声误导林岚，本章不要召回。"
      }
    })
  });
  if (!excludedMemory.exclusions?.some((item) => item.id === "red-herring" && item.type === "characters")) {
    throw new Error("记忆排除接口未保存本章禁用记忆");
  }
  const codexTask = await api(`/api/projects/${encodeURIComponent(id)}/codex`, {
    method: "POST",
    body: JSON.stringify({ task: "请根据当前项目风格写一段测试任务单。", chapterNo: 2, title: "风格测试", brief: "林岚拿着钥匙靠近门后笑声，需要召回文风模仿档案、人物状态、伏笔和读者承诺。" })
  });
  const recallPreview = await api(`/api/projects/${encodeURIComponent(id)}/memory-recall`, {
    method: "POST",
    body: JSON.stringify({ chapterNo: 2, title: "风格测试", brief: "林岚拿着钥匙靠近门后笑声。" })
  });
  const search = await api(`/api/projects/${encodeURIComponent(id)}/search?q=${encodeURIComponent("钥匙")}`);
  const taskIndexPath = path.join(projectDir, "09_运行时", "tasks.json");
  const seededTaskIndex = JSON.parse(await fs.readFile(taskIndexPath, "utf8"));
  const failedTask = {
    id: "quality:failed-regression",
    source: "task-index",
    kind: "quality",
    status: "failed",
    title: "失败质检回归任务",
    detail: "回归测试失败任务",
    files: [quality.reportFile],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  seededTaskIndex.tasks = [failedTask, ...(seededTaskIndex.tasks || []).filter((item) => item.id !== failedTask.id)];
  await fs.writeFile(taskIndexPath, JSON.stringify(seededTaskIndex, null, 2) + "\n", "utf8");
  const tasks = await api(`/api/projects/${encodeURIComponent(id)}/tasks`);
  const failedQualityTasks = await api(`/api/projects/${encodeURIComponent(id)}/tasks?kind=quality&status=failed`);
  const failedTaskDetail = await api(`/api/projects/${encodeURIComponent(id)}/tasks/${encodeURIComponent(failedTask.id)}`);
  const retriedTask = await api(`/api/projects/${encodeURIComponent(id)}/tasks/${encodeURIComponent(failedTask.id)}/retry`, {
    method: "POST",
    body: JSON.stringify({})
  });
  const radar = await api(`/api/projects/${encodeURIComponent(id)}/narrative-radar`);

  const requiredFiles = [
    quality.reportFile,
    revisionTask.taskFile,
    materials.file,
    finalPublishCheck.reportFile,
    proseQuality.reportFile,
    releaseBackup.manifestFile,
    releasePackage.manifestFile,
    releaseNotes.file,
    diagnosticsReport.reportFile,
    portableExport.manifestFile,
    memoryRepair.reportFile,
    integrityCheck.reportFile,
    batch.file,
    exported.file,
    conflicts.reportFile,
    styleProfile.profileFile,
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
  const taskIndex = JSON.parse(await fs.readFile(taskIndexPath, "utf8"));
  if (!Array.isArray(taskIndex.tasks) || taskIndex.tasks.length < 4) {
    throw new Error("统一任务索引未记录核心任务");
  }
  if (!failedQualityTasks.tasks?.some((item) => item.id === failedTask.id)) {
    throw new Error("任务中心筛选未返回失败质检任务");
  }
  if (failedTaskDetail.task?.id !== failedTask.id || !failedTaskDetail.preview?.files?.length) {
    throw new Error("任务详情接口未返回任务详情和产物预览");
  }
  if (retriedTask.task?.status !== "completed" || retriedTask.task?.retriedFrom !== failedTask.id) {
    throw new Error("失败任务一键重试未生成完成记录");
  }
  if (!tasks.tasks?.some((item) => item.source === "task-index" && item.kind === "quality")) {
    throw new Error("任务中心未优先返回统一任务索引记录");
  }
  if (!finalPublishCheck.checks?.some((item) => item.key === "chapter-continuity") || !releasePackage.files?.some((file) => file.endsWith(".txt")) || !releasePackage.files?.some((file) => file.endsWith(".md"))) {
    throw new Error("发布准备版未生成总检查或发布包清单");
  }
  if (!releaseBackup.filesCopied || !releaseBackup.manifestFile?.includes("完整备份包")) {
    throw new Error("项目完整备份包未生成");
  }
  if (!Array.isArray(memorySchemaCheck.files) || !memorySchemaCheck.files.some((item) => item.file === "04_连续性/character_state.json")) {
    throw new Error("长期记忆 JSON schema 校验未返回核心文件");
  }
  if (!diagnosticsReport.reportFile?.includes("故障诊断报告")) {
    throw new Error("故障诊断报告未生成");
  }
  if (!proseQuality.analysis?.scores?.hookScore || !proseQuality.analysis?.scores?.voiceConsistency) {
    throw new Error("文稿质量增强未返回钩子和口吻评分");
  }
  if (!portableExport.manifestFile?.includes("迁移清单") || !Array.isArray(memoryRepair.repaired) || !integrityCheck.reportFile?.includes("项目损坏诊断")) {
    throw new Error("项目安全与迁移功能未返回预期产物");
  }
  const styleMemory = JSON.parse(await fs.readFile(path.join(projectDir, "04_连续性", "style_memory.json"), "utf8"));
  if (!styleMemory.imitationProfile?.rhythm || !styleMemory.imitationProfile?.guardrails?.length) {
    throw new Error("文风模仿档案未写入风格记忆");
  }
  const runtimeContext = JSON.parse(await fs.readFile(path.join(projectDir, ...codexTask.runtime.runtimeDir.split("/"), "context.json"), "utf8"));
  if (!runtimeContext.recalledMemory?.styleImitation?.profileFile || !runtimeContext.recalledMemory?.relevant?.length) {
    throw new Error("运行时上下文未召回文风模仿和长期记忆");
  }
  if (!runtimeContext.recalledMemory?.pinned?.some((item) => item.id === "key-001" && item.text.includes("不存在的门"))) {
    throw new Error("运行时上下文未带入本章手动钉选记忆");
  }
  if (!runtimeContext.recalledMemory?.excluded?.some((item) => item.id === "red-herring")) {
    throw new Error("运行时上下文未记录本章手动排除记忆");
  }
  const ranked = runtimeContext.recalledMemory?.ranked || {};
  if (ranked.characters?.some((item) => item.id === "red-herring" || item.name === "假线索人物")) {
    throw new Error("运行时上下文仍召回了本章手动排除的人物记忆");
  }
  if (ranked.characters?.[0]?.name !== "林岚") {
    throw new Error("长期记忆未优先召回相关人物状态");
  }
  if (!ranked.foreshadows?.[0]?.text?.includes("钥匙")) {
    throw new Error("长期记忆未优先召回相关伏笔");
  }
  if (!ranked.readerPromises?.[0]?.text?.includes("门后")) {
    throw new Error("长期记忆未优先召回读者承诺");
  }
  if (!ranked.plotThreads?.[0]?.text?.includes("门后的笑声")) {
    throw new Error("长期记忆未优先召回剧情线程");
  }
  if (recallPreview.recalledMemory?.ranked?.characters?.[0]?.name !== "林岚" || !recallPreview.recalledMemory?.ranked?.foreshadows?.[0]?.text?.includes("钥匙")) {
    throw new Error("召回调试接口未返回本章相关记忆");
  }
  if (!recallPreview.recalledMemory?.pinned?.some((item) => item.id === "key-001")) {
    throw new Error("召回调试接口未返回本章手动钉选记忆");
  }
  if (!recallPreview.recalledMemory?.excluded?.some((item) => item.id === "red-herring")) {
    throw new Error("召回调试接口未返回本章手动排除记忆");
  }
  if (recallPreview.recalledMemory?.ranked?.characters?.some((item) => item.id === "red-herring" || item.name === "假线索人物")) {
    throw new Error("召回调试接口仍返回了本章手动排除的人物记忆");
  }
  const stateSyncFile = path.join(projectDir, ...codexTask.runtime.runtimeDir.split("/"), "state-sync.md");
  await fs.writeFile(stateSyncFile, [
    "# state sync",
    "",
    "```json",
    JSON.stringify({
      chapterLog: {
        chapter: "第2章",
        event: "林岚确认钥匙异常",
        newInfo: "钥匙能触发不存在的门",
        characterChange: "林岚从警惕转向主动试探",
        nextHook: "门后笑声再次出现"
      },
      characterUpdates: [
        { id: "lin-lan", name: "林岚", emotionalState: "主动试探", currentLocation: "旧屋门口" }
      ],
      readerPromises: [
        { id: "key-door-payoff", promise: "钥匙为什么能打开不存在的门", status: "open" }
      ]
    }, null, 2),
    "```"
  ].join("\n"), "utf8");
  const syncReview = await api(`/api/projects/${encodeURIComponent(id)}/sync-review?runtimeDir=${encodeURIComponent(codexTask.runtime.runtimeDir)}`);
  const syncItemIds = syncReview.items
    .filter((item) => ["chapterLog", "character_state", "reader_promises"].includes(item.id))
    .flatMap((item) => item.entries.map((entry) => entry.id));
  const syncPreview = await api(`/api/projects/${encodeURIComponent(id)}/sync-review/preview`, {
    method: "POST",
    body: JSON.stringify({ runtimeDir: codexTask.runtime.runtimeDir, itemIds: syncItemIds })
  });
  if (!syncPreview.preview?.targets?.some((item) => item.target === "04_连续性/character_state.json" && item.operation === "merge-json")) {
    throw new Error("状态同步差异预览未显示人物状态 JSON 合并目标");
  }
  if (!syncPreview.preview?.targets?.some((item) => item.target === "04_连续性/章节日志.md" && item.operation === "append-markdown")) {
    throw new Error("状态同步差异预览未显示章节日志追加目标");
  }
  if (!syncPreview.preview?.targets?.every((item) => typeof item.beforeCount === "number" && typeof item.afterCount === "number")) {
    throw new Error("状态同步差异预览缺少写入前后数量");
  }
  if (!radar.scores?.publishReadiness || !Array.isArray(radar.issues)) {
    throw new Error("创作雷达未返回评分和问题列表");
  }

  console.log(JSON.stringify({ ok: true, project: id, checkedArtifacts: requiredFiles.length, searchHits: search.results.length, tasks: tasks.tasks.length, radarScore: radar.scores.publishReadiness }, null, 2));
} finally {
  await new Promise((resolve) => started.server.close(resolve));
  await fs.rm(tmpRoot, { recursive: true, force: true });
}
