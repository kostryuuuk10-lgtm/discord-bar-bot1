const { MongoClient } = require("mongodb");
const { MONGO_URI } = require("../config/env");

const client = new MongoClient(MONGO_URI);
let database;

async function connectDB(){
  await client.connect();
  database = client.db("god_mode_v8");
  console.log("🍃 MongoDB CONNECTED (v8)");
}

function db(){ return database; }

module.exports = { connectDB, db };
