const os = require('os');

class ResourceManager {
  constructor() {
    this.limits = { cpuMax: 90, memoryMaxPercent: 85, diskCheckInterval: 60000 };
    this.modes = ['balanced', 'performance', 'economy', 'max_efficiency'];
    this.currentMode = process.env.SYSTEM_MODE || 'balanced';
  }

  getCurrentUsage() {
    const cpus = os.cpus().length;
    const cpuLoad = os.loadavg()[0] / cpus * 100;
    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const memPercent = Math.round(usedMem / totalMem * 100);

    return {
      cpu: { cores: cpus, usagePercent: Math.round(cpuLoad), safe: cpuLoad < this.limits.cpuMax },
      memory: { totalMB: Math.round(totalMem / 1048576), usedMB: Math.round(usedMem / 1048576), usagePercent: memPercent, safe: memPercent < this.limits.memoryMaxPercent },
      mode: this.currentMode
    };
  }

  adjustForLoad() {
    const usage = this.getCurrentUsage();
    if (usage.cpu.usagePercent > 85 || usage.memory.usagePercent > 90) {
      this.currentMode = 'economy';
      return { adjusted: true, mode: 'economy', reason: 'ทรัพยากรใกล้เต็ม' };
    }
    if (usage.cpu.usagePercent < 40 && usage.memory.usagePercent < 50) {
      this.currentMode = 'performance';
      return { adjusted: true, mode: 'performance' };
    }
    this.currentMode = 'balanced';
    return { adjusted: false, mode: 'balanced' };
  }

  allocateForTask(size = 'medium') {
    const limits = { small: { cpu: 5, memoryMB: 128 }, medium: { cpu: 20, memoryMB: 512 }, large: { cpu: 45, memoryMB: 2048 } };
    return limits[size] || limits.medium;
  }

  setMode(mode) {
    if (this.modes.includes(mode)) {
      this.currentMode = mode;
      return { ok: true };
    }
    return { ok: false, error: 'โหมดไม่ถูกต้อง' };
  }
}

module.exports = ResourceManager;

