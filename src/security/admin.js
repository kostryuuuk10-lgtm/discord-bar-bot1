const { OWNER_ID } = require("../config/env");

async function isAdmin(database, userId){
  if(userId === OWNER_ID) return true;
  const admin = await database.collection("admins").findOne({ userId });
  return !!admin;
}

async function addAdmin(database, userId){
  await database.collection("admins").updateOne(
    { userId },
    { $set: { userId } },
    { upsert: true }
  );
}

async function removeAdmin(database, userId){
  await database.collection("admins").deleteOne({ userId });
}

async function listAdmins(database){
  return await database.collection("admins").find().toArray();
}

module.exports = { isAdmin, addAdmin, removeAdmin, listAdmins };
