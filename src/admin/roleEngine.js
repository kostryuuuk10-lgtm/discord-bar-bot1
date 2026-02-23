const { backupRole } = require("../backup/roleBackup");
const { audit } = require("../logs/audit");

function canManage(botMember, role){
  if(role.name === "@everyone") return false;
  if(role.managed) return false;
  if(role.position >= botMember.roles.highest.position) return false;
  return true;
}

async function execute(action, message, database){

  const guild = message.guild;
  const botMember = guild.members.me;

  if(action.type === "CREATE"){
    await guild.roles.create({ name: action.role });
    return "Роль создана.";
  }

  const role = guild.roles.cache.find(r=>r.name===action.role);
  if(!role) return "Роль не найдена.";
  if(!canManage(botMember, role)) return "Нельзя управлять этой ролью.";

  if(action.type === "DELETE"){
    await backupRole(database, role);
    await role.delete();
    return "Роль удалена.";
  }

  if(action.type === "ADMIN_ON"){
    await backupRole(database, role);
    await role.setPermissions(["Administrator"]);
    return "Админ включен.";
  }

  if(action.type === "ADMIN_OFF"){
    await backupRole(database, role);
    await role.setPermissions([]);
    return "Админ выключен.";
  }

  if(action.type === "GIVE_USER"){
    const member = await guild.members.fetch(action.userId);
    await member.roles.add(role);
    await audit(database, { executor: message.author.id, action:"GIVE_USER", target: action.userId, role: role.name });
    return "Роль выдана.";
  }

  if(action.type === "REMOVE_USER"){
    const member = await guild.members.fetch(action.userId);
    await member.roles.remove(role);
    await audit(database, { executor: message.author.id, action:"REMOVE_USER", target: action.userId, role: role.name });
    return "Роль забрана.";
  }

  return "Неизвестное действие.";
}

module.exports = { execute };
