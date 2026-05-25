const state = {
  projects: [],
  activeProject: null,
  files: [],
  chapters: [],
  activeFile: "",
  doctor: null,
  qualityReport: null,
  versions: [],
  tasks: [],
  taskSummary: null,
  taskDetail: null,
  taskAutoRefreshTimer: null,
  taskFilters: {
    kind: "all",
    status: "all"
  },
  searchResults: [],
  narrativeRadar: null,
  memoryRecallResult: null,
  memoryRecallCandidates: {},
  storyBible: null,
  workflowResult: null,
  archiveAssistants: [],
  activeSyncReviewIndex: 0,
  activeSyncReview: null,
  activeSyncPreview: null,
  snapshots: [],
  activeToolGroup: "write",
  activeToolPanel: "chapter-board",
  autosaveTimer: null,
  lastAutosaveKey: "",
  layout: {
    leftCollapsed: false,
    rightCollapsed: false,
    newProjectCollapsed: false,
    moreToolsOpen: false
  }
};

const el = {
  appShell: document.querySelector(".app-shell"),
  refreshProjects: document.querySelector("#refreshProjects"),
  projectName: document.querySelector("#projectName"),
  projectGenre: document.querySelector("#projectGenre"),
  projectPremise: document.querySelector("#projectPremise"),
  projectAssistant: document.querySelector("#projectAssistant"),
  toggleNewProject: document.querySelector("#toggleNewProject"),
  newProjectBody: document.querySelector("#newProjectBody"),
  createProject: document.querySelector("#createProject"),
  createDemoProject: document.querySelector("#createDemoProject"),
  projectList: document.querySelector("#projectList"),
  activeProjectName: document.querySelector("#activeProjectName"),
  projectMeta: document.querySelector("#projectMeta"),
  toolboxTabs: document.querySelector("#toolboxTabs"),
  toggleMoreTools: document.querySelector("#toggleMoreTools"),
  moreToolMenu: document.querySelector("#moreToolMenu"),
  toggleLeftPane: document.querySelector("#toggleLeftPane"),
  toggleRightPane: document.querySelector("#toggleRightPane"),
  toggleAiConfig: document.querySelector("#toggleAiConfig"),
  topAiConfig: document.querySelector("#topAiConfig"),
  codexConfig: document.querySelector("#codexConfig"),
  openProjectFolder: document.querySelector("#openProjectFolder"),
  copyProjectPath: document.querySelector("#copyProjectPath"),
  saveAiSettings: document.querySelector("#saveAiSettings"),
  archiveAssistantSelect: document.querySelector("#archiveAssistantSelect"),
  archiveAssistantHint: document.querySelector("#archiveAssistantHint"),
  saveArchiveAssistant: document.querySelector("#saveArchiveAssistant"),
  openArchiveAssistant: document.querySelector("#openArchiveAssistant"),
  storyBibleSection: document.querySelector("#storyBibleSection"),
  storyBibleId: document.querySelector("#storyBibleId"),
  storyBibleName: document.querySelector("#storyBibleName"),
  storyBibleStatus: document.querySelector("#storyBibleStatus"),
  storyBibleSummary: document.querySelector("#storyBibleSummary"),
  saveStoryBibleEntry: document.querySelector("#saveStoryBibleEntry"),
  refreshStoryBible: document.querySelector("#refreshStoryBible"),
  storyBiblePanel: document.querySelector("#storyBiblePanel"),
  exportTxt: document.querySelector("#exportTxt"),
  exportMd: document.querySelector("#exportMd"),
  chapterNo: document.querySelector("#chapterNo"),
  chapterTitle: document.querySelector("#chapterTitle"),
  fileSelect: document.querySelector("#fileSelect"),
  chapterBrief: document.querySelector("#chapterBrief"),
  draft: document.querySelector("#draft"),
  modelName: document.querySelector("#modelName"),
  endpoint: document.querySelector("#endpoint"),
  ideaInput: document.querySelector("#ideaInput"),
  incubateIdea: document.querySelector("#incubateIdea"),
  knowledgeFiles: document.querySelector("#knowledgeFiles"),
  knowledgeNote: document.querySelector("#knowledgeNote"),
  absorbKnowledge: document.querySelector("#absorbKnowledge"),
  styleSample: document.querySelector("#styleSample"),
  styleNote: document.querySelector("#styleNote"),
  analyzeStyleProfile: document.querySelector("#analyzeStyleProfile"),
  styleProfilePanel: document.querySelector("#styleProfilePanel"),
  previewMemoryRecall: document.querySelector("#previewMemoryRecall"),
  memoryRecallPanel: document.querySelector("#memoryRecallPanel"),
  runPipeline: document.querySelector("#runPipeline"),
  pipelineRunner: document.querySelector("#pipelineRunner"),
  saveChapter: document.querySelector("#saveChapter"),
  saveChapterPlan: document.querySelector("#saveChapterPlan"),
  compareLatestVersion: document.querySelector("#compareLatestVersion"),
  autosaveStatus: document.querySelector("#autosaveStatus"),
  globalSearchInput: document.querySelector("#globalSearchInput"),
  runGlobalSearch: document.querySelector("#runGlobalSearch"),
  globalSearchResults: document.querySelector("#globalSearchResults"),
  refreshTaskCenter: document.querySelector("#refreshTaskCenter"),
  taskKindFilter: document.querySelector("#taskKindFilter"),
  taskStatusFilter: document.querySelector("#taskStatusFilter"),
  taskAutoRefresh: document.querySelector("#taskAutoRefresh"),
  taskCenterPanel: document.querySelector("#taskCenterPanel"),
  taskDetailPanel: document.querySelector("#taskDetailPanel"),
  runNarrativeRadar: document.querySelector("#runNarrativeRadar"),
  narrativeRadarPanel: document.querySelector("#narrativeRadarPanel"),
  projectStats: document.querySelector("#projectStats"),
  chapterBoard: document.querySelector("#chapterBoard"),
  snapshotNote: document.querySelector("#snapshotNote"),
  createSnapshot: document.querySelector("#createSnapshot"),
  snapshotPanel: document.querySelector("#snapshotPanel"),
  qualityScope: document.querySelector("#qualityScope"),
  runQualityCheck: document.querySelector("#runQualityCheck"),
  runAiQualityCheck: document.querySelector("#runAiQualityCheck"),
  runProseQualityReview: document.querySelector("#runProseQualityReview"),
  qualityPanel: document.querySelector("#qualityPanel"),
  revisionNote: document.querySelector("#revisionNote"),
  createRevisionTask: document.querySelector("#createRevisionTask"),
  runRevisionTask: document.querySelector("#runRevisionTask"),
  batchFrom: document.querySelector("#batchFrom"),
  batchTo: document.querySelector("#batchTo"),
  runBatchQuality: document.querySelector("#runBatchQuality"),
  analyzeConflicts: document.querySelector("#analyzeConflicts"),
  publishPlatform: document.querySelector("#publishPlatform"),
  generatePublishMaterials: document.querySelector("#generatePublishMaterials"),
  runFinalPublishCheck: document.querySelector("#runFinalPublishCheck"),
  createReleaseBackup: document.querySelector("#createReleaseBackup"),
  generateReleasePackage: document.querySelector("#generateReleasePackage"),
  generateReleaseNotes: document.querySelector("#generateReleaseNotes"),
  saveModelPreset: document.querySelector("#saveModelPreset"),
  cloneProject: document.querySelector("#cloneProject"),
  exportPortableProject: document.querySelector("#exportPortableProject"),
  repairMemoryJson: document.querySelector("#repairMemoryJson"),
  runProjectIntegrityCheck: document.querySelector("#runProjectIntegrityCheck"),
  workflowPanel: document.querySelector("#workflowPanel"),
  maintenancePanel: document.querySelector("#maintenancePanel"),
  refreshVersions: document.querySelector("#refreshVersions"),
  versionPanel: document.querySelector("#versionPanel"),
  doctorPanel: document.querySelector("#doctorPanel"),
  runDoctor: document.querySelector("#runDoctor"),
  diagnosticsPanel: document.querySelector("#diagnosticsPanel"),
  runMemorySchemaCheck: document.querySelector("#runMemorySchemaCheck"),
  generateDiagnosticsReport: document.querySelector("#generateDiagnosticsReport"),
  pipelineFlow: document.querySelector("#pipelineFlow"),
  runDetailPanel: document.querySelector("#runDetailPanel"),
  syncReviewPanel: document.querySelector("#syncReviewPanel"),
  status: document.querySelector("#status"),
  contextFiles: document.querySelector("#contextFiles"),
  fileBrowser: document.querySelector("#fileBrowser")
};

const RUN_DETAIL_TABS = [
  ["intent", "意图", "intent.md"],
  ["context", "上下文", "context.json"],
  ["rules", "规则栈", "rule-stack.yaml"],
  ["plan", "规划", "plan.md"],
  ["orchestration", "编排", "orchestration.md"],
  ["draft", "草稿", "draft.md"],
  ["audit", "审计", "audit.md"],
  ["revision", "修订", "revision.md"],
  ["stateSync", "同步", "state-sync.md"],
  ["trace", "Trace", "trace.json"]
];

const FLOW_STAGE_DETAIL_TABS = {
  compile_intent: "intent",
  compile_context: "context",
  compile_rule_stack: "rules",
  plan: "plan",
  orchestrate: "orchestration",
  write: "draft",
  audit: "audit",
  revise: "revision",
  state_sync: "stateSync"
};

function setStatus(message, type = "") {
  el.status.textContent = message;
  el.status.className = `status ${type}`.trim();
}

function updateAiModeVisibility() {
  const mode = el.pipelineRunner?.value || "codex";
  for (const node of document.querySelectorAll("[data-ai-mode]")) {
    const shouldHide = node.dataset.aiMode !== mode;
    node.hidden = shouldHide;
    node.classList.toggle("is-hidden", shouldHide);
  }
  if (state.doctor) renderDoctor(state.doctor);
}

function normalizeToolboxGroup(group = "write") {
  const available = new Set(["write", "project", "quality", "revision", "publish", "system"]);
  return available.has(group) ? group : "write";
}

function loadLayoutState() {
  try {
    const saved = JSON.parse(localStorage.getItem("novelStudioLayout") || "{}");
    state.layout.leftCollapsed = Boolean(saved.leftCollapsed);
    state.layout.rightCollapsed = Boolean(saved.rightCollapsed);
    state.layout.newProjectCollapsed = Boolean(saved.newProjectCollapsed);
    state.layout.moreToolsOpen = Boolean(saved.moreToolsOpen);
    state.activeToolGroup = normalizeToolboxGroup(saved.activeToolGroup || "write");
    state.activeToolPanel = saved.activeToolPanel || "chapter-board";
  } catch {
    state.layout.leftCollapsed = false;
    state.layout.rightCollapsed = false;
    state.layout.newProjectCollapsed = false;
    state.layout.moreToolsOpen = false;
    state.activeToolGroup = "write";
    state.activeToolPanel = "chapter-board";
  }
}

function saveLayoutState() {
  localStorage.setItem("novelStudioLayout", JSON.stringify({
    leftCollapsed: state.layout.leftCollapsed,
    rightCollapsed: state.layout.rightCollapsed,
    newProjectCollapsed: state.layout.newProjectCollapsed,
    moreToolsOpen: state.layout.moreToolsOpen,
    activeToolGroup: state.activeToolGroup,
    activeToolPanel: state.activeToolPanel
  }));
}

function renderLayoutState() {
  el.appShell?.classList.toggle("left-collapsed", state.layout.leftCollapsed);
  el.appShell?.classList.toggle("right-collapsed", state.layout.rightCollapsed);
  el.appShell?.classList.toggle("new-project-collapsed", state.layout.newProjectCollapsed);
  if (el.toggleLeftPane) {
    el.toggleLeftPane.setAttribute("aria-pressed", String(state.layout.leftCollapsed));
    el.toggleLeftPane.textContent = state.layout.leftCollapsed ? "显示项目栏" : "隐藏项目栏";
    el.toggleLeftPane.title = state.layout.leftCollapsed ? "显示项目栏" : "隐藏项目栏";
    el.toggleLeftPane.setAttribute("aria-label", state.layout.leftCollapsed ? "显示项目栏" : "隐藏项目栏");
  }
  if (el.toggleRightPane) {
    el.toggleRightPane.setAttribute("aria-pressed", String(state.layout.rightCollapsed));
    el.toggleRightPane.textContent = state.layout.rightCollapsed ? "显示工具栏" : "隐藏工具栏";
    el.toggleRightPane.title = state.layout.rightCollapsed ? "显示工具栏" : "隐藏工具栏";
    el.toggleRightPane.setAttribute("aria-label", state.layout.rightCollapsed ? "显示工具栏" : "隐藏工具栏");
  }
  if (el.newProjectBody) {
    el.newProjectBody.hidden = state.layout.newProjectCollapsed;
  }
  if (el.toggleNewProject) {
    el.toggleNewProject.setAttribute("aria-expanded", String(!state.layout.newProjectCollapsed));
    const stateText = el.toggleNewProject.querySelector("em");
    if (stateText) stateText.textContent = state.layout.newProjectCollapsed ? "展开" : "收起";
  }
  if (el.moreToolMenu) {
    el.moreToolMenu.hidden = !state.layout.moreToolsOpen;
  }
  if (el.toggleMoreTools) {
    const isSecondaryGroup = state.activeToolGroup !== "write";
    el.toggleMoreTools.setAttribute("aria-expanded", String(state.layout.moreToolsOpen));
    el.toggleMoreTools.classList.toggle("active", isSecondaryGroup || state.layout.moreToolsOpen);
  }
}

function togglePane(side, force) {
  const key = side === "left" ? "leftCollapsed" : "rightCollapsed";
  state.layout[key] = typeof force === "boolean" ? force : !state.layout[key];
  renderLayoutState();
  saveLayoutState();
}

function toggleNewProjectPanel(force) {
  state.layout.newProjectCollapsed = typeof force === "boolean" ? force : !state.layout.newProjectCollapsed;
  renderLayoutState();
  saveLayoutState();
}

function toggleAiConfig(force) {
  if (!el.topAiConfig || !el.toggleAiConfig) return;
  const shouldOpen = typeof force === "boolean" ? force : el.topAiConfig.hidden;
  el.topAiConfig.hidden = !shouldOpen;
  el.toggleAiConfig.setAttribute("aria-expanded", String(shouldOpen));
  el.toggleAiConfig.classList.toggle("active", shouldOpen);
}

function toggleMoreTools(force) {
  state.layout.moreToolsOpen = typeof force === "boolean" ? force : !state.layout.moreToolsOpen;
  renderLayoutState();
  saveLayoutState();
}

