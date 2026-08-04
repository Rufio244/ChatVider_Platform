class ImprovementValidator {
  constructor() { this.approvedKnowledge = []; }

  evaluateNewContent(userId, newData, source = "user") {
    const score = { value: 0, risk: 0, novelty: 0 };
    const existingTexts = this.approvedKnowledge.map(k => k.content);

    score.novelty = existingTexts.some(t => t.includes(newData.substring(0,80))) ? 10 : 90;
    score.value = newData.length > 30 ? 70 + Math.min(30, newData.length / 20) : 30;
    
    const dangerWords = ["ลบทิ้ง", "แก้ระบบหลัก", "ปิดความปลอดภัย", "ยกระดับ AGI"];
    score.risk = dangerWords.some(w => newData.includes(w)) ? 95 : 5;

    const total = Math.round((score.value + score.novelty - score.risk) / 3);

    return {
      score: total,
      recommendation: total > 60 ? "ACCEPT" : total > 30 ? "REVIEW" : "REJECT",
      details: score
    };
  }

  confirmAdd(userId, content, evaluation, ownerKey) {
    const isOwner = ownerKey === "MASTER-OWNER-ONLY-244" || ownerKey.includes("Thanva Phupingbut");
    const canAuto = evaluation.recommendation === "ACCEPT" || isOwner;
    
    if (!canAuto) return { ok: false, status: "WAIT_CONFIRM" };

    this.approvedKnowledge.push({
      from: userId,
      content,
      addedAt: new Date().toISOString(),
      score: evaluation.score,
      confirmedBy: isOwner ? "MASTER" : "SYSTEM"
    });
    return { ok: true, added: true };
  }
}
module.exports = ImprovementValidator;

