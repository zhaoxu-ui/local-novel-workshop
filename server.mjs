import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.join(ROOT, "projects");
const SNAPSHOTS_DIR = path.join(PROJECTS_DIR, ".snapshots");
const HOME_DIR = process.env.USERPROFILE || process.env.HOME || "";
const CODEX_HOME = process.env.CODEX_HOME || path.join(HOME_DIR, ".codex");
const CC_SWITCH_HOME = process.env.CC_SWITCH_HOME || path.join(HOME_DIR, ".cc-switch");
const HOST_PROJECTS_DIR = process.env.HOST_PROJECTS_DIR || "";
const IN_DOCKER = process.env.IN_DOCKER === "true";
const KNOWLEDGE_SOURCE_CHAR_LIMIT = 180000;

const TEXT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".csv", "text/csv; charset=utf-8"],
  [".yaml", "text/yaml; charset=utf-8"],
  [".yml", "text/yaml; charset=utf-8"]
]);

const ARCHIVE_ASSISTANTS = [
  {
    id: "general",
    name: "通用档案管家",
    tagline: "适合大多数新项目，重点维护总纲、人物、章节和发布资料。",
    keywords: [],
    focus: ["总纲一致性", "人物状态", "章节日志", "发布资料", "提示词能力"],
    duties: ["每次生成或修改后补齐章节日志", "发现设定冲突时写入未解决问题", "保持项目能力文件短而可执行"],
    guardrails: ["不凭空替作者解决长期悬念", "不把未经判断的资料直接写入能力包"]
  },
  {
    id: "web_serial",
    name: "网文连载档案官",
    tagline: "适合番茄/起点/七猫节奏，重点追踪爽点、追读钩子和章节承诺。",
    keywords: ["网文", "连载", "爽文", "番茄", "起点", "七猫", "都市", "玄幻", "修仙", "系统", "升级"],
    focus: ["章节承诺", "追读钩子", "爽点兑现", "升级节奏", "读者期待"],
    duties: ["记录每章新增承诺和兑现情况", "检查章节结尾是否有具体追读问题", "避免连续多章只有铺垫没有变化"],
    guardrails: ["不为追求爽点破坏人物动机", "不一次性解释完长期问题"]
  },
  {
    id: "mystery",
    name: "悬疑伏笔档案官",
    tagline: "适合悬疑、推理、怪谈、无限流，重点维护线索、误导和回收。",
    keywords: ["悬疑", "推理", "刑侦", "怪谈", "无限", "副本", "案件", "谜案", "诡异", "恐怖"],
    focus: ["线索链", "误导方向", "伏笔回收", "时间线", "证据一致性"],
    duties: ["把线索写入伏笔回收表", "区分读者已知和角色已知", "检查推理结论是否有证据支撑"],
    guardrails: ["不允许关键真相无证据空降", "不把所有谜底提前说透"]
  },
  {
    id: "relationship",
    name: "人物关系档案官",
    tagline: "适合言情、群像、都市情感，重点维护关系变化、情绪债和潜台词。",
    keywords: ["言情", "情感", "恋爱", "婚恋", "群像", "家庭", "救赎", "破镜", "暗恋", "女频"],
    focus: ["关系阶段", "情绪债", "误会与隐瞒", "说话习惯", "亲密度变化"],
    duties: ["记录每次关系推进或倒退", "检查情绪转折是否有场景支撑", "维护人物说话习惯和压力反应"],
    guardrails: ["不让人物突然变得过度正确", "不使用总结式心理替代冲突场景"]
  },
  {
    id: "worldbuilding",
    name: "世界观设定官",
    tagline: "适合玄幻、科幻、架空、赛博等设定密集项目。",
    keywords: ["世界观", "架空", "科幻", "赛博", "玄幻", "奇幻", "异能", "末世", "克苏鲁", "设定"],
    focus: ["规则边界", "代价系统", "组织势力", "地理场景", "技术或力量限制"],
    duties: ["记录新设定的使用条件和代价", "检查能力边界是否前后矛盾", "把场景和规则转化为冲突资源"],
    guardrails: ["不为方便剧情临时扩大能力", "不做说明书式设定倾倒"]
  },
  {
    id: "fanfic",
    name: "同人设定守门人",
    tagline: "适合同人或二创灵感项目，重点控制原作设定、原创剧情和合规边界。",
    keywords: ["同人", "动漫", "二创", "原作", "角色", "漫画", "游戏", "影视"],
    focus: ["原作设定边界", "原创主线", "角色口吻", "剧情差异点", "合规风险"],
    duties: ["区分原作信息、作者原创设定和临时猜想", "维护原创主线的独立冲突", "标记可能涉及照搬原作桥段的风险"],
    guardrails: ["不复刻原作长段剧情或台词", "不把受版权保护的独创表达当作可直接生成素材"]
  }
];

const NOVEL_SKILL_CANDIDATES = [
  {
    id: "novel-writing-polisher",
    name: "novel-writing-polisher",
    role: "小说创作、续写、润色、降 AI 感、连续性维护"
  },
  {
    id: "novel-ai-reviewer",
    name: "novel-ai-reviewer",
    role: "审稿、诊断 AI 感、发布前问题识别、正文修订建议"
  }
];

const DEFAULT_CONTEXT_FILES = [
  "00_总控/author_intent.md",
  "00_总控/current_focus.md",
  "00_总控/创作总纲.md",
  "00_总控/章节目录.md",
  "00_总控/未解决问题.md",
  "04_连续性/章节日志.md",
  "04_连续性/情绪账本.md",
  "04_连续性/伏笔回收表.md",
  "04_连续性/story_state.json",
  "04_连续性/character_state.json",
  "04_连续性/timeline_state.json",
  "04_连续性/plot_threads.json",
  "04_连续性/world_state.json",
  "04_连续性/style_memory.json",
  "04_连续性/reader_promises.json",
  "05_提示词/正文生成规则.md",
  "05_提示词/降AI感规则.md",
  "05_提示词/项目能力包.md",
  "05_提示词/项目工作流.md",
  "05_提示词/多角色协作.md",
  "05_提示词/SKILL.md",
  "05_提示词/档案助手.md"
];

const NARRATIVE_RADAR_RULES = {
  aiTone: [
    "值得注意的是", "与此同时", "不仅如此", "由此可见", "总而言之", "综上所述", "事实上", "实际上",
    "他意识到", "她意识到", "终于明白", "内心深处", "难以言喻", "某种意义上", "不可否认"
  ],
  cliches: [
    "虎躯一震", "倒吸一口凉气", "心头一沉", "呼吸一滞", "瞳孔骤缩", "嘴角勾起",
    "空气仿佛凝固", "时间仿佛静止", "如遭雷击", "如坠冰窟", "命运的齿轮", "五味杂陈",
    "百感交集", "一股暖流", "心脏漏跳了一拍", "血液倒流"
  ],
  mechanicalActions: ["压", "按", "稳", "落", "抬", "垂", "攥", "捏", "扫", "顿了顿"],
  genreProfiles: [
    {
      match: ["悬疑", "推理", "刑侦", "怪谈", "无限"],
      label: "悬疑",
      anchors: ["线索", "证据", "嫌疑", "动机", "时间线", "误导", "真相", "伏笔", "异常", "目击"],
      avoid: ["无敌", "系统奖励", "境界突破", "斗气", "灵气"],
      advice: "悬疑项目要让线索、误导和证据链同时存在，避免关键真相空降。"
    },
    {
      match: ["玄幻", "修仙", "仙侠", "奇幻"],
      label: "玄幻/仙侠",
      anchors: ["境界", "灵气", "剑意", "血脉", "宗门", "法器", "天道", "因果", "破境", "秘境"],
      avoid: ["算法", "屏幕", "接口", "服务器", "像素"],
      advice: "玄幻项目要稳定力量边界和代价，避免现代技术比喻串味。"
    },
    {
      match: ["科幻", "赛博", "末世"],
      label: "科幻",
      anchors: ["算法", "引擎", "深空", "芯片", "量子", "轨道", "辐射", "协议", "仿生", "网络"],
      avoid: ["灵气", "天道", "仙缘", "渡劫", "命格"],
      advice: "科幻项目要让技术词服务冲突，不要只堆名词。"
    },
    {
      match: ["同人", "动漫", "二创", "原作"],
      label: "同人",
      anchors: ["原作", "原创", "角色", "主线", "支线", "设定", "差异", "口吻", "边界", "桥段"],
      avoid: ["照搬", "原文台词", "复刻剧情"],
      advice: "同人项目要区分原作事实、原创设定和临时猜想，避免复刻原作长段表达。"
    },
    {
      match: ["都市", "情感", "言情", "家庭"],
      label: "都市/情感",
      anchors: ["关系", "选择", "误会", "债", "工作", "家庭", "现实", "压力", "对话", "隐瞒"],
      avoid: ["飞升", "斗气", "虫洞", "天道"],
      advice: "都市情感项目要让情绪转折落在具体选择和关系变化上。"
    }
  ]
};

const TEMPLATE_FILES = [
  {
    file: "00_总控/author_intent.md",
    body: `# Author Intent

## 这本书真正想写什么

## 读者承诺

## 不想写成什么

## 长期坚持的边界

## 当前作者偏好
`
  },
  {
    file: "00_总控/current_focus.md",
    body: `# Current Focus

## 当前阶段
- 孵化 / 大纲 / 连载 / 修订 / 发布：

## 近期重点

## 本轮最重要的问题

## 暂时不要处理的问题

## 下次运行前提醒
`
  },
  {
    file: "00_总控/创作总纲.md",
    body: `# 创作总纲

## 一句话卖点

## 类型与平台取向
- 类型：
- 阅读节奏：
- 禁止事项：

## 主线问题

## 主角长期目标

## 反派或阻力系统

## 前十章承诺

## 发布标准
- 每章有明确变化。
- 情绪通过动作、停顿、物件、对话和选择表现。
- 不用总结式心理描写替代场景。
- 结尾留下具体追读钩子。
`
  },
  {
    file: "00_总控/章节目录.md",
    body: `# 章节目录

| 章节 | 标题 | 状态 | 本章变化 | 结尾钩子 |
| --- | --- | --- | --- | --- |
`
  },
  {
    file: "00_总控/chapters.json",
    body: JSON.stringify({ version: 1, chapters: [] }, null, 2) + "\n"
  },
  {
    file: "00_总控/未解决问题.md",
    body: `# 未解决问题

| 编号 | 问题 | 首次出现 | 当前状态 | 预计回收 |
| --- | --- | --- | --- | --- |
`
  },
  {
    file: "02_人物/人物卡模板.md",
    body: `# 人物姓名

## 表面身份

## 当前目标

## 核心恐惧

## 不愿说出的秘密

## 压力反应
- 被质问时：
- 害怕时：
- 想挽留时：

## 说话习惯

## 行动习惯

## 与主线关系

## 后续变化方向
`
  },
  {
    file: "03_设定/世界观.md",
    body: `# 世界观

## 故事发生地

## 规则或现实限制

## 可反复使用的场景

## 场景如何参与案件或冲突
`
  },
  {
    file: "04_连续性/章节日志.md",
    body: `# 章节日志

| 章节 | 已发生事件 | 新增信息 | 人物状态变化 | 下章必须承接 |
| --- | --- | --- | --- | --- |
`
  },
  {
    file: "04_连续性/情绪账本.md",
    body: `# 情绪账本

| 人物 | 事件 | 表面反应 | 真实残留 | 何时偿还 |
| --- | --- | --- | --- | --- |
`
  },
  {
    file: "04_连续性/伏笔回收表.md",
    body: `# 伏笔回收表

| 编号 | 首次出现章节 | 表面含义 | 真实含义 | 误导方向 | 当前状态 | 回收方式 |
| --- | --- | --- | --- | --- | --- | --- |
`
  },
  {
    file: "04_连续性/story_state.json",
    body: `{
  "version": 1,
  "updatedAt": "",
  "currentArc": "",
  "globalSituation": "",
  "activeConflicts": [],
  "resolvedConflicts": [],
  "openQuestions": []
}
`
  },
  {
    file: "04_连续性/character_state.json",
    body: `{
  "version": 1,
  "updatedAt": "",
  "characters": []
}
`
  },
  {
    file: "04_连续性/timeline_state.json",
    body: `{
  "version": 1,
  "updatedAt": "",
  "timeline": []
}
`
  },
  {
    file: "04_连续性/plot_threads.json",
    body: `{
  "version": 1,
  "updatedAt": "",
  "threads": []
}
`
  },
  {
    file: "04_连续性/world_state.json",
    body: `{
  "version": 1,
  "updatedAt": "",
  "rules": [],
  "locations": [],
  "organizations": [],
  "constraints": []
}
`
  },
  {
    file: "04_连续性/style_memory.json",
    body: `{
  "version": 1,
  "updatedAt": "",
  "voice": [],
  "preferredTextures": [],
  "bannedPatterns": [],
  "chapterRhythm": []
}
`
  },
  {
    file: "04_连续性/reader_promises.json",
    body: `{
  "version": 1,
  "updatedAt": "",
  "promises": []
}
`
  },
  {
    file: "05_提示词/正文生成规则.md",
    body: `# 正文生成规则

- 面向中文网文手机端阅读，自然段短而清楚。
- 不要用作者总结替代正在发生的场景。
- 情绪必须通过动作、停顿、物件、误会、回避、对话压力表现。
- 对话不要过度完整，允许答非所问、打断、沉默和嘴硬。
- 每章至少有一个信息增量、一个人物压力、一个具体钩子。
- 不要模仿任何特定在世作者的签名风格、原句或独特设定。
`
  },
  {
    file: "05_提示词/降AI感规则.md",
    body: `# 降AI感规则

重点删除或替换：
- 他意识到、她终于明白、这一刻、仿佛全世界、命运的齿轮。
- 空泛情绪词和整齐总结句。
- 人物过度正确、过度礼貌、过度解释。

替换方向：
- 具体动作、生活物件、停顿、看错、误解、没说完的话。
- 保留人物的不体面：嘴硬、迁怒、逃避、迟来的道歉。
`
  },
  {
    file: "05_提示词/项目能力包.md",
    body: `# 项目能力包

这里保存经过“资料投喂”综合分析后被采纳的写作规则、限制和项目专用能力。

要求：
- 只记录经过筛选、去重、合并后的规则。
- 不把上传资料原文直接当能力。
- 与本项目冲突、不适合发布、版权风险高或证据不足的内容必须标记为不采纳。
`
  },
  {
    file: "05_提示词/项目工作流.md",
    body: `# 项目工作流

这里保存经过资料投喂后沉淀出的项目流程，例如立项、起章、正文生成、降 AI 感、审稿、连续性检查和发布前检查。
`
  },
  {
    file: "05_提示词/多角色协作.md",
    body: `# 多角色协作

这里保存经过资料投喂后沉淀出的 AI 多角色分工，例如立项编辑、结构编辑、正文写手、审稿人、连续性管理员和发布检查员。
`
  },
  {
    file: "05_提示词/SKILL.md",
    body: `# 本项目写作 Skill

这个文件由“资料投喂”功能逐步整理，用于保存本项目专属的写作能力、限制、流程和审稿标准。
`
  },
  {
    file: "05_提示词/档案助手.md",
    body: `# 档案助手

这里保存当前项目使用的档案助手设定。创建项目或切换助手后会自动生成。
`
  },
  {
    file: "00_总控/立项建议.md",
    body: `# 立项建议

在工具的“创意孵化”面板里填写原始思路后，可以自动生成书名、类型、标签、封面描述、简介卖点、主角方案、阻力系统和前三章启动方案。
`
  },
  {
    file: "00_总控/封面与发布资料.md",
    body: `# 封面与发布资料

## 书名候选

## 类型

## 标签

## 一句话卖点

## 简介

## 封面描述

## 避免元素
`
  },
  {
    file: "07_Codex/Codex任务单.md",
    body: `# Codex任务单

这个文件用于让本地 Codex 零配置接手小说项目。

## 使用方式

在 Codex 里直接说：

\`\`\`text
请读取这个项目的 Codex任务单，并按任务单继续处理。
\`\`\`

## 当前任务

待填写。
`
  }
];

function sendJson(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function sendText(res, status, text, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "content-type": type });
  res.end(text);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error("请求体不是有效 JSON");
    err.status = 400;
    throw err;
  }
}

