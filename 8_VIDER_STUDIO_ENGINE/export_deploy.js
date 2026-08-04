const fs = require('fs-extra');
const archiver = require('archiver');

class ExportDeploy {
  async exportAsZip(projectId, userId) {
    const source = `./user_projects/${userId}/${projectId}`;
    const outPath = `./exports/${projectId}.zip`;
    await fs.ensureDir('./exports/');

    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);
    archive.directory(source, false);
    await archive.finalize();
    return { ok: true, file: outPath };
  }

  async prepareVercelConfig(projectPath) {
    const files = await fs.readdir(projectPath);
    const config = { version: 2 };
    
    if (files.includes('package.json')) {
      config.builds = [{ src: '**/*.js', use: '@vercel/node' }];
    } else if (files.includes('index.html')) {
      config.builds = [{ src: '**/*', use: '@vercel/static' }];
    }
    await fs.writeJson(path.join(projectPath, 'vercel.json'), config, { spaces: 2 });
    return config;
  }

  getDeployInstructions(type) {
    const guides = {
      vercel: `1. ดึงไฟล์ ZIP ออกมา\n2. ไปที่ Vercel → Import\n3. เลือกโฟลเดอร์นี้\n4. กดปรับใช้งาน`,
      github: `git init\ngit add .\ngit commit -m "เริ่มต้น"\ngit remote add origin <ลิงก์ของคุณ>\ngit push -u origin main`
    };
    return guides[type] || guides.github;
  }
}

module.exports = ExportDeploy;

