export const MEMORY_MODULE_BOUNDARY = {
  name: "memory",
  owns: ["04_连续性/*.json", "04_连续性/*.md"],
  responsibilities: ["长期记忆读取", "长期记忆 schema 校验", "召回控制"]
};

export const MEMORY_SCHEMAS = {
  "04_连续性/character_state.json": { root: "characters", requiredRoot: true },
  "04_连续性/timeline_state.json": { root: "events", requiredRoot: false },
  "04_连续性/plot_threads.json": { root: "threads", requiredRoot: false },
  "04_连续性/world_state.json": { root: "rules", requiredRoot: false },
  "04_连续性/reader_promises.json": { root: "promises", requiredRoot: false },
  "04_连续性/style_memory.json": { root: "imitationProfile", requiredRoot: false },
  "04_连续性/memory_pins.json": { root: "pins", requiredRoot: false },
  "04_连续性/memory_exclusions.json": { root: "exclusions", requiredRoot: false }
};

export function validateMemoryPayload(file, payload) {
  const schema = MEMORY_SCHEMAS[file];
  const issues = [];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    issues.push("根节点必须是 JSON object。");
    return { ok: false, issues };
  }
  if (schema?.requiredRoot && !Array.isArray(payload[schema.root])) {
    issues.push(`缺少数组字段：${schema.root}`);
  }
  if (schema?.root && payload[schema.root] != null && schema.root !== "imitationProfile" && !Array.isArray(payload[schema.root])) {
    issues.push(`${schema.root} 应为数组。`);
  }
  if (payload.version != null && typeof payload.version !== "number") {
    issues.push("version 应为数字。");
  }
  return { ok: issues.length === 0, issues };
}
