require('dotenv').config();

const DB_CONFIG = {
  systemId: "ChatVider_Storage_v1.0",
  owner: "Thanva Phupingbut 244",
  
  mode: {
    default: process.env.DB_MODE || "hybrid",
    options: ["local_file", "mongodb", "postgresql", "hybrid"]
  },

  connections: {
    local: {
      path: "./database_store/",
      format: "json",
      maxFileSizeMB: 50
    },
    mongodb: {
      uri: process.env.MONGODB_URI || "",
      dbName: "ChatViderDB"
    },
    postgresql: {
      connectionString: process.env.POSTGRES_URI || "",
      schema: "chatvider_core"
    }
  },

  security: {
    encryptionAtRest: true,
    encryptFields: ["ownerData", "paymentInfo", "apiKeys", "learnedSensitive"],
    keyDerivation: "aes-256-gcm",
    autoPurgeDays: 0 // 0 = ไม่ลบเอง
  },

  backup: {
    autoEnabled: true,
    intervalHours: 6,
    keepCopies: 30,
    destination: "./backup_files/"
  }
};

module.exports = DB_CONFIG;

