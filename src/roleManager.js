async function giveRole(member, role){
  await member.roles.add(role);
}

async function removeRole(member, role){
  await member.roles.remove(role);
}

module.exports = { giveRole, removeRole };