function initializeToolPanels() {
  for (const panel of document.querySelectorAll("[data-tool-panel]")) {
    const heading = panel.querySelector("h2");
    if (!heading || panel.querySelector(".tool-panel-toggle")) continue;
    const title = heading.textContent.trim();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tool-panel-toggle";
    button.dataset.toolPanelToggle = panel.dataset.toolPanel;
    button.innerHTML = `<span>${escapeHtml(title)}</span><em>展开</em>`;
    button.addEventListener("click", () => setActiveToolPanel(panel.dataset.toolPanel));
    heading.replaceWith(button);
  }
}

function visibleToolPanels(group = state.activeToolGroup) {
  const normalizedGroup = normalizeToolboxGroup(group);
  return [...document.querySelectorAll("[data-tool-panel]")].filter((panel) => {
    const groups = String(panel.dataset.toolGroup || "").split(/\s+/).filter(Boolean);
    return groups.includes(normalizedGroup);
  });
}

function setActiveToolPanel(panelId) {
  const visiblePanels = visibleToolPanels();
  const fallback = visiblePanels[0]?.dataset.toolPanel || "";
  state.activeToolPanel = visiblePanels.some((panel) => panel.dataset.toolPanel === panelId)
    ? panelId
    : fallback;
  for (const panel of document.querySelectorAll("[data-tool-panel]")) {
    const isActive = panel.dataset.toolPanel === state.activeToolPanel;
    panel.classList.toggle("tool-panel-active", isActive);
    panel.classList.toggle("tool-panel-collapsed", !isActive);
    const toggle = panel.querySelector(".tool-panel-toggle");
    if (toggle) {
      toggle.classList.toggle("active", isActive);
      toggle.setAttribute("aria-expanded", String(isActive));
      const stateText = toggle.querySelector("em");
      if (stateText) stateText.textContent = isActive ? "收起" : "展开";
    }
  }
  saveLayoutState();
}

function setToolboxGroup(group = "write") {
  state.activeToolGroup = normalizeToolboxGroup(group);
  for (const button of el.toolboxTabs?.querySelectorAll("[data-toolbox-group]") || []) {
    button.classList.toggle("active", button.dataset.toolboxGroup === state.activeToolGroup);
  }
  for (const panel of document.querySelectorAll("[data-tool-group]")) {
    const groups = String(panel.dataset.toolGroup || "").split(/\s+/).filter(Boolean);
    const visible = groups.includes(state.activeToolGroup);
    panel.hidden = !visible;
    panel.classList.toggle("is-hidden", !visible);
  }
  const activePanelVisible = visibleToolPanels(state.activeToolGroup).some((panel) => panel.dataset.toolPanel === state.activeToolPanel);
  if (!activePanelVisible) {
    state.activeToolPanel = visibleToolPanels(state.activeToolGroup)[0]?.dataset.toolPanel || "";
  }
  if (state.activeToolGroup !== "write") state.layout.moreToolsOpen = false;
  setActiveToolPanel(state.activeToolPanel);
  renderLayoutState();
  saveLayoutState();
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `请求失败：${res.status}`);
  return data;
}

async function readProjectFileContent(file) {
  if (!state.activeProject) throw new Error("请先选择项目。");
  const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/file?path=${encodeURIComponent(file)}`);
  return data.content || "";
}

function setAutosaveStatus(message, type = "") {
  if (!el.autosaveStatus) return;
  el.autosaveStatus.textContent = message;
  el.autosaveStatus.className = `autosave-status ${type}`.trim();
}

function autosaveKey() {
  return [
    state.activeProject?.id || "",
    state.activeFile || "",
    el.chapterNo?.value || "",
    el.chapterTitle?.value || "",
    el.chapterBrief?.value || "",
    el.draft?.value || ""
  ].join("\n---\n");
}

function scheduleAutosave() {
  if (state.autosaveTimer) window.clearTimeout(state.autosaveTimer);
  if (!state.activeProject || (!el.draft?.value.trim() && !el.chapterBrief?.value.trim())) {
    setAutosaveStatus("自动保存待机");
    return;
  }
  setAutosaveStatus("自动保存等待中");
  state.autosaveTimer = window.setTimeout(performAutosave, 1800);
}

async function performAutosave() {
  if (!state.activeProject) return;
  const key = autosaveKey();
  if (key === state.lastAutosaveKey) {
    setAutosaveStatus("自动保存无变更");
    return;
  }
  const content = [
    "# 当前编辑草稿自动保存",
    "",
    `- 项目：${state.activeProject.name || state.activeProject.id}`,
    `- 正文文件：${state.activeFile || "未绑定章节文件"}`,
    `- 章节号：${el.chapterNo?.value || ""}`,
    `- 标题：${el.chapterTitle?.value || ""}`,
    `- 保存时间：${new Date().toLocaleString()}`,
    "",
    "## Brief",
    "",
    el.chapterBrief?.value || "",
    "",
    "## Draft",
    "",
    el.draft?.value || ""
  ].join("\n");
  try {
    setAutosaveStatus("自动保存中");
    await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/file`, {
      method: "POST",
      body: JSON.stringify({ file: "09_运行时/autosave/current-draft.md", content })
    });
    state.lastAutosaveKey = key;
    setAutosaveStatus("已自动保存", "ok");
  } catch (error) {
    setAutosaveStatus(`自动保存失败：${error.message}`, "error");
  }
}

function renderProjects() {
  if (!state.projects.length) {
    el.projectList.textContent = "暂无项目";
    el.projectList.classList.add("muted");
    return;
  }
  el.projectList.classList.remove("muted");
  el.projectList.innerHTML = "";
  for (const project of state.projects) {
    const button = document.createElement("button");
    button.className = `project-item ${state.activeProject?.id === project.id ? "active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.genre || "未填写类型")}</span>`;
    button.addEventListener("click", () => loadProject(project.id));
    el.projectList.appendChild(button);
  }
}

function renderFiles() {
  el.fileSelect.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "新章节";
  el.fileSelect.appendChild(empty);
  for (const file of state.files) {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file;
    el.fileSelect.appendChild(option);
  }
  el.fileSelect.value = state.activeFile || "";
  renderFileBrowser();

  const extraFiles = state.files.filter((file) => !file.startsWith("01_正文/"));
  el.contextFiles.innerHTML = "";
  for (const file of extraFiles) {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${escapeAttr(file)}" /> <span>${escapeHtml(file)}</span>`;
    el.contextFiles.appendChild(label);
  }
}

function renderProjectMeta() {
  if (!state.activeProject) {
    el.projectMeta.textContent = "选择或创建项目后开始写作";
    return;
  }
  const chapterCount = state.files.filter((file) => file.startsWith("01_正文/")).length;
  const codexCount = state.files.filter((file) => file.startsWith("07_Codex/")).length;
  const runner = state.activeProject.runner === "model" ? "本地模型接口" : "Codex 直连";
  const assistant = state.activeProject.archiveAssistantName || "未设置助手";
  el.projectMeta.textContent = `${state.activeProject.id} · ${runner} · ${assistant} · ${state.files.length} 个文件 · ${chapterCount} 章正文 · ${codexCount} 个 Codex 产物`;
}

function fileKind(file) {
  if (file.startsWith("00_总控/")) return "总控";
  if (file.startsWith("01_正文/")) return "正文";
  if (file.startsWith("02_人物/")) return "人物";
  if (file.startsWith("03_设定/")) return "设定";
  if (file.startsWith("04_连续性/")) return "连续性";
  if (file.startsWith("05_提示词/")) return "提示词";
  if (file.startsWith("06_发布/")) return "发布";
  if (file.startsWith("07_Codex/")) return "Codex";
  if (file.startsWith("08_资料投喂/")) return "资料";
  if (file.startsWith("09_运行时/")) return "运行时";
  return "文件";
}

