const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const CONFIG = require('./db_config');

class BackupSystem {
  constructor() {
    this.basePath = CONFIG.backup.destination;
    this.enabled = CONFIG.backup.autoEnabled;
    this.keepCount = CONFIG.backup.keepCopies;
    this.initialized = false;
  }

  async init() {
    await fs.ensureDir(this.basePath);
    if (this.enabled) this.startScheduler();
    this.initialized = true;
    return { ok: true };
  }

  startScheduler() {
    const timeExpr = `0 */${CONFIG.backup.intervalHours} * * *`;
    cron.schedule(timeExpr, async () => {
      console.log("⏳ เริ่มสำรองข้อมูลตามกำหนดเวลา");
      await this.createBackup();
    });
  }

  async createBackup() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.basePath, `backup_${stamp}`);
    
    try {
      await fs.copy("./database_store/", backupPath);
      await this.cleanOldBackups();
      return { ok: true, savedAt: backupPath };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async restoreBackup(folderName, ownerKey) {
    if (!ownerKey || !ownerKey.includes("Thanva Phupingbut") && ownerKey !== "MASTER-OWNER-ONLY-244") {
      return { ok: false, error: "สิทธิ์ไม่พอใจ" };
    }
    const target = path.join(this.basePath, folderName);
    if (!await fs.pathExists(target)) return { ok: false, error: "ไม่พบข้อมูลสำรอง" };
    
    await fs.copy(target, "./database_store/");
    return { ok: true, message: "กู้คืนเรียบร้อย" };
  }

  async cleanOldBackups() {
    const all = await fs.readdir(this.basePath);
    const sorted = all.sort().reverse();
    const toRemove = sorted.slice(this.keepCount);
    for (let name of toRemove) await fs.remove(path.join(this.basePath, name));
  }

  listBackups() {
    return fs.readdir(this.basePath).then(list => list.sort().reverse());
  }
}

module.exports = BackupSystem;