function slugify(input) {
  const clean = String(input || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  return clean || `novel-${Date.now()}`;
}

function projectNameFromIdea(idea) {
  const firstLine = String(idea || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  const base = firstLine ? firstLine.slice(0, 16) : "新书创意";
  const stamp = new Date().toISOString().slice(0, 19).replace("T", "_").replaceAll(":", "");
  return slugify(`${base}_${stamp}`);
}

function publicArchiveAssistants() {
  return ARCHIVE_ASSISTANTS.map(({ id, name, tagline, focus }) => ({ id, name, tagline, focus }));
}

function pickArchiveAssistant({ name = "", genre = "", premise = "", assistantId = "auto" }) {
  if (assistantId && assistantId !== "auto") {
    return ARCHIVE_ASSISTANTS.find((item) => item.id === assistantId) || ARCHIVE_ASSISTANTS[0];
  }

  const text = `${name} ${genre} ${premise}`.toLowerCase();
  let best = ARCHIVE_ASSISTANTS[0];
  let bestScore = 0;
  for (const assistant of ARCHIVE_ASSISTANTS.slice(1)) {
    const score = assistant.keywords.reduce((sum, keyword) => {
      return sum + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      best = assistant;
      bestScore = score;
    }
  }
  return best;
}

function summarizeSkillContent(content) {
  const text = String(content || "");
  const frontMatter = text.match(/^---\s*([\s\S]*?)\s*---/);
  const description = frontMatter?.[1]?.match(/^description:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
  const name = frontMatter?.[1]?.match(/^name:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
  const headings = [...text.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) => match[1].trim()).slice(0, 8);
  return {
    name,
    description,
    headings
  };
}

async function readNovelSkillBasis() {
  const basis = [];
  for (const skill of NOVEL_SKILL_CANDIDATES) {
    const candidates = [
      path.join(CC_SWITCH_HOME, "skills", skill.id, "SKILL.md"),
      path.join(CODEX_HOME, "skills", skill.id, "SKILL.md")
    ];
    let found = "";
    for (const candidate of candidates) {
      if (await exists(candidate)) {
        found = candidate;
        break;
      }
    }
    if (!found) continue;
    const content = await fs.readFile(found, "utf8");
    basis.push({
      id: skill.id,
      name: skill.name,
      role: skill.role,
      path: found,
      summary: summarizeSkillContent(content)
    });
  }
  return basis;
}

function formatSkillBasis(skillBasis = []) {
  if (!skillBasis.length) {
    return `- 未检测到本机小说 Skill。此助手只能作为项目档案模板使用，不能声称具备额外写作能力。`;
  }
  return skillBasis.map((skill) => {
    const summary = [
      skill.summary.description ? `说明：${skill.summary.description}` : "",
      skill.summary.headings?.length ? `结构：${skill.summary.headings.join(" / ")}` : ""
    ].filter(Boolean).join("\n  ");
    return `- ${skill.name}：${skill.role}\n  来源：${skill.path}\n  ${summary || "已读取 SKILL.md，作为当前项目档案助手的能力来源。"}`;
  }).join("\n");
}

function buildArchiveAssistantProfile({ project, assistant, mode = "auto", skillBasis = [] }) {
  const projectName = project.name || project.id || "未命名项目";
  return `# 档案助手

## 生成原则

这个档案助手不是凭空生成的新能力，也不替代当前 AI 的 Skill。

它只做一件事：基于本机已经存在的小说相关 Skill，把当前项目需要长期维护的资料、限制、连续性和检查清单整理成“项目档案层”的补充规则。

如果这里的内容与 Skill 冲突，以本机 Skill 和用户明确要求为准；档案助手只能补充项目上下文，不能扩展出未经来源支持的新能力。

## 能力来源

${formatSkillBasis(skillBasis)}

## 当前助手

- 助手：${assistant.name}
- 选择方式：${mode === "manual" ? "手动选择" : "根据项目信息自动推荐"}
- 适用说明：${assistant.tagline}

## 项目信息

- 项目名：${projectName}
- 类型：${project.genre || "未填写"}
- 初始创意：${project.premise || "未填写"}

## 档案重点

${assistant.focus.map((item) => `- ${item}`).join("\n")}

## 日常职责

${assistant.duties.map((item) => `- ${item}`).join("\n")}

## 工作方式

- 先调用或遵守当前 AI 已有小说 Skill 的能力，再用本助手补充项目档案管理。
- 生成正文前，先检查总纲、章节目录、人物、设定、连续性、项目能力包是否存在冲突。
- 生成或修改正文后，提醒或补写章节日志、情绪账本、伏笔回收表和未解决问题。
- 资料投喂后，只接收经过判断、去重、合并后的规则，不把原文直接塞进能力。
- 审稿时优先指出会影响连载、读者理解、人物可信度和发布合规的问题。
- 当资料冲突时，标记冲突来源和建议取舍，不直接替作者拍板长期设定。

## 边界

${assistant.guardrails.map((item) => `- ${item}`).join("\n")}
- 不把档案助手写成独立创作 Skill；它必须依附当前本机 Skill 和项目资料。
- 不声称拥有未在“能力来源”中检测到的写作、审稿或平台能力。

## 默认维护文件

- \`00_总控/创作总纲.md\`
- \`00_总控/章节目录.md\`
- \`00_总控/未解决问题.md\`
- \`02_人物/*.md\`
- \`03_设定/*.md\`
- \`04_连续性/章节日志.md\`
- \`04_连续性/情绪账本.md\`
- \`04_连续性/伏笔回收表.md\`
- \`05_提示词/项目能力包.md\`
- \`05_提示词/项目工作流.md\`
- \`05_提示词/多角色协作.md\`
- \`05_提示词/SKILL.md\`
- \`05_提示词/档案助手.md\`
`;
}

function assertSafeProjectId(id) {
  const clean = slugify(id);
  if (clean !== id) {
    const err = new Error("项目 ID 不合法");
    err.status = 400;
    throw err;
  }
  return clean;
}

function projectPath(projectId, ...parts) {
  const id = assertSafeProjectId(projectId);
  const full = path.resolve(PROJECTS_DIR, id, ...parts);
  const root = path.resolve(PROJECTS_DIR, id);
  if (full !== root && !full.startsWith(root + path.sep)) {
    const err = new Error("路径越界");
    err.status = 400;
    throw err;
  }
  return full;
}

function displayProjectPath(projectId, ...parts) {
  if (!HOST_PROJECTS_DIR) return projectPath(projectId, ...parts);
  return path.win32.join(HOST_PROJECTS_DIR, projectId, ...parts);
}

function snapshotPath(projectId, snapshotId = "", ...parts) {
  const id = assertSafeProjectId(projectId);
  const root = path.resolve(SNAPSHOTS_DIR, id);
  const cleanSnapshotId = snapshotId ? slugify(snapshotId) : "";
  if (snapshotId && cleanSnapshotId !== snapshotId) {
    const err = new Error("快照 ID 不合法");
    err.status = 400;
    throw err;
  }
  const full = path.resolve(root, cleanSnapshotId, ...parts);
  if (full !== root && !full.startsWith(root + path.sep)) {
    const err = new Error("快照路径越界");
    err.status = 400;
    throw err;
  }
  return full;
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function initProject({ name, genre = "", premise = "", archiveAssistant = "auto" }) {
  const id = slugify(name);
  const root = projectPath(id);
  if (await exists(root)) {
    const err = new Error("同名项目已经存在");
    err.status = 409;
    throw err;
  }

  await fs.mkdir(root, { recursive: true });
  for (const dir of ["00_总控", "01_正文", "02_人物", "03_设定", "04_连续性", "05_提示词", "06_发布", "07_Codex", "08_资料投喂", "08_资料投喂/原始资料", "09_运行时"]) {
    await fs.mkdir(path.join(root, dir), { recursive: true });
  }
  for (const item of TEMPLATE_FILES) {
    const file = path.join(root, item.file);
    await ensureDir(file);
    await fs.writeFile(file, item.body, "utf8");
  }

  const assistant = pickArchiveAssistant({ name, genre, premise, assistantId: archiveAssistant });
  const meta = {
    id,
    name: name.trim(),
    genre,
    premise,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    runner: "codex",
    status: "incubating",
    reviewStatus: "draft",
    archiveAssistantId: assistant.id,
    archiveAssistantName: assistant.name,
    model: "qwen3:8b",
    endpoint: "http://127.0.0.1:11434/api/generate"
  };
  await fs.writeFile(path.join(root, "project.json"), JSON.stringify(meta, null, 2), "utf8");
  const skillBasis = await readNovelSkillBasis();
  await fs.writeFile(
    path.join(root, "05_提示词", "档案助手.md"),
    buildArchiveAssistantProfile({
      project: meta,
      assistant,
      mode: archiveAssistant === "auto" ? "auto" : "manual",
      skillBasis
    }),
    "utf8"
  );

  if (premise.trim()) {
    const outline = projectPath(id, "00_总控", "创作总纲.md");
    await fs.appendFile(outline, `\n## 初始创意\n${premise.trim()}\n`, "utf8");
  }

  return meta;
}

async function listProjects() {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const metaFile = path.join(PROJECTS_DIR, entry.name, "project.json");
    if (!(await exists(metaFile))) continue;
    const meta = JSON.parse(await fs.readFile(metaFile, "utf8"));
    projects.push(meta);
  }
  return projects.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

async function updateProjectMeta(projectId, patch) {
  const file = projectPath(projectId, "project.json");
  const meta = JSON.parse(await fs.readFile(file, "utf8"));
  const next = { ...meta, ...patch, updatedAt: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}

async function ensureProjectArchiveAssistant(projectId, meta) {
  const assistantFile = projectPath(projectId, "05_提示词", "档案助手.md");
  if (meta.archiveAssistantId && (await exists(assistantFile))) return meta;
  const assistant = pickArchiveAssistant({
    name: meta.name,
    genre: meta.genre,
    premise: meta.premise,
    assistantId: meta.archiveAssistantId || "auto"
  });
  const next = {
    ...meta,
    archiveAssistantId: assistant.id,
    archiveAssistantName: assistant.name,
    updatedAt: new Date().toISOString()
  };
  await fs.writeFile(projectPath(projectId, "project.json"), JSON.stringify(next, null, 2), "utf8");
  await ensureDir(assistantFile);
  const skillBasis = await readNovelSkillBasis();
  await fs.writeFile(
    assistantFile,
    buildArchiveAssistantProfile({
      project: next,
      assistant,
      mode: meta.archiveAssistantId ? "manual" : "auto",
      skillBasis
    }),
    "utf8"
  );
  return next;
}

async function readProject(projectId) {
  const rawMeta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
  const meta = await ensureProjectArchiveAssistant(projectId, rawMeta);
  await ensureProjectControlFiles(projectId);
  const files = await listMarkdownFiles(projectId);
  const stats = await getProjectStats(projectId, files);
  const runs = await listCodexRuns(projectId);
  const syncReviews = await listStateSyncReviews(projectId, files);
  const snapshots = await listProjectSnapshots(projectId);
  const chapters = await listChapters(projectId, files);
  return { ...meta, rootPath: displayProjectPath(projectId), containerPath: projectPath(projectId), files, stats, runs, syncReviews, snapshots, chapters };
}

async function listMarkdownFiles(projectId) {
  const root = projectPath(projectId);
  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && [".md", ".txt", ".json", ".csv", ".yaml", ".yml"].includes(path.extname(entry.name).toLowerCase())) {
        out.push(path.relative(root, full).replaceAll(path.sep, "/"));
      }
    }
  }
  await walk(root);
  return out.sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

function parseChapterFileName(file) {
  const match = String(file || "").match(/^01_正文\/第(\d+)章_([^/]+)\.(md|txt)$/);
  if (!match) return null;
  return {
    no: Number(match[1]),
    title: match[2] || "",
    file
  };
}

function normalizeChapterStatus(status = "") {
  const value = String(status || "").trim();
  return ["未规划", "已规划", "生成中", "待审", "可发布"].includes(value) ? value : "未规划";
}

function normalizeChapterEntry(entry = {}) {
  const no = Number(entry.no || entry.chapterNo || entry.chapter || 0);
  if (!Number.isFinite(no) || no <= 0) return null;
  const characters = Array.isArray(entry.characters)
    ? entry.characters
    : String(entry.characters || "").split(/[，,、\s]+/).filter(Boolean);
  const threads = Array.isArray(entry.threads)
    ? entry.threads
    : String(entry.threads || "").split(/[，,、\s]+/).filter(Boolean);
  return {
    no,
    title: String(entry.title || "").trim(),
    status: normalizeChapterStatus(entry.status),
    brief: String(entry.brief || entry.change || "").trim(),
    hook: String(entry.hook || "").trim(),
    characters,
    threads,
    file: String(entry.file || "").trim(),
    wordCount: Number(entry.wordCount || 0),
    updatedAt: entry.updatedAt || ""
  };
}

async function readChapterPlanJson(projectId) {
  const file = projectPath(projectId, "00_总控", "chapters.json");
  if (!(await exists(file))) return [];
  try {
    const data = JSON.parse(await fs.readFile(file, "utf8"));
    return Array.isArray(data.chapters) ? data.chapters.map(normalizeChapterEntry).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function readChapterDirectoryRows(projectId) {
  const file = projectPath(projectId, "00_总控", "章节目录.md");
  if (!(await exists(file))) return [];
  const text = await fs.readFile(file, "utf8");
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.includes("---") || trimmed.includes("章节 | 标题")) continue;
    const cells = trimmed.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 2) continue;
    const noMatch = cells[0].match(/\d+/);
    if (!noMatch) continue;
    rows.push(normalizeChapterEntry({
      no: Number(noMatch[0]),
      title: cells[1],
      status: cells[2] || "已规划",
      brief: cells[3] || "",
      hook: cells[4] || ""
    }));
  }
  return rows.filter(Boolean);
}

async function listChapters(projectId, files = null) {
  const allFiles = files || (await listMarkdownFiles(projectId));
  const byNo = new Map();
  const merge = (entry) => {
    if (!entry) return;
    const current = byNo.get(entry.no) || {};
    byNo.set(entry.no, {
      ...current,
      ...entry,
      title: entry.title || current.title || "",
      status: entry.status && entry.status !== "未规划" ? entry.status : current.status || entry.status || "未规划",
      brief: entry.brief || current.brief || "",
      hook: entry.hook || current.hook || "",
      characters: entry.characters?.length ? entry.characters : current.characters || [],
      threads: entry.threads?.length ? entry.threads : current.threads || [],
      file: entry.file || current.file || "",
      wordCount: entry.wordCount || current.wordCount || 0,
      updatedAt: entry.updatedAt || current.updatedAt || ""
    });
  };

  for (const entry of await readChapterDirectoryRows(projectId)) merge(entry);
  for (const entry of await readChapterPlanJson(projectId)) merge(entry);

  for (const file of allFiles) {
    const parsed = parseChapterFileName(file);
    if (!parsed) continue;
    let wordCount = 0;
    try {
      const content = await readProjectFile(projectId, file);
      wordCount = content.replace(/\s/g, "").length;
    } catch {
      // Ignore unreadable chapter files.
    }
    merge({
      no: parsed.no,
      title: parsed.title,
      status: "待审",
      file,
      wordCount,
      updatedAt: new Date().toISOString()
    });
  }

  const chapters = [...byNo.values()]
    .map(normalizeChapterEntry)
    .filter(Boolean)
    .sort((a, b) => a.no - b.no);
  return chapters;
}

async function saveChapters(projectId, chapters) {
  const normalized = chapters.map(normalizeChapterEntry).filter(Boolean).sort((a, b) => a.no - b.no);
  await writeProjectFile(projectId, "00_总控/chapters.json", JSON.stringify({ version: 1, chapters: normalized }, null, 2) + "\n");
  const rows = normalized.map((chapter) => {
    return `| 第${chapter.no}章 | ${chapter.title || ""} | ${chapter.status || "未规划"} | ${chapter.brief || ""} | ${chapter.hook || ""} |`;
  }).join("\n");
  await writeProjectFile(projectId, "00_总控/章节目录.md", `# 章节目录\n\n| 章节 | 标题 | 状态 | 本章变化 | 结尾钩子 |\n| --- | --- | --- | --- | --- |\n${rows}${rows ? "\n" : ""}`);
  return normalized;
}

async function updateChapterPlan(projectId, patch) {
  const chapters = await listChapters(projectId);
  const next = normalizeChapterEntry({
    no: patch.no || patch.chapterNo,
    title: patch.title,
    status: patch.status,
    brief: patch.brief,
    hook: patch.hook,
    characters: patch.characters,
    threads: patch.threads,
    file: patch.file,
    wordCount: patch.wordCount,
    updatedAt: new Date().toISOString()
  });
  if (!next) {
    const err = new Error("章节号不合法");
    err.status = 400;
    throw err;
  }
  const index = chapters.findIndex((chapter) => chapter.no === next.no);
  if (index >= 0) {
    chapters[index] = {
      ...chapters[index],
      ...next,
      title: next.title || chapters[index].title,
      brief: next.brief || chapters[index].brief,
      hook: next.hook || chapters[index].hook,
      file: next.file || chapters[index].file,
      wordCount: next.wordCount || chapters[index].wordCount
    };
  } else {
    chapters.push(next);
  }
  return saveChapters(projectId, chapters);
}

function countTextMatches(text, patterns = []) {
  const content = String(text || "");
  return patterns.reduce((total, pattern) => {
    const matches = content.match(pattern);
    return total + (matches ? matches.length : 0);
  }, 0);
}

function repeatedParagraphStarts(paragraphs) {
  const starts = new Map();
  for (const paragraph of paragraphs) {
    const start = paragraph.replace(/^[“"'\s]+/, "").slice(0, 3);
    if (start.length < 2) continue;
    starts.set(start, (starts.get(start) || 0) + 1);
  }
  return [...starts.entries()].filter(([, count]) => count >= 4).map(([start, count]) => ({ start, count }));
}

function pushQualityIssue(issues, severity, title, detail, suggestion, chapter = null) {
  issues.push({
    severity,
    title,
    detail,
    suggestion,
    chapterNo: chapter?.no || "",
    chapterTitle: chapter?.title || "",
    file: chapter?.file || ""
  });
}

async function analyzeChapterQuality(projectId, chapter) {
  const issues = [];
  if (!chapter.title) {
    pushQualityIssue(issues, "warn", "章节缺少标题", "章节看板中没有标题。", "补一个能表达本章冲突或钩子的标题。", chapter);
  }
  if (!chapter.brief) {
    pushQualityIssue(issues, "warn", "章节缺少 brief", "章节规划里没有本章任务、冲突或信息增量。", "补充本章 brief，至少写清楚开场、冲突、信息增量和结尾钩子。", chapter);
  }
  if (!chapter.hook) {
    pushQualityIssue(issues, "info", "章节缺少结尾钩子记录", "章节目录中没有记录结尾钩子。", "在章节规划里补充读者会追下一章的问题或悬念。", chapter);
  }
  if (!chapter.file) {
    pushQualityIssue(issues, "critical", "章节还没有正文", "章节看板里没有关联正文文件。", "先运行多阶段流水线或手动保存正文。", chapter);
    return { chapter, wordCount: 0, issues };
  }

  let content = "";
  try {
    content = await readProjectFile(projectId, chapter.file);
  } catch (error) {
    pushQualityIssue(issues, "critical", "正文文件无法读取", error.message, "检查项目文件是否被移动、删除或占用。", chapter);
    return { chapter, wordCount: 0, issues };
  }

  const normalized = content.trim();
  const wordCount = normalized.replace(/\s/g, "").length;
  const paragraphs = normalized.split(/\r?\n+/).map((item) => item.trim()).filter(Boolean);
  const dialogueCount = paragraphs.filter((item) => /^["“「『]/.test(item) || item.includes("：“") || item.includes(':"')).length;
  const longParagraphs = paragraphs.filter((item) => item.replace(/\s/g, "").length > 260);
  const aiPhraseCount = countTextMatches(normalized, [
    /作为一名AI/g,
    /作为一个AI/g,
    /总而言之/g,
    /综上所述/g,
    /不难看出/g,
    /与此同时/g,
    /他意识到/g,
    /她意识到/g,
    /终于明白/g,
    /内心深处/g,
    /一种难以言喻/g
  ]);
  const mechanicalActionCount = countTextMatches(normalized, [/压/g, /按/g, /稳/g, /落/g, /抬/g, /垂/g, /攥/g, /捏/g, /扫/g]);
  const repeatedStarts = repeatedParagraphStarts(paragraphs);

  if (wordCount < 800) {
    pushQualityIssue(issues, "critical", "正文字数过短", `当前约 ${wordCount} 字，低于常规连载章节长度。`, "补足场景推进、对话拉扯、信息增量和结尾悬念。", chapter);
  } else if (wordCount < 1500) {
    pushQualityIssue(issues, "warn", "章节偏短", `当前约 ${wordCount} 字。`, "确认平台目标字数；如果目标是网文连载，建议扩充到更稳定的章节长度。", chapter);
  }
  if (wordCount > 6500) {
    pushQualityIssue(issues, "warn", "章节过长", `当前约 ${wordCount} 字。`, "考虑拆章，避免移动端阅读疲劳。", chapter);
  }
  if (paragraphs.length < 8) {
    pushQualityIssue(issues, "warn", "段落数量偏少", `当前只有 ${paragraphs.length} 个有效段落。`, "移动端阅读建议多分段，尤其是动作、对话和心理转折处。", chapter);
  }
  if (longParagraphs.length >= 3) {
    pushQualityIssue(issues, "warn", "长段落偏多", `超过 260 字的段落有 ${longParagraphs.length} 个。`, "拆分设定说明和内心独白，让手机端更容易读。", chapter);
  }
  if (paragraphs.length >= 12 && dialogueCount / paragraphs.length < 0.12) {
    pushQualityIssue(issues, "info", "对话占比偏低", `约 ${dialogueCount}/${paragraphs.length} 个段落含对话。`, "如果本章不是纯动作或氛围章，可增加人物之间的问答、误会或遮掩。", chapter);
  }
  if (aiPhraseCount >= 4) {
    pushQualityIssue(issues, "warn", "AI 感风险词偏多", `疑似模板化表达出现 ${aiPhraseCount} 次。`, "重点检查“意识到、终于明白、内心深处、难以言喻”等解释性表达。", chapter);
  }
  if (mechanicalActionCount >= Math.max(24, Math.floor(wordCount / 120))) {
    pushQualityIssue(issues, "info", "机械动作词密度偏高", `压/按/稳/落/抬/垂/攥/捏/扫等动作词约 ${mechanicalActionCount} 次。`, "适当替换为更具体的物件互动、停顿、误判、选择和对话反应。", chapter);
  }
  if (repeatedStarts.length) {
    pushQualityIssue(
      issues,
      "info",
      "段落开头重复",
      repeatedStarts.map((item) => `“${item.start}” ${item.count} 次`).join("；"),
      "调整段落起手式，避免连续使用同一主语或同一动作开头。",
      chapter
    );
  }
  if (!/[。！？!?」”』]$/.test(normalized)) {
    pushQualityIssue(issues, "warn", "正文结尾不完整", "正文最后一个字符不像完整句末。", "检查是否粘贴/生成中断。", chapter);
  }

  return { chapter, wordCount, paragraphCount: paragraphs.length, issues };
}

function qualityVerdict(issues) {
  const critical = issues.filter((issue) => issue.severity === "critical").length;
  const warn = issues.filter((issue) => issue.severity === "warn").length;
  const info = issues.filter((issue) => issue.severity === "info").length;
  const score = Math.max(0, 100 - critical * 24 - warn * 9 - info * 2);
  const status = critical > 0 ? "需重写" : warn > 3 ? "需小修" : "可发布";
  return { status, score, critical, warn, info };
}

function qualityIssueMarkdown(issue) {
  const prefix = issue.chapterNo ? `第${issue.chapterNo}章 ${issue.chapterTitle || ""}`.trim() : "项目";
  return `- **[${issue.severity}] ${prefix}：${issue.title}**\n  - 依据：${issue.detail || "未填写"}\n  - 建议：${issue.suggestion || "人工复核。"}${issue.file ? `\n  - 文件：\`${issue.file}\`` : ""}`;
}

async function runPublishQualityCheck(projectId, { scope = "current", chapterNo = "", file = "" } = {}) {
  const files = await listMarkdownFiles(projectId);
  const chapters = await listChapters(projectId, files);
  const issues = [];
  let targets = [];

  if (scope === "all") {
    targets = chapters;
  } else {
    const no = Number(chapterNo || 0);
    targets = chapters.filter((chapter) => (file && chapter.file === file) || (no && Number(chapter.no) === no));
    if (!targets.length && file) {
      const parsed = parseChapterFileName(file);
      targets = [normalizeChapterEntry({ ...(parsed || {}), no: parsed?.no || no || 1, title: parsed?.title || "", file })].filter(Boolean);
    }
  }

  if (!targets.length) {
    pushQualityIssue(issues, "critical", "没有可质检章节", scope === "all" ? "当前项目还没有章节。": "当前章节没有匹配到章节规划或正文文件。", "先在章节看板选择章节，或保存/生成至少一章正文。");
  }

  const chapterReports = [];
  for (const chapter of targets) {
    const report = await analyzeChapterQuality(projectId, chapter);
    chapterReports.push(report);
    issues.push(...report.issues);
  }

  const requiredMemoryFiles = [
    "04_连续性/章节日志.md",
    "04_连续性/情绪账本.md",
    "04_连续性/伏笔回收表.md",
    "04_连续性/story_state.json",
    "04_连续性/character_state.json",
    "04_连续性/reader_promises.json"
  ];
  for (const memoryFile of requiredMemoryFiles) {
    if (!files.includes(memoryFile)) {
      pushQualityIssue(issues, "warn", "连续性文件缺失", `缺少 ${memoryFile}。`, "运行资料初始化或补齐长期记忆文件，避免后续章节断档。");
    }
  }

  const unresolved = files.includes("00_总控/未解决问题.md") ? await readProjectFile(projectId, "00_总控/未解决问题.md").catch(() => "") : "";
  const openQuestions = unresolved.split(/\r?\n/).filter((line) => line.includes("|") && !line.includes("---") && /未解决|待定|待回收/.test(line)).length;
  if (scope === "all" && openQuestions >= 8) {
    pushQualityIssue(issues, "info", "长期未解决问题较多", `未解决问题表中约有 ${openQuestions} 条待处理项。`, "导出发布稿前，确认哪些是追读悬念，哪些是遗漏。");
  }

  const verdict = qualityVerdict(issues);
  const stamp = timestampId();
  const reportFile = `06_发布/发布前质检_${stamp}.md`;
  const chapterRows = chapterReports.map((item) => {
    return `| 第${item.chapter.no}章 | ${item.chapter.title || ""} | ${item.wordCount || 0} | ${item.issues.length} | ${item.chapter.file || ""} |`;
  }).join("\n");
  const issueText = issues.length ? issues.map(qualityIssueMarkdown).join("\n\n") : "- 未发现阻碍发布的明显问题。";
  await writeProjectFile(projectId, reportFile, `# 发布前质检报告

生成时间：${new Date().toISOString()}

## 结论

- 范围：${scope === "all" ? "全书" : "当前章节"}
- 结论：${verdict.status}
- 分数：${verdict.score}
- 严重：${verdict.critical}
- 警告：${verdict.warn}
- 提醒：${verdict.info}

## 章节概览

| 章节 | 标题 | 字数 | 问题数 | 文件 |
| --- | --- | ---: | ---: | --- |
${chapterRows || "| - | - | 0 | 0 | - |"}

## 问题清单

${issueText}
`);

  return {
    reportFile,
    scope,
    verdict,
    chapters: chapterReports.map((item) => ({
      no: item.chapter.no,
      title: item.chapter.title,
      file: item.chapter.file,
      wordCount: item.wordCount || 0,
      issueCount: item.issues.length
    })),
    issues
  };
}

async function collectQualityReviewMaterial(projectId, { scope = "current", chapterNo = "", file = "" } = {}) {
  const files = await listMarkdownFiles(projectId);
  const chapters = await listChapters(projectId, files);
  let targets = [];
  if (scope === "all") {
    targets = chapters.filter((chapter) => chapter.file);
  } else {
    const no = Number(chapterNo || 0);
    targets = chapters.filter((chapter) => (file && chapter.file === file) || (no && Number(chapter.no) === no));
    if (!targets.length && file) {
      const parsed = parseChapterFileName(file);
      targets = [normalizeChapterEntry({ ...(parsed || {}), no: parsed?.no || no || 1, title: parsed?.title || "", file })].filter(Boolean);
    }
  }
  const chapterBlocks = [];
  let totalChars = 0;
  for (const chapter of targets.slice(0, scope === "all" ? 20 : 1)) {
    if (!chapter.file) continue;
    let content = "";
    try {
      content = await readProjectFile(projectId, chapter.file);
    } catch {
      continue;
    }
    const clipped = content.trim().slice(0, scope === "all" ? 2600 : 9000);
    totalChars += clipped.length;
    if (totalChars > 36000) break;
    chapterBlocks.push(`## 第${chapter.no}章 ${chapter.title || ""}\n文件：${chapter.file}\n字数：${chapter.wordCount || content.replace(/\s/g, "").length}\nbrief：${chapter.brief || "未填写"}\n结尾钩子：${chapter.hook || "未填写"}\n\n${clipped}`);
  }
  const context = await gatherContext(projectId, [
    "00_总控/章节目录.md",
    "00_总控/current_focus.md",
    "04_连续性/章节日志.md",
    "04_连续性/情绪账本.md",
    "04_连续性/伏笔回收表.md",
    "05_提示词/档案助手.md",
    "05_提示词/项目能力包.md"
  ]);
  return {
    scope,
    targets,
    context,
    chaptersText: chapterBlocks.join("\n\n---\n\n") || "没有读取到可复核正文。"
  };
}

function buildAiQualityReviewPrompt({ projectName, scope, localQuality, material }) {
  const localIssues = (localQuality.issues || []).slice(0, 20).map(qualityIssueMarkdown).join("\n\n") || "- 本地规则扫描未发现明显问题。";
  return `你是一个严厉但务实的中文长篇小说发布前审稿人，负责判断章节是否值得直接发布。

项目：${projectName || "未命名"}
范围：${scope === "all" ? "全书抽检" : "当前章节"}

## 本地硬指标质检摘要

- 结论：${localQuality.verdict.status}
- 分数：${localQuality.verdict.score}
- 严重：${localQuality.verdict.critical}
- 警告：${localQuality.verdict.warn}
- 提醒：${localQuality.verdict.info}

${localIssues}

## 项目资料与连续性上下文

${material.context}

## 待复核正文

${material.chaptersText}

## 复核重点

请不要泛泛夸奖。重点判断：

1. 人物动机是否可信，行为是否像真人而不是剧情工具。
2. 情绪推进是否自然，有没有“作者替角色解释”的 AI 感。
3. 本章是否空转，是否有明确冲突、信息增量、状态变化和结尾钩子。
4. 是否存在说明书式设定倾倒。
5. 爽点、悬念或同人看点是否足够支撑读者继续看。
6. 是否存在平台发布风险、同人版权风险、原作台词/桥段照搬风险。
7. 哪些段落最该重写，应该怎么改。

## 输出格式

# AI 深度质检报告

## 总结论
写“可发布 / 需小修 / 需重写”三选一，并给出 1 段理由。

## 最大问题 TOP 5
按严重程度列出。每条包含：问题、证据、影响、修改建议。

## 人物与情绪

## 情节与节奏

## AI 感与文风

## 连续性与读者承诺

## 发布风险

## 建议修订任务单
列出可直接交给 Codex 或多阶段流水线执行的修改任务。
`;
}

function buildCodexAiQualityTask({ projectId, reportFile, scope, localReportFile, material }) {
  const root = projectPath(projectId);
  const targetFiles = material.targets.map((chapter) => `- 第${chapter.no}章：\`${chapter.file || "未成稿"}\``).join("\n") || "- 无可复核正文";
  return `# Codex任务单

更新时间：${new Date().toISOString()}

## 项目路径

\`\`\`text
${root}
\`\`\`

## 当前任务

请执行“AI 深度发布质检”，读取项目资料和目标正文，生成严厉、具体、可执行的发布前审稿报告。

## 检查范围

${scope === "all" ? "全书抽检" : "当前章节"}

## 目标正文

${targetFiles}

## 必须参考

- \`${localReportFile}\`
- \`00_总控/创作总纲.md\`
- \`00_总控/章节目录.md\`
- \`00_总控/current_focus.md\`
- \`04_连续性/章节日志.md\`
- \`04_连续性/情绪账本.md\`
- \`04_连续性/伏笔回收表.md\`
- \`05_提示词/档案助手.md\`
- \`05_提示词/项目能力包.md\`

## 必须写入

\`${reportFile}\`

## 复核重点

1. 人物动机是否可信，行为是否像真人而不是剧情工具。
2. 情绪推进是否自然，有没有“作者替角色解释”的 AI 感。
3. 本章是否空转，是否有明确冲突、信息增量、状态变化和结尾钩子。
4. 是否存在说明书式设定倾倒。
5. 爽点、悬念或同人看点是否足够支撑读者继续看。
6. 是否存在平台发布风险、同人版权风险、原作台词/桥段照搬风险。
7. 哪些段落最该重写，应该怎么改。

## 输出格式

在 \`${reportFile}\` 中写入 Markdown：

# AI 深度质检报告
## 总结论
## 最大问题 TOP 5
## 人物与情绪
## 情节与节奏
## AI 感与文风
## 连续性与读者承诺
## 发布风险
## 建议修订任务单

完成后简短列出报告文件路径。`;
}

async function runAiQualityReview(projectId, body = {}, meta = {}) {
  const scope = body.scope || "current";
  const localQuality = await runPublishQualityCheck(projectId, body);
  const material = await collectQualityReviewMaterial(projectId, body);
  const stamp = timestampId();
  const reportFile = `06_发布/AI深度质检_${stamp}.md`;
  const runner = body.runner || meta.runner || "codex";

  if (runner === "codex") {
    const content = buildCodexAiQualityTask({
      projectId,
      reportFile,
      scope,
      localReportFile: localQuality.reportFile,
      material
    });
    const run = await runCodexForProject(projectId, content);
    return {
      mode: "codex",
      status: "running",
      reportFile,
      localReportFile: localQuality.reportFile,
      run,
      localQuality
    };
  }

  const prompt = buildAiQualityReviewPrompt({
    projectName: meta.name,
    scope,
    localQuality,
    material
  });
  const output = await callModel({
    endpoint: body.endpoint || meta.endpoint,
    model: body.model || meta.model || "qwen3:8b",
    prompt
  });
  const content = output.trim() + "\n";
  await writeProjectFile(projectId, reportFile, content);
  await updateProjectMeta(projectId, { model: body.model || meta.model, endpoint: body.endpoint || meta.endpoint, runner });
  return {
    mode: "model",
    status: "completed",
    reportFile,
    localReportFile: localQuality.reportFile,
    output: content,
    localQuality
  };
}

async function latestProjectFile(projectId, prefix, suffix = ".md") {
  const files = await listMarkdownFiles(projectId);
  return files.filter((file) => file.startsWith(prefix) && file.endsWith(suffix)).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")).at(-1) || "";
}

async function createRevisionTask(projectId, { reportFile = "", chapterNo = "", file = "", note = "" } = {}) {
  const files = await listMarkdownFiles(projectId);
  const chapters = await listChapters(projectId, files);
  const targetChapter = chapters.find((chapter) => (file && chapter.file === file) || (chapterNo && Number(chapter.no) === Number(chapterNo))) || chapters.find((chapter) => chapter.file) || null;
  const selectedReport = reportFile && files.includes(reportFile)
    ? reportFile
    : (await latestProjectFile(projectId, "06_发布/AI深度质检_")) || (await latestProjectFile(projectId, "06_发布/发布前质检_"));
  const reportText = selectedReport ? await readProjectFile(projectId, selectedReport).catch(() => "") : "";
  const targetText = targetChapter?.file ? await readProjectFile(projectId, targetChapter.file).catch(() => "") : "";
  const stamp = timestampId();
  const taskFile = `06_发布/修订任务单_${stamp}.md`;
  await writeProjectFile(projectId, taskFile, `# 修订任务单

生成时间：${new Date().toISOString()}

## 目标章节

- 章节：${targetChapter ? `第${targetChapter.no}章 ${targetChapter.title || ""}` : "未匹配"}
- 正文文件：${targetChapter?.file || file || "未指定"}
- 来源质检报告：${selectedReport || "未找到"}

## 作者补充要求

${note || "无"}

## 必须修

${extractMarkdownSection(reportText, "最大问题 TOP 5") || extractMarkdownSection(reportText, "问题清单") || "请根据质检报告补充必须修复的问题。"}

## 可选增强

- 增强人物动机的具体行动证据。
- 增强章节结尾的追读钩子。
- 精简说明书式设定，改成场景内信息释放。

## 禁止改动

- 不改核心人设、主线目标、已确认世界观规则。
- 不照搬原作台词、桥段或独创设定。
- 不一次性回收所有长期伏笔。

## 修订后需同步记忆

- 章节日志
- 情绪账本
- 伏笔回收表
- 人物状态
- 读者承诺

## 原质检报告摘录

${reportText.slice(0, 8000) || "未读取到质检报告。"}

## 当前正文摘录

${targetText.slice(0, 6000) || "未读取到正文。"}
`);
  return { taskFile, reportFile: selectedReport, chapter: targetChapter };
}

async function saveChapterVersion(projectId, chapterFile, reason = "manual") {
  const rel = safeRelativeFile(chapterFile);
  const content = await readProjectFile(projectId, rel);
  const parsed = parseChapterFileName(rel);
  const stamp = timestampId();
  const base = parsed ? `第${String(parsed.no).padStart(3, "0")}章_${parsed.title}` : path.parse(rel).name;
  const versionFile = `01_正文/历史版本/${base}_${stamp}_${slugify(reason)}.md`;
  await writeProjectFile(projectId, versionFile, content);
  return { versionFile };
}

async function listChapterVersions(projectId) {
  const files = await listMarkdownFiles(projectId);
  const versions = [];
  for (const file of files.filter((item) => item.startsWith("01_正文/历史版本/"))) {
    let chars = 0;
    try {
      chars = (await readProjectFile(projectId, file)).replace(/\s/g, "").length;
    } catch {
      // Ignore unreadable version.
    }
    versions.push({ file, chars });
  }
  return versions.sort((a, b) => b.file.localeCompare(a.file, "zh-Hans-CN"));
}

async function restoreChapterVersion(projectId, { versionFile, targetFile }) {
  const source = safeRelativeFile(versionFile);
  const target = safeRelativeFile(targetFile || "");
  if (!source.startsWith("01_正文/历史版本/")) {
    const err = new Error("只能恢复历史版本目录中的文件");
    err.status = 400;
    throw err;
  }
  if (!target || !target.startsWith("01_正文/")) {
    const err = new Error("请指定要覆盖的正文文件");
    err.status = 400;
    throw err;
  }
  const safetySnapshot = await createProjectSnapshot(projectId, { note: `恢复章节版本前：${target}`, reason: "before_restore_chapter_version" });
  const currentVersion = await saveChapterVersion(projectId, target, "before_restore");
  await writeProjectFile(projectId, target, await readProjectFile(projectId, source));
  return { restored: source, targetFile: target, currentVersion, safetySnapshot };
}

function diffParagraphs(oldText, newText) {
  const oldParts = String(oldText || "").split(/\r?\n+/).map((item) => item.trim()).filter(Boolean);
  const newParts = String(newText || "").split(/\r?\n+/).map((item) => item.trim()).filter(Boolean);
  const max = Math.max(oldParts.length, newParts.length);
  const rows = [];
  for (let index = 0; index < max; index += 1) {
    const before = oldParts[index] || "";
    const after = newParts[index] || "";
    rows.push({ index: index + 1, status: before === after ? "same" : before && after ? "changed" : before ? "removed" : "added", before, after });
  }
  return rows;
}

async function compareChapterText(projectId, { file, versionFile = "", content = "" }) {
  const current = await readProjectFile(projectId, file);
  const other = versionFile ? await readProjectFile(projectId, versionFile) : String(content || "");
  return { file, versionFile, diff: diffParagraphs(current, other).filter((row) => row.status !== "same").slice(0, 80) };
}

function buildRevisionPrompt({ taskText, chapterText, context }) {
  return `你是中文长篇小说修订编辑。请严格根据修订任务单修订正文。

## 修订任务单

${taskText}

## 项目上下文

${context}

## 当前正文

${chapterText}

要求：
1. 只输出修订后的完整正文，不解释过程。
2. 不改变核心设定和人物身份。
3. 保留必要伏笔，不一次性解释干净。
4. 降低 AI 感，减少“意识到、终于明白、内心深处”等解释性表达。
5. 保持移动端分段，对话换人换段。`;
}

async function runRevisionTask(projectId, body = {}, meta = {}) {
  const taskFile = body.taskFile && (await listMarkdownFiles(projectId)).includes(body.taskFile)
    ? body.taskFile
    : (await latestProjectFile(projectId, "06_发布/修订任务单_"));
  if (!taskFile) {
    const err = new Error("没有找到修订任务单");
    err.status = 400;
    throw err;
  }
  const chapters = await listChapters(projectId);
  const target = chapters.find((chapter) => (body.file && chapter.file === body.file) || (body.chapterNo && Number(chapter.no) === Number(body.chapterNo))) || chapters.find((chapter) => chapter.file);
  if (!target?.file) {
    const err = new Error("没有找到可修订正文");
    err.status = 400;
    throw err;
  }
  const safetySnapshot = await createProjectSnapshot(projectId, { note: `运行修订任务前：${target.file}`, reason: "before_revision_task" });
  const oldVersion = await saveChapterVersion(projectId, target.file, "before_revision");
  const stamp = timestampId();
  const runtimeDir = `09_运行时/第${String(target.no).padStart(3, "0")}章_${slugify(target.title || "修订")}/revision_${stamp}`;
  const runner = body.runner || meta.runner || "codex";
  const taskText = await readProjectFile(projectId, taskFile);
  const chapterText = await readProjectFile(projectId, target.file);

  if (runner === "codex") {
    const content = `# Codex任务单

请根据修订任务单修订小说章节。

项目路径：
\`\`\`text
${projectPath(projectId)}
\`\`\`

目标正文：\`${target.file}\`
修订任务单：\`${taskFile}\`
旧稿备份：\`${oldVersion.versionFile}\`
运行时目录：\`${runtimeDir}\`

要求：
1. 读取修订任务单和目标正文。
2. 把修订稿写入 \`${runtimeDir}/revision.md\`。
3. 不直接覆盖 \`${target.file}\`，等待用户人工确认。
4. 生成 \`${runtimeDir}/state-sync.md\`，只写修订后需要更新的长期记忆 JSON。
5. 简短说明修改了哪些文件。`;
    const run = await runCodexForProject(projectId, content);
    return { mode: "codex", status: "running", run, taskFile, targetFile: target.file, runtimeDir, oldVersion, safetySnapshot };
  }

  const context = await gatherContext(projectId, DEFAULT_CONTEXT_FILES);
  const output = await callModel({
    endpoint: body.endpoint || meta.endpoint,
    model: body.model || meta.model || "qwen3:8b",
    prompt: buildRevisionPrompt({ taskText, chapterText, context })
  });
  const revisionFile = `${runtimeDir}/revision.md`;
  await writeProjectFile(projectId, revisionFile, output.trim() + "\n");
  if (body.apply === true) {
    await writeProjectFile(projectId, target.file, output.trim() + "\n");
  }
  await updateProjectMeta(projectId, { model: body.model || meta.model, endpoint: body.endpoint || meta.endpoint, runner });
  return { mode: "model", status: "completed", taskFile, targetFile: target.file, runtimeDir, revisionFile, oldVersion, safetySnapshot, applied: body.apply === true };
}

async function analyzeMemoryConflicts(projectId) {
  const files = await listMarkdownFiles(projectId);
  const conflicts = [];
  const character = await readProjectJsonFile(projectId, "04_连续性/character_state.json", { characters: [] });
  const names = new Map();
  for (const item of character.characters || []) {
    const key = item.name || item.id;
    if (!key) continue;
    if (names.has(key)) conflicts.push({ type: "人物状态重复", key, files: ["04_连续性/character_state.json"], detail: `人物 ${key} 出现多条状态记录。` });
    names.set(key, item);
  }
  const timeline = await readProjectJsonFile(projectId, "04_连续性/timeline_state.json", { timeline: [] });
  const timelineKeys = new Map();
  for (const item of timeline.timeline || []) {
    const key = `${item.chapter || ""}:${item.event || ""}`;
    if (!item.event) continue;
    if (timelineKeys.has(key)) conflicts.push({ type: "时间线重复", key, files: ["04_连续性/timeline_state.json"], detail: `时间线事件重复：${key}` });
    timelineKeys.set(key, item);
  }
  const foreshadows = files.includes("04_连续性/伏笔回收表.md") ? await readProjectFile(projectId, "04_连续性/伏笔回收表.md").catch(() => "") : "";
  const openForeshadows = foreshadows.split(/\r?\n/).filter((line) => line.includes("|") && /未回收|待回收|进行中/.test(line)).length;
  if (openForeshadows >= 10) conflicts.push({ type: "伏笔积压", key: String(openForeshadows), files: ["04_连续性/伏笔回收表.md"], detail: `约 ${openForeshadows} 条伏笔仍待处理。` });
  const unresolved = files.includes("00_总控/未解决问题.md") ? await readProjectFile(projectId, "00_总控/未解决问题.md").catch(() => "") : "";
  const unresolvedCount = unresolved.split(/\r?\n/).filter((line) => line.includes("|") && /未解决|待定|待回收/.test(line)).length;
  if (unresolvedCount >= 10) conflicts.push({ type: "未解决问题积压", key: String(unresolvedCount), files: ["00_总控/未解决问题.md"], detail: `约 ${unresolvedCount} 条未解决问题，发布前需确认是悬念还是遗漏。` });
  const reportFile = `04_连续性/记忆冲突报告_${timestampId()}.md`;
  await writeProjectFile(projectId, reportFile, `# 记忆冲突报告

生成时间：${new Date().toISOString()}

${conflicts.length ? conflicts.map((item) => `- **${item.type}**：${item.detail}\n  - 位置：${item.files.map((file) => `\`${file}\``).join("、")}`).join("\n\n") : "- 暂未发现明显冲突。"}
`);
  return { conflicts, reportFile };
}

async function generatePublishMaterials(projectId, { platform = "通用", from = "", to = "" } = {}) {
  const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
  const chapters = await listChapters(projectId);
  const start = Number(from || 0);
  const end = Number(to || 0);
  const selected = chapters.filter((chapter) => (!start || chapter.no >= start) && (!end || chapter.no <= end));
  const tags = [
    meta.genre,
    ...(meta.premise || "").match(/同人|悬疑|热血|穿越|系统|群像|都市|玄幻|克苏鲁|无限|恋爱/g) || []
  ].filter(Boolean);
  const titleList = selected.map((chapter) => `- 第${chapter.no}章 ${chapter.title || "未命名"}`).join("\n");
  const file = `06_发布/发布资料包_${timestampId()}.md`;
  await writeProjectFile(projectId, file, `# 发布资料包

生成时间：${new Date().toISOString()}
目标平台：${platform}

## 作品名

${meta.name}

## 类型与标签

${[...new Set(tags)].join(" / ") || "未填写"}

## 一句话简介

${meta.premise || "请补充一句话卖点。"}

## 作品简介

${meta.premise || "请补充项目创意。"}

## 章节标题列表

${titleList || "- 暂无章节"}

## 封面提示词

主体：主角处于核心冲突现场。场景：体现作品类型与第一卷主舞台。色调：高对比、清晰、适合移动端缩略图。关键物件：与主角秘密或长期悬念相关。禁止：照搬已有 IP 角色形象、明显商标、原作画面复刻。

## 平台注意事项

- 简介不要剧透所有长期伏笔。
- 同人项目避免直接使用原作长台词、原作桥段复刻和官方图像。
- 标题与标签优先表达冲突、身份差异和追读问题。
`);
  return { file };
}

async function runBatchOperation(projectId, { task = "quality", from = "", to = "" } = {}) {
  const chapters = await listChapters(projectId);
  const start = Number(from || 0);
  const end = Number(to || 0);
  const selected = chapters.filter((chapter) => (!start || chapter.no >= start) && (!end || chapter.no <= end));
  const rows = [];
  for (const chapter of selected) {
    if (task === "quality") {
      const result = await analyzeChapterQuality(projectId, chapter);
      rows.push(`| 第${chapter.no}章 | ${chapter.title || ""} | ${result.wordCount || 0} | ${result.issues.length} | ${chapter.file || ""} |`);
    } else {
      rows.push(`| 第${chapter.no}章 | ${chapter.title || ""} | 待执行 | ${chapter.file || ""} |`);
    }
  }
  const file = `09_运行时/批量任务_${timestampId()}.md`;
  await writeProjectFile(projectId, file, `# 批量任务报告

任务：${task}
范围：${from || "开头"} - ${to || "结尾"}
生成时间：${new Date().toISOString()}

| 章节 | 标题 | 字数/状态 | 问题数 | 文件 |
| --- | --- | ---: | ---: | --- |
${rows.join("\n") || "| - | - | 0 | 0 | - |"}
`);
  return { file, count: selected.length };
}

async function readModelPresets(projectId) {
  return readProjectJsonFile(projectId, "05_提示词/model-presets.json", { version: 1, presets: [] });
}

async function saveModelPreset(projectId, preset = {}) {
  const data = await readModelPresets(projectId);
  data.presets = data.presets || [];
  const id = slugify(preset.id || preset.name || `preset_${Date.now()}`);
  const next = {
    id,
    name: preset.name || id,
    runner: preset.runner || "codex",
    model: preset.model || "",
    endpoint: preset.endpoint || "",
    task: preset.task || "通用",
    updatedAt: new Date().toISOString()
  };
  const index = data.presets.findIndex((item) => item.id === id);
  if (index >= 0) data.presets[index] = next;
  else data.presets.push(next);
  await writeProjectFile(projectId, "05_提示词/model-presets.json", JSON.stringify(data, null, 2) + "\n");
  return data;
}

async function cloneProject(projectId, { name = "" } = {}) {
  const source = projectPath(projectId);
  const meta = JSON.parse(await fs.readFile(path.join(source, "project.json"), "utf8"));
  const cloneName = name || `${meta.name || projectId}_副本_${new Date().toISOString().slice(0, 10)}`;
  const cloneId = slugify(cloneName);
  const target = projectPath(cloneId);
  if (await exists(target)) {
    const err = new Error("克隆目标项目已存在");
    err.status = 409;
    throw err;
  }
  await fs.cp(source, target, { recursive: true, force: true });
  await fs.writeFile(path.join(target, "project.json"), JSON.stringify({ ...meta, id: cloneId, name: cloneName, clonedFrom: projectId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, null, 2), "utf8");
  return JSON.parse(await fs.readFile(path.join(target, "project.json"), "utf8"));
}

async function directorySize(dir) {
  let total = 0;
  if (!(await exists(dir))) return total;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await directorySize(full);
    } else if (entry.isFile()) {
      total += (await fs.stat(full)).size;
    }
  }
  return total;
}

async function countProjectSnapshotFiles(dir) {
  let total = 0;
  if (!(await exists(dir))) return total;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await countProjectSnapshotFiles(full);
    } else if (entry.isFile()) {
      total += 1;
    }
  }
  return total;
}

async function listProjectSnapshots(projectId) {
  const root = snapshotPath(projectId);
  if (!(await exists(root))) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const snapshots = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const id = entry.name;
    const metaFile = snapshotPath(projectId, id, "snapshot.json");
    const contentDir = snapshotPath(projectId, id, "content");
    if (!(await exists(metaFile)) || !(await exists(contentDir))) continue;
    const meta = JSON.parse(await fs.readFile(metaFile, "utf8"));
    snapshots.push({
      id,
      note: meta.note || "",
      reason: meta.reason || "manual",
      createdAt: meta.createdAt || "",
      fileCount: meta.fileCount || 0,
      size: meta.size || 0
    });
  }
  return snapshots.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function createProjectSnapshot(projectId, { note = "", reason = "manual" } = {}) {
  const source = projectPath(projectId);
  if (!(await exists(path.join(source, "project.json")))) {
    const err = new Error("项目不存在，无法创建快照");
    err.status = 404;
    throw err;
  }
  const id = timestampId();
  const target = snapshotPath(projectId, id);
  const contentDir = path.join(target, "content");
  await fs.mkdir(contentDir, { recursive: true });
  await fs.cp(source, contentDir, { recursive: true, force: true });
  const meta = {
    id,
    projectId,
    note: String(note || "").trim(),
    reason,
    createdAt: new Date().toISOString(),
    fileCount: await countProjectSnapshotFiles(contentDir),
    size: await directorySize(contentDir)
  };
  await fs.writeFile(path.join(target, "snapshot.json"), JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

async function restoreProjectSnapshot(projectId, snapshotId) {
  const source = snapshotPath(projectId, snapshotId, "content");
  const target = projectPath(projectId);
  if (!(await exists(path.join(source, "project.json")))) {
    const err = new Error("快照不存在或内容不完整");
    err.status = 404;
    throw err;
  }

  const projectsRoot = path.resolve(PROJECTS_DIR);
  const targetRoot = path.resolve(target);
  if (!targetRoot.startsWith(projectsRoot + path.sep)) {
    const err = new Error("恢复目标路径不安全");
    err.status = 400;
    throw err;
  }

  const safetySnapshot = await createProjectSnapshot(projectId, {
    note: `恢复 ${snapshotId} 前自动创建`,
    reason: "before_restore"
  });
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  await fs.cp(source, target, { recursive: true, force: true });
  await updateProjectMeta(projectId, { restoredFromSnapshot: snapshotId });
  return { restored: snapshotId, safetySnapshot };
}

async function deleteProjectSnapshot(projectId, snapshotId) {
  const target = snapshotPath(projectId, snapshotId);
  if (!(await exists(target))) {
    const err = new Error("快照不存在");
    err.status = 404;
    throw err;
  }
  await fs.rm(target, { recursive: true, force: true });
  return { deleted: snapshotId };
}

async function getProjectStats(projectId, files = null) {
  const allFiles = files || (await listMarkdownFiles(projectId));
  const chapterFiles = allFiles.filter((file) => file.startsWith("01_正文/"));
  const codexFiles = allFiles.filter((file) => file.startsWith("07_Codex/"));
  const runtimeFiles = allFiles.filter((file) => file.startsWith("09_运行时/"));
  const coreFiles = [
    "00_总控/立项建议.md",
    "00_总控/author_intent.md",
    "00_总控/current_focus.md",
    "00_总控/chapters.json",
    "00_总控/创作总纲.md",
    "00_总控/章节目录.md",
    "02_人物/主角.md",
    "04_连续性/章节日志.md",
    "04_连续性/情绪账本.md",
    "04_连续性/伏笔回收表.md",
    "04_连续性/story_state.json",
    "04_连续性/character_state.json",
    "04_连续性/timeline_state.json",
    "04_连续性/plot_threads.json",
    "04_连续性/world_state.json",
    "04_连续性/style_memory.json",
    "04_连续性/reader_promises.json",
    "05_提示词/档案助手.md"
  ];

  let totalChars = 0;
  for (const file of chapterFiles) {
    try {
      const content = await readProjectFile(projectId, file);
      totalChars += content.replace(/\s/g, "").length;
    } catch {
      // Ignore unreadable chapter files.
    }
  }

  return {
    fileCount: allFiles.length,
    chapterCount: chapterFiles.length,
    plannedChapterCount: (await listChapters(projectId, allFiles)).length,
    codexArtifactCount: codexFiles.length,
    runtimeArtifactCount: runtimeFiles.length,
    totalChapterChars: totalChars,
    missingCoreFiles: coreFiles.filter((file) => !allFiles.includes(file)),
    latestFinal: allFiles.filter((file) => file.startsWith("07_Codex/") && file.endsWith("_final.md")).at(-1) || ""
  };
}

async function listCodexRuns(projectId) {
  const dir = projectPath(projectId, "07_Codex");
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const runs = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith("_status.json")) continue;
    const statusPath = path.join(dir, entry.name);
    const status = await readJsonIfExists(statusPath);
    if (!status?.runId) continue;
    runs.push({
      runId: status.runId,
      status: status.status || "unknown",
      code: status.code,
      startedAt: status.startedAt || "",
      finishedAt: status.finishedAt || "",
      logFile: status.logFile || `07_Codex/run_${status.runId}.log`,
      finalFile: status.finalFile || `07_Codex/run_${status.runId}_final.md`
    });
  }
  return runs.sort((a, b) => String(b.startedAt || b.runId).localeCompare(String(a.startedAt || a.runId))).slice(0, 12);
}

async function listStateSyncReviews(projectId, files = null) {
  const allFiles = files || (await listMarkdownFiles(projectId));
  const traceFiles = allFiles.filter((file) => file.startsWith("09_运行时/") && file.endsWith("/trace.json"));
  const reviews = [];
  for (const traceFile of traceFiles) {
    const trace = await readJsonIfExists(projectPath(projectId, ...traceFile.split("/")));
    if (!trace) continue;
    const runtimeDir = traceFile.split("/").slice(0, -1).join("/");
    const syncStage = Array.isArray(trace.stages) ? trace.stages.find((stage) => stage.name === "state_sync") : null;
    const failedStage = Array.isArray(trace.stages) ? trace.stages.find((stage) => stage.status === "failed") : null;
    const reportFile = `${runtimeDir}/state-sync-apply.md`;
    const stateSyncFile = `${runtimeDir}/state-sync.md`;
    const revisionFile = `${runtimeDir}/revision.md`;
    const hasReport = allFiles.includes(reportFile);
    const hasStateSync = allFiles.includes(stateSyncFile);
    const hasRevision = allFiles.includes(revisionFile);
    const status = syncStage?.status === "completed" && syncStage?.applied
      ? "applied"
      : syncStage?.status === "needs_review"
        ? "needs_review"
        : failedStage
          ? "failed"
          : hasStateSync
            ? "pending_review"
            : "pending";
    reviews.push({
      runtimeDir,
      traceFile,
      reportFile: hasReport ? reportFile : "",
      stateSyncFile: hasStateSync ? stateSyncFile : "",
      revisionFile: hasRevision ? revisionFile : "",
      status,
      task: trace.task || "",
      generatedAt: trace.generatedAt || "",
      updatedAt: trace.updatedAt || trace.generatedAt || "",
      failedStage: failedStage?.name || "",
      error: failedStage?.error || syncStage?.error || ""
    });
  }
  return reviews
    .sort((a, b) => String(b.updatedAt || b.generatedAt).localeCompare(String(a.updatedAt || a.generatedAt)))
    .slice(0, 8);
}

async function listProjectTasks(projectId, files = null) {
  const allFiles = files || (await listMarkdownFiles(projectId));
  const codexRuns = await listCodexRuns(projectId);
  const syncReviews = await listStateSyncReviews(projectId, allFiles);
  const revisionTasks = allFiles
    .filter((file) => file.startsWith("06_发布/修订任务单_"))
    .slice(-10)
    .map((file) => ({
      id: `revision:${file}`,
      kind: "revision",
      status: "ready",
      title: "修订任务单",
      detail: file,
      files: [file],
      startedAt: "",
      finishedAt: ""
    }));
  const qualityReports = allFiles
    .filter((file) => file.startsWith("06_发布/质检报告_") || file.startsWith("06_发布/批量质检_"))
    .slice(-10)
    .map((file) => ({
      id: `quality:${file}`,
      kind: "quality",
      status: "completed",
      title: "质检报告",
      detail: file,
      files: [file],
      startedAt: "",
      finishedAt: ""
    }));
  const runTasks = codexRuns.map((run) => ({
    id: `codex:${run.runId}`,
    kind: "codex",
    status: run.status || "unknown",
    title: "Codex 直连任务",
    detail: run.finalFile || run.logFile || run.runId,
    runtimeDir: "",
    files: [run.finalFile, run.logFile].filter(Boolean),
    startedAt: run.startedAt || "",
    finishedAt: run.finishedAt || ""
  }));
  const syncTasks = syncReviews.map((review) => ({
    id: `sync:${review.runtimeDir}`,
    kind: "sync-review",
    status: review.status || "pending",
    title: "状态同步审核",
    detail: review.task || review.runtimeDir,
    runtimeDir: review.runtimeDir,
    files: [review.traceFile, review.reportFile, review.stateSyncFile, review.revisionFile].filter(Boolean),
    startedAt: review.generatedAt || "",
    finishedAt: review.updatedAt || ""
  }));

  return [...runTasks, ...syncTasks, ...revisionTasks, ...qualityReports]
    .sort((a, b) => String(b.finishedAt || b.startedAt || b.detail).localeCompare(String(a.finishedAt || a.startedAt || a.detail), "zh-Hans-CN"))
    .slice(0, 40);
}

async function searchProjectFiles(projectId, query) {
  const q = String(query || "").trim();
  if (!q) return { query: q, results: [] };
  if (q.length > 80) {
    const err = new Error("搜索关键词太长，请缩短到 80 字以内");
    err.status = 400;
    throw err;
  }
  const files = await listMarkdownFiles(projectId);
  const results = [];
  const lower = q.toLocaleLowerCase("zh-Hans-CN");
  for (const file of files) {
    if (results.length >= 80) break;
    let content = "";
    try {
      content = await readProjectFile(projectId, file);
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      if (results.length >= 80) break;
      const line = lines[index];
      if (!line.toLocaleLowerCase("zh-Hans-CN").includes(lower)) continue;
      const trimmed = line.trim();
      results.push({
        file,
        line: index + 1,
        kind: file.split("/")[0] || "文件",
        preview: trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed
      });
    }
  }
  return { query: q, results };
}

function countTermHits(text, terms = []) {
  const content = String(text || "");
  return terms
    .map((term) => {
      const value = String(term || "");
      if (!value) return null;
      let count = 0;
      let index = content.indexOf(value);
      while (index >= 0) {
        count += 1;
        index = content.indexOf(value, index + value.length);
      }
      return count ? { term: value, count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, "zh-Hans-CN"));
}

function pickGenreProfile(project) {
  const text = `${project?.name || ""} ${project?.genre || ""} ${project?.premise || ""}`.toLocaleLowerCase("zh-Hans-CN");
  return NARRATIVE_RADAR_RULES.genreProfiles.find((profile) => {
    return profile.match.some((keyword) => text.includes(keyword.toLocaleLowerCase("zh-Hans-CN")));
  }) || {
    label: project?.genre || "通用",
    anchors: ["人物", "冲突", "目标", "代价", "变化", "伏笔", "选择", "关系", "场景", "钩子"],
    avoid: [],
    advice: "通用项目先看人物目标、冲突代价、章节变化和结尾钩子是否清楚。"
  };
}

function radarScore(value, warnAt, dangerAt) {
  if (value >= dangerAt) return 42;
  if (value >= warnAt) return 68;
  return 88;
}

function radarIssue(severity, title, detail, suggestion, meta = {}) {
  return { severity, title, detail, suggestion, ...meta };
}

async function analyzeNarrativeRadar(projectId, { file = "" } = {}) {
  const project = await readProject(projectId);
  const chapters = project.chapters || [];
  const targetFiles = file
    ? [safeRelativeFile(file)]
    : chapters.map((chapter) => chapter.file).filter(Boolean).slice(-5);
  const files = targetFiles.length
    ? targetFiles
    : (project.files || []).filter((item) => item.startsWith("01_正文/") && !item.startsWith("01_正文/历史版本/")).slice(-5);

  const texts = [];
  for (const item of files) {
    try {
      texts.push({ file: item, content: await readProjectFile(projectId, item) });
    } catch {
      // Ignore unreadable files; the radar should still show whatever can be scanned.
    }
  }
  const content = texts.map((item) => item.content).join("\n\n");
  const paragraphs = content.split(/\r?\n+/).map((item) => item.trim()).filter(Boolean);
  const chars = content.replace(/\s/g, "").length;
  const aiHits = countTermHits(content, NARRATIVE_RADAR_RULES.aiTone);
  const clicheHits = countTermHits(content, NARRATIVE_RADAR_RULES.cliches);
  const actionHits = countTermHits(content, NARRATIVE_RADAR_RULES.mechanicalActions);
  const profile = pickGenreProfile(project);
  const anchorHits = countTermHits(content, profile.anchors);
  const avoidHits = countTermHits(content, profile.avoid);
  const longParagraphs = paragraphs.filter((item) => item.replace(/\s/g, "").length > 240).length;
  const dialogueParagraphs = paragraphs.filter((item) => /[“「『].+[”」』]/.test(item) || item.includes("：“") || item.includes(':"')).length;
  const dialogueRatio = paragraphs.length ? dialogueParagraphs / paragraphs.length : 0;
  const unresolved = project.files.includes("00_总控/未解决问题.md") ? await readProjectFile(projectId, "00_总控/未解决问题.md").catch(() => "") : "";
  const foreshadows = project.files.includes("04_连续性/伏笔回收表.md") ? await readProjectFile(projectId, "04_连续性/伏笔回收表.md").catch(() => "") : "";
  const chapterLog = project.files.includes("04_连续性/章节日志.md") ? await readProjectFile(projectId, "04_连续性/章节日志.md").catch(() => "") : "";
  const unresolvedCount = unresolved.split(/\r?\n/).filter((line) => /^[-*]\s+/.test(line.trim())).length;
  const foreshadowCount = foreshadows.split(/\r?\n/).filter((line) => line.includes("|") && !line.includes("---")).length;
  const chapterLogCount = chapterLog.split(/\r?\n/).filter((line) => /^[-*#|]/.test(line.trim())).length;

  const issues = [];
  if (!texts.length) {
    issues.push(radarIssue("critical", "还没有可扫描正文", "创作雷达未读取到正文文件。", "先保存章节，或运行多阶段流水线生成正文。"));
  }
  if (aiHits.reduce((sum, item) => sum + item.count, 0) >= Math.max(5, Math.floor(chars / 900))) {
    issues.push(radarIssue("warn", "AI 腔连接词偏多", `命中 ${aiHits.length} 类模板化表达。`, "优先删除总结式连接词，把判断改成动作、对话或具体场景反应。", { hits: aiHits.slice(0, 8) }));
  }
  if (clicheHits.length) {
    issues.push(radarIssue("warn", "高频套路句出现", `命中 ${clicheHits.length} 类常见套路。`, "把身体反应改成更具体的行为选择，避免读者一眼看出模板。", { hits: clicheHits.slice(0, 8) }));
  }
  if (actionHits.reduce((sum, item) => sum + item.count, 0) >= Math.max(18, Math.floor(chars / 150))) {
    issues.push(radarIssue("info", "机械动作词密度偏高", "压、按、抬、垂、顿等动作词容易形成 AI 式机械调度。", "删掉无意义动作，把动作换成带目的的互动或选择。", { hits: actionHits.slice(0, 8) }));
  }
  if (longParagraphs >= 3) {
    issues.push(radarIssue("warn", "长段落偏多", `超过 240 字的段落有 ${longParagraphs} 段。`, "移动端阅读建议拆分说明、心理和动作，让节奏更可扫读。"));
  }
  if (paragraphs.length >= 10 && dialogueRatio < 0.12) {
    issues.push(radarIssue("info", "对话占比偏低", `当前对话段落约 ${Math.round(dialogueRatio * 100)}%。`, "如果不是纯动作或氛围章，可加入问答、误会、遮掩或交易。"));
  }
  if (anchorHits.length < 3 && chars > 800) {
    issues.push(radarIssue("info", "题材锚点偏弱", `${profile.label} 关键词命中较少。`, profile.advice, { hits: anchorHits }));
  }
  if (avoidHits.length) {
    issues.push(radarIssue("warn", "疑似题材串味", `出现 ${avoidHits.map((item) => item.term).join("、")}。`, "确认这些词是否符合当前项目设定；不符合就改成题材内部的表达。", { hits: avoidHits.slice(0, 8) }));
  }
  if (chapters.length && chapterLogCount < Math.min(3, chapters.length)) {
    issues.push(radarIssue("info", "章节日志偏薄", "长期记忆里的章节日志记录较少。", "保存章节后补一条本章变化、人物状态和新承诺，方便后续连续性。"));
  }
  if (unresolvedCount >= 8 || foreshadowCount >= 16) {
    issues.push(radarIssue("warn", "悬而未决信息积压", `未解决问题约 ${unresolvedCount} 条，伏笔记录约 ${foreshadowCount} 条。`, "下一轮流水线可以安排回收、转化或关闭一批旧承诺。"));
  }

  const aiPenalty = aiHits.reduce((sum, item) => sum + item.count, 0) + clicheHits.reduce((sum, item) => sum + item.count * 2, 0);
  const scores = {
    humanTexture: Math.max(35, radarScore(aiPenalty, 4, 10) - Math.min(18, actionHits.length * 2)),
    genreFit: Math.max(40, 70 + Math.min(20, anchorHits.length * 4) - avoidHits.length * 12),
    rhythm: Math.max(35, 88 - longParagraphs * 6 - (paragraphs.length >= 10 && dialogueRatio < 0.12 ? 10 : 0)),
    continuity: Math.max(40, 82 - Math.max(0, unresolvedCount - 6) * 3 - Math.max(0, foreshadowCount - 14) * 2),
    publishReadiness: 0
  };
  scores.publishReadiness = Math.round((scores.humanTexture + scores.genreFit + scores.rhythm + scores.continuity) / 4 - issues.filter((item) => item.severity === "critical").length * 16);

  return {
    project: project.name,
    genre: profile.label,
    files: texts.map((item) => item.file),
    chars,
    paragraphCount: paragraphs.length,
    scores,
    metrics: {
      aiHits: aiHits.slice(0, 12),
      clicheHits: clicheHits.slice(0, 12),
      actionHits: actionHits.slice(0, 12),
      genreAnchors: anchorHits.slice(0, 12),
      genreAvoid: avoidHits.slice(0, 12),
      longParagraphs,
      dialogueRatio,
      unresolvedCount,
      foreshadowCount
    },
    issues: issues.sort((a, b) => ({ critical: 0, warn: 1, info: 2 }[a.severity] - { critical: 0, warn: 1, info: 2 }[b.severity])).slice(0, 12),
    inspiration: {
      source: "基于本项目内置的题材规则、套路风险、去 AI 腔与健康检查思路生成。",
      next: "可继续扩展为项目级词库、向量检索和多 Gate 生成前检查。"
    }
  };
}

async function checkCommand(command) {
  return new Promise((resolve) => {
    const probe = process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", "where", command], { windowsHide: true })
      : spawn("sh", ["-lc", `command -v ${command}`]);
    probe.on("exit", (code) => resolve(code === 0));
    probe.on("error", () => resolve(false));
  });
}

async function checkModelEndpoint(endpoint) {
  if (!endpoint) return { checked: false, ok: false, message: "未配置本地模型接口" };
  const url = endpoint.includes("/api/generate") ? endpoint.replace(/\/api\/generate.*$/, "/api/tags") : endpoint;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timer);
    return { checked: true, ok: res.ok, message: res.ok ? "可连接" : `HTTP ${res.status}` };
  } catch (error) {
    return { checked: true, ok: false, message: error.message };
  }
}

async function runProjectDoctor(projectId) {
  const project = await readProject(projectId);
  const codexConfig = await readCodexLocalConfig();
  const codexCommand = await checkCommand("codex");
  const modelEndpoint = await checkModelEndpoint(project.endpoint);
  const projectsDirOk = await exists(PROJECTS_DIR);
  return {
    projectJson: true,
    projectsDirOk,
    codexCommand,
    codexModel: codexConfig.model,
    codexProvider: codexConfig.modelProvider,
    ccSwitchProvider: codexConfig.currentProviderCodex,
    novelSkillAvailable: codexConfig.novelSkillAvailable,
    modelEndpoint,
    missingCoreFiles: project.stats.missingCoreFiles,
    summaryOk: codexCommand && codexConfig.novelSkillAvailable && project.stats.missingCoreFiles.length <= 2
  };
}

function safeRelativeFile(file) {
  const normalized = String(file || "").replaceAll("\\", "/");
  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    const err = new Error("文件路径不合法");
    err.status = 400;
    throw err;
  }
  return normalized;
}

async function readProjectFile(projectId, file) {
  const rel = safeRelativeFile(file);
  return fs.readFile(projectPath(projectId, ...rel.split("/")), "utf8");
}

async function writeProjectFile(projectId, file, content) {
  const rel = safeRelativeFile(file);
  const full = projectPath(projectId, ...rel.split("/"));
  await ensureDir(full);
  await fs.writeFile(full, content ?? "", "utf8");
  await updateProjectMeta(projectId, {});
  return { file: rel };
}

async function saveKnowledgeFeedSources(projectId, files = [], stamp = timestampId()) {
  if (!Array.isArray(files) || !files.length) {
    const err = new Error("请先选择或粘贴至少一份资料");
    err.status = 400;
    throw err;
  }

  let totalChars = 0;
  const saved = [];
  for (const item of files.slice(0, 20)) {
    const content = String(item.content || "").trim();
    if (!content) continue;
    totalChars += content.length;
    if (totalChars > KNOWLEDGE_SOURCE_CHAR_LIMIT) {
      const err = new Error(`资料太长，本次最多约 ${KNOWLEDGE_SOURCE_CHAR_LIMIT} 字，请分批投喂`);
      err.status = 413;
      throw err;
    }
    const name = safeUploadFileName(item.name);
    const rel = `08_资料投喂/原始资料/${stamp}_${name}`;
    await writeProjectFile(projectId, rel, content + "\n");
    saved.push({ file: rel, name, chars: content.length, content });
  }

  if (!saved.length) {
    const err = new Error("资料内容为空");
    err.status = 400;
    throw err;
  }
  return saved;
}

async function ensureProjectTemplateFiles(projectId, files) {
  for (const file of files) {
    const full = projectPath(projectId, ...safeRelativeFile(file).split("/"));
    if (await exists(full)) continue;
    const template = TEMPLATE_FILES.find((item) => item.file === file);
    await writeProjectFile(projectId, file, template?.body || `# ${path.parse(file).name}\n`);
  }
}

async function ensureProjectControlFiles(projectId) {
  await ensureProjectTemplateFiles(projectId, [
    "00_总控/author_intent.md",
    "00_总控/current_focus.md",
    "00_总控/chapters.json",
    "04_连续性/story_state.json",
    "04_连续性/character_state.json",
    "04_连续性/timeline_state.json",
    "04_连续性/plot_threads.json",
    "04_连续性/world_state.json",
    "04_连续性/style_memory.json",
    "04_连续性/reader_promises.json",
    "05_提示词/档案助手.md"
  ]);
  await fs.mkdir(projectPath(projectId, "09_运行时"), { recursive: true });
}

async function applyArchiveAssistant(projectId, assistantId = "auto") {
  const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
  const assistant = pickArchiveAssistant({
    name: meta.name,
    genre: meta.genre,
    premise: meta.premise,
    assistantId
  });
  const next = await updateProjectMeta(projectId, {
    archiveAssistantId: assistant.id,
    archiveAssistantName: assistant.name
  });
  const skillBasis = await readNovelSkillBasis();
  await writeProjectFile(
    projectId,
    "05_提示词/档案助手.md",
    buildArchiveAssistantProfile({
      project: next,
      assistant,
      mode: assistantId === "auto" ? "auto" : "manual",
      skillBasis
    })
  );
  return { project: next, assistant: { id: assistant.id, name: assistant.name, tagline: assistant.tagline } };
}

async function readJsonIfExists(filePath) {
  if (!(await exists(filePath))) return null;
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function readCodexLocalConfig() {
  const ccSwitchSettings = await readJsonIfExists(path.join(CC_SWITCH_HOME, "settings.json"));
  const codexConfigFile = path.join(CODEX_HOME, "config.toml");
  const codexConfig = (await exists(codexConfigFile)) ? await fs.readFile(codexConfigFile, "utf8") : "";
  const modelMatch = codexConfig.match(/^model\s*=\s*"([^"]+)"/m);
  const providerMatch = codexConfig.match(/^model_provider\s*=\s*"([^"]+)"/m);
  const skillExists =
    (await exists(path.join(CC_SWITCH_HOME, "skills", "novel-writing-polisher", "SKILL.md"))) ||
    (await exists(path.join(CODEX_HOME, "skills", "novel-writing-polisher", "SKILL.md")));

  return {
    codexHome: CODEX_HOME,
    ccSwitchHome: CC_SWITCH_HOME,
    model: modelMatch?.[1] || "",
    modelProvider: providerMatch?.[1] || "",
    currentProviderCodex: ccSwitchSettings?.currentProviderCodex || "",
    skillStorageLocation: ccSwitchSettings?.skillStorageLocation || "",
    novelSkillAvailable: skillExists
  };
}

function chapterFileName(chapterNo, title = "") {
  const n = String(chapterNo || "").padStart(3, "0");
  const safeTitle = slugify(title || "未命名").replaceAll("-", "");
  return `01_正文/第${n}章_${safeTitle}.md`;
}

function timestampId() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function safeUploadFileName(name = "资料.txt") {
  const parsed = path.parse(String(name || "资料.txt").replaceAll("\\", "/"));
  const base = slugify(parsed.name || "资料");
  const ext = (parsed.ext || ".txt").toLowerCase().replace(/[^.\w-]/g, "").slice(0, 12) || ".txt";
  return `${base}${ext}`;
}

function extractMarkdownSection(markdown, heading) {
  const text = String(markdown || "").trim();
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|\\n)# ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n# |$)`);
  const match = text.match(pattern);
  return match?.[2]?.trim() || text;
}

