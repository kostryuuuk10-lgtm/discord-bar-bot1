import { Client, GatewayIntentBits } from "discord.js";
import { TOKEN, AI_CHANNEL_ID } from "./config.js";
import { connectDB } from "./database/mongo.js";
import { registerSlash } from "./slash/register.js";
import { isAdmin } from "./admin/adminManager.js";
import { parseRoleCommand } from "./roles/roleParser.js";
import { executeRoleAction } from "./roles/roleEngine.js";
import { panicRestore } from "./panic/panic.js";
import { askGroq } from "./ai/groq.js";
import { getMemory, saveMessage } from "./ai/memory.js";

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", async ()=>{
  console.log("🔥 GOD_MODE_FINAL START 🔥");
  await connectDB();
  await registerSlash(client);
  console.log("✅ GOD_MODE_FINAL ONLINE");
});

client.on("interactionCreate", async interaction=>{

  if(!interaction.isChatInputCommand()) return;
  if(!(await isAdmin(interaction.user.id)))
    return interaction.reply({content:"Нет доступа.",ephemeral:true});

  if(interaction.commandName === "panic"){
    const ok = await panicRestore(interaction.guild);
    return interaction.reply(ok ? "🔁 Откат выполнен." : "Нет бэкапа.");
  }

  if(interaction.commandName === "admin"){
    return interaction.reply("Используй !do команды или расширим UI позже.");
  }
});

client.on("messageCreate", async message=>{

  if(message.author.bot) return;

  // AI
  if(message.channel.id === AI_CHANNEL_ID){
    const history = await getMemory(AI_CHANNEL_ID);
    const formatted = history.reverse().map(m=>({
      role:m.role,
      content:m.content
    }));
    formatted.push({ role:"user", content:message.content });

    const reply = await askGroq(formatted);

    await saveMessage(AI_CHANNEL_ID,"user",message.content);
    await saveMessage(AI_CHANNEL_ID,"assistant",reply);

    return message.reply(reply);
  }

  // Text role fallback
  if(!message.content.startsWith("!do ")) return;
  if(!(await isAdmin(message.author.id)))
    return message.reply("Нет доступа.");

  const action = parseRoleCommand(message.content.slice(4));
  if(!action) return message.reply("Не понял команду.");

  const result = await executeRoleAction(action,message);
  return message.reply(result);
});

client.login(TOKEN);
