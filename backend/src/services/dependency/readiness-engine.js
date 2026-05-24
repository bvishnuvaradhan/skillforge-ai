const { validatePrerequisites, scoreToBand } = require("./prerequisite-validator");

module.exports = {
  computeReadiness: validatePrerequisites,
  scoreToBand,
  validatePrerequisites
};