async function gatherContext(projectId, selectedFiles = []) {
  const files = [...new Set([...DEFAULT_CONTEXT_FILES, ...(selectedFiles || [])])];
  const blocks = [];
  for (const file of files) {
    try {
      const content = await readProjectFile(projectId, file);
      blocks.push(`## ${file}\n${content.trim()}`);
    } catch {
      // Ignore optional context files.
    }
  }
  return blocks.join("\n\n---\n\n");
}

function yamlString(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function runtimeChapterKey({ chapterNo, title, task }) {
  const chapter = String(chapterNo || "未定章").padStart(3, "0");
  const safeTitle = slugify(title || task || "未命名").replaceAll("-", "");
  return `第${chapter}章_${safeTitle}`;
}

async function collectRuntimeContext(projectId, selectedFiles = []) {
  const files = [...new Set([...DEFAULT_CONTEXT_FILES, ...(selectedFiles || [])])];
  const summaries = [];
  for (const file of files) {
    try {
      const content = await readProjectFile(projectId, file);
      summaries.push({
        file,
        chars: content.length,
        excerpt: content.trim().slice(0, 600)
      });
    } catch {
      summaries.push({ file, missing: true });
    }
  }
  return summaries;
}

function buildRuleStackYaml({ task, selectedFiles = [] }) {
  const selected = selectedFiles.map((file) => `    - ${yamlString(file)}`).join("\n") || "    []";
  return `version: 1
task: ${yamlString(task)}
priority:
  - name: user_request
    level: highest
    source: ${yamlString("本次界面 brief / 当前任务")}
  - name: author_intent
    level: high
    source: ${yamlString("00_总控/author_intent.md")}
  - name: current_focus
    level: high
    source: ${yamlString("00_总控/current_focus.md")}
  - name: archive_assistant
    level: high
    source: ${yamlString("05_提示词/档案助手.md")}
  - name: project_skill
    level: high
    source: ${yamlString("05_提示词/SKILL.md")}
  - name: project_rules
    level: normal
    source:
      - ${yamlString("05_提示词/正文生成规则.md")}
      - ${yamlString("05_提示词/降AI感规则.md")}
      - ${yamlString("05_提示词/项目能力包.md")}
      - ${yamlString("05_提示词/项目工作流.md")}
      - ${yamlString("05_提示词/多角色协作.md")}
  - name: long_memory
    level: normal
    source:
      - ${yamlString("04_连续性/story_state.json")}
      - ${yamlString("04_连续性/character_state.json")}
      - ${yamlString("04_连续性/timeline_state.json")}
      - ${yamlString("04_连续性/plot_threads.json")}
      - ${yamlString("04_连续性/world_state.json")}
      - ${yamlString("04_连续性/style_memory.json")}
      - ${yamlString("04_连续性/reader_promises.json")}
selected_context:
${selected}
conflict_policy:
  - ${yamlString("用户明确要求 > author_intent > current_focus > 档案助手 > 项目规则 > 长期记忆")}
  - ${yamlString("发生冲突时必须在 trace 中记录，不要静默改设定")}
`;
}

async function compileRuntimeArtifacts(projectId, { task = "unknown", chapterNo = "", title = "", brief = "", draft = "", activeFile = "", contextFiles = [] } = {}) {
  await ensureProjectControlFiles(projectId);
  const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
  const stamp = timestampId();
  const chapterKey = runtimeChapterKey({ chapterNo, title, task });
  const runtimeDir = `09_运行时/${chapterKey}/run_${stamp}_${slugify(task)}`;
  const contextSummary = await collectRuntimeContext(projectId, contextFiles);

  const intent = `# Runtime Intent

- 时间：${new Date().toISOString()}
- 项目：${meta.name || projectId}
- 任务：${task}
- 章节：第${chapterNo || "?"}章 ${title || ""}
- 当前文件：${activeFile || "新章节或未指定"}

## 本轮 brief

${brief || "未填写。"}

## 当前草稿摘要

${draft ? draft.slice(0, 1200) : "无。"}

## 执行目标

- 先读取控制面、长期记忆、档案助手和项目规则。
- 再根据本轮 brief 执行任务。
- 如果发现设定、人物状态、规则或读者承诺冲突，必须在 trace 中记录。
`;

  const contextJson = {
    version: 1,
    generatedAt: new Date().toISOString(),
    projectId,
    projectName: meta.name || "",
    task,
    chapterNo: chapterNo || "",
    title: title || "",
    activeFile: activeFile || "",
    selectedContextFiles: contextFiles || [],
    defaultContextFiles: DEFAULT_CONTEXT_FILES,
    contextSummary
  };

  const traceJson = {
    version: 1,
    generatedAt: new Date().toISOString(),
    task,
    stages: [
      { name: "compile_intent", status: "completed", file: `${runtimeDir}/intent.md` },
      { name: "compile_context", status: "completed", file: `${runtimeDir}/context.json` },
      { name: "compile_rule_stack", status: "completed", file: `${runtimeDir}/rule-stack.yaml` },
      { name: "execute", status: "pending" },
      { name: "audit", status: "pending" },
      { name: "state_sync", status: "pending" }
    ],
    notes: []
  };

  await writeProjectFile(projectId, `${runtimeDir}/intent.md`, intent);
  await writeProjectFile(projectId, `${runtimeDir}/context.json`, JSON.stringify(contextJson, null, 2) + "\n");
  await writeProjectFile(projectId, `${runtimeDir}/rule-stack.yaml`, buildRuleStackYaml({ task, selectedFiles: contextFiles || [] }));
  await writeProjectFile(projectId, `${runtimeDir}/trace.json`, JSON.stringify(traceJson, null, 2) + "\n");
  return { runtimeDir };
}

async function updateRuntimeTrace(projectId, runtimeDir, stageName, patch = {}) {
  const traceFile = `${runtimeDir}/trace.json`;
  const full = projectPath(projectId, ...safeRelativeFile(traceFile).split("/"));
  const trace = (await exists(full)) ? JSON.parse(await fs.readFile(full, "utf8")) : { version: 1, stages: [] };
  const stages = Array.isArray(trace.stages) ? trace.stages : [];
  const index = stages.findIndex((stage) => stage.name === stageName);
  const nextStage = {
    name: stageName,
    ...(index >= 0 ? stages[index] : {}),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  if (index >= 0) stages[index] = nextStage;
  else stages.push(nextStage);
  trace.stages = stages;
  trace.updatedAt = new Date().toISOString();
  await writeProjectFile(projectId, traceFile, JSON.stringify(trace, null, 2) + "\n");
}

function buildPipelineStagePrompt({ stage, context, chapterNo, title, brief, draft, previous = "" }) {
  const stageText = {
    plan: "规划：明确本章目标、冲突、信息增量、人物变化、结尾钩子和必须避开的风险。",
    orchestrate: "编排：根据规划、项目资料和规则栈，安排场景顺序、出场人物、信息释放、伏笔与情绪节奏。",
    write: "写作：生成一章可发布的中文小说正文，遵守项目资料、档案助手、规则栈和编排方案。",
    audit: "审计：从 AI 感、连续性、人物可信度、节奏、冲突、钩子、合规风险检查正文问题。",
    revise: "修订：根据审计意见输出最终可发布章节正文，不解释过程。",
    state_sync: "状态同步：根据最终正文整理需要写回长期记忆的建议，包含章节日志、人物状态、伏笔、情绪账本、读者承诺和世界状态。"
  }[stage] || stage;
  const outputHint = stage === "revise"
    ? "只输出最终可发布章节正文。"
    : stage === "write"
      ? "只输出章节正文草稿。"
      : stage === "state_sync"
        ? `只输出 JSON，不要使用 Markdown。结构如下：
{
  "chapterLog": {"chapter":"","title":"","event":"","newInfo":"","characterChange":"","nextHook":""},
  "emotionEntries": [{"character":"","event":"","surfaceReaction":"","residue":"","payoff":""}],
  "foreshadowEntries": [{"id":"","firstSeen":"","surface":"","truth":"","mislead":"","status":"","payoff":""}],
  "unresolvedQuestions": [{"id":"","question":"","firstSeen":"","status":"","expectedPayoff":""}],
  "storyState": {"currentArc":"","globalSituation":"","activeConflicts":[],"resolvedConflicts":[],"openQuestions":[]},
  "characterUpdates": [{"name":"","status":"","goal":"","emotion":"","relationship":"","notes":""}],
  "timelineEvents": [{"chapter":"","event":"","time":"","impact":""}],
  "plotThreads": [{"id":"","thread":"","status":"","nextStep":""}],
  "worldRules": [{"rule":"","limit":"","cost":"","sourceChapter":""}],
  "styleMemory": {"voice":[],"preferredTextures":[],"bannedPatterns":[],"chapterRhythm":[]},
  "readerPromises": [{"promise":"","createdAt":"","status":"","payoffPlan":""}]
}`
        : "输出 Markdown，条目清晰，便于后续阶段读取。";

  return `你是本地小说工坊的多阶段流水线执行者。

当前阶段：${stageText}

章节：第${chapterNo || "?"}章 ${title || ""}

本章 brief：
${brief || "未填写。"}

项目资料与规则：
${context}

当前界面草稿：
${draft || "无。"}

前序阶段输出：
${previous || "无。"}

硬性边界：
1. 不模仿任何特定作者的原句、签名风格、独创设定或具体桥段。
2. 不凭空解决长期悬念；新增设定必须能写入状态同步建议。
3. 人物情绪通过动作、停顿、物件、选择、误会和潜台词表现。
4. 如发现项目资料冲突，必须在本阶段输出中标注。

输出要求：
${outputHint}`;
}

async function runModelPipeline(projectId, body, meta, runtime) {
  const context = await gatherContext(projectId, body.contextFiles);
  const stages = [
    ["plan", "plan.md"],
    ["orchestrate", "orchestration.md"],
    ["write", "draft.md"],
    ["audit", "audit.md"],
    ["revise", "revision.md"],
    ["state_sync", "state-sync.md"]
  ];
  let previous = "";
  let finalOutput = "";
  let stateSyncOutput = "";

  for (const [stage, fileName] of stages) {
    await updateRuntimeTrace(projectId, runtime.runtimeDir, stage, { status: "running" });
    const prompt = buildPipelineStagePrompt({
      stage,
      context,
      chapterNo: body.chapterNo,
      title: body.title,
      brief: body.brief,
      draft: stage === "audit" || stage === "revise" || stage === "state_sync" ? finalOutput || body.draft : body.draft,
      previous
    });
    let output;
    try {
      output = await callModel({
        endpoint: body.endpoint || meta.endpoint,
        model: body.model || meta.model || "qwen3:8b",
        prompt
      });
    } catch (error) {
      await updateRuntimeTrace(projectId, runtime.runtimeDir, stage, {
        status: "failed",
        error: error.message
      });
      throw error;
    }
    const content = output.trim() + "\n";
    const file = `${runtime.runtimeDir}/${fileName}`;
    await writeProjectFile(projectId, file, content);
    await updateRuntimeTrace(projectId, runtime.runtimeDir, stage, { status: "completed", file });
    previous += `\n\n# ${stage}\n${content}`;
    if (stage === "write" || stage === "revise") finalOutput = content;
    if (stage === "state_sync") stateSyncOutput = content;
  }

  const chapterFile = body.activeFile || chapterFileName(body.chapterNo, body.title || "未命名");
  await writeProjectFile(projectId, chapterFile, finalOutput);
  const syncResult = await applyStateSync(projectId, {
    chapterNo: body.chapterNo,
    title: body.title,
    chapterFile,
    runtimeDir: runtime.runtimeDir,
    output: stateSyncOutput
  });
  await updateRuntimeTrace(projectId, runtime.runtimeDir, "state_sync", {
    status: syncResult.applied ? "completed" : "needs_review",
    applied: syncResult.applied,
    reportFile: syncResult.reportFile,
    error: syncResult.error || ""
  });

  return {
    output: finalOutput,
    runtimeDir: runtime.runtimeDir,
    finalFile: `${runtime.runtimeDir}/revision.md`,
    chapterFile,
    sync: syncResult
  };
}

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  if (!candidate || !candidate.trim().startsWith("{")) return null;
  return JSON.parse(candidate);
}

async function appendMarkdownLine(projectId, file, line) {
  const full = projectPath(projectId, ...safeRelativeFile(file).split("/"));
  const current = (await exists(full)) ? await fs.readFile(full, "utf8") : "";
  await writeProjectFile(projectId, file, `${current.trimEnd()}\n${line}\n`);
}

async function readProjectJsonFile(projectId, file, fallback) {
  try {
    return JSON.parse(await readProjectFile(projectId, file));
  } catch {
    return fallback;
  }
}

function pushUnique(list, item, keyFn) {
  if (!item) return list;
  const key = keyFn(item);
  if (!key || list.some((existing) => keyFn(existing) === key)) return list;
  list.push(item);
  return list;
}

const SYNC_REVIEW_CATEGORIES = [
  {
    id: "chapterLog",
    label: "章节日志",
    target: "04_连续性/章节日志.md",
    keys: ["chapterLog", "chapter_log"]
  },
  {
    id: "emotionLedger",
    label: "情绪账本",
    target: "04_连续性/情绪账本.md",
    keys: ["emotionEntries", "emotionLedger", "emotion_ledger", "emotion_entries"]
  },
  {
    id: "foreshadows",
    label: "伏笔回收",
    target: "04_连续性/伏笔回收表.md",
    keys: ["foreshadowEntries", "foreshadows", "foreshadow_entries"]
  },
  {
    id: "story_state",
    label: "故事状态",
    target: "04_连续性/story_state.json",
    keys: ["storyState", "story_state", "unresolvedQuestions", "unresolved_questions"]
  },
  {
    id: "character_state",
    label: "人物状态",
    target: "04_连续性/character_state.json",
    keys: ["characterUpdates", "characterState", "character_state", "characters"]
  },
  {
    id: "timeline_state",
    label: "时间线",
    target: "04_连续性/timeline_state.json",
    keys: ["timelineEvents", "timeline", "timeline_state", "timeline_events"]
  },
  {
    id: "plot_threads",
    label: "剧情线程",
    target: "04_连续性/plot_threads.json",
    keys: ["plotThreads", "plot_threads", "threads"]
  },
  {
    id: "world_state",
    label: "世界状态",
    target: "04_连续性/world_state.json",
    keys: ["worldRules", "world", "world_state", "world_rules"]
  },
  {
    id: "style_memory",
    label: "风格记忆",
    target: "04_连续性/style_memory.json",
    keys: ["styleMemory", "style_memory"]
  },
  {
    id: "reader_promises",
    label: "读者承诺",
    target: "04_连续性/reader_promises.json",
    keys: ["readerPromises", "reader_promises", "promises"]
  }
];

function valueAtAnyKey(data, keys) {
  for (const key of keys) {
    if (data && Object.prototype.hasOwnProperty.call(data, key)) return data[key];
  }
  return undefined;
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.entries)) return value.entries;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.characters)) return value.characters;
  if (Array.isArray(value.timeline)) return value.timeline;
  if (Array.isArray(value.threads)) return value.threads;
  if (Array.isArray(value.rules)) return value.rules;
  if (Array.isArray(value.promises)) return value.promises;
  return typeof value === "object" ? [value] : [String(value)];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function entryText(entry, ...fields) {
  if (entry == null) return "";
  if (typeof entry !== "object") return String(entry);
  for (const field of fields) {
    if (entry[field]) return String(entry[field]);
  }
  return JSON.stringify(entry);
}

