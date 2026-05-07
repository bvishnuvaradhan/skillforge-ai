/**
 * Initialize all background workers
 */
function initWorkers() {
  console.log("Initializing background workers...");
  require("./scraping.worker");
  require("./analytics.worker");
}

module.exports = { initWorkers };
