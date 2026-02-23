import { db } from "../database/mongo.js";

export async function backupRole(role){
  await db.collection("role_backups").insertOne({
    name: role.name,
    permissions: role.permissions.bitfield,
    position: role.position,
    date: Date.now()
  });
}

export async function lastBackup(){
  return await db.collection("role_backups")
    .find().sort({date:-1}).limit(1).next();
}
