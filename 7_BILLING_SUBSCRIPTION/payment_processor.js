
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentProcessor {
  constructor() {
    this.channels = {
      promptpay: "1529900399939",
      kbank: "0318613826",
      scb: "4078670710"
    };
  }

  async createStripeCheckout(userId, planId, amountThb) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{price_data:{currency:'thb',unit_amount:amountThb*100,product_data:{name:planId}},quantity:1}],
      mode: 'subscription',
      success_url: `${process.env.DOMAIN}/success?ref={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`
    });
    return {url:session.url, id:session.id};
  }

  getPromptpayQR(amount, ref) {
    return {
      type: "PROMPTPAY",
      target: this.channels.promptpay,
      amount: amount,
      reference: ref,
      instruction: `สั่งจ่าย ${amount} บาท อ้างอิง ${ref}`
    };
  }
}
module.exports = PaymentProcessor;