function renderFileBrowser() {
  if (!state.files.length) {
    el.fileBrowser.textContent = "暂无文件";
    el.fileBrowser.classList.add("muted");
    return;
  }
  el.fileBrowser.classList.remove("muted");
  el.fileBrowser.innerHTML = "";
  for (const file of state.files) {
    const button = document.createElement("button");
    button.className = `file-row ${state.activeFile === file ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `<span>${escapeHtml(fileKind(file))}</span><strong>${escapeHtml(file)}</strong>`;
    button.addEventListener("click", async () => {
      state.activeFile = file;
      el.fileSelect.value = file;
      await loadSelectedFile();
      renderFileBrowser();
    });
    el.fileBrowser.appendChild(button);
  }
}

function renderGlobalSearchResults() {
  if (!el.globalSearchResults) return;
  if (!state.activeProject) {
    el.globalSearchResults.textContent = "选择项目后可搜索全项目文件";
    el.globalSearchResults.classList.add("muted");
    return;
  }
  const results = state.searchResults || [];
  if (!results.length) {
    el.globalSearchResults.textContent = "暂无搜索结果";
    el.globalSearchResults.classList.add("muted");
    return;
  }
  el.globalSearchResults.classList.remove("muted");
  el.globalSearchResults.innerHTML = "";
  for (const item of results) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-row";
    button.innerHTML = `
      <span>${escapeHtml(item.kind || "文件")} · 第 ${escapeHtml(item.line || 1)} 行</span>
      <strong>${escapeHtml(item.file)}</strong>
      <em>${escapeHtml(item.preview || "")}</em>
    `;
    button.addEventListener("click", () => openFileByPath(item.file));
    el.globalSearchResults.appendChild(button);
  }
}

async function runGlobalSearch() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const query = el.globalSearchInput?.value.trim() || "";
  if (!query) return setStatus("请输入搜索关键词。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/search?q=${encodeURIComponent(query)}`);
    state.searchResults = data.results || [];
    renderGlobalSearchResults();
    setStatus(`搜索完成：${state.searchResults.length} 条命中。`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function taskStatusLabel(status) {
  return {
    completed: "完成",
    success: "完成",
    ready: "可处理",
    running: "运行中",
    failed: "失败",
    cancelled: "已取消",
    needs_review: "需复核",
    pending_review: "待审核",
    pending: "等待中"
  }[status] || status || "未知";
}

function taskKindLabel(kind) {
  return {
    codex: "Codex 运行",
    "sync-review": "状态同步",
    revision: "修订任务",
    pipeline: "多阶段流水线",
    idea: "创意孵化",
    knowledge: "资料投喂",
    style: "文风模仿",
    quality: "质检任务",
    publish: "发布资料",
    conflict: "记忆冲突",
    maintenance: "项目维护",
    export: "导出任务"
  }[kind] || kind || "任务";
}

function filteredTasks() {
  const kind = el.taskKindFilter?.value || state.taskFilters.kind || "all";
  const status = el.taskStatusFilter?.value || state.taskFilters.status || "all";
  return (state.tasks || []).filter((task) => {
    const kindOk = kind === "all" || task.kind === kind;
    const statusOk = status === "all" || task.status === status;
    return kindOk && statusOk;
  });
}

function renderTaskCenter() {
  if (!el.taskCenterPanel) return;
  if (!state.activeProject) {
    el.taskCenterPanel.textContent = "选择项目后显示 Codex 运行历史、流水线、修订和质检任务";
    el.taskCenterPanel.classList.add("muted");
    return;
  }
  const tasks = filteredTasks();
  if (!tasks.length) {
    el.taskCenterPanel.textContent = "暂无匹配任务。可以调整类型/状态筛选，或运行流水线、修订、质检后再刷新。";
    el.taskCenterPanel.classList.add("muted");
    return;
  }
  el.taskCenterPanel.classList.remove("muted");
  el.taskCenterPanel.innerHTML = "";
  for (const task of tasks) {
    const row = document.createElement("div");
    row.className = `task-row ${task.status || "unknown"}`;
    const file = (task.files || []).find((item) => state.files.includes(item));
    const time = task.finishedAt || task.startedAt || "";
    row.innerHTML = `
      <div>
        <span>${escapeHtml(taskKindLabel(task.kind))} · ${escapeHtml(taskStatusLabel(task.status))}${time ? ` · ${escapeHtml(time)}` : ""}</span>
        <strong>${escapeHtml(task.title || "任务")}</strong>
        <em>${escapeHtml(task.detail || task.runtimeDir || "")}</em>
      </div>
      <div class="task-actions">
        <button type="button" data-task-detail="${escapeAttr(task.id)}">详情</button>
        <button type="button" data-task-open="${escapeAttr(file || "")}"${file ? "" : " disabled"}>打开产物</button>
        <button type="button" data-task-retry="${escapeAttr(task.id)}"${task.status === "failed" ? "" : " disabled"}>重试</button>
        <button type="button" data-task-cancel="${escapeAttr(task.id)}"${task.status === "running" ? "" : " disabled"}>取消</button>
      </div>
    `;
    row.querySelector("[data-task-detail]")?.addEventListener("click", () => loadTaskDetail(task.id));
    row.querySelector("[data-task-open]")?.addEventListener("click", () => file && openFileByPath(file));
    row.querySelector("[data-task-retry]")?.addEventListener("click", () => retryTask(task.id));
    row.querySelector("[data-task-cancel]")?.addEventListener("click", () => cancelTask(task.id));
    el.taskCenterPanel.appendChild(row);
  }
}

function renderTaskDetail() {
  if (!el.taskDetailPanel) return;
  if (!state.activeProject) {
    el.taskDetailPanel.textContent = "选择项目后查看任务详情";
    el.taskDetailPanel.classList.add("muted");
    return;
  }
  const detail = state.taskDetail;
  if (!detail?.task) {
    el.taskDetailPanel.textContent = "选择一条任务查看日志、产物、错误和下一步。";
    el.taskDetailPanel.classList.add("muted");
    return;
  }
  const task = detail.task;
  const files = detail.preview?.files || [];
  el.taskDetailPanel.classList.remove("muted");
  el.taskDetailPanel.innerHTML = `
    <div class="task-detail-head">
      <strong>${escapeHtml(task.title || "任务详情")}</strong>
      <span>${escapeHtml(taskKindLabel(task.kind))} · ${escapeHtml(taskStatusLabel(task.status))}</span>
    </div>
    <p>${escapeHtml(task.detail || task.runtimeDir || "")}</p>
    ${task.error ? `<p class="task-error">${escapeHtml(task.error)}</p>` : ""}
    ${detail.preview?.nextAction ? `<p>${escapeHtml(detail.preview.nextAction)}</p>` : ""}
    <div class="task-detail-files">
      ${files.length ? files.map((item) => `
        <button type="button" data-task-file="${escapeAttr(item.file)}">${escapeHtml(item.file)}</button>
        <pre>${escapeHtml(item.preview || "")}</pre>
      `).join("") : "<span class=\"muted\">暂无可预览产物</span>"}
    </div>
  `;
  for (const button of el.taskDetailPanel.querySelectorAll("[data-task-file]")) {
    button.addEventListener("click", () => openFileByPath(button.dataset.taskFile));
  }
}

function radarScoreClass(score) {
  const value = Number(score || 0);
  if (value >= 82) return "good";
  if (value >= 65) return "warn";
  return "bad";
}

function renderHitList(hits = []) {
  if (!hits.length) return "<span class=\"muted\">无明显命中</span>";
  return hits.slice(0, 6).map((item) => `<span>${escapeHtml(item.term)} × ${escapeHtml(item.count)}</span>`).join("");
}

function renderNarrativeRadar() {
  if (!el.narrativeRadarPanel) return;
  if (!state.activeProject) {
    el.narrativeRadarPanel.textContent = "基于本地题材规则、套路检测和去 AI 腔规则，选择项目后可本地扫描。";
    el.narrativeRadarPanel.classList.add("muted");
    return;
  }
  const radar = state.narrativeRadar;
  if (!radar) {
    el.narrativeRadarPanel.textContent = "点击“扫描当前项目”查看人味、题材、节奏和连续性风险。";
    el.narrativeRadarPanel.classList.add("muted");
    return;
  }
  const scores = radar.scores || {};
  const scoreItems = [
    ["人味", scores.humanTexture],
    ["题材", scores.genreFit],
    ["节奏", scores.rhythm],
    ["连续性", scores.continuity],
    ["发布", scores.publishReadiness]
  ];
  el.narrativeRadarPanel.classList.remove("muted");
  el.narrativeRadarPanel.innerHTML = `
    <div class="radar-summary">
      <strong>${escapeHtml(radar.genre || "通用")} · ${escapeHtml(radar.chars || 0)} 字</strong>
      <span>${escapeHtml((radar.files || []).length)} 个正文文件 · ${escapeHtml(radar.paragraphCount || 0)} 段</span>
    </div>
    <div class="radar-score-grid">
      ${scoreItems.map(([label, value]) => `<div class="radar-score ${radarScoreClass(value)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(Math.round(value || 0))}</strong></div>`).join("")}
    </div>
    <div class="radar-hit-groups">
      <div><strong>AI 腔</strong>${renderHitList(radar.metrics?.aiHits)}</div>
      <div><strong>套路句</strong>${renderHitList(radar.metrics?.clicheHits)}</div>
      <div><strong>题材锚点</strong>${renderHitList(radar.metrics?.genreAnchors)}</div>
    </div>
    <div class="radar-issues"></div>
  `;
  const issues = el.narrativeRadarPanel.querySelector(".radar-issues");
  for (const issue of radar.issues || []) {
    const row = document.createElement("div");
    row.className = `radar-issue ${issue.severity || "info"}`;
    row.innerHTML = `
      <span>${escapeHtml(issue.severity || "info")}</span>
      <strong>${escapeHtml(issue.title || "风险")}</strong>
      <p>${escapeHtml(issue.detail || "")}</p>
      <em>${escapeHtml(issue.suggestion || "")}</em>
    `;
    issues.appendChild(row);
  }
}

async function runNarrativeRadar() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  try {
    const file = state.activeFile && state.activeFile.startsWith("01_正文/") && !state.activeFile.startsWith("01_正文/历史版本/")
      ? `?file=${encodeURIComponent(state.activeFile)}`
      : "";
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/narrative-radar${file}`);
    state.narrativeRadar = data;
    renderNarrativeRadar();
    setStatus(`创作雷达扫描完成：发布准备度 ${Math.round(data.scores?.publishReadiness || 0)}。`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function refreshTaskCenter() {
  if (!state.activeProject) return;
  try {
    state.taskFilters.kind = el.taskKindFilter?.value || "all";
    state.taskFilters.status = el.taskStatusFilter?.value || "all";
    const query = new URLSearchParams();
    if (state.taskFilters.kind !== "all") query.set("kind", state.taskFilters.kind);
    if (state.taskFilters.status !== "all") query.set("status", state.taskFilters.status);
    const suffix = query.toString() ? `?${query}` : "";
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/tasks${suffix}`);
    state.tasks = data.tasks || [];
    state.taskSummary = data.summary || null;
    renderTaskCenter();
    renderTaskDetail();
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function loadTaskDetail(taskId) {
  if (!state.activeProject || !taskId) return;
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/tasks/${encodeURIComponent(taskId)}`);
    state.taskDetail = data;
    renderTaskDetail();
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function retryTask(taskId) {
  if (!state.activeProject || !taskId) return;
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/tasks/${encodeURIComponent(taskId)}/retry`, {
      method: "POST",
      body: JSON.stringify({})
    });
    if (data.project) {
      state.activeProject = data.project;
      state.files = data.project.files || [];
      state.chapters = data.project.chapters || [];
    }
    state.taskDetail = { task: data.task, preview: { files: [], nextAction: data.task?.nextAction || "" } };
    renderFiles();
    renderProjectStats();
    await refreshTaskCenter();
    setStatus(data.task?.status === "pending" ? "已生成待人工重跑任务。" : "任务已重试。");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function cancelTask(taskId) {
  if (!state.activeProject || !taskId) return;
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/tasks/${encodeURIComponent(taskId)}/cancel`, {
      method: "POST",
      body: JSON.stringify({})
    });
    state.taskDetail = { task: data.task, preview: { files: [], nextAction: data.message || "" } };
    await refreshTaskCenter();
    setStatus(data.message || "任务取消请求已发送。");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

function setTaskAutoRefresh() {
  if (state.taskAutoRefreshTimer) {
    clearInterval(state.taskAutoRefreshTimer);
    state.taskAutoRefreshTimer = null;
  }
  if (el.taskAutoRefresh?.checked) {
    state.taskAutoRefreshTimer = setInterval(() => {
      if (state.activeProject) refreshTaskCenter();
    }, 8000);
  }
}

function selectedContextFiles() {
  return [...el.contextFiles.querySelectorAll("input:checked")].map((node) => node.value);
}

async function loadProjects() {
  const data = await api("/api/projects");
  state.projects = data.projects;
  renderProjects();
}

async function loadArchiveAssistants() {
  const data = await api("/api/archive-assistants");
  state.archiveAssistants = data.assistants || [];
  renderArchiveAssistantOptions();
}

function renderArchiveAssistantOptions() {
  const targets = [el.projectAssistant, el.archiveAssistantSelect].filter(Boolean);
  for (const select of targets) {
    const current = select === el.archiveAssistantSelect && state.activeProject?.archiveAssistantId
      ? state.activeProject.archiveAssistantId
      : select.value;
    select.innerHTML = "";
    const auto = document.createElement("option");
    auto.value = "auto";
    auto.textContent = "自动推荐";
    select.appendChild(auto);
    for (const assistant of state.archiveAssistants) {
      const option = document.createElement("option");
      option.value = assistant.id;
      option.textContent = assistant.name;
      select.appendChild(option);
    }
    select.value = current && [...select.options].some((option) => option.value === current) ? current : "auto";
  }
  renderArchiveAssistantHint();
}

function currentArchiveAssistant() {
  const id = el.archiveAssistantSelect?.value === "auto"
    ? state.activeProject?.archiveAssistantId
    : el.archiveAssistantSelect?.value;
  return state.archiveAssistants.find((assistant) => assistant.id === id);
}

function renderArchiveAssistantHint() {
  if (!el.archiveAssistantHint) return;
  const assistant = currentArchiveAssistant();
  if (!state.activeProject) {
    el.archiveAssistantHint.textContent = "创建或选择项目后显示助手说明。";
    return;
  }
  el.archiveAssistantHint.textContent = assistant
    ? `${assistant.name}：${assistant.tagline}`
    : `${state.activeProject.archiveAssistantName || "未设置"}：可选择自动推荐或手动指定助手。`;
}

function currentStoryBibleSection() {
  return el.storyBibleSection?.value || "characters";
}

function renderStoryBible() {
  if (!el.storyBiblePanel) return;
  if (!state.activeProject) {
    el.storyBiblePanel.textContent = "选择项目后显示长期记忆条目";
    el.storyBiblePanel.classList.add("muted");
    return;
  }
  const sectionKey = currentStoryBibleSection();
  const section = state.storyBible?.sections?.[sectionKey];
  if (!section) {
    el.storyBiblePanel.textContent = "点击“刷新故事圣经”读取长期记忆。";
    el.storyBiblePanel.classList.add("muted");
    return;
  }
  const items = section.items || [];
  if (!items.length) {
    el.storyBiblePanel.textContent = `暂无${section.label || "条目"}，可用上方表单新增。`;
    el.storyBiblePanel.classList.add("muted");
    return;
  }
  el.storyBiblePanel.classList.remove("muted");
  el.storyBiblePanel.innerHTML = "";
  for (const item of items.slice(0, 12)) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "story-bible-row";
    row.innerHTML = `
      <strong>${escapeHtml(item.name || item.id)}</strong>
      <span>${escapeHtml(item.status || "未标注状态")}</span>
      <em>${escapeHtml(item.summary || item.note || "")}</em>
    `;
    row.addEventListener("click", () => {
      if (el.storyBibleId) el.storyBibleId.value = item.id || "";
      if (el.storyBibleName) el.storyBibleName.value = item.name || "";
      if (el.storyBibleStatus) el.storyBibleStatus.value = item.status || "";
      if (el.storyBibleSummary) el.storyBibleSummary.value = item.summary || item.note || "";
    });
    el.storyBiblePanel.appendChild(row);
  }
}

async function loadStoryBible(showStatus = false) {
  if (!state.activeProject) return;
  if (showStatus) setStatus("正在读取故事圣经...");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/story-bible`);
    state.storyBible = data;
    renderStoryBible();
    if (showStatus) setStatus("故事圣经已刷新。");
  } catch (error) {
    if (el.storyBiblePanel) {
      el.storyBiblePanel.textContent = error.message;
      el.storyBiblePanel.classList.add("muted");
    }
    if (showStatus) setStatus(error.message, "error");
  }
}

async function saveStoryBibleEntry() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const item = {
    id: el.storyBibleId?.value.trim() || "",
    name: el.storyBibleName?.value.trim() || "",
    status: el.storyBibleStatus?.value.trim() || "",
    summary: el.storyBibleSummary?.value.trim() || ""
  };
  if (!item.name && !item.id) return setStatus("请至少填写 ID 或名称。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/story-bible`, {
      method: "POST",
      body: JSON.stringify({
        section: currentStoryBibleSection(),
        item
      })
    });
    state.storyBible = { sections: data.sections || {} };
    if (data.project) {
      state.activeProject = data.project;
      state.files = data.project.files || [];
      renderFiles();
      renderProjectMeta();
    }
    renderStoryBible();
    await refreshTaskCenter();
    setStatus("故事圣经条目已保存。");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function loadCodexConfig() {
  try {
    const data = await api("/api/codex/config");
    const config = data.config;
    el.codexConfig.innerHTML = [
      `模型：<code>${escapeHtml(config.model || "未读取到")}</code>`,
      `Provider：<code>${escapeHtml(config.modelProvider || "未读取到")}</code>`,
      `cc-switch：<code>${escapeHtml(config.currentProviderCodex || "未读取到")}</code>`,
      `小说技能：<code>${config.novelSkillAvailable ? "已找到" : "未找到"}</code>`
    ].join("<br />");
  } catch (error) {
    el.codexConfig.textContent = `Codex 配置读取失败：${error.message}`;
  }
}

async function loadProject(id) {
  const data = await api(`/api/projects/${encodeURIComponent(id)}`);
  state.activeProject = data.project;
  state.files = data.project.files || [];
  state.chapters = data.project.chapters || [];
  state.activeFile = "";
  state.doctor = null;
  state.activeSyncReviewIndex = 0;
  state.activeSyncReview = null;
  state.qualityReport = null;
  state.workflowResult = null;
  state.versions = [];
  state.tasks = [];
  state.taskDetail = null;
  state.searchResults = [];
  state.narrativeRadar = null;
  state.storyBible = null;
  state.lastAutosaveKey = "";
  state.snapshots = data.project.snapshots || [];
  el.activeProjectName.textContent = data.project.name;
  renderProjectMeta();
  el.modelName.value = data.project.model || "qwen3:8b";
  el.endpoint.value = data.project.endpoint || "http://127.0.0.1:11434/api/generate";
  el.pipelineRunner.value = data.project.runner || "codex";
  el.archiveAssistantSelect.value = data.project.archiveAssistantId || "auto";
  updateAiModeVisibility();
  renderArchiveAssistantHint();
  el.ideaInput.value = data.project.premise || "";
  el.draft.value = "";
  el.chapterBrief.value = "";
  renderProjects();
  renderFiles();
  renderProjectMeta();
  renderProjectStats();
  renderChapterBoard();
  renderSnapshots();
  renderQualityReport();
  renderWorkflowResult();
  renderVersions();
  renderGlobalSearchResults();
  renderTaskCenter();
  renderTaskDetail();
  renderNarrativeRadar();
  renderStoryBible();
  renderStyleProfileResult();
  renderMemoryRecallResult();
  renderSyncReviews();
  loadStoryBible(false);
  refreshTaskCenter();
  runDoctor(false);
  setAutosaveStatus("自动保存待机");
  setStatus("项目已载入。可以选择章节，或填写 brief 生成新章节。");
}

async function createProject() {
  const name = el.projectName.value.trim();
  if (!name) return setStatus("请先填写项目名。", "error");
  setBusy(true);
  try {
    const data = await api("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name,
        genre: el.projectGenre.value.trim(),
        premise: el.projectPremise.value.trim(),
        archiveAssistant: el.projectAssistant.value || "auto"
      })
    });
    el.projectName.value = "";
    el.projectGenre.value = "";
    el.projectPremise.value = "";
    await loadProjects();
    await loadProject(data.project.id);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function createDemoProject() {
  setBusy(true);
  try {
    const data = await api("/api/demo-project", {
      method: "POST",
      body: JSON.stringify({})
    });
    await loadProjects();
    if (data.project?.id) await loadProject(data.project.id);
    setStatus(`演示项目已创建：${data.project?.name || ""}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function ensureProjectForIdea(idea) {
  if (state.activeProject) return state.activeProject;
  const name = el.projectName.value.trim();
  setStatus("未选择项目，正在根据原始思路自动创建小说项目。");
  const data = await api("/api/idea/project", {
    method: "POST",
    body: JSON.stringify({
      name,
      genre: el.projectGenre.value.trim(),
      idea,
      archiveAssistant: el.projectAssistant.value || "auto"
    })
  });
  await loadProjects();
  await loadProject(data.project.id);
  return data.project;
}

async function loadSelectedFile() {
  if (!state.activeProject) return;
  const file = el.fileSelect.value;
  state.activeFile = file;
  if (!file) {
    el.draft.value = "";
    setStatus("已切换到新章节。");
    return;
  }
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/file?path=${encodeURIComponent(file)}`);
    el.draft.value = data.content;
    parseChapterFromFile(file);
    setStatus(`已打开：${file}`);
    renderFileBrowser();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

function parseChapterFromFile(file) {
  const match = file.match(/第(\d+)章_([^/]+)\.(md|txt)$/);
  if (!match) return;
  el.chapterNo.value = String(Number(match[1]));
  el.chapterTitle.value = match[2] || "";
  const chapter = state.chapters.find((item) => Number(item.no) === Number(match[1]));
  if (chapter?.brief && !el.chapterBrief.value.trim()) {
    el.chapterBrief.value = chapter.brief;
  }
}

async function saveChapter() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  try {
    const body = {
      file: state.activeFile || "",
      chapterNo: el.chapterNo.value,
      title: el.chapterTitle.value,
      brief: el.chapterBrief.value.trim(),
      content: el.draft.value
    };
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/chapter`, {
      method: "POST",
      body: JSON.stringify(body)
    });
    const savedFile = data.file;
    state.activeFile = savedFile;
    await loadProject(state.activeProject.id);
    state.activeFile = savedFile;
    el.fileSelect.value = savedFile;
    renderFileBrowser();
    renderChapterBoard();
    state.lastAutosaveKey = autosaveKey();
    setAutosaveStatus("手动保存完成", "ok");
    setStatus(`已保存：${data.file}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function runPipeline() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  setStatus("正在启动多阶段流水线：规划、编排、写作、审计、修订、状态同步。");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/pipeline`, {
      method: "POST",
      body: JSON.stringify({
        runner: el.pipelineRunner.value,
        chapterNo: el.chapterNo.value,
        title: el.chapterTitle.value.trim(),
        brief: el.chapterBrief.value.trim(),
        draft: el.draft.value,
        activeFile: state.activeFile,
        contextFiles: selectedContextFiles(),
        model: el.modelName.value.trim(),
        endpoint: el.endpoint.value.trim()
      })
    });
    if (data.mode === "codex") {
    setStatus(`Codex 多阶段流水线已启动，PID：${data.run.pid}。运行时：${data.runtime.runtimeDir}`);
      refreshTaskCenter();
      pollCodexRun(data.run.runId, data.run.finalFile);
      return;
    }
    await loadProject(state.activeProject.id);
    if (data.chapterFile && state.files.includes(data.chapterFile)) {
      await openFileByPath(data.chapterFile);
    } else {
      el.draft.value = data.output.trim();
    }
    setStatus(`多阶段流水线完成。最终章节：${data.chapterFile || "未保存"}。阶段产物：${data.runtimeDir}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function incubateIdea() {
  if (el.pipelineRunner?.value === "codex") {
    return incubateIdeaWithCodex();
  }
  const idea = el.ideaInput.value.trim() || el.chapterBrief.value.trim();
  if (!idea) return setStatus("请先填写原始思路。", "error");
  setBusy(true);
  setStatus("正在生成立项建议：书名、类型、标签、封面描述、卖点和前三章方案。");
  try {
    const project = await ensureProjectForIdea(idea);
    const data = await api(`/api/projects/${encodeURIComponent(project.id)}/idea`, {
      method: "POST",
      body: JSON.stringify({
        idea,
        genre: document.querySelector("#projectGenre")?.value?.trim() || project.genre || "",
        contextFiles: selectedContextFiles(),
        model: el.modelName.value.trim(),
        endpoint: el.endpoint.value.trim()
      })
    });
    await loadProject(state.activeProject.id);
    el.draft.value = data.output.trim();
    state.activeFile = data.file;
    el.fileSelect.value = "";
    setStatus(`立项建议已生成并写入：${data.file}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function incubateIdeaWithCodex() {
  const idea = el.ideaInput.value.trim() || el.chapterBrief.value.trim();
  if (!idea) return setStatus("请先填写原始思路。", "error");
  setBusy(true);
  try {
    const project = await ensureProjectForIdea(idea);
    setStatus("正在启动 Codex 创意孵化。它会使用 cc-switch 当前 Codex 配置，并把结果写入项目文件。");
    const data = await api(`/api/projects/${encodeURIComponent(project.id)}/codex-run`, {
      method: "POST",
      body: JSON.stringify({
        mode: "idea",
        idea,
        genre: el.projectGenre.value.trim() || project.genre || "",
        chapterNo: el.chapterNo.value,
        title: el.chapterTitle.value.trim(),
        brief: idea,
        activeFile: state.activeFile
      })
    });
    setStatus(`Codex 创意孵化已启动，PID：${data.run.pid}。日志：${data.run.logFile}`);
    refreshTaskCenter();
    pollCodexRun(data.run.runId, "00_总控/立项建议.md");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function readKnowledgeFiles() {
  const files = [];
  for (const file of [...(el.knowledgeFiles?.files || [])]) {
    const content = await file.text();
    files.push({ name: file.name, content });
  }
  const note = el.knowledgeNote.value.trim();
  if (note) {
    files.push({ name: "粘贴补充资料.md", content: note });
  }
  return files;
}

async function absorbKnowledge() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const files = await readKnowledgeFiles();
  if (!files.length) return setStatus("请先上传资料文件，或粘贴补充资料。", "error");

  setBusy(true);
  setStatus("正在整理资料：会先保存原始资料，再综合判断是否吸收到项目能力中。");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/knowledge-feed`, {
      method: "POST",
      body: JSON.stringify({
        runner: el.pipelineRunner.value,
        files,
        note: el.knowledgeNote.value.trim(),
        model: el.modelName.value.trim(),
        endpoint: el.endpoint.value.trim()
      })
    });
    if (data.mode === "codex") {
      setStatus(`Codex 资料投喂已启动，PID：${data.run.pid}。原始资料已保存，等待综合分析。`);
      refreshTaskCenter();
      pollCodexRun(data.run.runId, data.reportFile || "05_提示词/项目能力包.md");
      return;
    }
    await loadProject(state.activeProject.id);
    if (data.file && state.files.includes(data.file)) {
      await openFileByPath(data.file);
    } else {
      el.draft.value = data.output || "";
    }
    setStatus(`资料吸收完成：已更新项目能力包，并写入 ${data.file}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function analyzeStyleProfile() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const sample = el.styleSample?.value.trim() || "";
  if (!sample) return setStatus("请先粘贴作者样本或本项目样稿。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/style-profile`, {
      method: "POST",
      body: JSON.stringify({
        sample,
        note: el.styleNote?.value.trim() || ""
      })
    });
    if (data.project) {
      state.activeProject = data.project;
      state.files = data.project.files || [];
      state.chapters = data.project.chapters || [];
    }
    renderFiles();
    renderProjectStats();
    renderStyleProfileResult(data);
    await refreshTaskCenter();
    setStatus(`文风模仿档案已生成：${data.profileFile}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function previewMemoryRecall() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/memory-recall`, {
      method: "POST",
      body: JSON.stringify({
        chapterNo: el.chapterNo.value,
        title: el.chapterTitle.value.trim(),
        brief: el.chapterBrief.value.trim(),
        draft: el.draft.value,
        activeFile: state.activeFile
      })
    });
    state.memoryRecallResult = data;
    renderMemoryRecallResult(data);
    const ranked = data.recalledMemory?.ranked || {};
    const total = ["characters", "foreshadows", "plotThreads", "readerPromises", "similarChapters", "emotionBeats"]
      .reduce((sum, key) => sum + (ranked[key]?.length || 0), 0);
    setStatus(`本章召回预览完成：${total} 条结构化记忆。`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function pollCodexRun(runId, preferredFile = "") {
  if (!state.activeProject) return;
  const projectId = state.activeProject.id;
  let attempts = 0;
  const tick = async () => {
    attempts += 1;
    try {
      const data = await api(`/api/projects/${encodeURIComponent(projectId)}/codex-run/${encodeURIComponent(runId)}`);
      const status = data.status.status;
      if (data.final?.trim()) {
        el.draft.value = data.final.trim();
      } else if (data.log?.trim()) {
        el.draft.value = data.log.trim();
      }
      setStatus(`Codex 运行状态：${status}。runId：${runId}`);
      if (status === "running" && attempts < 240) {
        window.setTimeout(tick, 3000);
      } else {
        await loadProject(projectId);
        await refreshTaskCenter();
        if (preferredFile && state.files.includes(preferredFile)) {
          state.activeFile = preferredFile;
          el.fileSelect.value = preferredFile;
          await loadSelectedFile();
        }
        setStatus(`Codex 运行状态：${status}。结果和日志保存在 07_Codex。`);
      }
    } catch (error) {
      setStatus(`Codex 状态读取失败：${error.message}`, "error");
    }
  };
  window.setTimeout(tick, 2000);
}

async function exportProject(format) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/export`, {
      method: "POST",
      body: JSON.stringify({
        format,
        from: el.batchFrom?.value || "",
        to: el.batchTo?.value || "",
        platform: el.publishPlatform?.value.trim() || "",
        withTitles: true
      })
    });
    setStatus(`已导出：${data.file}`);
    await loadProject(state.activeProject.id);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function openProjectFolder() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/open-folder`, {
      method: "POST",
      body: JSON.stringify({})
    });
    setStatus(data.ok ? `已请求打开项目文件夹：${data.path}` : `${data.message} 路径：${data.path}`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function copyProjectPath() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const path = state.activeProject.rootPath || "";
  if (!path) return setStatus("当前项目路径不可用，请刷新项目。", "error");
  try {
    await navigator.clipboard.writeText(path);
    setStatus(`已复制项目路径：${path}`);
  } catch {
    el.draft.value = path;
    setStatus("浏览器未允许写入剪贴板，已把项目路径放到正文框。");
  }
}

async function saveAiSettings() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/meta`, {
      method: "POST",
      body: JSON.stringify({
        runner: el.pipelineRunner.value,
        model: el.modelName.value.trim(),
        endpoint: el.endpoint.value.trim()
      })
    });
    state.activeProject = { ...state.activeProject, ...data.project };
    renderProjectMeta();
    setStatus("AI 执行配置已保存到当前项目。");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function saveArchiveAssistant() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/archive-assistant`, {
      method: "POST",
      body: JSON.stringify({
        assistantId: el.archiveAssistantSelect.value || "auto"
      })
    });
    state.activeProject = { ...state.activeProject, ...data.project };
    await loadProject(state.activeProject.id);
    setStatus(`档案助手已应用：${data.assistant.name}`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function setBusy(isBusy) {
  for (const button of document.querySelectorAll("button")) {
    button.disabled = isBusy;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function renderProjectStats() {
  if (!state.activeProject?.stats) {
    el.projectStats.textContent = "选择项目后显示状态";
    el.projectStats.classList.add("muted");
    return;
  }
  const stats = state.activeProject.stats;
  const reviewStatus = {
    draft: "草稿",
    reviewing: "待审",
    approved: "通过"
  }[state.activeProject.reviewStatus || "draft"] || "草稿";
  const bookStatus = {
    incubating: "孵化中",
    outlining: "大纲中",
    active: "连载中",
    paused: "暂停",
    completed: "完结",
    dropped: "搁置"
  }[state.activeProject.status || "incubating"] || "孵化中";
  el.projectStats.classList.remove("muted");
  el.projectStats.innerHTML = [
    statCard("阶段", bookStatus),
    statCard("审核", reviewStatus),
    statCard("正文", `${stats.chapterCount || 0} 章`),
    statCard("字数", `${stats.totalChapterChars || 0}`),
    statCard("文件", `${stats.fileCount || 0}`),
    statCard("Codex", `${stats.codexArtifactCount || 0}`),
    statCard("运行时", `${stats.runtimeArtifactCount || 0}`)
  ].join("");
  for (const button of document.querySelectorAll("[data-review-status]")) {
    button.classList.toggle("active", button.dataset.reviewStatus === (state.activeProject.reviewStatus || "draft"));
  }
}

function statCard(label, value) {
  return `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function chapterStatusClass(status = "") {
  return {
    "未规划": "unplanned",
    "已规划": "planned",
    "生成中": "running",
    "待审": "reviewing",
    "可发布": "approved"
  }[status] || "unplanned";
}

function renderChapterBoard() {
  if (!el.chapterBoard) return;
  const chapters = state.chapters || [];
  if (!state.activeProject) {
    el.chapterBoard.textContent = "选择项目后显示章节规划";
    el.chapterBoard.classList.add("muted");
    return;
  }
  if (!chapters.length) {
    el.chapterBoard.textContent = "暂无章节规划。填写章节号、标题和 brief 后点击“保存章节规划”。";
    el.chapterBoard.classList.add("muted");
    return;
  }
  el.chapterBoard.classList.remove("muted");
  el.chapterBoard.innerHTML = "";
  for (const chapter of chapters) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chapter-card ${chapterStatusClass(chapter.status)} ${state.activeFile && chapter.file === state.activeFile ? "active" : ""}`;
    const title = chapter.title || "未命名";
    const meta = [
      chapter.file ? "已成稿" : "未成稿",
      chapter.wordCount ? `${chapter.wordCount} 字` : "",
      chapter.hook ? `钩子：${chapter.hook}` : ""
    ].filter(Boolean).join(" · ");
    button.innerHTML = `
      <span>${escapeHtml(chapter.status || "未规划")}</span>
      <strong>第${escapeHtml(chapter.no)}章 ${escapeHtml(title)}</strong>
      <em>${escapeHtml(chapter.brief || "暂无 brief")}</em>
      <small>${escapeHtml(meta || "点击载入到编辑区")}</small>
    `;
    button.addEventListener("click", () => loadChapterFromBoard(chapter));
    el.chapterBoard.appendChild(button);
  }
}

async function loadChapterFromBoard(chapter) {
  if (!state.activeProject) return;
  el.chapterNo.value = chapter.no || 1;
  el.chapterTitle.value = chapter.title || "";
  el.chapterBrief.value = chapter.brief || "";
  if (chapter.file && state.files.includes(chapter.file)) {
    state.activeFile = chapter.file;
    el.fileSelect.value = chapter.file;
    await loadSelectedFile();
  } else {
    state.activeFile = "";
    el.fileSelect.value = "";
    el.draft.value = "";
    setStatus(`已载入第 ${chapter.no} 章规划。可以补充 brief 后运行流水线。`);
  }
  renderChapterBoard();
}

async function saveChapterPlan() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const no = Number(el.chapterNo.value || 0);
  if (!no) return setStatus("请先填写章节号。", "error");
  setBusy(true);
  try {
    const current = state.chapters.find((chapter) => Number(chapter.no) === no) || {};
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/chapters`, {
      method: "POST",
      body: JSON.stringify({
        no,
        title: el.chapterTitle.value.trim(),
        status: current.status === "可发布" ? "可发布" : (state.activeFile ? "待审" : "已规划"),
        brief: el.chapterBrief.value.trim(),
        hook: current.hook || "",
        file: state.activeFile || current.file || "",
        wordCount: el.draft.value ? el.draft.value.replace(/\s/g, "").length : current.wordCount || 0
      })
    });
    state.chapters = data.chapters || [];
    if (state.activeProject) state.activeProject.chapters = state.chapters;
    renderChapterBoard();
    setStatus(`第 ${no} 章规划已保存。`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function renderSnapshots() {
  if (!el.snapshotPanel) return;
  const snapshots = state.snapshots || state.activeProject?.snapshots || [];
  if (!state.activeProject) {
    el.snapshotPanel.textContent = "选择项目后显示快照";
    el.snapshotPanel.classList.add("muted");
    return;
  }
  if (!snapshots.length) {
    el.snapshotPanel.textContent = "暂无快照。建议在运行流水线或大改资料前先创建。";
    el.snapshotPanel.classList.add("muted");
    return;
  }
  el.snapshotPanel.classList.remove("muted");
  el.snapshotPanel.innerHTML = "";
  for (const snapshot of snapshots) {
    const card = document.createElement("div");
    card.className = `snapshot-card ${snapshot.reason || "manual"}`;
    const note = snapshot.note || (snapshot.reason === "before_restore" ? "恢复前自动快照" : "手动快照");
    card.innerHTML = `
      <div class="snapshot-head">
        <strong>${escapeHtml(note)}</strong>
        <span>${escapeHtml(formatBytes(snapshot.size))}</span>
      </div>
      <p>${escapeHtml(snapshot.createdAt || snapshot.id)} · ${escapeHtml(snapshot.fileCount || 0)} 个文件</p>
      <div class="snapshot-actions"></div>
    `;
    const actions = card.querySelector(".snapshot-actions");
    const restore = document.createElement("button");
    restore.type = "button";
    restore.textContent = "恢复";
    restore.addEventListener("click", () => restoreSnapshot(snapshot.id));
    actions.appendChild(restore);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => deleteSnapshot(snapshot.id));
    actions.appendChild(remove);
    el.snapshotPanel.appendChild(card);
  }
}

async function createSnapshot() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  setStatus("正在创建项目快照。");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/snapshots`, {
      method: "POST",
      body: JSON.stringify({ note: el.snapshotNote?.value.trim() || "" })
    });
    state.snapshots = data.snapshots || [];
    state.activeProject.snapshots = state.snapshots;
    if (el.snapshotNote) el.snapshotNote.value = "";
    renderSnapshots();
    setStatus(`项目快照已创建：${data.snapshot.id}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function restoreSnapshot(snapshotId) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const ok = confirm("恢复快照会用旧版本覆盖当前项目。系统会先自动创建一份恢复前快照，确定继续吗？");
  if (!ok) return;
  setBusy(true);
  setStatus("正在恢复项目快照。");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/snapshots/${encodeURIComponent(snapshotId)}/restore`, {
      method: "POST",
      body: JSON.stringify({})
    });
    state.activeProject = data.project;
    state.files = data.project.files || [];
    state.snapshots = data.project.snapshots || [];
    state.chapters = data.project.chapters || [];
    renderProjects();
    renderFiles();
    renderProjectMeta();
    renderProjectStats();
    renderChapterBoard();
    renderSnapshots();
    state.qualityReport = null;
    renderQualityReport();
    renderSyncReviews();
    setStatus(`已恢复快照：${snapshotId}。恢复前状态已保存为：${data.safetySnapshot?.id || "自动快照"}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function deleteSnapshot(snapshotId) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const ok = confirm("确定删除这个快照吗？删除后无法恢复。");
  if (!ok) return;
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/snapshots/${encodeURIComponent(snapshotId)}`, {
      method: "DELETE"
    });
    state.snapshots = data.snapshots || [];
    state.activeProject.snapshots = state.snapshots;
    renderSnapshots();
    setStatus(`已删除快照：${snapshotId}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

function qualitySeverityLabel(severity) {
  return {
    critical: "严重",
    warn: "警告",
    info: "提醒"
  }[severity] || severity || "提醒";
}

function qualityVerdictClass(status = "") {
  return {
    "可发布": "approved",
    "需小修": "warn",
    "需重写": "critical"
  }[status] || "warn";
}

function renderQualityReport() {
  if (!el.qualityPanel) return;
  const report = state.qualityReport;
  if (!state.activeProject) {
    el.qualityPanel.textContent = "选择项目后运行质检";
    el.qualityPanel.classList.add("muted");
    return;
  }
  if (!report) {
    el.qualityPanel.textContent = "尚未运行发布前质检";
    el.qualityPanel.classList.add("muted");
    return;
  }
  el.qualityPanel.classList.remove("muted");
  const verdict = report.verdict || report.localQuality?.verdict || {};
  const verdictClass = qualityVerdictClass(verdict.status);
  const topIssues = (report.issues || report.localQuality?.issues || []).slice(0, 6);
  el.qualityPanel.innerHTML = `
    <div class="quality-verdict ${verdictClass}">
      <strong>${escapeHtml(verdict.status || (report.status === "running" ? "AI复核中" : "未判断"))}</strong>
      <span>${escapeHtml(verdict.score ?? "-")} 分</span>
    </div>
    <div class="quality-counts">
      <span>严重 ${escapeHtml(verdict.critical || 0)}</span>
      <span>警告 ${escapeHtml(verdict.warn || 0)}</span>
      <span>提醒 ${escapeHtml(verdict.info || 0)}</span>
    </div>
    ${report.mode ? `<p class="quality-mode">${escapeHtml(report.mode === "codex" ? "Codex 深度复核已启动" : "AI 深度复核已完成")}</p>` : ""}
    <div class="quality-issues"></div>
    <div class="quality-actions"></div>
  `;
  const issues = el.qualityPanel.querySelector(".quality-issues");
  if (!topIssues.length) {
    issues.innerHTML = `<p>未发现阻碍发布的明显问题。</p>`;
  } else {
    for (const issue of topIssues) {
      const item = document.createElement("div");
      item.className = `quality-issue ${issue.severity || "info"}`;
      item.innerHTML = `
        <span>${escapeHtml(qualitySeverityLabel(issue.severity))}</span>
        <strong>${escapeHtml(issue.chapterNo ? `第${issue.chapterNo}章 ${issue.chapterTitle || ""}` : "项目")}</strong>
        <p>${escapeHtml(issue.title || "")}</p>
        <small>${escapeHtml(issue.suggestion || issue.detail || "")}</small>
      `;
      issues.appendChild(item);
    }
  }
  const actions = el.qualityPanel.querySelector(".quality-actions");
  if (report.reportFile) {
    const open = document.createElement("button");
    open.type = "button";
    open.textContent = report.mode ? "打开 AI 报告" : "打开质检报告";
    open.disabled = !state.files.includes(report.reportFile);
    open.title = open.disabled ? "报告生成后刷新项目即可打开" : report.reportFile;
    open.addEventListener("click", () => openFileByPath(report.reportFile));
    actions.appendChild(open);
  }
  if (report.localReportFile) {
    const openLocal = document.createElement("button");
    openLocal.type = "button";
    openLocal.textContent = "打开本地报告";
    openLocal.disabled = !state.files.includes(report.localReportFile);
    openLocal.title = openLocal.disabled ? "报告生成后刷新项目即可打开" : report.localReportFile;
    openLocal.addEventListener("click", () => openFileByPath(report.localReportFile));
    actions.appendChild(openLocal);
  }
}

async function runQualityCheck() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  setStatus("正在运行发布前质检...");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/quality-check`, {
      method: "POST",
      body: JSON.stringify({
        scope: el.qualityScope?.value || "current",
        chapterNo: el.chapterNo.value,
        file: state.activeFile
      })
    });
    state.qualityReport = data;
    state.activeProject = data.project;
    state.files = data.project.files || [];
    state.chapters = data.project.chapters || [];
    renderFiles();
    renderProjectStats();
    renderChapterBoard();
    renderQualityReport();
    setStatus(`发布前质检完成：${data.verdict.status}，报告已保存到 ${data.reportFile}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function runAiQualityCheck() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  const runner = el.pipelineRunner?.value || "codex";
  setStatus(runner === "codex" ? "正在启动 Codex AI 深度复核..." : "正在运行 AI 深度复核...");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/quality-check/ai`, {
      method: "POST",
      body: JSON.stringify({
        scope: el.qualityScope?.value || "current",
        chapterNo: el.chapterNo.value,
        file: state.activeFile,
        runner,
        model: el.modelName.value.trim(),
        endpoint: el.endpoint.value.trim()
      })
    });
    state.qualityReport = data;
    state.activeProject = data.project;
    state.files = data.project.files || [];
    state.chapters = data.project.chapters || [];
    renderFiles();
    renderProjectStats();
    renderChapterBoard();
    renderQualityReport();
    if (data.mode === "codex") {
      setStatus(`Codex AI 深度复核已启动。目标报告：${data.reportFile}`);
    } else {
      setStatus(`AI 深度复核完成，报告已保存到 ${data.reportFile}`);
    }
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function runProseQualityReview() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/prose-quality`, {
      method: "POST",
      body: JSON.stringify({
        file: state.activeFile || "",
        text: el.draft?.value || ""
      })
    });
    state.activeProject = data.project;
    state.files = data.project.files || [];
    state.chapters = data.project.chapters || [];
    renderFiles();
    renderProjectStats();
    state.qualityReport = { reportFile: data.reportFile, verdict: { status: "文稿增强", score: data.analysis?.scores?.humanScore || 0 }, issues: (data.analysis?.suggestions || []).map((item) => ({ severity: "info", title: "修订建议", detail: item })) };
    renderQualityReport();
    await refreshTaskCenter();
    setStatus(`文稿质量增强报告已生成：${data.reportFile}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

function renderResultPanel(panel, result, selectText, idleText) {
  if (!panel) return;
  if (!state.activeProject) {
    panel.textContent = selectText;
    panel.classList.add("muted");
    return;
  }
  if (!result) {
    panel.textContent = idleText;
    panel.classList.add("muted");
    return;
  }
  panel.classList.remove("muted");
  panel.innerHTML = "";
  const card = document.createElement("div");
  card.className = "workflow-card";
  const files = [result.taskFile, result.revisionFile, result.file, result.reportFile, result.localReportFile, result.manifestFile].filter(Boolean);
  card.innerHTML = `
    <strong>${escapeHtml(result.title || result.status || result.mode || "已完成")}</strong>
    <p>${escapeHtml(result.message || result.file || result.taskFile || result.reportFile || "")}</p>
    <div class="workflow-actions"></div>
  `;
  const actions = card.querySelector(".workflow-actions");
  for (const file of files) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = file.includes("修订任务单") ? "任务单" : file.includes("revision") ? "修订稿" : file.includes("发布资料包") ? "发布资料" : file.includes("冲突") ? "冲突报告" : "打开文件";
    button.disabled = !state.files.includes(file);
    button.title = file;
    button.addEventListener("click", () => openFileByPath(file));
    actions.appendChild(button);
  }
  renderConflictRepairControls(card, result);
  panel.appendChild(card);
}

function firstRepairableConflict(result) {
  return (result?.conflicts || []).find((item) => item?.type === "人物状态重复" && item?.key)
    || (result?.conflict?.type === "人物状态重复" && result?.conflict?.key ? result.conflict : null);
}

function renderConflictRepairControls(card, result) {
  const conflict = firstRepairableConflict(result);
  const conflicts = result?.conflicts || [];
  const plan = result?.plan || result?.repairPlan;
  if (!conflict && !conflicts.length && !plan) return;

  const section = document.createElement("div");
  section.className = "conflict-repair";

  const summary = document.createElement("p");
  summary.textContent = conflicts.length
    ? `发现 ${conflicts.length} 个记忆冲突，当前可自动修复：${conflict ? `${conflict.type} / ${conflict.key}` : "暂无"}`
    : `修复对象：${conflict?.type || "记忆冲突"} / ${conflict?.key || "未指定"}`;
  section.appendChild(summary);

  if (plan?.actions?.length) {
    const list = document.createElement("div");
    list.className = "conflict-repair-plan";
    list.textContent = `${plan.title || "修复方案"}：${plan.actions.map((item) => item.summary || item.action).join("；")}`;
    section.appendChild(list);
  } else if (conflicts.length) {
    const list = document.createElement("div");
    list.className = "conflict-repair-plan";
    list.textContent = conflicts.slice(0, 3).map((item) => `${item.type}：${item.key}`).join("；");
    section.appendChild(list);
  }

  if (conflict) {
    const actions = document.createElement("div");
    actions.className = "workflow-actions";

    const planButton = document.createElement("button");
    planButton.type = "button";
    planButton.textContent = "生成修复方案";
    planButton.setAttribute("data-conflict-repair-plan", "true");
    planButton.addEventListener("click", () => createConflictRepairPlan(conflict));

    const applyButton = document.createElement("button");
    applyButton.type = "button";
    applyButton.textContent = plan ? "应用修复" : "直接修复";
    applyButton.setAttribute("data-conflict-repair-apply", "true");
    applyButton.addEventListener("click", () => applyConflictRepair(conflict));

    actions.append(planButton, applyButton);
    section.appendChild(actions);
  }

  card.appendChild(section);
}

function renderWorkflowResult() {
  const result = state.workflowResult;
  const target = result?.target || "revision";
  renderResultPanel(
    el.workflowPanel,
    target === "revision" ? result : null,
    "选择项目后显示修订发布结果",
    "尚未执行修订发布任务"
  );
  renderResultPanel(
    el.maintenancePanel,
    target === "maintenance" ? result : null,
    "选择项目后显示维护结果",
    "尚未执行项目维护任务"
  );
}

function renderStyleProfileResult(result = null) {
  if (!el.styleProfilePanel) return;
  if (!state.activeProject) {
    el.styleProfilePanel.textContent = "选择项目后可生成文风模仿档案";
    el.styleProfilePanel.classList.add("muted");
    return;
  }
  if (!result) {
    el.styleProfilePanel.textContent = "粘贴自己的样稿后生成风格画像，流水线会自动召回。";
    el.styleProfilePanel.classList.add("muted");
    return;
  }
  const profile = result.profile || {};
  el.styleProfilePanel.classList.remove("muted");
  el.styleProfilePanel.innerHTML = `
    <div class="workflow-card">
      <strong>${escapeHtml(profile.rhythm || "文风档案已生成")}</strong>
      <p>${escapeHtml(profile.sentenceShape || "")} ${escapeHtml(profile.dialogue || "")}</p>
      <div class="workflow-actions">
        <button type="button" data-style-file="${escapeAttr(result.profileFile || "")}">打开档案</button>
        <button type="button" data-style-file="${escapeAttr(result.memoryFile || "")}">风格记忆</button>
      </div>
    </div>
  `;
  for (const button of el.styleProfilePanel.querySelectorAll("[data-style-file]")) {
    const file = button.dataset.styleFile;
    button.disabled = !file || !state.files.includes(file);
    button.addEventListener("click", () => file && openFileByPath(file));
  }
}

function memoryRecallItemLabel(type) {
  return {
    characters: "人物",
    foreshadows: "伏笔",
    plotThreads: "剧情线",
    readerPromises: "承诺",
    similarChapters: "章节",
    emotionBeats: "情绪"
  }[type] || "记忆";
}

function memoryRecallPinKey(type, item = {}, index = 0) {
  return `${type}:${item.id || item.name || index}`;
}

function memoryRecallPinPayload(type, item = {}, index = 0) {
  const text = item.text || item.name || item.id || "";
  return {
    type,
    id: String(item.id || item.name || `${type}-${index}`),
    label: item.name || item.id || memoryRecallItemLabel(type),
    text,
    source: (item.hits || []).join(" / ")
  };
}

async function pinMemoryRecallItem(key) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const item = state.memoryRecallCandidates[key];
  if (!item) return setStatus("没有找到可钉选的召回条目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/memory-pins`, {
      method: "POST",
      body: JSON.stringify({
        chapterNo: el.chapterNo.value,
        title: el.chapterTitle.value.trim(),
        item
      })
    });
    const current = state.memoryRecallResult || { title: el.chapterTitle.value.trim(), recalledMemory: {} };
    state.memoryRecallResult = {
      ...current,
      recalledMemory: {
        ...(current.recalledMemory || {}),
        pinned: data.pins || []
      }
    };
    renderMemoryRecallResult(state.memoryRecallResult);
    setStatus(`已钉选为本章必读：${item.label || item.id}`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function unpinMemoryRecallItem(key) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const item = state.memoryRecallCandidates[key];
  if (!item) return setStatus("没有找到可取消的钉选条目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/memory-pins`, {
      method: "DELETE",
      body: JSON.stringify({
        chapterNo: el.chapterNo.value,
        title: el.chapterTitle.value.trim(),
        ...item
      })
    });
    const current = state.memoryRecallResult || { title: el.chapterTitle.value.trim(), recalledMemory: {} };
    state.memoryRecallResult = {
      ...current,
      recalledMemory: {
        ...(current.recalledMemory || {}),
        pinned: data.pins || []
      }
    };
    renderMemoryRecallResult(state.memoryRecallResult);
    setStatus(`已取消本章必读：${item.label || item.id}`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function excludeMemoryRecallItem(key) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const item = state.memoryRecallCandidates[key];
  if (!item) return setStatus("没有找到可排除的召回条目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/memory-exclusions`, {
      method: "POST",
      body: JSON.stringify({
        chapterNo: el.chapterNo.value,
        title: el.chapterTitle.value.trim(),
        item
      })
    });
    const current = state.memoryRecallResult || { title: el.chapterTitle.value.trim(), recalledMemory: {} };
    state.memoryRecallResult = {
      ...current,
      recalledMemory: {
        ...(current.recalledMemory || {}),
        excluded: data.exclusions || []
      }
    };
    renderMemoryRecallResult(state.memoryRecallResult);
    setStatus(`已设为本章不读：${item.label || item.id}`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function unexcludeMemoryRecallItem(key) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const item = state.memoryRecallCandidates[key];
  if (!item) return setStatus("没有找到可取消排除的条目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/memory-exclusions`, {
      method: "DELETE",
      body: JSON.stringify({
        chapterNo: el.chapterNo.value,
        title: el.chapterTitle.value.trim(),
        ...item
      })
    });
    const current = state.memoryRecallResult || { title: el.chapterTitle.value.trim(), recalledMemory: {} };
    state.memoryRecallResult = {
      ...current,
      recalledMemory: {
        ...(current.recalledMemory || {}),
        excluded: data.exclusions || []
      }
    };
    renderMemoryRecallResult(state.memoryRecallResult);
    setStatus(`已恢复本章召回：${item.label || item.id}`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function renderMemoryRecallPinned(items = []) {
  const rows = (items || []).slice(0, 12);
  return `
    <div class="recall-group recall-pinned">
      <strong>本章必读</strong>
      ${rows.length ? rows.map((item, index) => {
        const key = memoryRecallPinKey(item.type || "pinned", item, index);
        state.memoryRecallCandidates[key] = item;
        return `
          <div class="recall-item">
            <span>${escapeHtml(memoryRecallItemLabel(item.type))} · ${escapeHtml(item.label || item.id || "")}</span>
            <p>${escapeHtml(item.text || "")}</p>
            <div class="recall-actions">
              <button type="button" data-memory-unpin="${escapeAttr(key)}">取消钉选</button>
            </div>
          </div>
        `;
      }).join("") : `<em>暂无钉选。可在下方召回结果里把关键条目设为本章必读。</em>`}
    </div>
  `;
}

function renderMemoryRecallExcluded(items = []) {
  const rows = (items || []).slice(0, 12);
  return `
    <div class="recall-group recall-excluded">
      <strong>本章不读</strong>
      ${rows.length ? rows.map((item, index) => {
        const key = memoryRecallPinKey(item.type || "excluded", item, index);
        state.memoryRecallCandidates[key] = item;
        return `
          <div class="recall-item">
            <span>${escapeHtml(memoryRecallItemLabel(item.type))} · ${escapeHtml(item.label || item.id || "")}</span>
            <p>${escapeHtml(item.text || "")}</p>
            <div class="recall-actions">
              <button type="button" data-memory-unexclude="${escapeAttr(key)}">取消排除</button>
            </div>
          </div>
        `;
      }).join("") : `<em>暂无排除。可在下方召回结果里把不适合本章的条目标为本章不读。</em>`}
    </div>
  `;
}

function memoryRecallMatchesControl(type, item = {}, control = {}) {
  if (control.type !== type) return false;
  const candidates = [item.id, item.name, item.label, item.thread, item.promise, item.question].filter(Boolean).map(String);
  if (control.id && candidates.includes(String(control.id))) return true;
  if (control.label && candidates.includes(String(control.label))) return true;
  const itemText = String(item.text || item.name || item.id || "");
  const controlText = String(control.text || "").slice(0, 120);
  return Boolean(controlText && itemText.includes(controlText));
}

function filterMemoryRecallItems(type, items = [], excluded = []) {
  return (items || []).filter((item) => !excluded.some((control) => memoryRecallMatchesControl(type, item, control)));
}

function renderMemoryRecallGroup(title, type, items = [], emptyText = "暂无命中") {
  const rows = (items || []).slice(0, 4);
  return `
    <div class="recall-group">
      <strong>${escapeHtml(title)}</strong>
      ${rows.length ? rows.map((item, index) => {
        const key = memoryRecallPinKey(type, item, index);
        state.memoryRecallCandidates[key] = memoryRecallPinPayload(type, item, index);
        return `
        <div class="recall-item">
          <span>${escapeHtml((item.hits || []).join(" / ") || `score ${item.score || 0}`)}</span>
          <p>${escapeHtml(item.name || item.text || item.id || "")}</p>
          <div class="recall-actions">
            <button type="button" data-memory-pin="${escapeAttr(key)}">钉选本章</button>
            <button type="button" data-memory-exclude="${escapeAttr(key)}">排除本章</button>
          </div>
        </div>
      `;
      }).join("") : `<em>${escapeHtml(emptyText)}</em>`}
    </div>
  `;
}

function renderMemoryRecallResult(data = null) {
  if (!el.memoryRecallPanel) return;
  if (!state.activeProject) {
    el.memoryRecallPanel.textContent = "选择项目后可预览本章召回";
    el.memoryRecallPanel.classList.add("muted");
    return;
  }
  if (!data) {
    el.memoryRecallPanel.textContent = "点击“预览本章召回”，查看 AI 写作前会读取的关键记忆。";
    el.memoryRecallPanel.classList.add("muted");
    return;
  }
  const recall = data.recalledMemory || {};
  const excluded = recall.excluded || [];
  const ranked = Object.fromEntries(Object.entries(recall.ranked || {}).map(([type, items]) => [type, filterMemoryRecallItems(type, items, excluded)]));
  state.memoryRecallCandidates = {};
  el.memoryRecallPanel.classList.remove("muted");
  el.memoryRecallPanel.innerHTML = `
    <div class="recall-summary">
      <strong>${escapeHtml(data.title || "本章召回")}</strong>
      <span>关键词：${escapeHtml((recall.keywords || []).slice(0, 10).join(" / ") || "无")}</span>
    </div>
    ${renderMemoryRecallPinned(recall.pinned)}
    ${renderMemoryRecallExcluded(excluded)}
    ${renderMemoryRecallGroup("人物状态", "characters", ranked.characters)}
    ${renderMemoryRecallGroup("伏笔", "foreshadows", ranked.foreshadows)}
    ${renderMemoryRecallGroup("剧情线程", "plotThreads", ranked.plotThreads)}
    ${renderMemoryRecallGroup("读者承诺", "readerPromises", ranked.readerPromises)}
    ${renderMemoryRecallGroup("相似章节", "similarChapters", ranked.similarChapters)}
    ${renderMemoryRecallGroup("情绪记录", "emotionBeats", ranked.emotionBeats)}
    <div class="recall-group">
      <strong>文风档案</strong>
      <p>${escapeHtml(recall.styleImitation?.profile?.rhythm || recall.styleImitation?.profileFile || "暂无文风档案")}</p>
    </div>
  `;
  for (const button of el.memoryRecallPanel.querySelectorAll("[data-memory-pin]")) {
    button.addEventListener("click", () => pinMemoryRecallItem(button.dataset.memoryPin));
  }
  for (const button of el.memoryRecallPanel.querySelectorAll("[data-memory-exclude]")) {
    button.addEventListener("click", () => excludeMemoryRecallItem(button.dataset.memoryExclude));
  }
  for (const button of el.memoryRecallPanel.querySelectorAll("[data-memory-unpin]")) {
    button.addEventListener("click", () => unpinMemoryRecallItem(button.dataset.memoryUnpin));
  }
  for (const button of el.memoryRecallPanel.querySelectorAll("[data-memory-unexclude]")) {
    button.addEventListener("click", () => unexcludeMemoryRecallItem(button.dataset.memoryUnexclude));
  }
}

function renderVersions() {
  if (!el.versionPanel) return;
  if (!state.activeProject) {
    el.versionPanel.textContent = "选择项目后显示历史版本";
    el.versionPanel.classList.add("muted");
    return;
  }
  if (!state.versions.length) {
    el.versionPanel.textContent = "暂无历史版本";
    el.versionPanel.classList.add("muted");
    return;
  }
  el.versionPanel.classList.remove("muted");
  el.versionPanel.innerHTML = "";
  for (const version of state.versions.slice(0, 8)) {
    const row = document.createElement("div");
    row.className = "version-row";
    row.innerHTML = `
      <strong title="${escapeAttr(version.file)}">${escapeHtml(version.file.split("/").at(-1))}</strong>
      <span>${escapeHtml(version.chars || 0)} 字</span>
      <div></div>
    `;
    const actions = row.querySelector("div");
    const open = document.createElement("button");
    open.type = "button";
    open.textContent = "打开";
    open.addEventListener("click", () => openFileByPath(version.file));
    actions.appendChild(open);
    if (state.activeFile && state.activeFile.startsWith("01_正文/") && !state.activeFile.startsWith("01_正文/历史版本/")) {
      const diff = document.createElement("button");
      diff.type = "button";
      diff.textContent = "对照";
      diff.addEventListener("click", () => diffVersion(version.file));
      actions.appendChild(diff);
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "恢复";
      restore.addEventListener("click", () => restoreVersion(version.file));
      actions.appendChild(restore);
    }
    el.versionPanel.appendChild(row);
  }
}

async function refreshVersions() {
  if (!state.activeProject) return;
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/versions`);
    state.versions = data.versions || [];
    renderVersions();
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function compareLatestVersion() {
  if (!state.activeFile || !state.activeFile.startsWith("01_正文/") || state.activeFile.startsWith("01_正文/历史版本/")) {
    return setStatus("请先打开一个正文文件。", "error");
  }
  await refreshVersions();
  const currentBase = state.activeFile.split("/").at(-1).replace(/\.(md|txt)$/i, "");
  const normalizedBase = currentBase.replace(/^第(\d+)章_/, (_, no) => `第${String(Number(no)).padStart(3, "0")}章_`);
  const latest = state.versions.find((item) => item.file.includes(normalizedBase))
    || state.versions.find((item) => item.file.includes(currentBase))
    || state.versions[0];
  if (!latest) return setStatus("还没有可对照的历史版本。", "error");
  await diffVersion(latest.file);
}

async function workflowPost(path, body, successMessage, target = "revision") {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/${path}`, {
      method: "POST",
      body: JSON.stringify(body || {})
    });
    if (data.project) {
      state.activeProject = data.project;
      state.files = data.project.files || [];
      state.chapters = data.project.chapters || [];
      state.snapshots = data.project.snapshots || [];
    }
    state.workflowResult = { ...data, target, title: successMessage, message: data.file || data.taskFile || data.reportFile || data.revisionFile || "" };
    renderProjects();
    renderFiles();
    renderProjectMeta();
    renderProjectStats();
    renderChapterBoard();
    renderSnapshots();
    renderWorkflowResult();
    await refreshVersions();
    await refreshTaskCenter();
    setStatus(successMessage);
    return data;
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function createRevisionTaskFromReport() {
  await workflowPost("revision-task", {
    reportFile: state.qualityReport?.reportFile || "",
    chapterNo: el.chapterNo.value,
    file: state.activeFile,
    note: el.revisionNote?.value.trim() || ""
  }, "修订任务单已生成。");
}

async function runRevisionWorkflow() {
  const runner = el.pipelineRunner?.value || "codex";
  await workflowPost("revision-run", {
    chapterNo: el.chapterNo.value,
    file: state.activeFile,
    runner,
    model: el.modelName.value.trim(),
    endpoint: el.endpoint.value.trim(),
    apply: false
  }, runner === "codex" ? "Codex 修订任务已启动。" : "修订稿已生成。");
}

async function runBatchQuality() {
  await workflowPost("batch", {
    task: "quality",
    from: el.batchFrom?.value || "",
    to: el.batchTo?.value || ""
  }, "批量质检报告已生成。");
}

async function analyzeConflicts() {
  await workflowPost("conflicts", {}, "记忆冲突报告已生成。");
}

async function createConflictRepairPlan(conflict) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  if (!conflict) return setStatus("没有可生成方案的记忆冲突。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/conflicts/repair-plan`, {
      method: "POST",
      body: JSON.stringify({ conflict })
    });
    state.workflowResult = {
      ...state.workflowResult,
      ...data,
      target: "revision",
      title: "记忆冲突修复方案已生成",
      message: data.plan?.title || "可在当前卡片中应用修复。"
    };
    renderWorkflowResult();
    setStatus("记忆冲突修复方案已生成。");
    return data;
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function applyConflictRepair(conflict) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  if (!conflict) return setStatus("没有可应用的记忆冲突修复。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/conflicts/apply`, {
      method: "POST",
      body: JSON.stringify({ conflict })
    });
    if (data.project) {
      state.activeProject = data.project;
      state.files = data.project.files || [];
      state.chapters = data.project.chapters || [];
      state.snapshots = data.project.snapshots || [];
    }
    state.workflowResult = {
      ...data,
      target: "revision",
      title: "记忆冲突已修复",
      message: `已创建安全快照，并生成修复报告：${data.reportFile || ""}`
    };
    renderProjects();
    renderFiles();
    renderProjectMeta();
    renderProjectStats();
    renderChapterBoard();
    renderSnapshots();
    renderWorkflowResult();
    await refreshVersions();
    await refreshTaskCenter();
    await loadStoryBible();
    setStatus("记忆冲突修复已应用，修复前状态已保存为安全快照。");
    return data;
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function generatePublishMaterials() {
  await workflowPost("publish-materials", {
    platform: el.publishPlatform?.value.trim() || "通用",
    from: el.batchFrom?.value || "",
    to: el.batchTo?.value || ""
  }, "发布资料包已生成。");
}

async function runFinalPublishCheck() {
  await workflowPost("publish-final-check", {
    platform: el.publishPlatform?.value.trim() || "通用"
  }, "发布前总检查已生成。");
}

async function createReleaseBackup() {
  await workflowPost("release-backup", {}, "完整备份包已创建。");
}

async function generateReleasePackage() {
  await workflowPost("release-package", {
    platform: el.publishPlatform?.value.trim() || "通用",
    from: el.batchFrom?.value || "",
    to: el.batchTo?.value || ""
  }, "发布包清单已生成。");
}

async function generateReleaseNotes() {
  await workflowPost("release-notes", {}, "安装包发布说明已生成。");
}

async function saveCurrentModelPreset() {
  await workflowPost("model-presets", {
    name: `${el.pipelineRunner.value}-${el.modelName.value || "codex"}`,
    runner: el.pipelineRunner.value,
    model: el.modelName.value.trim(),
    endpoint: el.endpoint.value.trim(),
    task: "当前配置"
  }, "模型预设已保存。", "maintenance");
}

async function cloneCurrentProject() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const name = `${state.activeProject.name}_副本_${new Date().toISOString().slice(0, 10)}`;
  const data = await workflowPost("clone", { name }, "项目已克隆。", "maintenance");
  if (data?.project?.id) {
    await loadProjects();
  }
}

async function exportPortableProject() {
  await workflowPost("portable-export", {}, "项目迁移包已生成。", "maintenance");
}

async function repairMemoryJson() {
  await workflowPost("memory-repair", {}, "记忆 JSON 自动修复已完成。", "maintenance");
}

async function runProjectIntegrityCheck() {
  await workflowPost("integrity-check", {}, "项目损坏诊断已生成。", "maintenance");
}

async function diffVersion(versionFile) {
  if (!state.activeFile) return setStatus("请先打开一个正文文件。", "error");
  const data = await workflowPost("versions/diff", { file: state.activeFile, versionFile }, "版本对照已生成。");
  const lines = (data?.diff || []).slice(0, 8).map((row) => `#${row.index} ${row.status}\n- 当前：${row.before?.slice(0, 80) || ""}\n- 版本：${row.after?.slice(0, 80) || ""}`).join("\n\n");
  state.workflowResult = { target: "revision", title: "版本对照", message: lines || "没有差异" };
  renderWorkflowResult();
}

async function restoreVersion(versionFile) {
  if (!state.activeFile) return setStatus("请先打开一个正文文件。", "error");
  if (!confirm("恢复历史版本会覆盖当前正文，系统会先创建快照和当前版本备份。继续吗？")) return;
  await workflowPost("versions/restore", { versionFile, targetFile: state.activeFile }, "章节历史版本已恢复。");
}

function syncStatusLabel(status) {
  return {
    applied: "已应用",
    needs_review: "需复核",
    failed: "失败",
    pending_review: "待审核",
    pending: "未完成"
  }[status] || status || "未知";
}

const FLOW_STAGES = [
  ["compile_intent", "意图"],
  ["compile_context", "上下文"],
  ["compile_rule_stack", "规则栈"],
  ["plan", "规划"],
  ["orchestrate", "编排"],
  ["write", "写作"],
  ["audit", "审计"],
  ["revise", "修订"],
  ["state_sync", "同步"]
];

function flowStageStatus(review, stageName) {
  if (stageName === "state_sync") return review.status || "pending";
  if (review.failedStage === stageName) return "failed";
  if (review.status === "failed") {
    const failedIndex = FLOW_STAGES.findIndex(([name]) => name === review.failedStage);
    const currentIndex = FLOW_STAGES.findIndex(([name]) => name === stageName);
    if (failedIndex >= 0 && currentIndex > failedIndex) return "pending";
  }
  if (["compile_intent", "compile_context", "compile_rule_stack"].includes(stageName)) return "completed";
  if (review.status === "applied") return "completed";
  if (review.status === "needs_review" || review.status === "pending_review") {
    return ["plan", "orchestrate", "write", "audit", "revise"].includes(stageName) ? "completed" : "needs_review";
  }
  return "pending";
}

function flowStageFile(review, stageName) {
  const files = {
    compile_intent: `${review.runtimeDir}/intent.md`,
    compile_context: `${review.runtimeDir}/context.json`,
    compile_rule_stack: `${review.runtimeDir}/rule-stack.yaml`,
    plan: `${review.runtimeDir}/plan.md`,
    orchestrate: `${review.runtimeDir}/orchestration.md`,
    write: `${review.runtimeDir}/draft.md`,
    audit: `${review.runtimeDir}/audit.md`,
    revise: review.revisionFile || `${review.runtimeDir}/revision.md`,
    state_sync: review.stateSyncFile || review.reportFile || `${review.runtimeDir}/trace.json`
  };
  return files[stageName];
}

function flowStageDetailKey(review, stageName) {
  if (stageName === "state_sync" && !(review.stateSyncFile && state.files.includes(review.stateSyncFile))) {
    return "trace";
  }
  return FLOW_STAGE_DETAIL_TABS[stageName];
}

function runDetailFile(review, fileName) {
  return `${review.runtimeDir}/${fileName}`;
}

async function showRunDetailTab(review, tabKey) {
  const tab = RUN_DETAIL_TABS.find(([key]) => key === tabKey) || RUN_DETAIL_TABS[0];
  const file = runDetailFile(review, tab[2]);
  const viewer = el.runDetailPanel.querySelector(".run-detail-viewer");
  const openButton = el.runDetailPanel.querySelector("[data-run-detail-open]");
  for (const button of el.runDetailPanel.querySelectorAll("[data-run-detail-tab]")) {
    button.classList.toggle("active", button.dataset.runDetailTab === tab[0]);
  }
  if (openButton) {
    openButton.disabled = !state.files.includes(file);
    openButton.onclick = () => openFileByPath(file);
  }
  if (!viewer) return;
  if (!state.files.includes(file)) {
    viewer.textContent = `还没有生成：${file}`;
    viewer.classList.add("muted");
    return;
  }
  viewer.classList.remove("muted");
  viewer.textContent = "正在读取...";
  try {
    const content = await readProjectFileContent(file);
    viewer.textContent = content || "空文件";
  } catch (error) {
    viewer.textContent = error.message;
    viewer.classList.add("muted");
  }
}

function renderRunDetail(review) {
  if (!review) {
    el.runDetailPanel.textContent = "暂无运行详情";
    el.runDetailPanel.classList.add("muted");
    return;
  }
  el.runDetailPanel.classList.remove("muted");
  el.runDetailPanel.innerHTML = `
    <div class="run-detail-head">
      <strong>${escapeHtml(review.runtimeDir)}</strong>
      <button type="button" data-run-detail-open>打开当前</button>
    </div>
    <div class="run-detail-tabs"></div>
    <pre class="run-detail-viewer">选择标签查看运行产物</pre>
  `;
  const tabs = el.runDetailPanel.querySelector(".run-detail-tabs");
  for (const [key, label, fileName] of RUN_DETAIL_TABS) {
    const file = runDetailFile(review, fileName);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.runDetailTab = key;
    button.textContent = label;
    button.disabled = !state.files.includes(file);
    button.addEventListener("click", () => showRunDetailTab(review, key));
    tabs.appendChild(button);
  }
  const firstAvailable = RUN_DETAIL_TABS.find(([, , fileName]) => state.files.includes(runDetailFile(review, fileName))) || RUN_DETAIL_TABS[0];
  showRunDetailTab(review, firstAvailable[0]);
}

function renderPipelineFlow() {
  const reviews = state.activeProject?.syncReviews || [];
  if (state.activeSyncReviewIndex >= reviews.length) state.activeSyncReviewIndex = 0;
  const review = reviews[state.activeSyncReviewIndex];
  if (!review) {
    el.pipelineFlow.textContent = "暂无流程图";
    el.pipelineFlow.classList.add("muted");
    renderRunDetail(null);
    return;
  }
  renderRunDetail(review);
  el.pipelineFlow.classList.remove("muted");
  el.pipelineFlow.innerHTML = "";
  const meta = document.createElement("div");
  meta.className = "flow-meta";
  meta.innerHTML = `<strong>${escapeHtml(review.task || "pipeline")}</strong><span>${escapeHtml(syncStatusLabel(review.status))}</span>`;
  if (reviews.length > 1) {
    const select = document.createElement("select");
    select.className = "flow-select";
    select.setAttribute("aria-label", "选择运行记录");
    reviews.forEach((item, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${index + 1}. ${syncStatusLabel(item.status)} · ${item.generatedAt || item.runtimeDir}`;
      select.appendChild(option);
    });
    select.value = String(state.activeSyncReviewIndex);
    select.addEventListener("change", () => {
      state.activeSyncReviewIndex = Number(select.value) || 0;
      renderSyncReviews();
    });
    meta.appendChild(select);
  }
  el.pipelineFlow.appendChild(meta);
  if (review.error) {
    const error = document.createElement("div");
    error.className = "flow-error";
    error.textContent = review.error;
    el.pipelineFlow.appendChild(error);
  }
  const rail = document.createElement("div");
  rail.className = "flow-rail";
  for (const [stageName, label] of FLOW_STAGES) {
    const status = flowStageStatus(review, stageName);
    const file = flowStageFile(review, stageName);
    const node = document.createElement("button");
    node.type = "button";
    node.className = `flow-node ${status}`;
    node.innerHTML = `<span></span><strong>${escapeHtml(label)}</strong>`;
    node.title = file;
    node.disabled = !(file && state.files.includes(file));
    node.addEventListener("click", () => {
      const detailTab = flowStageDetailKey(review, stageName);
      if (detailTab) showRunDetailTab(review, detailTab);
    });
    rail.appendChild(node);
  }
  el.pipelineFlow.appendChild(rail);
}

function renderSyncReviews() {
  const reviews = state.activeProject?.syncReviews || [];
  renderPipelineFlow();
  if (!reviews.length) {
    el.syncReviewPanel.textContent = "暂无同步记录";
    el.syncReviewPanel.classList.add("muted");
    return;
  }
  el.syncReviewPanel.classList.remove("muted");
  el.syncReviewPanel.innerHTML = "";
  reviews.forEach((review, index) => {
    const card = document.createElement("div");
    card.className = `sync-card ${review.status || "pending"} ${index === state.activeSyncReviewIndex ? "active" : ""}`;
    const detail = review.error || review.runtimeDir;
    card.innerHTML = `
      <div class="sync-card-head">
        <span>${escapeHtml(syncStatusLabel(review.status))}</span>
        <strong>${escapeHtml(review.task || "pipeline")}</strong>
      </div>
      <p title="${escapeAttr(detail)}">${escapeHtml(detail)}</p>
      <div class="sync-actions"></div>
    `;
    const actions = card.querySelector(".sync-actions");
    const viewFlow = document.createElement("button");
    viewFlow.type = "button";
    viewFlow.textContent = "查看流程";
    viewFlow.addEventListener("click", () => {
      state.activeSyncReviewIndex = index;
      renderSyncReviews();
    });
    actions.appendChild(viewFlow);
    if (review.stateSyncFile || review.reportFile) {
      const reviewButton = document.createElement("button");
      reviewButton.type = "button";
      reviewButton.textContent = "审核同步";
      reviewButton.addEventListener("click", () => openSyncReview(review, index));
      actions.appendChild(reviewButton);
    }
    const actionFiles = [
      ["trace", review.traceFile],
      ["报告", review.reportFile],
      ["同步", review.stateSyncFile],
      ["终稿", review.revisionFile]
    ].filter(([, file]) => file && state.files.includes(file));
    for (const [label, file] of actionFiles) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => openFileByPath(file));
      actions.appendChild(button);
    }
    el.syncReviewPanel.appendChild(card);
  });
  if (state.activeSyncReview) {
    el.syncReviewPanel.appendChild(renderSyncReviewEditor());
  }
}

async function openSyncReview(review, index) {
  if (!state.activeProject) return;
  setStatus("正在读取状态同步建议...");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/sync-review?runtimeDir=${encodeURIComponent(review.runtimeDir)}`);
    state.activeSyncReviewIndex = index;
    state.activeSyncReview = data;
    state.activeSyncPreview = null;
    renderSyncReviews();
    setStatus("状态同步建议已载入。勾选确认后再应用到长期记忆。");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function renderSyncReviewEditor() {
  const review = state.activeSyncReview;
  const box = document.createElement("div");
  box.className = "sync-review-editor";
  box.innerHTML = `
    <div class="sync-review-editor-head">
      <strong>人工审核</strong>
      <span title="${escapeAttr(review.sourceFile)}">${escapeHtml(review.sourceFile)}</span>
    </div>
    <div class="sync-review-items"></div>
    <div class="sync-review-ops">
      <button type="button" data-sync-select-all>全选</button>
      <button type="button" data-sync-select-none>清空</button>
      <button type="button" data-sync-preview>预览差异</button>
      <button type="button" data-sync-apply>应用选中</button>
    </div>
    <div class="sync-diff-preview"></div>
  `;
  const items = box.querySelector(".sync-review-items");
  for (const item of review.items || []) {
    const group = document.createElement("div");
    group.className = `sync-review-item ${item.available ? "" : "disabled"}`;
    group.innerHTML = `
      <label class="sync-review-category">
        <input type="checkbox" data-sync-category value="${escapeAttr(item.id)}" ${item.selected ? "checked" : ""} ${item.available ? "" : "disabled"} />
        <span>
          <strong>${escapeHtml(item.label)} <em>${escapeHtml(item.count || 0)}</em></strong>
          <small>${escapeHtml(item.target)}</small>
          <code>${escapeHtml(item.summary || "")}</code>
        </span>
      </label>
      <div class="sync-review-children"></div>
    `;
    const categoryInput = group.querySelector("[data-sync-category]");
    const children = group.querySelector(".sync-review-children");
    for (const entry of item.entries || []) {
      const child = document.createElement("label");
      child.className = "sync-review-child";
      child.innerHTML = `
        <input type="checkbox" data-sync-leaf value="${escapeAttr(entry.id)}" ${item.selected ? "checked" : ""} />
        <span>
          <strong>${escapeHtml(entry.label)}</strong>
          <code>${escapeHtml(entry.summary || "")}</code>
        </span>
      `;
      child.querySelector("input").addEventListener("change", () => {
        const leafInputs = [...group.querySelectorAll("[data-sync-leaf]")];
        categoryInput.checked = leafInputs.length > 0 && leafInputs.every((input) => input.checked);
        state.activeSyncPreview = null;
        renderSyncDiffPreview(box);
      });
      children.appendChild(child);
    }
    categoryInput.addEventListener("change", () => {
      for (const input of group.querySelectorAll("[data-sync-leaf]")) input.checked = categoryInput.checked;
      state.activeSyncPreview = null;
      renderSyncDiffPreview(box);
    });
    items.appendChild(group);
  }
  box.querySelector("[data-sync-select-all]").addEventListener("click", () => {
    for (const input of box.querySelectorAll("input[type='checkbox']:not(:disabled)")) input.checked = true;
    state.activeSyncPreview = null;
    renderSyncDiffPreview(box);
  });
  box.querySelector("[data-sync-select-none]").addEventListener("click", () => {
    for (const input of box.querySelectorAll("input[type='checkbox']")) input.checked = false;
    state.activeSyncPreview = null;
    renderSyncDiffPreview(box);
  });
  box.querySelector("[data-sync-preview]").addEventListener("click", () => previewSelectedSyncReview(box));
  box.querySelector("[data-sync-apply]").addEventListener("click", () => applySelectedSyncReview(box));
  renderSyncDiffPreview(box);
  return box;
}

function selectedSyncReviewItemIds(box) {
  return [...box.querySelectorAll("[data-sync-leaf]:checked")].map((input) => input.value);
}

function renderSyncDiffPreview(box) {
  const panel = box.querySelector(".sync-diff-preview");
  if (!panel) return;
  const preview = state.activeSyncPreview;
  if (!preview?.targets?.length) {
    panel.classList.add("muted");
    panel.textContent = "应用前可先预览差异：会列出目标文件、追加/合并方式和写入前后数量。";
    return;
  }
  panel.classList.remove("muted");
  panel.innerHTML = `
    <div class="sync-diff-head">
      <strong>写入前差异预览</strong>
      <span>${escapeHtml(preview.targetCount || preview.targets.length)} 个目标文件</span>
    </div>
    <div class="sync-diff-list">
      ${preview.targets.map((item) => `
        <div class="sync-diff-row ${escapeAttr(item.operation || "")}">
          <strong>${escapeHtml(item.label || item.id)}</strong>
          <span>${escapeHtml(item.target)}</span>
          <em>${escapeHtml(item.operation === "append-markdown" ? "追加 Markdown" : "合并 JSON")} · ${escapeHtml(item.beforeCount)} -> ${escapeHtml(item.afterCount)} · +${escapeHtml(item.delta)}</em>
          <code>${escapeHtml(item.summary || "")}</code>
        </div>
      `).join("")}
    </div>
  `;
}

async function previewSelectedSyncReview(box) {
  if (!state.activeProject || !state.activeSyncReview) return;
  const itemIds = selectedSyncReviewItemIds(box);
  if (!itemIds.length) return setStatus("请至少勾选一项同步内容。", "error");
  setStatus("正在预览状态同步差异...");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/sync-review/preview`, {
      method: "POST",
      body: JSON.stringify({
        runtimeDir: state.activeSyncReview.runtimeDir,
        itemIds
      })
    });
    state.activeSyncPreview = data.preview;
    renderSyncDiffPreview(box);
    setStatus(`差异预览完成：${data.preview?.targetCount || 0} 个目标文件。`);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function applySelectedSyncReview(box) {
  if (!state.activeProject || !state.activeSyncReview) return;
  const itemIds = selectedSyncReviewItemIds(box);
  if (!itemIds.length) return setStatus("请至少勾选一项同步内容。", "error");
  setBusy(true);
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/sync-review/apply`, {
      method: "POST",
      body: JSON.stringify({
        runtimeDir: state.activeSyncReview.runtimeDir,
        itemIds
      })
    });
    state.activeProject = data.project;
    state.files = data.project.files || [];
    state.chapters = data.project.chapters || [];
    state.snapshots = data.project.snapshots || [];
    state.activeSyncReview = null;
    state.activeSyncPreview = null;
    renderProjects();
    renderFiles();
    renderProjectMeta();
    renderProjectStats();
    renderChapterBoard();
    renderSnapshots();
    renderSyncReviews();
    setStatus(`状态同步已应用。应用前快照：${data.safetySnapshot?.id || "已创建"}`);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function runDoctor(showStatus = true) {
  if (!state.activeProject) return;
  if (showStatus) setStatus("正在诊断项目配置。");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/doctor`);
    state.doctor = data.doctor;
    renderDoctor(data.doctor);
    const mode = el.pipelineRunner?.value || "codex";
    const coreFilesOk = !data.doctor.missingCoreFiles?.length;
    const doctorOk = mode === "model"
      ? Boolean(data.doctor.modelEndpoint?.ok) && coreFilesOk
      : data.doctor.summaryOk;
    if (showStatus) setStatus(doctorOk ? "配置诊断通过。" : "配置诊断发现需要关注的问题。");
  } catch (error) {
    el.doctorPanel.textContent = error.message;
    el.doctorPanel.classList.add("muted");
    if (showStatus) setStatus(error.message, "error");
  }
}

async function runMemorySchemaCheck() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/memory-schema-check`);
    if (el.diagnosticsPanel) {
      el.diagnosticsPanel.classList.remove("muted");
      el.diagnosticsPanel.innerHTML = `
        <div class="doctor-row ${data.ok ? "ok" : "warn"}">
          <span>${data.ok ? "✓" : "!"}</span>
          <strong>长期记忆校验</strong>
          <em>${escapeHtml(data.ok ? "通过" : "需处理")}</em>
        </div>
        ${(data.files || []).map((item) => `
          <div class="doctor-row ${item.ok ? "ok" : "warn"}">
            <span>${item.ok ? "✓" : "!"}</span>
            <strong>${escapeHtml(item.file)}</strong>
            <em>${escapeHtml((item.issues || []).join("；") || "通过")}</em>
          </div>
        `).join("")}
      `;
    }
    setStatus(data.ok ? "长期记忆校验通过。" : "长期记忆校验发现需要处理的问题。");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function generateDiagnosticsReport() {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const data = await workflowPost("diagnostics-report", {}, "故障诊断报告已生成。", "maintenance");
  if (el.diagnosticsPanel && data?.reportFile) {
    el.diagnosticsPanel.classList.remove("muted");
    el.diagnosticsPanel.innerHTML = `
      <div class="doctor-row ${data.memory?.ok ? "ok" : "warn"}">
        <span>${data.memory?.ok ? "✓" : "!"}</span>
        <strong>故障诊断报告</strong>
        <em>${escapeHtml(data.reportFile)}</em>
      </div>
    `;
  }
}

function renderDoctor(doctor) {
  el.doctorPanel.classList.remove("muted");
  const mode = el.pipelineRunner?.value || "codex";
  const rows = mode === "model"
    ? [
        ["执行方式", true, "本地模型接口"],
        ["本地模型接口", doctor.modelEndpoint?.ok, doctor.modelEndpoint?.message || "未检查"],
        ["核心文件", !doctor.missingCoreFiles?.length, doctor.missingCoreFiles?.length ? `缺 ${doctor.missingCoreFiles.length} 个` : "齐全"]
      ]
    : [
        ["执行方式", true, "Codex 直连"],
        ["Codex 命令", doctor.codexCommand, doctor.codexCommand ? "可用" : "未找到 codex"],
        ["小说技能", doctor.novelSkillAvailable, doctor.novelSkillAvailable ? "已找到" : "未找到 novel-writing-polisher"],
        ["Codex 模型", Boolean(doctor.codexModel), `${doctor.codexProvider || "-"} / ${doctor.codexModel || "-"}`],
        ["核心文件", !doctor.missingCoreFiles?.length, doctor.missingCoreFiles?.length ? `缺 ${doctor.missingCoreFiles.length} 个` : "齐全"]
      ];
  el.doctorPanel.innerHTML = rows.map(([label, ok, detail]) => {
    return `<div class="doctor-row ${ok ? "ok" : "warn"}"><span>${ok ? "✓" : "!"}</span><strong>${escapeHtml(label)}</strong><em>${escapeHtml(detail)}</em></div>`;
  }).join("");
}

async function setReviewStatus(status) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  try {
    const data = await api(`/api/projects/${encodeURIComponent(state.activeProject.id)}/meta`, {
      method: "POST",
      body: JSON.stringify({ reviewStatus: status })
    });
    state.activeProject = { ...state.activeProject, ...data.project };
    renderProjectMeta();
    renderProjectStats();
    setStatus("审核状态已更新。");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function openFileByPath(file) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  if (!state.files.includes(file)) return setStatus(`项目里还没有这个文件：${file}`, "error");
  state.activeFile = file;
  el.fileSelect.value = file;
  await loadSelectedFile();
}

async function openLatestByPrefix(prefix) {
  if (!state.activeProject) return setStatus("请先选择项目。", "error");
  const preferred = prefix === "08_资料投喂"
    ? state.files.filter((file) => file.startsWith(`${prefix}/投喂报告_`))
    : prefix === "09_运行时"
      ? state.files.filter((file) => file.startsWith(`${prefix}/`) && file.endsWith("/trace.json"))
    : state.files.filter((file) => file.startsWith(`${prefix}/`) && file.endsWith("_final.md"));
  const file = preferred.at(-1) || state.files.filter((item) => item.startsWith(`${prefix}/`)).at(-1);
  if (!file) return setStatus("还没有可打开的结果文件。", "error");
  await openFileByPath(file);
}

function on(node, event, handler) {
  if (node) node.addEventListener(event, handler);
}

on(el.refreshProjects, "click", loadProjects);
on(el.toggleLeftPane, "click", () => togglePane("left"));
on(el.toggleRightPane, "click", () => togglePane("right"));
on(el.toggleNewProject, "click", () => toggleNewProjectPanel());
on(el.toggleAiConfig, "click", () => toggleAiConfig());
on(el.toggleMoreTools, "click", () => toggleMoreTools());
on(el.pipelineRunner, "change", updateAiModeVisibility);
on(el.openProjectFolder, "click", openProjectFolder);
on(el.copyProjectPath, "click", copyProjectPath);
on(el.saveAiSettings, "click", saveAiSettings);
on(el.archiveAssistantSelect, "change", renderArchiveAssistantHint);
on(el.saveArchiveAssistant, "click", saveArchiveAssistant);
el.openArchiveAssistant.addEventListener("click", () => openFileByPath("05_提示词/档案助手.md"));
on(el.storyBibleSection, "change", renderStoryBible);
on(el.saveStoryBibleEntry, "click", saveStoryBibleEntry);
on(el.refreshStoryBible, "click", () => loadStoryBible(true));
on(el.runDoctor, "click", () => runDoctor(true));
on(el.runMemorySchemaCheck, "click", runMemorySchemaCheck);
on(el.generateDiagnosticsReport, "click", generateDiagnosticsReport);
on(el.createProject, "click", createProject);
on(el.createDemoProject, "click", createDemoProject);
on(el.fileSelect, "change", loadSelectedFile);
on(el.saveChapterPlan, "click", saveChapterPlan);
on(el.saveChapter, "click", saveChapter);
on(el.compareLatestVersion, "click", compareLatestVersion);
on(el.chapterBrief, "input", scheduleAutosave);
on(el.draft, "input", scheduleAutosave);
on(el.runGlobalSearch, "click", runGlobalSearch);
on(el.globalSearchInput, "keydown", (event) => {
  if (event.key === "Enter") runGlobalSearch();
});
on(el.refreshTaskCenter, "click", refreshTaskCenter);
on(el.taskKindFilter, "change", refreshTaskCenter);
on(el.taskStatusFilter, "change", refreshTaskCenter);
on(el.taskAutoRefresh, "change", setTaskAutoRefresh);
on(el.runNarrativeRadar, "click", runNarrativeRadar);
on(el.createSnapshot, "click", createSnapshot);
on(el.runQualityCheck, "click", runQualityCheck);
on(el.runAiQualityCheck, "click", runAiQualityCheck);
on(el.runProseQualityReview, "click", runProseQualityReview);
on(el.createRevisionTask, "click", createRevisionTaskFromReport);
on(el.runRevisionTask, "click", runRevisionWorkflow);
on(el.runBatchQuality, "click", runBatchQuality);
on(el.analyzeConflicts, "click", analyzeConflicts);
on(el.generatePublishMaterials, "click", generatePublishMaterials);
on(el.runFinalPublishCheck, "click", runFinalPublishCheck);
on(el.createReleaseBackup, "click", createReleaseBackup);
on(el.generateReleasePackage, "click", generateReleasePackage);
on(el.generateReleaseNotes, "click", generateReleaseNotes);
on(el.saveModelPreset, "click", saveCurrentModelPreset);
on(el.cloneProject, "click", cloneCurrentProject);
on(el.exportPortableProject, "click", exportPortableProject);
on(el.repairMemoryJson, "click", repairMemoryJson);
on(el.runProjectIntegrityCheck, "click", runProjectIntegrityCheck);
on(el.refreshVersions, "click", refreshVersions);
on(el.incubateIdea, "click", incubateIdea);
on(el.absorbKnowledge, "click", absorbKnowledge);
on(el.analyzeStyleProfile, "click", analyzeStyleProfile);
on(el.previewMemoryRecall, "click", previewMemoryRecall);
on(el.runPipeline, "click", runPipeline);
on(el.exportTxt, "click", () => exportProject("txt"));
on(el.exportMd, "click", () => exportProject("md"));
for (const button of document.querySelectorAll("[data-open-file]")) {
  button.addEventListener("click", () => openFileByPath(button.dataset.openFile));
}
for (const button of document.querySelectorAll("[data-open-latest]")) {
  button.addEventListener("click", () => openLatestByPrefix(button.dataset.openLatest));
}
for (const button of document.querySelectorAll("[data-review-status]")) {
  button.addEventListener("click", () => setReviewStatus(button.dataset.reviewStatus));
}
for (const button of document.querySelectorAll("[data-toolbox-group]")) {
  button.addEventListener("click", () => setToolboxGroup(button.dataset.toolboxGroup || "all"));
}

loadArchiveAssistants().catch((error) => setStatus(error.message, "error"));
loadProjects().catch((error) => setStatus(error.message, "error"));
loadCodexConfig();
loadLayoutState();
initializeToolPanels();
renderLayoutState();
updateAiModeVisibility();
setToolboxGroup(state.activeToolGroup || "write");
renderGlobalSearchResults();
renderTaskCenter();
renderTaskDetail();
renderNarrativeRadar();
renderStoryBible();
renderStyleProfileResult();
renderMemoryRecallResult();
setAutosaveStatus("自动保存待机");
