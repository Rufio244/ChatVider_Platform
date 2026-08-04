class AD_MasterControl {
  constructor() {
    this.masterOwner = "Thanva Phupingbut 244";
    this.permissions = {};
    this.globalRules = { noAGILeak:true, ownerOnly:true };
  }

  checkAccess(userId, action, resource) {
    if(userId === this.masterOwner) return {allowed:true, level:"FULL_OWNER"};
    const userPerm = this.permissions[userId];
    if(!userPerm) return {allowed:false};
    return {allowed: userPerm.actions?.includes(action) && userPerm.resources?.includes(resource)};
  }

  setPermission(userId, planId) {
    const plans = {
      free: {actions:["chat_basic"], resources:["public_only"]},
      personal: {actions:["chat_all","studio_basic"], resources:["own_projects"]},
      pro: {actions:["chat_all","studio_full","api_call"], resources:["all_own"]},
      enterprise: {actions:["*"], resources:["*"]}
    };
    this.permissions[userId] = plans[planId] || plans.free;
  }

  enforceSystemRules(request) {
    if(request.tryElevateAGI) return {deny:true, reason:"ห้ามยกระดับเกินขอบเขต"};
    return {ok:true};
  }
}
module.exports = AD_MasterControl;

