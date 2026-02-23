const { OWNER_ID } = require("../config/env");

async function isAdmin(database, userId){
  if(userId === OWNER_ID) return true;
  const admin = await database.collection("admins").findOne({ userId });
  return !!admin;
}

module.exports = { isAdmin };