function entryKey(entry, ...fields) {
  const value = entryText(entry, ...fields);
  return value.slice(0, 240);
}

function compactPayload(value) {
  const json = JSON.stringify(value, null, 2) || "";
  return json.length > 260 ? `${json.slice(0, 260)}...` : json;
}

function encodeReviewPart(value) {
  return encodeURIComponent(String(value ?? ""));
}

function decodeReviewPart(value) {
  return decodeURIComponent(String(value ?? ""));
}

function categoryPayload(data, categoryId) {
  const category = SYNC_REVIEW_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return undefined;
  if (categoryId === "story_state") {
    const storyState = valueAtAnyKey(data, ["storyState", "story_state"]);
    const unresolvedQuestions = valueAtAnyKey(data, ["unresolvedQuestions", "unresolved_questions"]);
    if (!storyState && !unresolvedQuestions) return undefined;
    return { storyState: asObject(storyState), unresolvedQuestions: toArray(unresolvedQuestions) };
  }
  return valueAtAnyKey(data, category.keys);
}

function reviewEntryTitle(categoryId, value, key = "") {
  if (categoryId === "story_state" && key) return key === "unresolvedQuestions" ? "未解决问题" : `故事状态：${key}`;
  if (categoryId === "chapterLog") return entryText(value, "event", "title", "chapter") || "章节日志";
  if (categoryId === "emotionLedger") return [entryText(value, "character", "name"), entryText(value, "event", "scene")].filter(Boolean).join(" / ") || "情绪记录";
  if (categoryId === "foreshadows") return [entryText(value, "id"), entryText(value, "surface")].filter(Boolean).join(" / ") || "伏笔记录";
  if (categoryId === "character_state") return entryText(value, "name", "id") || "人物状态";
  if (categoryId === "timeline_state") return entryText(value, "event", "time", "chapter") || "时间线事件";
  if (categoryId === "plot_threads") return entryText(value, "thread", "name", "id") || "剧情线程";
  if (categoryId === "world_state") return entryText(value, "rule", "name", "id") || key || "世界状态";
  if (categoryId === "style_memory") return key ? `风格字段：${key}` : "风格记忆";
  if (categoryId === "reader_promises") return entryText(value, "promise", "question", "id") || "读者承诺";
  return key || "同步项";
}

