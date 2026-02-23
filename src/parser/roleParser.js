function parse(content){

  const giveUser = content.match(/выдай\s+<@!?(\d+)>\s+роль\s+(.+)/i);
  const removeUser = content.match(/забери\s+<@!?(\d+)>\s+роль\s+(.+)/i);
  const create = content.match(/создай\s+роль\s+(.+)/i);
  const del = content.match(/удали\s+роль\s+(.+)/i);
  const adminOn = content.match(/дай\s+админ\s+роли\s+(.+)/i);
  const adminOff = content.match(/забери\s+админ\s+у\s+роли\s+(.+)/i);

  if(giveUser) return { type:"GIVE_USER", userId: giveUser[1], role: giveUser[2] };
  if(removeUser) return { type:"REMOVE_USER", userId: removeUser[1], role: removeUser[2] };
  if(create) return { type:"CREATE", role: create[1] };
  if(del) return { type:"DELETE", role: del[1], dangerous:true };
  if(adminOn) return { type:"ADMIN_ON", role: adminOn[1], dangerous:true };
  if(adminOff) return { type:"ADMIN_OFF", role: adminOff[1], dangerous:true };

  return null;
}

module.exports = { parse };
