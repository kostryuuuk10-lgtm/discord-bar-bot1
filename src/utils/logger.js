import { LOG_CHANNEL_ID } from "../config.js";

export async function log(client, text){
  if(!LOG_CHANNEL_ID) return;
  const ch = await client.channels.fetch(LOG_CHANNEL_ID).catch(()=>null);
  if(ch) ch.send("📜 " + text);
}
