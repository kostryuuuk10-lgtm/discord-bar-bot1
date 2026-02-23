import { db } from "../database/mongo.js";

export async function getMemory(channel){
  return await db.collection("memory")
    .find({ channel })
    .sort({ date:-1 })
    .limit(15).toArray();
}

export async function saveMessage(channel, role, content){
  await db.collection("memory").insertOne({
    channel, role, content, date:Date.now()
  });
}
