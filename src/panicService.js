async function backupRole(database, guildId, roleData){
  await database.collection("backups").insertOne({ guildId, roleData, date: Date.now() });
}

async function lastBackup(database){
  return await database.collection("backups").find().sort({ date: -1 }).limit(1).next();
}

module.exports = { backupRole, lastBackup };
