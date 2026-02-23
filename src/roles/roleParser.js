export function parseRoleCommand(content){

  const give = content.match(/выдай\s+<@!?(\d+)>\s+роль\s+(.+)/i);
  if(give) return { type:"GIVE_USER", userId:give[1], role:give[2] };

  const remove = content.match(/забери\s+<@!?(\d+)>\s+роль\s+(.+)/i);
  if(remove) return { type:"REMOVE_USER", userId:remove[1], role:remove[2] };

  const create = content.match(/создай\s+роль\s+(.+)/i);
  if(create) return { type:"CREATE", role:create[1] };

  const del = content.match(/удали\s+роль\s+(.+)/i);
  if(del) return { type:"DELETE", role:del[1] };

  const adminOn = content.match(/дай\s+админ\s+роли\s+(.+)/i);
  if(adminOn) return { type:"ADMIN_ON", role:adminOn[1] };

  const adminOff = content.match(/забери\s+админ\s+у\s+роли\s+(.+)/i);
  if(adminOff) return { type:"ADMIN_OFF", role:adminOff[1] };

  const setPos = content.match(/поставь\s+роль\s+(.+)\s+на\s+позицию\s+(\d+)/i);
  if(setPos) return { type:"SET_POSITION", role:setPos[1], position:parseInt(setPos[2]) };

  return null;
}
