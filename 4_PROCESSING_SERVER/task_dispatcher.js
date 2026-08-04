const { v4: uuidv4 } = require('uuid');

class TaskDispatcher {
  constructor() {
    this.queue = [];
    this.active = new Map();
    this.completed = [];
    this.maxConcurrent = 8;
    this.running = false;
    this.priorities = { owner: 10, enterprise: 8, pro: 6, personal: 4, free: 1 };
  }

  addTask(data = {}) {
    const task = {
      id: uuidv4(),
      type: data.type || 'general',
      priority: this.priorities[data.priorityLevel] || 3,
      payload: data.payload || {},
      status: 'queued',
      submittedAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      result: null,
      error: null
    };
    this.queue.push(task);
    this.sortQueue();
    return { id: task.id, position: this.queue.indexOf(task) + 1 };
  }

  sortQueue() {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  getTask(id) {
    return this.active.get(id) || this.queue.find(t => t.id === id) || this.completed.find(t => t.id === id);
  }

  async startProcessing() {
    if (this.running) return;
    this.running = true;
    this.processLoop();
  }

  async processLoop() {
    while (this.running) {
      while (this.active.size < this.maxConcurrent && this.queue.length > 0) {
        const task = this.queue.shift();
        this.active.set(task.id, task);
        this.executeTask(task);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  async executeTask(task) {
    task.status = 'processing';
    task.startedAt = new Date().toISOString();
    try {
      task.result = await this.processByType(task);
      task.status = 'completed';
    } catch (err) {
      task.status = 'failed';
      task.error = err.message;
    } finally {
      task.finishedAt = new Date().toISOString();
      this.archiveTask(task);
    }
  }

  async processByType(task) {
    await new Promise(r => setTimeout(r, 300));
    return { processed: true, type: task.type };
  }

  archiveTask(task) {
    this.active.delete(task.id);
    this.completed.push(task);
    if (this.completed.length > 2000) this.completed.shift();
  }

  pause() { this.running = false; }
  resume() { this.startProcessing(); }
}

module.exports = TaskDispatcher;

