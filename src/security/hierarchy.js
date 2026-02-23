function canManageRole(botMember, role){
  if(role.managed) return false;
  if(role.name === "@everyone") return false;
  if(role.position >= botMember.roles.highest.position) return false;
  return true;
}

module.exports = { canManageRole };
