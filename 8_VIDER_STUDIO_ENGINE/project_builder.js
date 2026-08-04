const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

class ProjectBuilder {
  constructor() {
    this.projectsRoot = './user_projects/';
    this.templatesRoot = './8_VIDER_STUDIO_ENGINE/templates/';
    this.allowedTypes = ['website', 'api', 'script', 'system', 'qr3d', 'automation'];
  }

  async init() {
    await fs.ensureDir(this.projectsRoot);
    await fs.ensureDir(this.templatesRoot);
  }

  async createNew(userId, name, type = 'website', description = '') {
    if (!this.allowedTypes.includes(type)) return { ok: false, error: 'ประเภทงานไม่รองรับ' };
    
    const id = `PRJ-${Date.now()}-${uuidv4().slice(0,8).toUpperCase()}`;
    const safeName = name.replace(/[^a-zA-Z0-9ก-ฮ_ก-ฮ ]/g, '-').replace(/\s+/g, '-').toLowerCase();
    const targetPath = path.join(this.projectsRoot, userId, id);
    
    await fs.ensureDir(targetPath);
    await fs.writeJson(path.join(targetPath, 'project.json'), {
      id, name, safeName, type, description,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      files: []
    }, { spaces: 2 });

    await this.applyTemplate(targetPath, type);
    return { ok: true, projectId: id, path: targetPath };
  }

  async applyTemplate(targetPath, type) {
    const templatePath = path.join(this.templatesRoot, type);
    if (await fs.pathExists(templatePath)) await fs.copy(templatePath, targetPath);
    else await this.createBasicStructure(targetPath);
  }

  async createBasicStructure(targetPath) {
    await fs.writeFile(path.join(targetPath, 'README.md'), `# โปรเจกต์ใหม่\nสร้างด้วย Vider Studio`);
    await fs.writeFile(path.join(targetPath, 'main.js'), `// เริ่มเขียนโค้ดที่นี่\nconsole.log("ทำงานแล้ว");`);
  }

  async saveFile(projectId, userId, filePath, content) {
    const projPath = path.join(this.projectsRoot, userId, projectId);
    const projInfo = await fs.readJson(path.join(projPath, 'project.json'));
    if (projInfo.ownerId !== userId) return { ok: false, error: 'ไม่ใช่เจ้าของงาน' };
    
    const fullPath = path.join(projPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
    
    projInfo.updatedAt = new Date().toISOString();
    if (!projInfo.files.includes(filePath)) projInfo.files.push(filePath);
    await fs.writeJson(path.join(projPath, 'project.json'), projInfo, { spaces: 2 });
    return { ok: true };
  }

  async listUserProjects(userId) {
    const userRoot = path.join(this.projectsRoot, userId);
    if (!await fs.pathExists(userRoot)) return [];
    const dirs = await fs.readdir(userRoot);
    const list = [];
    for (const id of dirs) {
      try {
        const info = await fs.readJson(path.join(userRoot, id, 'project.json'));
        list.push(info);
      } catch {}
    }
    return list.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
}

module.exports = ProjectBuilder;

