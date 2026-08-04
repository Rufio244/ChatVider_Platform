class W2_UserUnderstanding {
  constructor() { this.userPatterns = {}; }

  learnPattern(userId, input, style) {
    if(!this.userPatterns[userId]) this.userPatterns[userId] = { inputs:[], preferences:{}, style:{} };
    this.userPatterns[userId].inputs.push({text:input, time:new Date()});
    Object.assign(this.userPatterns[userId].style, style);
  }

  getProfile(userId) { return this.userPatterns[userId] || null; }

  adaptResponse(userId, baseText) {
    const profile = this.getProfile(userId);
    if(!profile) return baseText;
    if(profile.style.format === "short") return baseText.substring(0,150)+"...";
    return baseText;
  }
}
module.exports = W2_UserUnderstanding;

