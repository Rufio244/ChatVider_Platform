const crypto = require('crypto');
require('dotenv').config();

class EncryptionLayer {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(process.env.DB_ENCRYPT_KEY || 'DEFAULT_CHATVIDER_KEY_244_CHANGE_ME', 'utf8').subarray(0, 32);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${tag}:${encrypted}`;
  }

  decrypt(encryptedString) {
    try {
      const [ivHex, tagHex, dataHex] = encryptedString.split(':');
      if (!ivHex || !tagHex || !dataHex) return null;
      
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const data = Buffer.from(dataHex, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(data);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString('utf8');
    } catch (err) {
      return null;
    }
  }

  secureObject(obj, fieldsToEncrypt) {
    const result = { ...obj };
    fieldsToEncrypt.forEach(field => {
      if (result[field]) result[field] = this.encrypt(String(result[field]));
    });
    return result;
  }

  openSecureObject(obj, fieldsToDecrypt) {
    const result = { ...obj };
    fieldsToDecrypt.forEach(field => {
      if (result[field] && typeof result[field] === 'string' && result[field].includes(':')) {
        const opened = this.decrypt(result[field]);
        if (opened) result[field] = opened;
      }
    });
    return result;
  }
}

module.exports = EncryptionLayer;

