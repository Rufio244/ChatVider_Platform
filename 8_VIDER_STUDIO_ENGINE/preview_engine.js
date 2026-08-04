const { exec } = require('child_process');
const path = require('path');

class PreviewEngine {
  constructor() {
    this.runningPreviews = new Map();
  }

  async startPreview(projectId, userId, port = 5500) {
    const projPath = `./user_projects/${userId}/${projectId}`;
    const commands = {
      'package.json': `cd ${projPath} && npm install && npm start`,
      'index.html': `npx serve ${projPath} -l ${port}`,
      'main.py': `python3 ${projPath}/main.py`
    };

    let cmd = null;
    for (const file of await this.findFiles(projPath)) {
      if (commands[file]) { cmd = commands[file]; break; }
    }
    if (!cmd) return { ok: false, error: 'ไม่รู้วิธีรันไฟล์นี้' };

    const proc = exec(cmd);
    this.runningPreviews.set(`${userId}-${projectId}`, { proc, port, startedAt: new Date() });
    
    proc.stdout.on('data', d => console.log(`[PREVIEW] ${d}`));
    proc.stderr.on('data', d => console.error(`[PREVIEW ERR] ${d}`));
    
    return { ok: true, url: `http://localhost:${port}`, port };
  }

  async findFiles(dir) {
    const exist = [];
    for await (const entry of require('fs').promises.readdir(dir)) {
      exist.push(entry);
    }
    return exist;
  }

  stopPreview(projectId, userId) {
    const key = `${userId}-${projectId}`;
    const running = this.runningPreviews.get(key);
    if (running) { running.proc.kill(); this.runningPreviews.delete(key); }
    return { stopped: true };
  }
}

module.exports = PreviewEngine;

