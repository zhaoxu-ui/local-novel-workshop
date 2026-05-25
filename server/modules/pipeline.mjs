export const PIPELINE_MODULE_BOUNDARY = {
  name: "pipeline",
  owns: ["09_运行时/*"],
  responsibilities: ["运行时产物", "多阶段流水线", "状态同步审核"]
};
