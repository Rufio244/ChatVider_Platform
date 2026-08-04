class StylePatternRecorder {
  constructor() { this.patterns = new Map(); }

  recordCodingStyle(userId, sampleCode) {
    if (!this.patterns.has(userId)) this.patterns.set(userId, { code: [], structure: [], tools: [] });
    const style = this.patterns.get(userId);
    
    const detected = {
      indent: sampleCode.includes("    ") ? "4space" : sampleCode.includes("\t") ? "tab" : "unknown",
      naming: /([a-z]+([A-Z][a-z]+)+)/.test(sampleCode) ? "camelCase" : /([a-z_]+)/.test(sampleCode) ? "snake_case" : "other",
      comments: sampleCode.includes("//") ? true : false
    };

    style.code.push({ time: new Date(), detected });
    return detected;
  }

  recordStructurePref(userId, description) {
    if (!this.patterns.has(userId)) this.patterns.set(userId, { code: [], structure: [], tools: [] });
    this.patterns.get(userId).structure.push({
      time: new Date(), text: description.substring(0, 500)
    });
  }

  getBestStyle(userId) {
    const rec = this.patterns.get(userId);
    if (!rec || rec.code.length === 0) return null;
    const counts = {};
    rec.code.forEach(r => {
      const key = `${r.detected.indent}|${r.detected.naming}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
  }
}
module.exports = StylePatternRecorder;

