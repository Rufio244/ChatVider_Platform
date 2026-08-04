const UserProfileLearner = require('./UserProfileLearner');
const PreferenceAdapter = require('./PreferenceAdapter');
const StylePatternRecorder = require('./StylePatternRecorder');
const ImprovementValidator = require('./ImprovementValidator');

class LearningSystem {
  constructor() {
    this.profile = new UserProfileLearner();
    this.preference = new PreferenceAdapter();
    this.style = new StylePatternRecorder();
    this.validator = new ImprovementValidator();
    this.active = true;
  }

  processNewInput(userId, text, extra = {}) {
    if (!this.active) return { paused: true };
    this.profile.recordInput(userId, text, extra.type || "general");
    
    const detectedPref = this.preference.detectPreferences(text);
    const userProf = this.profile.getProfile(userId);
    Object.assign(userProf.preferences, detectedPref);

    if (extra.codeSample) this.style.recordCodingStyle(userId, extra.codeSample);
    const evalResult = this.validator.evaluateNewContent(userId, text);

    return {
      preferences: detectedPref,
      evaluation: evalResult,
      readyToApply: evalResult.recommendation === "ACCEPT"
    };
  }

  getReadyResponse(userId, baseText) {
    const prof = this.profile.getProfile(userId);
    if (!prof) return baseText;
    return this.preference.applyPreferences(baseText, prof.preferences);
  }
}

module.exports = LearningSystem;

