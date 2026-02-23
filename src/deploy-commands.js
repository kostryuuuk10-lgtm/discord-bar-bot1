const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const { TOKEN, CLIENT_ID, GUILD_ID } = require("./config");

const commands = [
  new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Очистить память")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ Команды зарегистрированы");
})();
