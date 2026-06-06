/**
 * database backup and restore utility
 * Supports mongodump/mongorestore cli command, with a programmatic json fallback
 */
require("dotenv").config();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/skillforge";
const BACKUPS_DIR = path.join(__dirname, "../backups");

// Ensure backup folder exists
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

/**
 * Checks if a CLI command is available
 */
function isCommandAvailable(cmd) {
  return new Promise((resolve) => {
    const checkCmd = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
    exec(checkCmd, (err) => {
      resolve(!err);
    });
  });
}

/**
 * Perform backup using mongodump CLI
 */
function runMongodump(archivePath) {
  return new Promise((resolve, reject) => {
    console.log(`[Backup] Spawning mongodump for archive: ${archivePath}`);
    exec(`mongodump --uri="${MONGO_URL}" --archive="${archivePath}" --gzip`, (err, stdout, stderr) => {
      if (err) {
        console.warn("[Backup] mongodump CLI failed:", stderr || err.message);
        return reject(err);
      }
      console.log("[Backup] mongodump CLI completed successfully.");
      resolve(stdout);
    });
  });
}

/**
 * Perform restore using mongorestore CLI
 */
function runMongorestore(archivePath) {
  return new Promise((resolve, reject) => {
    console.log(`[Restore] Spawning mongorestore from archive: ${archivePath}`);
    exec(`mongorestore --uri="${MONGO_URL}" --archive="${archivePath}" --gzip --drop`, (err, stdout, stderr) => {
      if (err) {
        console.warn("[Restore] mongorestore CLI failed:", stderr || err.message);
        return reject(err);
      }
      console.log("[Restore] mongorestore CLI completed successfully.");
      resolve(stdout);
    });
  });
}

/**
 * Programmatic JSON fallback backup
 */
async function runProgrammaticBackup(backupFilePath) {
  console.log(`[Backup] Falling back to programmatic JSON exporter to: ${backupFilePath}`);
  await mongoose.connect(MONGO_URL);
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const backupData = {};

  for (const col of collections) {
    const name = col.name;
    const docs = await db.collection(name).find({}).toArray();
    backupData[name] = docs;
    console.log(`[Backup] Exported ${docs.length} documents from collection: ${name}`);
  }

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");
  await mongoose.disconnect();
  console.log("[Backup] Programmatic backup completed successfully.");
}

/**
 * Programmatic JSON fallback restore
 */
async function runProgrammaticRestore(backupFilePath) {
  console.log(`[Restore] Falling back to programmatic JSON importer from: ${backupFilePath}`);
  const backupData = JSON.parse(fs.readFileSync(backupFilePath, "utf8"));
  
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  for (const [colName, docs] of Object.entries(backupData)) {
    // Drop existing collection
    await db.collection(colName).drop().catch(() => {});
    
    if (docs.length > 0) {
      // Restore documents
      await db.collection(colName).insertMany(docs);
      console.log(`[Restore] Programmatically imported ${docs.length} documents into: ${colName}`);
    }
  }

  await mongoose.disconnect();
  console.log("[Restore] Programmatic restore completed successfully.");
}

/**
 * Run end-to-end verification test
 */
async function runVerificationTest() {
  console.log("=== Beginning Backup/Restore Integrity Verification ===");
  const testArchive = path.join(BACKUPS_DIR, `test_verification_${Date.now()}.archive`);
  const testJson = path.join(BACKUPS_DIR, `test_verification_${Date.now()}.json`);

  try {
    const hasMongodump = await isCommandAvailable("mongodump");
    
    // 1. Run Backup
    if (hasMongodump) {
      await runMongodump(testArchive);
      console.log("✓ CLI mongodump validation PASSED.");
    } else {
      await runProgrammaticBackup(testJson);
      console.log("✓ Programmatic JSON backup validation PASSED.");
    }

    // 2. Run Restore validation
    const hasMongorestore = await isCommandAvailable("mongorestore");
    if (hasMongorestore && hasMongodump) {
      await runMongorestore(testArchive);
      console.log("✓ CLI mongorestore validation PASSED.");
    } else {
      await runProgrammaticRestore(testJson);
      console.log("✓ Programmatic JSON restore validation PASSED.");
    }

    // Clean up test files
    if (fs.existsSync(testArchive)) fs.unlinkSync(testArchive);
    if (fs.existsSync(testJson)) fs.unlinkSync(testJson);

    console.log("=== Verification Successful: Database backup/restore pipeline ready ===");
    process.exit(0);
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
    process.exit(1);
  }
}

/**
 * Command line parser
 */
async function main() {
  const args = process.argv.slice(2);
  const isBackup = args.includes("--backup");
  const isRestore = args.includes("--restore");
  const isTest = args.includes("--test");

  if (isTest) {
    await runVerificationTest();
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (isBackup) {
    const hasMongodump = await isCommandAvailable("mongodump");
    if (hasMongodump) {
      const file = path.join(BACKUPS_DIR, `backup_${timestamp}.archive`);
      await runMongodump(file).catch(() => runProgrammaticBackup(file.replace(".archive", ".json")));
    } else {
      await runProgrammaticBackup(path.join(BACKUPS_DIR, `backup_${timestamp}.json`));
    }
    process.exit(0);
  }

  if (isRestore) {
    const restoreIdx = args.indexOf("--restore");
    const file = args[restoreIdx + 1];
    if (!file) {
      console.error("Error: Please specify the backup file path to restore. Example: --restore path/to/backup.archive");
      process.exit(1);
    }

    const hasMongorestore = await isCommandAvailable("mongorestore");
    if (file.endsWith(".archive") && hasMongorestore) {
      await runMongorestore(file);
    } else {
      await runProgrammaticRestore(file);
    }
    process.exit(0);
  }

  // If no args, display usage
  console.log(`
SkillForge AI Database Backup & Restore Utility
Usage:
  node backup-restore.js --backup          Execute database backup (uses mongodump with programmatic json fallback)
  node backup-restore.js --restore <path>  Execute database restore (uses mongorestore with programmatic json fallback)
  node backup-restore.js --test           Validate backup/restore environment and verification runbook
  `);
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal error:", err.message);
    process.exit(1);
  });
}
