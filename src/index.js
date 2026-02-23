const { Client, GatewayIntentBits, InteractionType } = require("discord.js");
const { connectDB, db } = require("./database/mongo");
const { TOKEN } = require("./config/env");
const { parse } = require("./parser/roleParser");
const { execute } = require("./admin/roleEngine");
const { confirmRow } = require("./security/confirm");
const { panicRestore } = require("./backup/roleBackup");
const { isAdmin, addAdmin, removeAdmin, listAdmins } = require("./security/admin");
const { getLastBackup } = require("./backup/roleBackup");
const log = require("./logs/logger");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

console.log("🔥 STARTING GOD_MODE_v8_FULL 🔥");

client.once("ready",()=>{
  console.log("✅ GOD_MODE_v8_FULL ONLINE");
});

let pending = null;

client.on("messageCreate", async message=>{

  if(message.author.bot) return;
  const database = db();

  if(message.content.startsWith("!admin add")){
    if(!(await isAdmin(database, message.author.id))) return message.reply("Нет доступа.");
    const user = message.mentions.users.first();
    if(!user) return message.reply("Укажи пользователя.");
    await addAdmin(database, user.id);
    return message.reply("Админ добавлен.");
  }

  if(message.content.startsWith("!admin remove")){
    if(!(await isAdmin(database, message.author.id))) return message.reply("Нет доступа.");
    const user = message.mentions.users.first();
    if(!user) return message.reply("Укажи пользователя.");
    await removeAdmin(database, user.id);
    return message.reply("Админ удалён.");
  }

  if(message.content === "!admin list"){
    if(!(await isAdmin(database, message.author.id))) return message.reply("Нет доступа.");
    const admins = await listAdmins(database);
    return message.reply("Админы: " + admins.map(a=>`<@${a.userId}>`).join(", "));
  }

  if(message.content === "!panic"){
    const backup = await getLastBackup(database);
    if(!backup) return message.reply("Нет бэкапа.");
    return message.reply("Бэкап найден. Восстановление вручную через код.");
  }

  if(!message.content.startsWith("!do ")) return;
  if(!(await isAdmin(database, message.author.id))) return message.reply("Нет доступа.");

  const action = parse(message.content.slice(4));
  if(!action) return message.reply("Не понял команду.");

  if(action.dangerous){
    pending = { action, message };
    return message.reply({
      content: "⚠ Подтвердить действие?",
      components:[ confirmRow() ]
    });
  }

  const result = await execute(action, message, database);
  await log(client, message.content);
  message.reply(result);
});

client.on("interactionCreate", async interaction=>{
  if(interaction.type !== InteractionType.MessageComponent) return;
  if(!pending) return;

  const database = db();

  if(interaction.customId === "confirm_yes"){
    const result = await execute(pending.action, pending.message, database);
    await interaction.update({ content:"✅ "+result, components:[] });
    pending = null;
  }

  if(interaction.customId === "confirm_no"){
    await interaction.update({ content:"❌ Отменено.", components:[] });
    pending = null;
  }
});

(async()=>{
  await connectDB();
  await client.login(TOKEN);
})();
