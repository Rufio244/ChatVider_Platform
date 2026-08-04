const fs = require('fs-extra');
const Learning = require('../2_LEARNING_SYSTEM/index');

class CodeGenerator {
  constructor() {
    this.learn = new Learning();
    this.patterns = {
      indent: '    ',
      naming: 'camelCase',
      comments: true
    };
  }

  async setStyleFromUser(userId) {
    const style = this.learn.style.getBestStyle(userId);
    if (style) {
      const [indent, naming] = style.split('|');
      this.patterns.indent = indent === '4space' ? '    ' : '\t';
      this.patterns.naming = naming;
    }
  }

  async generateByPurpose(purpose, techStack = [], userId = '') {
    await this.setStyleFromUser(userId);
    const lower = purpose.toLowerCase();
    let result = { files: [], notes: [] };

    if (lower.includes('api')) result = await this.makeAPI(techStack);
    else if (lower.includes('เว็บ') || lower.includes('web')) result = await this.makeWebsite(techStack);
    else if (lower.includes('qr3d') || lower.includes('คิวอาร์')) result = await this.makeQR3D();
    else if (lower.includes('ระบบ') || lower.includes('system')) result = await this.makeSystemBase();
    else result.files.push({ name: 'main.js', content: this.makeTemplateScript(purpose) });

    result.notes.push(`สร้างตามรูปแบบ: ย่อหน้า${this.patterns.indent.length}ช่อง, ชื่อตัวแปรแบบ${this.patterns.naming}`);
    return result;
  }

  makeAPI(stack = ['express']) {
    return { files: [
      { name: 'server.js', content: `const express = require('express');\nconst app = express();\napp.use(express.json());\n\napp.get('/api/status', (req,res)=>res.json({ok:true}));\n\nconst PORT = process.env.PORT||3000;\napp.listen(PORT, ()=>console.log("ทำงานที่",PORT));` },
      { name: 'package.json', content: JSON.stringify({
        name: 'new-api', version: '1.0.0',
        dependencies: { express: "^4.19.0" }
      }, null, 2) }
    ]};
  }

  makeWebsite(stack = ['html','css','js']) {
    return { files: [
      { name: 'index.html', content: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>หน้าใหม่</title></head><body><h1>ยินดีต้อนรับ</h1></body></html>` },
      { name: 'style.css', content: `body{ background:#0f1118; color:white; font-family:sans-serif; }` }
    ]};
  }

  makeQR3D() {
    return { files: [
      { name: 'generator.js', content: `// QR3D Cord Engine\nclass QR3D { generate(data){ return {type:"QR3D",version:"2.0",data}; } }\nmodule.exports = QR3D;` }
    ]};
  }

  makeSystemBase() {
    return { files: [
      { name: 'core.js', content: `class SystemCore {\n  constructor(){ this.version="1.0.0"; }\n  init(){ return {ready:true}; }\n}\nmodule.exports = SystemCore;` }
    ]};
  }

  makeTemplateScript(title) {
    return `// === ${title} ===\n// สร้างด้วย Vider AGI\n\nasync function main() {\n  console.log("เริ่มทำงาน");\n}\n\nmain().catch(console.error);`;
  }
}

module.exports = CodeGenerator;

