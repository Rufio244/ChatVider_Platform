class W1_PureStart {
  constructor() {
    this.isInitialized = false;
    this.pureSpace = {};
    this.ownerSignature = Buffer.from("Thanva Phupingbut 244").toString("base64");
  }

  init() {
    if (this.isInitialized) return {ok:true, note:"เริ่มต้นแล้ว"};
    this.pureSpace = {
      createdAt: new Date().toISOString(),
      status: "EMPTY_PURE",
      ownerVerified: true
    };
    this.isInitialized = true;
    return {ok:true, message:"เริ่มต้นว่างเปล่าสะอาดสมบูรณ์"};
  }

  writeData(key, value, ownerKey) {
    if(!this.verifyOwner(ownerKey)) return {ok:false, error:"ไม่มีสิทธิ์"};
    this.pureSpace[key] = value;
    return {ok:true};
  }

  verifyOwner(key) {
    return key === this.ownerSignature || key === "MASTER-OWNER-ONLY-244";
  }
}
module.exports = W1_PureStart;

