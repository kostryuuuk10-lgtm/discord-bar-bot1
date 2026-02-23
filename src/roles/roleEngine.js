import { backupRole } from "../backup/roleBackup.js";
import { db } from "../database/mongo.js";

function canManage(botMember, role){
  if(role.name === "@everyone") return false;
  if(role.managed) return false;
  if(role.position >= botMember.roles.highest.position) return false;
  return true;
}

export async function executeRoleAction(action, message){

  const guild = message.guild;
  const botMember = guild.members.me;

  if(action.type === "CREATE"){
    await guild.roles.create({ name:action.role });
    return "Роль создана.";
  }

  const role = guild.roles.cache.find(r=>r.name===action.role);
  if(!role) return "Роль не найдена.";
  if(!canManage(botMember, role)) return "Нельзя управлять этой ролью.";

  if(action.type === "DELETE"){
    await backupRole(role);
    await role.delete();
    return "Роль удалена.";
  }

  if(action.type === "ADMIN_ON"){
    await backupRole(role);
    await role.setPermissions(["Administrator"]);
    return "Админ включен.";
  }

  if(action.type === "ADMIN_OFF"){
    await backupRole(role);
    await role.setPermissions([]);
    return "Админ выключен.";
  }

  if(action.type === "SET_POSITION"){
    await backupRole(role);
    await role.setPosition(action.position);
    return "Позиция обновлена.";
  }

  if(action.type === "GIVE_USER"){
    const member = await guild.members.fetch(action.userId);
    await member.roles.add(role);
    return "Роль выдана.";
  }

  if(action.type === "REMOVE_USER"){
    const member = await guild.members.fetch(action.userId);
    await member.roles.remove(role);
    return "Роль забрана.";
  }

  return "Неизвестное действие.";
}
