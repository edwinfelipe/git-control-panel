const AVAILABLE_OPTIONS = {
  ar: "Add one or many repos",
  cr: "Clone Repo",
  lr: "List unmerged releases",
  ex: "Exit",
};

const OPTIONS_MESSAGE = `Available options:\n${Object.entries(AVAILABLE_OPTIONS)
  .map(([key, value]) => `* ${key} -> ${value}`)
  .join("\n")}`;
module.exports = { AVAILABLE_OPTIONS, OPTIONS_MESSAGE };
