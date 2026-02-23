const { Client, GatewayIntentBits } = require("discord.js");
const { connectDB, db } = require("./database/mongo");
const { TOKEN, OWNER_ID } = require("./config/env");
const { ask } = require("./ai/chat");
const { generate } = require("./ai/image");
const { isAdmin } = require("./security/permissions");
const { enable, disable, status } = require("./security/warMode");
const log = require("./logs/logger");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", ()=>{
  console.log("👑 GOD MODE BOT ONLINE");
});

client.on("messageCreate", async message=>{

  if(message.author.bot) return;

  const database = db();

  // OWNER adds admin
  if(message.content.startsWith("!admin ") && message.author.id === OWNER_ID){
    const user = message.mentions.users.first();
    if(!user) return message.reply("Mention user.");

    await database.collection("admins").updateOne(
      { userId: user.id },
      { $set: { userId: user.id } },
      { upsert: true }
    );

    return message.reply("✅ Admin added.");
  }

  // War mode
  if(message.content === "!war on" && message.author.id === OWNER_ID){
    enable();
    return message.reply("🚨 War mode enabled.");
  }

  if(message.content === "!war off" && message.author.id === OWNER_ID){
    disable();
    return message.reply("🟢 War mode disabled.");
  }

  // !do core layer
  if(message.content.startsWith("!do ")){
    if(!(await isAdmin(database, message.author.id)))
      return message.reply("❌ No permission.");

    if(status() && message.author.id !== OWNER_ID)
      return message.reply("🚨 War mode active.");

    await log(client, `${message.author.tag} executed: ${message.content}`);

    return message.reply("⚙ Command acknowledged. Expand execution layer as needed.");
  }

  // AI in ai-chat
  if(message.channel.name === "ai-chat"){
    const reply = await ask([
      { role: "system", content: "Ты мощный Discord ассистент." },
      { role: "user", content: message.content }
    ]);
    return message.reply(reply);
  }

  // Image
  if(message.content.startsWith("!image ")){
    const buffer = await generate(message.content.slice(7));
    return message.reply({ files: [{ attachment: buffer, name: "image.png" }] });
  }

});

(async()=>{
  await connectDB();
  await client.login(TOKEN);
})();
