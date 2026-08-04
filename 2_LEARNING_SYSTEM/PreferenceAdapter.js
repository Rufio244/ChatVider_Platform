class PreferenceAdapter {
  detectPreferences(input, previousReplies = []) {
    const found = {};
    const low = input.toLowerCase();

    if (/สั้น|กระชับ|ย่อ/.test(low)) found.responseLength = "short";
    if (/ละเอียด|อธิบายเพิ่ม|ตัวอย่าง/.test(low)) found.responseLength = "detailed";
    if (/ไทย|ภาษาไทย/.test(low)) found.language = "th";
    if (/อังกฤษ|english/.test(low)) found.language = "en";
    if (/รูปแบบ|โครงสร้าง|ระเบียบ/.test(low)) found.formatStyle = "structured";
    if (/ธรรมดา|เล่าเรื่อยๆ/.test(low)) found.formatStyle = "natural";

    return found;
  }

  updateFromHistory(profile) {
    const recent = profile.inputHistory.slice(-50);
    const counts = { short: 0, detailed: 0 };
    
    recent.forEach(item => {
      if (/สั้น|กระชับ/.test(item.snippet)) counts.short++;
      if (/ละเอียด|เพิ่มเติม/.test(item.snippet)) counts.detailed++;
    });

    if (counts.short > counts.detailed) profile.preferences.responseLength = "short";
    if (counts.detailed > counts.short) profile.preferences.responseLength = "detailed";
    return profile.preferences;
  }

  applyPreferences(content, preferences) {
    let result = content;
    if (preferences.responseLength === "short" && result.length > 300) {
      result = "📌 สรุป: " + result.split("\n").slice(0, 3).join(" ");
    }
    return result;
  }
}
module.exports = PreferenceAdapter;