function buildCategoryReviewEntries(categoryId, payload) {
  if (!payload) return [];
  if (categoryId === "story_state") {
    const entries = [];
    for (const [key, value] of Object.entries(asObject(payload.storyState))) {
      entries.push({
        id: `${categoryId}:storyState:${encodeReviewPart(key)}`,
        label: reviewEntryTitle(categoryId, value, key),
        summary: compactPayload(value)
      });
    }
    toArray(payload.unresolvedQuestions).forEach((value, index) => {
      entries.push({
        id: `${categoryId}:unresolvedQuestions:${index}`,
        label: reviewEntryTitle(categoryId, value, "unresolvedQuestions"),
        summary: compactPayload(value)
      });
    });
    return entries;
  }
  if (Array.isArray(payload)) {
    return payload.map((value, index) => ({
      id: `${categoryId}:${index}`,
      label: reviewEntryTitle(categoryId, value),
      summary: compactPayload(value)
    }));
  }
  if (payload && typeof payload === "object") {
    return Object.entries(payload).map(([key, value]) => ({
      id: `${categoryId}:field:${encodeReviewPart(key)}`,
      label: reviewEntryTitle(categoryId, value, key),
      summary: compactPayload(value)
    }));
  }
  return [{
    id: `${categoryId}:value`,
    label: reviewEntryTitle(categoryId, payload),
    summary: compactPayload(payload)
  }];
}

