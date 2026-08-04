const crypto = require('crypto');
const PAYMENT = require('./payment_config');
const Subscription = require('./subscription_manager');

class PaymentProcessor {
  constructor() {
    this.sub = new Subscription();
    this.receiptsFile = './database_store/payment_receipts.json';
    this.init();
  }

  async init() {
    await require('fs-extra').ensureFile(this.receiptsFile);
  }

  generatePaymentRef(userId, amount) {
    const time = Date.now().toString().slice(-8);
    const hash = crypto.createHash('md5').update(`${userId}-${amount}-${time}`).digest('hex').slice(0,4).toUpperCase();
    return `VD${time}${hash}`;
  }

  createPromptpay(userId, amountThb) {
    const ref = this.generatePaymentRef(userId, amountThb);
    return {
      method: "PROMPTPAY",
      targetNumber: PAYMENT.channels.promptpay.target,
      recipientName: PAYMENT.channels.promptpay.name,
      amount: Number(amountThb).toFixed(2),
      referenceCode: ref,
      instruction: `โอน ${amountThb} บาท อ้างอิงรหัส ${ref}`
    };
  }

  async confirmManualPayment(referenceCode, userId, amountThb, channel = 'manual', ownerKey = '') {
    if (!ownerKey.includes('Thanva Phupingbut') && ownerKey !== 'MASTER-OWNER-ONLY-244') {
      return { ok: false, error: 'เฉพาะเจ้าของระบบ' };
    }

    const receipts = await require('fs-extra').readJson(this.receiptsFile);
    receipts.push({
      ref: referenceCode, userId, amount: amountThb, channel,
      confirmedAt: new Date().toISOString(), status: 'completed', confirmedBy: 'OWNER'
    });
    await require('fs-extra').writeJson(this.receiptsFile, receipts, { spaces: 2 });

    if (PAYMENT.settings.autoActivate) {
      await this.sub.changePlan(userId, 'personal', 'month', 0, ownerKey);
    }
    return { ok: true, message: 'ยืนยันสำเร็จ เปิดใช้งานแล้ว' };
  }

  async createStripeSession(userId, planId) {
    const stripe = require('stripe')(PAYMENT.channels.stripe.secretKey);
    const plan = require('./plan_definitions.json').plans.find(p => p.id === planId);
    if (!plan) return { error: 'ไม่พบแพ็กเกจ' };

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'thb',
            product_data: { name: `Vider — ${plan.name}` },
            unit_amount: plan.price_thb_month * 100
          },
          quantity: 1
        }],
        mode: 'subscription',
        success_url: `${process.env.DOMAIN || 'http://localhost:3000'}/payment/success?ref={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.DOMAIN || 'http://localhost:3000'}/payment/cancel`
      });
      return { ok: true, checkoutUrl: session.url, sessionId: session.id };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

module.exports = PaymentProcessor;
