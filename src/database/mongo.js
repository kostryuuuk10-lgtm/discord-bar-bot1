import { MongoClient } from "mongodb";
import { MONGO_URI } from "../config.js";

export const mongo = new MongoClient(MONGO_URI);
export let db;

export async function connectDB() {
  await mongo.connect();
  db = mongo.db("god_mode_final");
  console.log("🍃 Mongo connected (FINAL)");
}
