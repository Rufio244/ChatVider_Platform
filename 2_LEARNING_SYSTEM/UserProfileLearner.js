
class UserProfileLearner {
  constructor() {
    this.profiles = new Map();
    this.masterOwner = "Thanva Phupingbut 244";
  }

  initProfile(userId, userData = {}) {
    if (this.profiles.has(userId)) return { ok: false, note: "มีข้อมูลแล้ว" };
    this.profiles.set(userId, {
      userId,
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      inputHistory: [],
      preferences: {
        responseLength: "normal",
        detailLevel: "medium",
        formatStyle: "standard",
        language: "th"
      },
      workingStyle: {
        codingStyle: "",
        structurePref: "",
        toolsUsed: []
      },
      knowledgeGained: [],
      trustLevel: userId === this.masterOwner ? 100 : 10
    });
    return { ok: true, message: "สร้างโปรไฟล์สำเร็จ" };
  }

  recordInput(userId, content, type = "general") {
    if (!this.profiles.has(userId)) this.initProfile(userId);
    const profile = this.profiles.get(userId);
    profile.lastActive = new Date().toISOString();
    profile.inputHistory.push({
      time: new Date().toISOString(),
      type,
      snippet: content.substring(0, 200)
    });
    if (profile.inputHistory.length > 5000) profile.inputHistory.shift();
    return { ok: true };
  }

  getProfile(userId) {
    return this.profiles.get(userId) || null;
  }
}
module.exports = UserProfileLearner;
