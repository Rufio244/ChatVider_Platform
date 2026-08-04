require('dotenv').config();
const express = require('express');
const app = express();
const W1 = require('../1_CORE_FOUNDATION/W1_PureStart');
const AD = require('../1_CORE_FOUNDATION/AD_MasterControl');
const Billing = require('../7_BILLING_SUBSCRIPTION/subscription_manager');

const w1 = new W1(); w1.init();
const ad = new AD();
app.use(express.json());

app.use((req,res,next)=>{
  req.ownerCheck = ad;
  next();
});

app.get("/api/status", (req,res)=> res.json({system:"Vider", running:true, owner:"Thanva Phupingbut 244"}));

app.post("/api/chat", async (req,res)=>{
  const access = ad.checkAccess(req.body.userId, "chat_all", "conversation");
  if(!access.allowed) return res.status(403).json({error:"ไม่มีสิทธิ์"});
  res.json({reply:`ได้รับครับ: ${req.body.message}`});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`✅ ทำงานที่พอร์ต ${PORT}`));

