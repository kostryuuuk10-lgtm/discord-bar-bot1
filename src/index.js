const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const OpenAI = require("openai");
const { connectDB, memory } = require("./database");
const { TOKEN, GROQ_API_KEY, OWNER_ID } = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

client.once("ready", () => {
  console.log("🤖 Owner AI Admin Bot V6 Online");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "reset") {
    await memory().deleteOne({ userId: interaction.user.id });
    return interaction.reply("🧠 Память очищена.");
  }
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;
  if (message.channel.name !== "ai-chat") return;

  const isOwner = message.author.id === OWNER_ID;

  const systemPrompt = `
Ты Discord AI администратор.
Если нужно действие — верни JSON.

actions:
give_role, remove_role,
mute, unmute,
ban, unban,
clear,
create_channel, delete_channel,
rename_role,
toggle_admin,
panic,
panic_rollback

Иначе отвечай обычным текстом.
`;

  const response = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message.content }
    ]
  });

  const reply = response.choices[0].message.content;

  let data;
  try {
    data = JSON.parse(reply);
  } catch {
    return message.reply(reply);
  }

  if (!isOwner) return message.reply("Ты не владелец.");

  switch (data.action) {

    case "panic": {

      const backup = [];

      for (const member of message.guild.members.cache.values()) {
        if (!member.user.bot) {
          backup.push({
            userId: member.id,
            roles: member.roles.cache
              .filter(r => r.id !== message.guild.id)
              .map(r => r.id)
          });

          await member.roles.set([]);
        }
      }

      await memory().updateOne(
        { type: "panic_backup" },
        { $set: { data: backup } },
        { upsert: true }
      );

      return message.reply("🚨 PANIC MODE ACTIVATED (backup saved)");
    }

    case "panic_rollback": {

      const backupDoc = await memory().findOne({ type: "panic_backup" });
      if (!backupDoc) return message.reply("Нет сохранённого panic.");

      for (const entry of backupDoc.data) {
        const member = await message.guild.members.fetch(entry.userId).catch(() => null);
        if (member) await member.roles.set(entry.roles);
      }

      await memory().deleteOne({ type: "panic_backup" });

      return message.reply("♻ PANIC ROLLBACK COMPLETED");
    }

    case "give_role": {
      const member = message.mentions.members.first();
      const role = message.guild.roles.cache.find(r => r.name === data.role);
      if (member && role) await member.roles.add(role);
      return message.reply("Роль выдана.");
    }

    case "remove_role": {
      const member = message.mentions.members.first();
      const role = message.guild.roles.cache.find(r => r.name === data.role);
      if (member && role) await member.roles.remove(role);
      return message.reply("Роль снята.");
    }

    case "mute": {
      const member = message.mentions.members.first();
      if (member) await member.timeout((data.time || 5) * 60000);
      return message.reply("Замучен.");
    }

    case "unmute": {
      const member = message.mentions.members.first();
      if (member) await member.timeout(null);
      return message.reply("Размучен.");
    }

    case "ban": {
      const member = message.mentions.members.first();
      if (member) await member.ban();
      return message.reply("Забанен.");
    }

    case "unban": {
      await message.guild.members.unban(data.user);
      return message.reply("Разбанен.");
    }

    case "clear": {
      const amount = data.amount || 10;
      await message.channel.bulkDelete(amount, true);
      return message.reply(`Удалено ${amount}`);
    }

    case "create_channel": {
      await message.guild.channels.create({
        name: data.channel || "новый-канал",
        type: 0
      });
      return message.reply("Канал создан.");
    }

    case "delete_channel": {
      await message.channel.delete();
      break;
    }

    case "rename_role": {
      const role = message.guild.roles.cache.find(r => r.name === data.role);
      if (role) await role.setName(data.new_name);
      return message.reply("Роль переименована.");
    }

    case "toggle_admin": {
      const role = message.guild.roles.cache.find(r => r.name === data.role);
      if (role) {
        const perms = role.permissions;
        if (perms.has(PermissionsBitField.Flags.Administrator)) {
          await role.setPermissions(perms.remove(PermissionsBitField.Flags.Administrator));
        } else {
          await role.setPermissions(perms.add(PermissionsBitField.Flags.Administrator));
        }
      }
      return message.reply("Права изменены.");
    }

    default:
      return message.reply(reply);
  }

});

(async () => {
  await connectDB();
  await client.login(TOKEN);
})();