function buildSyncReviewItems(data) {
  return SYNC_REVIEW_CATEGORIES.map((category) => {
    const payload = categoryPayload(data, category.id);
    const entries = buildCategoryReviewEntries(category.id, payload);
    const count = entries.length;
    return {
      id: category.id,
      label: category.label,
      target: category.target,
      count,
      selected: count > 0,
      available: count > 0,
      entries,
      summary: count > 0 ? compactPayload(payload) : "本次没有识别到该类同步建议"
    };
  });
}

function selectedCategoryPayload(data, categoryId, selected) {
  const payload = categoryPayload(data, categoryId);
  if (!payload) return undefined;
  if (selected.has(categoryId)) return payload;
  const prefix = `${categoryId}:`;
  const ids = [...selected].filter((id) => id.startsWith(prefix));
  if (!ids.length) return undefined;

  if (categoryId === "story_state") {
    const partial = { storyState: {}, unresolvedQuestions: [] };
    for (const id of ids) {
      const parts = id.split(":");
      if (parts[1] === "storyState") {
        const key = decodeReviewPart(parts.slice(2).join(":"));
        if (Object.prototype.hasOwnProperty.call(asObject(payload.storyState), key)) {
          partial.storyState[key] = payload.storyState[key];
        }
      } else if (parts[1] === "unresolvedQuestions") {
        const index = Number(parts[2]);
        const questions = toArray(payload.unresolvedQuestions);
        if (Number.isInteger(index) && questions[index] !== undefined) partial.unresolvedQuestions.push(questions[index]);
      }
    }
    return Object.keys(partial.storyState).length || partial.unresolvedQuestions.length ? partial : undefined;
  }

  if (Array.isArray(payload)) {
    const picked = [];
    for (const id of ids) {
      const index = Number(id.slice(prefix.length));
      if (Number.isInteger(index) && payload[index] !== undefined) picked.push(payload[index]);
    }
    return picked.length ? picked : undefined;
  }

  if (payload && typeof payload === "object") {
    const picked = {};
    for (const id of ids) {
      const parts = id.split(":");
      if (parts[1] !== "field") continue;
      const key = decodeReviewPart(parts.slice(2).join(":"));
      if (Object.prototype.hasOwnProperty.call(payload, key)) picked[key] = payload[key];
    }
    return Object.keys(picked).length ? picked : undefined;
  }

  return ids.includes(`${categoryId}:value`) ? payload : undefined;
}

async function readStateSyncReview(projectId, runtimeDir) {
  const safeRuntimeDir = safeRelativeFile(runtimeDir || "");
  const candidates = [
    `${safeRuntimeDir}/state-sync.md`,
    `${safeRuntimeDir}/state-sync-apply.md`
  ];
  let sourceFile = "";
  let raw = "";
  for (const file of candidates) {
    try {
      raw = await readProjectFile(projectId, file);
      sourceFile = file;
      break;
    } catch {
      // Try the next possible runtime artifact.
    }
  }
  if (!sourceFile) {
    const err = new Error("没有找到可审核的 state-sync 产物");
    err.status = 404;
    throw err;
  }

  let data;
  try {
    data = extractJsonObject(raw);
  } catch (error) {
    const err = new Error(`state-sync JSON 解析失败：${error.message}`);
    err.status = 422;
    throw err;
  }
  if (!data) {
    const err = new Error("state-sync 中没有识别到 JSON，同步内容需要先人工整理为 JSON");
    err.status = 422;
    throw err;
  }

  return {
    runtimeDir: safeRuntimeDir,
    sourceFile,
    items: buildSyncReviewItems(data),
    raw: data
  };
}

async function applyStateSyncReviewData(projectId, { runtimeDir, data, itemIds = [] }) {
  const selected = new Set(itemIds);
  const reportFile = `${runtimeDir}/state-sync-review.md`;
  const reviewItems = buildSyncReviewItems(data);
  const selectedRows = [];
  const rejectedRows = [];
  for (const item of reviewItems.filter((entry) => entry.available)) {
    if (selected.has(item.id)) {
      selectedRows.push(`- ${item.label}：整类应用 -> ${item.target}`);
      continue;
    }
    const pickedEntries = item.entries.filter((entry) => selected.has(entry.id));
    for (const entry of pickedEntries) {
      selectedRows.push(`- ${item.label} / ${entry.label} -> ${item.target}`);
    }
    for (const entry of item.entries.filter((entry) => !selected.has(entry.id))) {
      rejectedRows.push(`- ${item.label} / ${entry.label}`);
    }
  }
  const selectedLabels = selectedRows.join("\n") || "- 无";
  const rejectedLabels = rejectedRows.join("\n") || "- 无";

  await writeProjectFile(projectId, reportFile, `# 状态同步人工审核报告

生成时间：${new Date().toISOString()}

## 已应用

${selectedLabels}

## 未应用

${rejectedLabels}

## 原始 JSON

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
`);

  const now = new Date().toISOString();

  const chapterLogPayload = selectedCategoryPayload(data, "chapterLog", selected);
  if (chapterLogPayload) {
    const chapter = asObject(chapterLogPayload);
    if (Object.keys(chapter).length) {
      await appendMarkdownLine(
        projectId,
        "04_连续性/章节日志.md",
        `| ${chapter.chapter || chapter.chapterNo || ""} | ${chapter.event || chapter.title || ""} | ${chapter.newInfo || ""} | ${chapter.characterChange || ""} | ${chapter.nextHook || ""} |`
      );
    }
  }

  const emotionLedgerPayload = selectedCategoryPayload(data, "emotionLedger", selected);
  if (emotionLedgerPayload) {
    for (const item of toArray(emotionLedgerPayload)) {
      await appendMarkdownLine(
        projectId,
        "04_连续性/情绪账本.md",
        `| ${entryText(item, "character", "name")} | ${entryText(item, "event", "scene")} | ${entryText(item, "surfaceReaction", "reaction")} | ${entryText(item, "residue")} | ${entryText(item, "payoff")} |`
      );
    }
  }

  const foreshadowsPayload = selectedCategoryPayload(data, "foreshadows", selected);
  if (foreshadowsPayload) {
    for (const item of toArray(foreshadowsPayload)) {
      await appendMarkdownLine(
        projectId,
        "04_连续性/伏笔回收表.md",
        `| ${entryText(item, "id")} | ${entryText(item, "firstSeen", "chapter")} | ${entryText(item, "surface")} | ${entryText(item, "truth")} | ${entryText(item, "mislead")} | ${entryText(item, "status")} | ${entryText(item, "payoff")} |`
      );
    }
  }

  const storyPayload = selectedCategoryPayload(data, "story_state", selected);
  if (storyPayload) {
    const story = await readProjectJsonFile(projectId, "04_连续性/story_state.json", { version: 1 });
    Object.assign(story, asObject(storyPayload.storyState), { updatedAt: now });
    await writeProjectFile(projectId, "04_连续性/story_state.json", JSON.stringify(story, null, 2) + "\n");
    for (const item of toArray(storyPayload.unresolvedQuestions)) {
      await appendMarkdownLine(
        projectId,
        "00_总控/未解决问题.md",
        `| ${entryText(item, "id")} | ${entryText(item, "question")} | ${entryText(item, "firstSeen", "chapter")} | ${entryText(item, "status") || "未解决"} | ${entryText(item, "expectedPayoff", "payoff")} |`
      );
    }
  }

  const characterPayload = selectedCategoryPayload(data, "character_state", selected);
  if (characterPayload) {
    const characterState = await readProjectJsonFile(projectId, "04_连续性/character_state.json", { version: 1, characters: [] });
    characterState.characters = characterState.characters || [];
    for (const item of toArray(characterPayload)) {
      const next = typeof item === "object" ? { ...item, updatedAt: now } : { name: String(item), updatedAt: now };
      pushUnique(characterState.characters, next, (entry) => entryKey(entry, "name", "id"));
    }
    characterState.updatedAt = now;
    await writeProjectFile(projectId, "04_连续性/character_state.json", JSON.stringify(characterState, null, 2) + "\n");
  }

  const timelinePayload = selectedCategoryPayload(data, "timeline_state", selected);
  if (timelinePayload) {
    const timeline = await readProjectJsonFile(projectId, "04_连续性/timeline_state.json", { version: 1, timeline: [] });
    timeline.timeline = timeline.timeline || [];
    for (const item of toArray(timelinePayload)) {
      pushUnique(timeline.timeline, item, (entry) => entryKey(entry, "event", "time", "chapter"));
    }
    timeline.updatedAt = now;
    await writeProjectFile(projectId, "04_连续性/timeline_state.json", JSON.stringify(timeline, null, 2) + "\n");
  }

  const plotThreadsPayload = selectedCategoryPayload(data, "plot_threads", selected);
  if (plotThreadsPayload) {
    const plotThreads = await readProjectJsonFile(projectId, "04_连续性/plot_threads.json", { version: 1, threads: [] });
    plotThreads.threads = plotThreads.threads || [];
    for (const item of toArray(plotThreadsPayload)) {
      pushUnique(plotThreads.threads, item, (entry) => entryKey(entry, "id", "thread", "name"));
    }
    plotThreads.updatedAt = now;
    await writeProjectFile(projectId, "04_连续性/plot_threads.json", JSON.stringify(plotThreads, null, 2) + "\n");
  }

  const worldPayload = selectedCategoryPayload(data, "world_state", selected);
  if (worldPayload) {
    const world = await readProjectJsonFile(projectId, "04_连续性/world_state.json", { version: 1, rules: [], locations: [], organizations: [], constraints: [] });
    if (Array.isArray(worldPayload) || Array.isArray(worldPayload?.rules)) {
      world.rules = world.rules || [];
      for (const item of toArray(worldPayload)) {
        pushUnique(world.rules, item, (entry) => entryKey(entry, "rule", "name", "id"));
      }
    } else {
      Object.assign(world, asObject(worldPayload));
    }
    world.updatedAt = now;
    await writeProjectFile(projectId, "04_连续性/world_state.json", JSON.stringify(world, null, 2) + "\n");
  }

  const stylePayload = selectedCategoryPayload(data, "style_memory", selected);
  if (stylePayload) {
    const style = await readProjectJsonFile(projectId, "04_连续性/style_memory.json", { version: 1 });
    Object.assign(style, asObject(stylePayload), { updatedAt: now });
    await writeProjectFile(projectId, "04_连续性/style_memory.json", JSON.stringify(style, null, 2) + "\n");
  }

  const readerPromisesPayload = selectedCategoryPayload(data, "reader_promises", selected);
  if (readerPromisesPayload) {
    const promises = await readProjectJsonFile(projectId, "04_连续性/reader_promises.json", { version: 1, promises: [] });
    promises.promises = promises.promises || [];
    for (const item of toArray(readerPromisesPayload)) {
      pushUnique(promises.promises, item, (entry) => entryKey(entry, "promise", "id", "question"));
    }
    promises.updatedAt = now;
    await writeProjectFile(projectId, "04_连续性/reader_promises.json", JSON.stringify(promises, null, 2) + "\n");
  }

  await appendMarkdownLine(projectId, reportFile, "\n## 应用结果\n\n已按勾选项写入长期记忆。应用前已创建项目快照，未勾选项没有写入。\n");
  await updateRuntimeTrace(projectId, runtimeDir, "state_sync", {
    status: "completed",
    applied: true,
    reportFile,
    reviewAppliedAt: now,
    selectedCategories: [...selected]
  });
  return { applied: true, reportFile, selectedCategories: [...selected] };
}

