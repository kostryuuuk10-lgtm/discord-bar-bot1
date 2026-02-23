import { OWNER_ID } from "../config.js";
import { db } from "../database/mongo.js";

export async function isAdmin(id){
  if(id === OWNER_ID) return true;
  const a = await db.collection("admins").findOne({ userId:id });
  return !!a;
}

export async function addAdmin(id){
  await db.collection("admins").updateOne(
    { userId:id },
    { $set:{ userId:id }},
    { upsert:true }
  );
}

export async function removeAdmin(id){
  await db.collection("admins").deleteOne({ userId:id });
}

export async function listAdmins(){
  return await db.collection("admins").find().toArray();
}
