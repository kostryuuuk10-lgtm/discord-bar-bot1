function parse(content){

  const giveUser = content.match(/выдай\s+<@!?(\d+)>\s+роль\s+(.+)/i);
  const removeUser = content.match(/забери\s+<@!?(\d+)>\s+роль\s+(.+)/i);
  const create = content.match(/создай\s+роль\s+(.+)/i);
  const del = content.match(/удали\s+роль\s+(.+)/i);
  const adminGive = content.match(/дай\s+админ\s+роли\s+(.+)/i);
  const adminRemove = content.match(/забери\s+админ\s+у\s+роли\s+(.+)/i);
  const moveUp = content.match(/перемести\s+роль\s+(.+)\s+выше/i);
  const moveDown = content.match(/перемести\s+роль\s+(.+)\s+ниже/i);

  if(giveUser) return { type:"GIVE_USER", userId: giveUser[1], role: giveUser[2] };
  if(removeUser) return { type:"REMOVE_USER", userId: removeUser[1], role: removeUser[2] };
  if(create) return { type:"CREATE", role: create[1] };
  if(del) return { type:"DELETE", role: del[1], dangerous:true };
  if(adminGive) return { type:"ADMIN_ON", role: adminGive[1], dangerous:true };
  if(adminRemove) return { type:"ADMIN_OFF", role: adminRemove[1], dangerous:true };
  if(moveUp) return { type:"MOVE_UP", role: moveUp[1] };
  if(moveDown) return { type:"MOVE_DOWN", role: moveDown[1] };

  return null;
}

module.exports = { parse };