async function applyStateSync(projectId, { chapterNo, title, chapterFile, runtimeDir, output }) {
  const reportFile = `${runtimeDir}/state-sync-apply.md`;
  await writeProjectFile(projectId, reportFile, `# 状态同步应用报告\n\n## 原始输出\n\n\`\`\`json\n${String(output || "").trim()}\n\`\`\`\n`);

  let data;
  try {
    data = extractJsonObject(output);
  } catch (error) {
    await appendMarkdownLine(projectId, reportFile, `\n## 结果\n\nJSON 解析失败，已保留原始 state-sync 输出等待人工处理。\n\n错误：${error.message}\n`);
    return { applied: false, reportFile, error: error.message };
  }
  if (!data) {
    await appendMarkdownLine(projectId, reportFile, "\n## 结果\n\n没有识别到 JSON，已保留原始 state-sync 输出等待人工处理。\n");
    return { applied: false, reportFile, error: "no-json" };
  }

  const chapter = data.chapterLog || {};
  await appendMarkdownLine(
    projectId,
    "04_连续性/章节日志.md",
    `| 第${chapterNo || chapter.chapter || "?"}章 | ${chapter.event || title || ""} | ${chapter.newInfo || ""} | ${chapter.characterChange || ""} | ${chapter.nextHook || ""} |`
  );

  for (const item of data.emotionEntries || []) {
    await appendMarkdownLine(
      projectId,
      "04_连续性/情绪账本.md",
      `| ${item.character || ""} | ${item.event || `第${chapterNo || "?"}章`} | ${item.surfaceReaction || ""} | ${item.residue || ""} | ${item.payoff || ""} |`
    );
  }

  for (const item of data.foreshadowEntries || []) {
    await appendMarkdownLine(
      projectId,
      "04_连续性/伏笔回收表.md",
      `| ${item.id || ""} | ${item.firstSeen || `第${chapterNo || "?"}章`} | ${item.surface || ""} | ${item.truth || ""} | ${item.mislead || ""} | ${item.status || ""} | ${item.payoff || ""} |`
    );
  }

  for (const item of data.unresolvedQuestions || []) {
    await appendMarkdownLine(
      projectId,
      "00_总控/未解决问题.md",
      `| ${item.id || ""} | ${item.question || ""} | ${item.firstSeen || `第${chapterNo || "?"}章`} | ${item.status || "未解决"} | ${item.expectedPayoff || ""} |`
    );
  }

  const now = new Date().toISOString();
  const story = await readProjectJsonFile(projectId, "04_连续性/story_state.json", { version: 1 });
  Object.assign(story, data.storyState || {}, { updatedAt: now });
  await writeProjectFile(projectId, "04_连续性/story_state.json", JSON.stringify(story, null, 2) + "\n");

  const characterState = await readProjectJsonFile(projectId, "04_连续性/character_state.json", { version: 1, characters: [] });
  characterState.characters = characterState.characters || [];
  for (const item of data.characterUpdates || []) {
    pushUnique(characterState.characters, { ...item, updatedAt: now }, (entry) => entry.name);
  }
  characterState.updatedAt = now;
  await writeProjectFile(projectId, "04_连续性/character_state.json", JSON.stringify(characterState, null, 2) + "\n");

  const timeline = await readProjectJsonFile(projectId, "04_连续性/timeline_state.json", { version: 1, timeline: [] });
  timeline.timeline = timeline.timeline || [];
  for (const item of data.timelineEvents || []) {
    pushUnique(timeline.timeline, { chapter: item.chapter || `第${chapterNo || "?"}章`, ...item }, (entry) => `${entry.chapter}:${entry.event}`);
  }
  timeline.updatedAt = now;
  await writeProjectFile(projectId, "04_连续性/timeline_state.json", JSON.stringify(timeline, null, 2) + "\n");

  const plotThreads = await readProjectJsonFile(projectId, "04_连续性/plot_threads.json", { version: 1, threads: [] });
  plotThreads.threads = plotThreads.threads || [];
  for (const item of data.plotThreads || []) {
    pushUnique(plotThreads.threads, item, (entry) => entry.id || entry.thread);
  }
  plotThreads.updatedAt = now;
  await writeProjectFile(projectId, "04_连续性/plot_threads.json", JSON.stringify(plotThreads, null, 2) + "\n");

  const world = await readProjectJsonFile(projectId, "04_连续性/world_state.json", { version: 1, rules: [], locations: [], organizations: [], constraints: [] });
  world.rules = world.rules || [];
  for (const item of data.worldRules || []) {
    pushUnique(world.rules, item, (entry) => entry.rule);
  }
  world.updatedAt = now;
  await writeProjectFile(projectId, "04_连续性/world_state.json", JSON.stringify(world, null, 2) + "\n");

  const style = await readProjectJsonFile(projectId, "04_连续性/style_memory.json", { version: 1 });
  Object.assign(style, data.styleMemory || {}, { updatedAt: now });
  await writeProjectFile(projectId, "04_连续性/style_memory.json", JSON.stringify(style, null, 2) + "\n");

  const promises = await readProjectJsonFile(projectId, "04_连续性/reader_promises.json", { version: 1, promises: [] });
  promises.promises = promises.promises || [];
  for (const item of data.readerPromises || []) {
    pushUnique(promises.promises, item, (entry) => entry.promise);
  }
  promises.updatedAt = now;
  await writeProjectFile(projectId, "04_连续性/reader_promises.json", JSON.stringify(promises, null, 2) + "\n");

  await appendMarkdownLine(projectId, reportFile, `\n## 结果\n\n已应用到长期记忆。最终章节：\`${chapterFile}\`\n`);
  return { applied: true, reportFile };
}

function buildPrompt({ task, title, chapterNo, brief, draft, context }) {
  const taskMap = {
    draft: "生成一章可直接发布的中文小说正文。",
    polish: "在不改变核心剧情的前提下润色正文，降低 AI 感，使其更像真人作者写出的可发布章节。",
    review: "对正文做发布前审稿，指出影响发布的硬伤，并给出可执行修改建议。",
    continuity: "检查正文与项目资料的连续性、人物状态、伏笔、情绪债和因果漏洞。"
  };
  const taskText = taskMap[task] || taskMap.draft;
  const needsProse = task === "draft" || task === "polish";

  return `你是一个本地小说生产工具中的中文长篇小说编辑与正文写手。

任务：${taskText}

章节：第${chapterNo || "?"}章 ${title || ""}

本章 brief：
${brief || "未填写，请根据项目资料合理推进，但不要凭空解决所有长期问题。"}

项目资料：
${context}

当前草稿：
${draft || "无。"}

硬性要求：
1. 不要模仿任何特定作者的原句、签名风格、独创设定或具体桥段。
2. 正文面向中文网文手机端阅读，段落清楚，对话换人换段。
3. 人物情绪通过动作、停顿、物件、选择、误会和潜台词表现，不要大量写“他意识到/她终于明白”。
4. 保留人物的不体面和不完整反应：沉默、嘴硬、答非所问、误判、回避、迁怒。
5. 每章必须有信息增量、人物压力、具体场景和结尾追读钩子。
6. 不要用说明书式设定倾倒，不要把所有伏笔一次性解释干净。

输出格式：
${needsProse ? "只输出可直接粘贴进正文文件的章节文本，不要解释创作思路。" : "输出审稿报告，按严重程度列出问题、证据和修改建议。"}
`;
}

function buildIdeaPrompt({ idea, projectName, genre, context }) {
  return `你是中文长篇小说的立项编辑，负责把作者的一段想法发展成可执行的小说项目资料。

项目名或暂定名：${projectName || "未填写"}
当前类型倾向：${genre || "未填写"}

作者原始思路：
${idea || "未填写"}

已有项目资料：
${context || "无"}

请输出一份“立项建议”，要求务实、可直接写入项目档案。不要写空泛鸡汤，不要模仿任何特定作者。

必须包含以下栏目：

## 书名建议
给出 12 个中文书名，分成“强悬念型、情绪钩子型、平台爽点型、克制质感型”，每个书名附一句适合的卖点解释。

## 类型推荐
推荐 3 个最适合的类型/子类型组合，并说明适合哪个平台阅读节奏。

## 标签与便签建议
给出 20 个标签或便签，分为题材标签、情绪标签、卖点标签、避坑标签。

## 一句话卖点
给出 5 个版本，必须具体、有冲突、有可持续连载空间。

## 封面描述建议
给出 6 条封面描述，适合交给画师或图像模型使用；每条包含主体、场景、色调、关键物件、禁止元素。

## 主角建议
给出 3 套主角方案，每套包括表面身份、核心恐惧、压力反应、不可说秘密。

## 阻力系统
列出反派/制度/环境/人情关系四类阻力，说明它们如何持续制造章节压力。

## 前三章启动方案
每章给出本章任务、开场钩子、信息增量、结尾钩子。

## 可长期追读的问题
列出 8 个读者会持续等待答案的问题。

输出只写立项建议本身。`;
}

function buildKnowledgeFeedPrompt({ projectName, note, sources, context }) {
  return `你是一个严谨的中文小说项目“能力整理员”。你的任务不是复述资料，也不是上传什么就接受什么，而是把作者投喂的规则、限制、平台要求、写作经验或审稿标准做综合判断后，整理成项目可复用能力。

项目名：${projectName || "未填写"}

作者补充说明：
${note || "无"}

现有项目资料与能力：
${context || "无"}

本次投喂资料：
${sources || "无"}

处理原则：
1. 先判断资料性质：硬性规则、经验建议、平台限制、风格偏好、流程方法、角色分工、风险内容、与本项目无关内容。
2. 不要把上传资料原文直接加入能力；必须去重、合并、抽象成可执行规则。
3. 与项目目标冲突、证据不足、过时、会导致侵权/仿写/洗稿/违规的内容，不采纳，并说明原因。
4. 可以把有价值但不宜硬性执行的内容放入“参考建议”，不能写成强制规则。
5. 最终内容要能被后续生成章节、润色、审稿、连续性检查直接读取使用。

请输出 Markdown，必须包含以下栏目：

# 资料吸收报告
## 资料类型判断
## 采纳规则
## 不采纳内容与原因
## 冲突与风险

# 项目能力包
按“必须遵守 / 优先考虑 / 可选参考 / 禁止事项”整理。

# 项目工作流
整理成立项、章节规划、正文生成、降 AI 感、审稿、连续性检查、发布前检查的流程。

# 多角色协作
整理成立项编辑、结构编辑、正文写手、风格润色、审稿人、连续性管理员、发布检查员的分工。

# 本项目写作 Skill
用简洁规则写成可复用技能说明，包含触发场景、输入、处理步骤、输出标准和安全边界。

只输出整理后的结果，不要输出原始资料全文。`;
}

function buildCodexKnowledgeFeedTask({ projectId, note, sourceFiles, reportFile }) {
  const root = projectPath(projectId);
  const sourceList = sourceFiles.map((file) => `- \`${file}\``).join("\n") || "- 无";
  return `# Codex任务单

更新时间：${new Date().toISOString()}

## 项目路径

\`\`\`text
${root}
\`\`\`

## 当前任务

请执行“资料投喂吸收”：读取本次上传的资料文件，综合判断后，把真正适合本项目的规则、限制、流程和多角色分工整理为项目能力。

这不是简单追加资料。必须先分析、去重、判断冲突、识别风险，再决定哪些内容被采纳。

## 作者补充说明

${note || "无"}

## 本次资料文件

${sourceList}

## 必须读取的现有项目能力

1. \`00_总控/创作总纲.md\`
2. \`05_提示词/正文生成规则.md\`
3. \`05_提示词/降AI感规则.md\`
4. \`05_提示词/项目能力包.md\`
5. \`05_提示词/项目工作流.md\`
6. \`05_提示词/多角色协作.md\`
7. \`05_提示词/SKILL.md\`
8. \`05_提示词/档案助手.md\`

## 必须写入或更新

1. \`${reportFile}\`：写清楚资料类型判断、采纳项、不采纳项、冲突和风险。
2. \`05_提示词/项目能力包.md\`：只写经过综合判断后沉淀出的项目能力。
3. \`05_提示词/项目工作流.md\`：整理可执行工作流。
4. \`05_提示词/多角色协作.md\`：整理多角色分工。
5. \`05_提示词/SKILL.md\`：整理成本项目可复用技能说明。

## 判断标准

- 不要把上传资料原文直接复制进能力文件。
- 与项目目标冲突、证据不足、过时、会导致侵权/仿写/洗稿/违规的内容，不采纳。
- 与已有能力重复的内容要合并，不能制造多套互相冲突的规则。
- 有价值但不适合强制执行的内容，标记为“参考建议”。
- 后续生成章节、润色、审稿、连续性检查会默认读取这些能力文件，所以必须写得短、清楚、可执行。

## 输出要求

直接修改上述项目文件。完成后简短列出修改了哪些文件。`;
}

function buildCodexTask({ projectId, task, chapterNo, title, brief, activeFile, draft, runtimeDir = "" }) {
  const root = projectPath(projectId);
  const taskFile = path.join(root, "07_Codex", "Codex任务单.md");
  return `# Codex任务单

更新时间：${new Date().toISOString()}

## 项目路径

\`\`\`text
${root}
\`\`\`

## 当前任务

${task || "请根据项目资料继续推进小说创作。"}

## 本次运行时产物

${runtimeDir ? `请优先读取 \`${runtimeDir}/intent.md\`、\`${runtimeDir}/context.json\`、\`${runtimeDir}/rule-stack.yaml\` 和 \`${runtimeDir}/trace.json\`，并在完成后根据实际情况更新 trace。` : "未编译运行时产物。"}

## 写作能力

请优先使用本地已同步的 $novel-writing-polisher 技能处理小说创作、续写、润色、降 AI 感和连续性维护。

## 当前章节

- 章节号：第${chapterNo || "?"}章
- 标题：${title || "未填写"}
- 当前正文文件：${activeFile || "新章节，尚未保存"}

## 本章 brief

${brief || "未填写。"}

## 当前界面草稿

${draft ? draft : "未提供。请优先读取当前正文文件。"}

## Codex 零配置接入方式

在本地 Codex 里直接发送下面这句话即可：

\`\`\`text
请读取并执行这个任务单：${taskFile}
\`\`\`

Codex 不需要额外 API 配置，因为这个项目使用本地 Markdown 文件夹管理。它只需要读取本项目下的资料文件，然后按任务单写入或修改对应文件。

## 默认读取顺序

1. \`00_总控/创作总纲.md\`
2. \`00_总控/立项建议.md\`
3. \`00_总控/章节目录.md\`
4. \`02_人物/*.md\`
5. \`03_设定/*.md\`
6. \`04_连续性/章节日志.md\`
7. \`04_连续性/情绪账本.md\`
8. \`04_连续性/伏笔回收表.md\`
9. \`05_提示词/正文生成规则.md\`
10. \`05_提示词/降AI感规则.md\`
11. \`05_提示词/项目能力包.md\`
12. \`05_提示词/项目工作流.md\`
13. \`05_提示词/多角色协作.md\`
14. \`05_提示词/SKILL.md\`
15. \`05_提示词/档案助手.md\`

## 输出要求

- 如果是写正文，直接修改或创建 \`01_正文\` 下的章节文件。
- 如果是立项、审稿、连续性检查，写入 \`00_总控\` 或 \`04_连续性\` 的对应文件。
- 保持中文网文手机端排版。
- 不模仿任何特定作者的原句、签名风格、具体桥段或独创设定。
- 每次修改后简短说明改动文件。
`;
}

function buildCodexIdeaTask({ projectId, idea, genre, runtimeDir = "" }) {
  const root = projectPath(projectId);
  return `# Codex任务单

更新时间：${new Date().toISOString()}

## 项目路径

\`\`\`text
${root}
\`\`\`

## 当前任务

请对下面的原始创意做“创意孵化”，并直接写入本地项目文件。

## 本次运行时产物

${runtimeDir ? `请优先读取 \`${runtimeDir}/intent.md\`、\`${runtimeDir}/context.json\`、\`${runtimeDir}/rule-stack.yaml\` 和 \`${runtimeDir}/trace.json\`，并在完成后根据实际情况更新 trace。` : "未编译运行时产物。"}

原始创意：

${idea || "未填写。"}

类型倾向：

${genre || "未填写，请根据创意推荐。"}

## 写作能力

请优先使用本地已同步的 $novel-writing-polisher 技能，必要时参考本项目的提示词规则。

## 必须写入或更新的文件

1. \`00_总控/立项建议.md\`
2. \`00_总控/封面与发布资料.md\`
3. \`00_总控/创作总纲.md\`
4. \`00_总控/章节目录.md\`
5. 如有明确主角方案，创建或更新 \`02_人物/主角.md\`

## 立项建议必须包含

- 书名建议：至少 12 个，分为强悬念型、情绪钩子型、平台爽点型、克制质感型。
- 类型推荐：至少 3 个类型/子类型组合，并说明适合的平台阅读节奏。
- 标签/便签建议：至少 20 个，分为题材标签、情绪标签、卖点标签、避坑标签。
- 一句话卖点：至少 5 个版本。
- 封面描述建议：至少 6 条，包含主体、场景、色调、关键物件、禁止元素。
- 主角方案：至少 3 套，每套有表面身份、核心恐惧、压力反应、不可说秘密。
- 阻力系统：反派、制度、环境、人情关系四类阻力。
- 前三章启动方案：每章有本章任务、开场钩子、信息增量、结尾钩子。
- 可长期追读的问题：至少 8 个。

## 输出要求

- 直接修改上述项目文件，不要只在最终回复里给建议。
- 不模仿任何特定作者的原句、签名风格、具体桥段或独创设定。
- 完成后简短列出修改了哪些文件。
`;
}

function buildCodexPipelineTask({ projectId, chapterNo, title, brief, activeFile, draft, runtimeDir }) {
  const root = projectPath(projectId);
  return `# Codex任务单：多阶段写作流水线

更新时间：${new Date().toISOString()}

## 项目路径

\`\`\`text
${root}
\`\`\`

## 当前任务

请按 InkOS 式多阶段流水线执行本章创作：

1. 规划 plan
2. 编排 orchestrate
3. 写作 write
4. 审计 audit
5. 修订 revise
6. 状态同步 state_sync

## 本次运行时产物

请先读取：

- \`${runtimeDir}/intent.md\`
- \`${runtimeDir}/context.json\`
- \`${runtimeDir}/rule-stack.yaml\`
- \`${runtimeDir}/trace.json\`

每完成一个阶段，写入对应文件，并更新 \`${runtimeDir}/trace.json\` 的阶段状态。

## 当前章节

- 章节号：第${chapterNo || "?"}章
- 标题：${title || "未填写"}
- 当前正文文件：${activeFile || "新章节，尚未保存"}

## 本章 brief

${brief || "未填写。"}

## 当前界面草稿

${draft || "无。"}

## 必须写入的阶段产物

- \`${runtimeDir}/plan.md\`
- \`${runtimeDir}/orchestration.md\`
- \`${runtimeDir}/draft.md\`
- \`${runtimeDir}/audit.md\`
- \`${runtimeDir}/revision.md\`
- \`${runtimeDir}/state-sync.md\`

## 必须同步的项目文件

- 最终正文：创建或更新 \`01_正文\` 下的章节文件。
- 状态同步：根据最终正文更新 \`04_连续性/章节日志.md\`、\`04_连续性/情绪账本.md\`、\`04_连续性/伏笔回收表.md\`，并按需要更新 \`04_连续性/*.json\`。
- 如果出现新的长期问题，更新 \`00_总控/未解决问题.md\`。

## 写作能力与边界

- 优先使用本地 $novel-writing-polisher 和项目 \`05_提示词/档案助手.md\`。
- 不模仿任何特定作者的原句、签名风格、具体桥段或独创设定。
- 不要把所有伏笔一次性解释干净。
- 如果规则冲突，在 \`${runtimeDir}/trace.json\` 和 \`${runtimeDir}/audit.md\` 中记录。

完成后简短列出修改了哪些文件。`;
}

function buildCodexRunPrompt(taskFile) {
  return `请读取并执行这个小说项目任务单：

${taskFile}

要求：
1. 使用本地项目文件作为唯一事实来源。
2. 优先使用 $novel-writing-polisher 技能。
3. 按任务单创建或修改项目文件。
4. 不要要求用户再复制资料；需要的资料请自己从项目目录读取。
5. 完成后简短说明修改了哪些文件。`;
}

async function runCodexForProject(projectId, taskContent) {
  const root = projectPath(projectId);
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const codexDir = projectPath(projectId, "07_Codex");
  await fs.mkdir(codexDir, { recursive: true });

  const taskFile = path.join(codexDir, "Codex任务单.md");
  const promptFile = path.join(codexDir, `run_${runId}_prompt.md`);
  const logFile = path.join(codexDir, `run_${runId}.log`);
  const finalFile = path.join(codexDir, `run_${runId}_final.md`);
  const statusFile = path.join(codexDir, `run_${runId}_status.json`);
  const prompt = buildCodexRunPrompt(taskFile);

  await fs.writeFile(taskFile, taskContent, "utf8");
  await fs.writeFile(promptFile, prompt, "utf8");
  await fs.writeFile(logFile, "", "utf8");
  await fs.writeFile(
    statusFile,
    JSON.stringify({ runId, status: "running", startedAt: new Date().toISOString(), pid: null }, null, 2),
    "utf8"
  );

  const args = [
    "exec",
    "--cd",
    root,
    "--skip-git-repo-check",
    "--sandbox",
    "danger-full-access",
    "--output-last-message",
    finalFile,
    "-"
  ];

  const command = process.platform === "win32" ? "cmd.exe" : "codex";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "codex", ...args] : args;
  const child = spawn(command, commandArgs, {
    cwd: root,
    windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env }
  });

  child.stdin.end(prompt, "utf8");
  await fs.writeFile(
    statusFile,
    JSON.stringify({ runId, status: "running", startedAt: new Date().toISOString(), pid: child.pid }, null, 2),
    "utf8"
  );

  const appendLog = async (chunk) => {
    await fs.appendFile(logFile, chunk.toString(), "utf8").catch(() => {});
  };
  child.stdout.on("data", appendLog);
  child.stderr.on("data", appendLog);
  child.on("exit", async (code, signal) => {
    const status = code === 0 ? "completed" : "failed";
    await fs.writeFile(
      statusFile,
      JSON.stringify(
        {
          runId,
          status,
          code,
          signal,
          finishedAt: new Date().toISOString(),
          logFile: path.relative(root, logFile).replaceAll(path.sep, "/"),
          finalFile: path.relative(root, finalFile).replaceAll(path.sep, "/")
        },
        null,
        2
      ),
      "utf8"
    ).catch(() => {});
  });

  return {
    runId,
    pid: child.pid,
    taskFile: path.relative(root, taskFile).replaceAll(path.sep, "/"),
    promptFile: path.relative(root, promptFile).replaceAll(path.sep, "/"),
    logFile: path.relative(root, logFile).replaceAll(path.sep, "/"),
    finalFile: path.relative(root, finalFile).replaceAll(path.sep, "/"),
    statusFile: path.relative(root, statusFile).replaceAll(path.sep, "/")
  };
}

function openFolder(folderPath) {
  if (process.platform === "win32") {
    spawn("explorer.exe", [folderPath], {
      detached: true,
      stdio: "ignore",
      windowsHide: false
    }).unref();
  } else if (process.platform === "darwin") {
    spawn("open", [folderPath], { detached: true, stdio: "ignore" }).unref();
  } else {
    spawn("xdg-open", [folderPath], { detached: true, stdio: "ignore" }).unref();
  }
}

