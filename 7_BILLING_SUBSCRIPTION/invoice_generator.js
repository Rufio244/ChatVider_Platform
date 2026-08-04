const crypto = require('crypto');

class InvoiceGenerator {
  create(invoiceData) {
    const id = `INV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const total = invoiceData.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const tax = Math.round(total * 7 / 100);

    return {
      id,
      issuedAt: new Date().toISOString(),
      for: invoiceData.userName,
      address: invoiceData.userEmail,
      reference: invoiceData.paymentRef || '-',
      items: invoiceData.items,
      subtotal: total,
      taxAmount: tax,
      grandTotal: total + tax,
      currency: 'THB',
      issuer: 'Thanva Phupingbut 244 — Vider Platform',
      signature: crypto.createHash('sha256').update(`${id}-${total}-${Date.now()}`).digest('hex')
    };
  }

  formatText(invoice) {
    return `
=====================================
        ใบแจ้งหนี้ / ใบเสร็จ
=====================================
เลขที่: ${invoice.id}
วันที่: ${new Date(invoice.issuedAt).toLocaleString('th-TH')}
ผู้ซื้อ: ${invoice.for}
อีเมล: ${invoice.address}

รายการ:
${invoice.items.map(i => `• ${i.name} ........ ${i.price} x ${i.qty} = ${i.price*i.qty} บาท`).join('\n')}

รวมก่อนภาษี: ${invoice.subtotal} บาท
ภาษี 7%: ${invoice.taxAmount} บาท
รวมทั้งสิ้น: **${invoice.grandTotal} บาท**

ออกโดย: ${invoice.issuer}
=====================================`;
  }
}

module.exports = InvoiceGenerator;

