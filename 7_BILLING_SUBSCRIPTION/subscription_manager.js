const fs = require('fs-extra');
const CONFIG = require('./payment_config');
const PLANS = require('./plan_definitions.json');

class SubscriptionManager {
  constructor() {
    this.subscriptionsFile = './database_store/subscriptions.json';
    this.usageFile = './database_store/usage_records.json';
    this.initStorage();
  }

  async initStorage() {
    await fs.ensureFile(this.subscriptionsFile);
    await fs.ensureFile(this.usageFile);
    if (!(await fs.readJson(this.subscriptionsFile, { throws: false }))) {
      await fs.writeJson(this.subscriptionsFile, []);
    }
    if (!(await fs.readJson(this.usageFile, { throws: false }))) {
      await fs.writeJson(this.usageFile, []);
    }
  }

  async getActivePlan(userId) {
    const subs = await fs.readJson(this.subscriptionsFile);
    const active = subs.filter(s => s.userId === userId && s.status === 'active')
                       .sort((a,b) => new Date(b.endDate) - new Date(a.endDate))[0];
    if (!active) return PLANS.plans.find(p => p.id === CONFIG.settings.defaultPlan);
    return PLANS.plans.find(p => p.id === active.planId) || PLANS.plans[0];
  }

  async changePlan(userId, newPlanId, duration = 'month', discountPercent = 0, ownerKey = '') {
    if (!ownerKey.includes('Thanva Phupingbut') && ownerKey !== 'MASTER-OWNER-ONLY-244') {
      return { ok: false, error: 'สิทธิ์ไม่ถูกต้อง' };
    }
    if (discountPercent > CONFIG.limits.maxDiscountPercent) discountPercent = CONFIG.limits.maxDiscountPercent;
    
    const plan = PLANS.plans.find(p => p.id === newPlanId);
    if (!plan) return { ok: false, error: 'ไม่พบแพ็กเกจ' };

    const price = duration === 'year' ? plan.price_thb_year : plan.price_thb_month;
    const finalPrice = Math.round(price * (100 - discountPercent) / 100);
    const days = duration === 'year' ? 365 : 30;

    const newSub = {
      id: `SUB-${Date.now()}`,
      userId,
      planId: newPlanId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + days*86400000).toISOString(),
      price: finalPrice,
      originalPrice: price,
      discountPercent,
      status: 'active',
      createdBy: 'OWNER',
      createdAt: new Date().toISOString()
    };

    const all = await fs.readJson(this.subscriptionsFile);
    all.forEach(s => { if(s.userId === userId && s.status === 'active') s.status = 'replaced'; });
    all.push(newSub);
    await fs.writeJson(this.subscriptionsFile, all, { spaces: 2 });
    return { ok: true, subscription: newSub };
  }

  async checkLimit(userId, featureKey, requestedAmount = 1) {
    const plan = await this.getActivePlan(userId);
    const limit = plan.features[featureKey];
    if (limit === -1 || limit === true) return { allowed: true };

    const usage = await this.getUserUsage(userId);
    const current = usage[featureKey] || 0;
    return { allowed: current + requestedAmount <= limit, current, limit, remaining: limit - current };
  }

  async getUserUsage(userId) {
    const records = await fs.readJson(this.usageFile);
    const userRec = records.find(r => r.userId === userId) || { userId };
    return userRec.usage || {};
  }

  async addUsage(userId, featureKey, amount = 1) {
    const records = await fs.readJson(this.usageFile);
    let userRec = records.find(r => r.userId === userId);
    if (!userRec) {
      userRec = { userId, usage: {}, updatedAt: null };
      records.push(userRec);
    }
    userRec.usage[featureKey] = (userRec.usage[featureKey] || 0) + amount;
    userRec.updatedAt = new Date().toISOString();
    await fs.writeJson(this.usageFile, records, { spaces: 2 });
    return { ok: true };
  }
}

module.exports = SubscriptionManager;

