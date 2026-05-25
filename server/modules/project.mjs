export const PROJECT_MODULE_BOUNDARY = {
  name: "project",
  owns: ["project.json", "00_总控/*", "02_人物/*", "03_设定/*"],
  responsibilities: ["项目创建", "项目元数据", "章节规划", "项目快照"]
};
