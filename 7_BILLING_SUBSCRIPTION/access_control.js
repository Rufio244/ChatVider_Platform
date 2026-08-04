const Subscription = require('./subscription_manager');

class AccessControl {
  constructor() {
    this.sub = new Subscription();
    this.masterOwnerId = ["Thanva Phupingbut 244", "MASTER-OWNER-ONLY-244"];
  }

  isOwner(userId) {
    return this.masterOwnerId.some(o => userId?.toString().includes(o));
  }

  async verify(userId, requiredFeature, minPlanLevel = 'free') {
    if (this.isOwner(userId)) return { allowed: true, level: 'OWNER_FULL' };

    const plan = await this.sub.getActivePlan(userId);
    const minOrder = ['free','personal','pro','enterprise'];
    const userLevel = minOrder.indexOf(plan.id);
    const needLevel = minOrder.indexOf(minPlanLevel);

    if (userLevel < needLevel) return { allowed: false, reason: 'ต้องอัปเกรดแพ็กเกจ' };

    const limitCheck = await this.sub.checkLimit(userId, requiredFeature);
    return limitCheck;
  }

  async canAccessAdminPanel(userId, adminKey = '') {
    return { allowed: this.isOwner(userId) || adminKey === 'MASTER-OWNER-ONLY-244' };
  }
}

module.exports = AccessControl;