async function callModel({ endpoint, model, prompt }) {
  const url = endpoint || "http://127.0.0.1:11434/api/generate";
  const isChatCompletions = url.includes("/v1/chat/completions");
  const payload = isChatCompletions
    ? {
        model,
        messages: [
          { role: "system", content: "你是严谨的中文长篇小说编辑与正文写手。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.8
      }
    : {
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9
        }
      };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    const err = new Error(`模型接口连接失败：${url}。如果你没有启动 Ollama/LM Studio，请把“生成流水线”的执行方式切到“Codex 直连”。原始错误：${error.message}`);
    err.status = 502;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`模型接口返回 ${res.status}: ${text.slice(0, 500)}`);
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  if (isChatCompletions) return data.choices?.[0]?.message?.content || "";
  return data.response || "";
}

async function exportProject(projectId, options = "txt") {
  const config = typeof options === "string" ? { format: options } : options || {};
  const chapters = await listChapters(projectId);
  const start = Number(config.from || 0);
  const end = Number(config.to || 0);
  const selectedChapterFiles = chapters
    .filter((chapter) => chapter.file && (!start || chapter.no >= start) && (!end || chapter.no <= end))
    .map((chapter) => chapter.file);
  const files = selectedChapterFiles.length
    ? selectedChapterFiles
    : (await listMarkdownFiles(projectId)).filter((file) => file.startsWith("01_正文/") && !file.startsWith("01_正文/历史版本/"));
  const parts = [];
  for (const file of files) {
    const chapter = chapters.find((item) => item.file === file);
    const content = (await readProjectFile(projectId, file)).trim();
    parts.push(config.withTitles === false || !chapter ? content : `# 第${chapter.no}章 ${chapter.title || ""}\n\n${content}`);
  }
  const content = parts.filter(Boolean).join("\n\n");
  const ext = config.format === "md" ? "md" : config.format === "docx" ? "md" : "txt";
  const range = start || end ? `_第${start || 1}-${end || "末"}章` : "";
  const platform = config.platform ? `_${slugify(config.platform)}` : "";
  const name = `发布稿${platform}${range}_${new Date().toISOString().slice(0, 10)}.${ext}`;
  await writeProjectFile(projectId, `06_发布/${name}`, content);
  return { file: `06_发布/${name}`, content };
}

async function routeApi(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, root: ROOT });
  }

  if (req.method === "GET" && url.pathname === "/api/projects") {
    return sendJson(res, 200, { projects: await listProjects() });
  }

  if (req.method === "GET" && url.pathname === "/api/codex/config") {
    return sendJson(res, 200, { config: await readCodexLocalConfig() });
  }

  if (req.method === "GET" && url.pathname === "/api/archive-assistants") {
    return sendJson(res, 200, { assistants: publicArchiveAssistants() });
  }

  if (req.method === "POST" && url.pathname === "/api/projects") {
    const body = await readBody(req);
    if (!body.name?.trim()) {
      const err = new Error("项目名不能为空");
      err.status = 400;
      throw err;
    }
    return sendJson(res, 201, { project: await initProject(body) });
  }

  if (req.method === "POST" && url.pathname === "/api/idea/project") {
    const body = await readBody(req);
    const idea = String(body.idea || "").trim();
    if (!idea) {
      const err = new Error("原始思路不能为空");
      err.status = 400;
      throw err;
    }
    const projectName = String(body.name || "").trim() || projectNameFromIdea(idea);
    const project = await initProject({
      name: projectName,
      genre: body.genre || "",
      premise: idea,
      archiveAssistant: body.archiveAssistant || "auto"
    });
    return sendJson(res, 201, { project });
  }

  if (parts[0] === "api" && parts[1] === "projects" && parts[2]) {
    const projectId = parts[2];
    if (req.method === "GET" && parts.length === 3) {
      return sendJson(res, 200, { project: await readProject(projectId) });
    }

    if (req.method === "POST" && parts[3] === "clone") {
      const body = await readBody(req);
      return sendJson(res, 201, { project: await cloneProject(projectId, body) });
    }

    if (req.method === "POST" && parts[3] === "meta") {
      const body = await readBody(req);
      return sendJson(res, 200, { project: await updateProjectMeta(projectId, body) });
    }

    if (req.method === "POST" && parts[3] === "archive-assistant") {
      const body = await readBody(req);
      return sendJson(res, 200, await applyArchiveAssistant(projectId, body.assistantId || "auto"));
    }

    if (parts[3] === "model-presets") {
      if (req.method === "GET") {
        return sendJson(res, 200, await readModelPresets(projectId));
      }
      if (req.method === "POST") {
        const body = await readBody(req);
        return sendJson(res, 200, await saveModelPreset(projectId, body));
      }
    }

    if (req.method === "GET" && parts[3] === "doctor") {
      return sendJson(res, 200, { doctor: await runProjectDoctor(projectId) });
    }

    if (req.method === "GET" && parts[3] === "runs") {
      return sendJson(res, 200, { runs: await listCodexRuns(projectId) });
    }

    if (req.method === "GET" && parts[3] === "tasks") {
      return sendJson(res, 200, { tasks: await listProjectTasks(projectId) });
    }

    if (req.method === "GET" && parts[3] === "search") {
      return sendJson(res, 200, await searchProjectFiles(projectId, url.searchParams.get("q") || ""));
    }

    if (req.method === "GET" && parts[3] === "narrative-radar") {
      return sendJson(res, 200, await analyzeNarrativeRadar(projectId, { file: url.searchParams.get("file") || "" }));
    }

    if (parts[3] === "snapshots") {
      if (req.method === "GET" && parts.length === 4) {
        return sendJson(res, 200, { snapshots: await listProjectSnapshots(projectId) });
      }
      if (req.method === "POST" && parts.length === 4) {
        const body = await readBody(req);
        const snapshot = await createProjectSnapshot(projectId, {
          note: body.note || "",
          reason: "manual"
        });
        return sendJson(res, 201, { snapshot, snapshots: await listProjectSnapshots(projectId) });
      }
      if (req.method === "POST" && parts[5] === "restore") {
        const result = await restoreProjectSnapshot(projectId, parts[4]);
        return sendJson(res, 200, { ...result, project: await readProject(projectId) });
      }
      if (req.method === "DELETE" && parts[4]) {
        const result = await deleteProjectSnapshot(projectId, parts[4]);
        return sendJson(res, 200, { ...result, snapshots: await listProjectSnapshots(projectId) });
      }
    }

    if (req.method === "POST" && parts[3] === "open-folder") {
      const root = projectPath(projectId);
      if (IN_DOCKER) {
        return sendJson(res, 200, {
          ok: false,
          path: displayProjectPath(projectId),
          message: "Docker 容器不能直接打开宿主机资源管理器，请使用复制项目路径。"
        });
      }
      openFolder(root);
      return sendJson(res, 200, { ok: true, method: "explorer.exe", path: displayProjectPath(projectId) });
    }

    if (req.method === "GET" && parts[3] === "file") {
      const file = url.searchParams.get("path");
      return sendJson(res, 200, { file, content: await readProjectFile(projectId, file) });
    }

    if (req.method === "POST" && parts[3] === "file") {
      const body = await readBody(req);
      return sendJson(res, 200, await writeProjectFile(projectId, body.file, body.content));
    }

    if (req.method === "POST" && parts[3] === "chapter") {
      const body = await readBody(req);
      const file = body.file || chapterFileName(body.chapterNo, body.title);
      const result = await writeProjectFile(projectId, file, body.content);
      await updateChapterPlan(projectId, {
        no: body.chapterNo,
        title: body.title,
        status: body.status || "待审",
        brief: body.brief,
        file: result.file,
        wordCount: String(body.content || "").replace(/\s/g, "").length
      });
      return sendJson(res, 200, result);
    }

    if (parts[3] === "chapters") {
      if (req.method === "GET") {
        return sendJson(res, 200, { chapters: await listChapters(projectId) });
      }
      if (req.method === "POST") {
        const body = await readBody(req);
        const chapters = await updateChapterPlan(projectId, body);
        return sendJson(res, 200, { chapters });
      }
    }

    if (parts[3] === "sync-review") {
      if (req.method === "GET") {
        const runtimeDir = url.searchParams.get("runtimeDir") || "";
        const review = await readStateSyncReview(projectId, runtimeDir);
        return sendJson(res, 200, review);
      }
      if (req.method === "POST" && parts[4] === "apply") {
        const body = await readBody(req);
        const runtimeDir = safeRelativeFile(body.runtimeDir || "");
        const review = await readStateSyncReview(projectId, runtimeDir);
        const itemIds = Array.isArray(body.itemIds) ? body.itemIds.filter(Boolean) : [];
        if (!itemIds.length) {
          const err = new Error("请至少选择一项要应用的同步内容");
          err.status = 400;
          throw err;
        }
        const validIds = new Set(
          review.items
            .filter((item) => item.available)
            .flatMap((item) => [item.id, ...(item.entries || []).map((entry) => entry.id)])
        );
        const selected = itemIds.filter((id) => validIds.has(id));
        if (!selected.length) {
          const err = new Error("所选同步项没有可应用内容");
          err.status = 400;
          throw err;
        }
        const safetySnapshot = await createProjectSnapshot(projectId, {
          note: `应用状态同步前：${runtimeDir}`,
          reason: "before_state_sync_review"
        });
        const result = await applyStateSyncReviewData(projectId, {
          runtimeDir,
          data: review.raw,
          itemIds: selected
        });
        const project = await readProject(projectId);
        return sendJson(res, 200, { ...result, safetySnapshot, project });
      }
    }

    if (req.method === "POST" && parts[3] === "quality-check") {
      const body = await readBody(req);
      const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
      if (parts[4] === "ai") {
        const result = await runAiQualityReview(projectId, body, meta);
        return sendJson(res, result.mode === "codex" ? 202 : 200, { ...result, project: await readProject(projectId) });
      }
      const result = await runPublishQualityCheck(projectId, body);
      return sendJson(res, 200, { ...result, project: await readProject(projectId) });
    }

    if (req.method === "POST" && parts[3] === "revision-task") {
      const body = await readBody(req);
      const result = await createRevisionTask(projectId, body);
      return sendJson(res, 200, { ...result, project: await readProject(projectId) });
    }

    if (req.method === "POST" && parts[3] === "revision-run") {
      const body = await readBody(req);
      const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
      const result = await runRevisionTask(projectId, body, meta);
      return sendJson(res, result.mode === "codex" ? 202 : 200, { ...result, project: await readProject(projectId) });
    }

    if (parts[3] === "versions") {
      if (req.method === "GET") {
        return sendJson(res, 200, { versions: await listChapterVersions(projectId) });
      }
      if (req.method === "POST" && parts[4] === "restore") {
        const body = await readBody(req);
        const result = await restoreChapterVersion(projectId, body);
        return sendJson(res, 200, { ...result, project: await readProject(projectId) });
      }
      if (req.method === "POST" && parts[4] === "diff") {
        const body = await readBody(req);
        return sendJson(res, 200, await compareChapterText(projectId, body));
      }
    }

    if (req.method === "POST" && parts[3] === "conflicts") {
      const result = await analyzeMemoryConflicts(projectId);
      return sendJson(res, 200, { ...result, project: await readProject(projectId) });
    }

    if (req.method === "POST" && parts[3] === "publish-materials") {
      const body = await readBody(req);
      const result = await generatePublishMaterials(projectId, body);
      return sendJson(res, 200, { ...result, project: await readProject(projectId) });
    }

    if (req.method === "POST" && parts[3] === "batch") {
      const body = await readBody(req);
      const result = await runBatchOperation(projectId, body);
      return sendJson(res, 200, { ...result, project: await readProject(projectId) });
    }

    if (req.method === "POST" && parts[3] === "generate") {
      const body = await readBody(req);
      const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
      const runtime = await compileRuntimeArtifacts(projectId, {
        task: body.task || "generate",
        chapterNo: body.chapterNo,
        title: body.title,
        brief: body.brief,
        draft: body.draft,
        activeFile: body.activeFile,
        contextFiles: body.contextFiles
      });
      const context = await gatherContext(projectId, body.contextFiles);
      const prompt = buildPrompt({ ...body, context });
      const output = await callModel({
        endpoint: body.endpoint || meta.endpoint,
        model: body.model || meta.model || "qwen3:8b",
        prompt
      });
      await updateProjectMeta(projectId, { model: body.model || meta.model, endpoint: body.endpoint || meta.endpoint });
      return sendJson(res, 200, { output, prompt, runtime });
    }

    if (req.method === "POST" && parts[3] === "pipeline") {
      const body = await readBody(req);
      const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
      const runtime = await compileRuntimeArtifacts(projectId, {
        task: "pipeline",
        chapterNo: body.chapterNo,
        title: body.title,
        brief: body.brief,
        draft: body.draft,
        activeFile: body.activeFile,
        contextFiles: body.contextFiles
      });

      if ((body.runner || meta.runner || "codex") === "codex") {
        const content = buildCodexPipelineTask({
          projectId,
          chapterNo: body.chapterNo,
          title: body.title,
          brief: body.brief,
          activeFile: body.activeFile,
          draft: body.draft,
          runtimeDir: runtime.runtimeDir
        });
        const run = await runCodexForProject(projectId, content);
        return sendJson(res, 202, { mode: "codex", run, runtime });
      }

      const result = await runModelPipeline(projectId, body, meta, runtime);
      await updateProjectMeta(projectId, { model: body.model || meta.model, endpoint: body.endpoint || meta.endpoint });
      return sendJson(res, 200, { mode: "model", ...result });
    }

    if (req.method === "POST" && parts[3] === "idea") {
      const body = await readBody(req);
      const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
      const runtime = await compileRuntimeArtifacts(projectId, {
        task: "idea",
        brief: body.idea,
        contextFiles: body.contextFiles
      });
      const context = await gatherContext(projectId, body.contextFiles);
      const prompt = buildIdeaPrompt({
        idea: body.idea,
        projectName: meta.name,
        genre: body.genre || meta.genre,
        context
      });
      const output = await callModel({
        endpoint: body.endpoint || meta.endpoint,
        model: body.model || meta.model || "qwen3:8b",
        prompt
      });
      await writeProjectFile(projectId, "00_总控/立项建议.md", output.trim() + "\n");
      await updateProjectMeta(projectId, {
        model: body.model || meta.model,
        endpoint: body.endpoint || meta.endpoint,
        premise: body.idea || meta.premise,
        genre: body.genre || meta.genre
      });
      return sendJson(res, 200, { output, file: "00_总控/立项建议.md", prompt, runtime });
    }

    if (req.method === "POST" && parts[3] === "knowledge-feed") {
      const body = await readBody(req);
      const meta = JSON.parse(await fs.readFile(projectPath(projectId, "project.json"), "utf8"));
      const stamp = timestampId();
      const saved = await saveKnowledgeFeedSources(projectId, body.files, stamp);
      await ensureProjectTemplateFiles(projectId, [
        "05_提示词/项目能力包.md",
        "05_提示词/项目工作流.md",
        "05_提示词/多角色协作.md",
        "05_提示词/SKILL.md",
        "05_提示词/档案助手.md"
      ]);
      const reportFile = `08_资料投喂/投喂报告_${stamp}.md`;

      if ((body.runner || meta.runner || "codex") === "codex") {
        const content = buildCodexKnowledgeFeedTask({
          projectId,
          note: body.note,
          sourceFiles: saved.map((item) => item.file),
          reportFile
        });
        const run = await runCodexForProject(projectId, content);
        return sendJson(res, 202, {
          mode: "codex",
          run,
          sources: saved.map(({ file, name, chars }) => ({ file, name, chars })),
          reportFile
        });
      }

      const context = await gatherContext(projectId, [
        "05_提示词/项目能力包.md",
        "05_提示词/项目工作流.md",
        "05_提示词/多角色协作.md",
        "05_提示词/SKILL.md",
        "05_提示词/档案助手.md"
      ]);
      const sourceBlocks = saved.map((item) => `## ${item.file}\n${item.content}`).join("\n\n---\n\n");
      const prompt = buildKnowledgeFeedPrompt({
        projectName: meta.name,
        note: body.note,
        sources: sourceBlocks,
        context
      });
      const output = await callModel({
        endpoint: body.endpoint || meta.endpoint,
        model: body.model || meta.model || "qwen3:8b",
        prompt
      });
      const result = output.trim() + "\n";
      await writeProjectFile(projectId, reportFile, result);
      await writeProjectFile(projectId, "05_提示词/项目能力包.md", `# 项目能力包\n\n${extractMarkdownSection(result, "项目能力包")}\n`);
      await writeProjectFile(projectId, "05_提示词/项目工作流.md", `# 项目工作流\n\n${extractMarkdownSection(result, "项目工作流")}\n`);
      await writeProjectFile(projectId, "05_提示词/多角色协作.md", `# 多角色协作\n\n${extractMarkdownSection(result, "多角色协作")}\n`);
      await writeProjectFile(projectId, "05_提示词/SKILL.md", `# 本项目写作 Skill\n\n${extractMarkdownSection(result, "本项目写作 Skill")}\n`);
      await updateProjectMeta(projectId, { model: body.model || meta.model, endpoint: body.endpoint || meta.endpoint });
      return sendJson(res, 200, {
        mode: "model",
        output: result,
        file: reportFile,
        sources: saved.map(({ file, name, chars }) => ({ file, name, chars }))
      });
    }

    if (req.method === "POST" && parts[3] === "codex") {
      const body = await readBody(req);
      const runtime = await compileRuntimeArtifacts(projectId, {
        task: "codex-task",
        chapterNo: body.chapterNo,
        title: body.title,
        brief: body.brief || body.task,
        draft: body.draft,
        activeFile: body.activeFile
      });
      const content = buildCodexTask({
        projectId,
        task: body.task,
        chapterNo: body.chapterNo,
        title: body.title,
        brief: body.brief,
        activeFile: body.activeFile
        ,
        draft: body.draft,
        runtimeDir: runtime.runtimeDir
      });
      await writeProjectFile(projectId, "07_Codex/Codex任务单.md", content);
      return sendJson(res, 200, { file: "07_Codex/Codex任务单.md", content, runtime });
    }

    if (req.method === "POST" && parts[3] === "codex-run") {
      const body = await readBody(req);
      const runtime = await compileRuntimeArtifacts(projectId, {
        task: body.mode === "idea" ? "idea" : "codex-run",
        chapterNo: body.chapterNo,
        title: body.title,
        brief: body.brief || body.idea || body.task,
        draft: body.draft,
        activeFile: body.activeFile
      });
      const content =
        body.mode === "idea"
          ? buildCodexIdeaTask({
              projectId,
              idea: body.idea || body.brief || body.task,
              genre: body.genre,
              runtimeDir: runtime.runtimeDir
            })
          : buildCodexTask({
              projectId,
              task: body.task,
              chapterNo: body.chapterNo,
              title: body.title,
              brief: body.brief,
              activeFile: body.activeFile
              ,
              draft: body.draft,
              runtimeDir: runtime.runtimeDir
            });
      const run = await runCodexForProject(projectId, content);
      return sendJson(res, 202, { run, runtime });
    }

    if (req.method === "GET" && parts[3] === "codex-run" && parts[4]) {
      const runId = parts[4];
      const statusFile = projectPath(projectId, "07_Codex", `run_${runId}_status.json`);
      const logFile = projectPath(projectId, "07_Codex", `run_${runId}.log`);
      const finalFile = projectPath(projectId, "07_Codex", `run_${runId}_final.md`);
      const status = (await exists(statusFile)) ? JSON.parse(await fs.readFile(statusFile, "utf8")) : { runId, status: "unknown" };
      const log = (await exists(logFile)) ? await fs.readFile(logFile, "utf8") : "";
      const final = (await exists(finalFile)) ? await fs.readFile(finalFile, "utf8") : "";
      return sendJson(res, 200, { status, log: log.slice(-12000), final });
    }

    if (req.method === "POST" && parts[3] === "export") {
      const body = await readBody(req);
      return sendJson(res, 200, await exportProject(projectId, body));
    }
  }

  const err = new Error("接口不存在");
  err.status = 404;
  throw err;
}

async function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const full = path.resolve(PUBLIC_DIR, "." + requested);
  if (!full.startsWith(path.resolve(PUBLIC_DIR) + path.sep) && full !== path.join(PUBLIC_DIR, "index.html")) {
    return sendText(res, 403, "Forbidden");
  }
  try {
    const content = await fs.readFile(full);
    const type = TEXT_TYPES.get(path.extname(full).toLowerCase()) || "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(content);
  } catch {
    sendText(res, 404, "Not found");
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await routeApi(req, res, url);
    } else {
      await serveStatic(req, res, url);
    }
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "服务器错误" });
  }
});

export function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      const address = server.address();
      const actualPort = typeof address === "object" && address ? address.port : port;
      console.log(`本地小说工坊已启动: http://127.0.0.1:${actualPort}`);
      console.log(`项目目录: ${PROJECTS_DIR}`);
      resolve({ server, port: actualPort, projectsDir: PROJECTS_DIR });
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
