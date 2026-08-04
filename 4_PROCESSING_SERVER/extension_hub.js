const fs = require('fs-extra');
const path = require('path');

class ExtensionHub {
  constructor() {
    this.loaded = new Map();
    this.folder = path.join(__dirname, '../extensions/');
    this.manifestFile = path.join(this.folder, 'extensions.json');
  }

  async init() {
    await fs.ensureDir(this.folder);
    if (!await fs.pathExists(this.manifestFile)) await fs.writeJson(this.manifestFile, []);
    await this.loadAll();
  }

  async loadAll() {
    const list = await fs.readJson(this.manifestFile);
    for (const item of list) {
      if (item.enabled) await this.register(item);
    }
  }

  async register(info) {
    try {
      const mod = require(path.join(this.folder, info.main));
      this.loaded.set(info.id, { ...info, module: new mod() });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async install(name, codeBuffer, ownerKey) {
    if (!ownerKey || !ownerKey.includes('Thanva Phupingbut') && ownerKey !== 'MASTER-OWNER-ONLY-244') {
      return { ok: false, error: 'เฉพาะเจ้าของระบบเท่านั้น' };
    }
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const targetFolder = path.join(this.folder, id);
    await fs.ensureDir(targetFolder);
    const entry = { id, name, version: '1.0.0', enabled: true, installedAt: new Date(), main: 'index.js' };
    await fs.writeFile(path.join(targetFolder, 'index.js'), codeBuffer);
    const all = await fs.readJson(this.manifestFile);
    all.push(entry);
    await fs.writeJson(this.manifestFile, all, { spaces: 2 });
    await this.register(entry);
    return { ok: true, extensionId: id };
  }

  run(id, method, params = {}) {
    const ext = this.loaded.get(id);
    if (!ext) return { error: 'ไม่พบส่วนขยาย' };
    if (typeof ext.module[method] === 'function') {
      return ext.module[method](params);
    }
    return { error: 'ไม่มีเมธอดนี้' };
  }

  list() {
    return Array.from(this.loaded.values()).map(x => ({ id: x.id, name: x.name, version: x.version, enabled: x.enabled }));
  }
}

module.exports = ExtensionHub;

