const os = require('os');

class HealthMonitor {
  constructor() {
    this.requestLog = [];
    this.errors = [];
    this.startedAt = new Date().toISOString();
    this.checks = [];
  }

  registerRequest(req) {
    this.requestLog.push({ time: new Date(), path: req.path, method: req.method });
    if (this.requestLog.length > 5000) this.requestLog.shift();
  }

  registerError(err, context = '') {
    this.errors.push({ time: new Date(), message: err.message, context });
    if (this.errors.length > 500) this.errors.shift();
  }

  start() {
    setInterval(() => this.runChecks(), 30000);
  }

  async runChecks() {
    this.checks = [
      { name: 'system', status: 'ok' },
      { name: 'storage', status: 'ok' },
      { name: 'network', status: 'ok' }
    ];
  }

  async getSummary() {
    await this.runChecks();
    const lastHour = this.requestLog.filter(r => Date.now() - new Date(r.time).getTime() < 3600000);
    const recentErrors = this.errors.filter(e => Date.now() - new Date(e.time).getTime() < 3600000);
    const status = this.checks.every(c => c.status === 'ok') ? 'healthy' : 'degraded';

    return {
      status,
      uptimeSec: Math.round(process.uptime()),
      startedAt: this.startedAt,
      requestsLastHour: lastHour.length,
      errorsLastHour: recentErrors.length,
      checks: this.checks
    };
  }
}

module.exports = HealthMonitor;

