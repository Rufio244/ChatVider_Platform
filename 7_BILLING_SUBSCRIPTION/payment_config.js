require('dotenv').config();

const PAYMENT_CONFIG = {
  owner: "Thanva Phupingbut 244",
  
  channels: {
    promptpay: {
      type: "PROMPTPAY",
      target: "1529900399939",
      name: "นายธันวา ภูปิงบุตร"
    },
    banks: {
      kbank: { code: "0318613826", name: "กสิกรไทย" },
      scb: { code: "4078670710", name: "ไทยพาณิชย์" }
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      currency: "thb"
    }
  },

  settings: {
    autoActivate: true,
    graceDays: 3,
    trialDays: 7,
    defaultPlan: "free",
    currency: "THB",
    allowPartial: false
  },

  limits: {
    maxDiscountPercent: 30,
    minTopupAmount: 100,
    taxRatePercent: 7
  }
};

module.exports = PAYMENT_CONFIG;

