import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { TOKEN } from "../config.js";

export async function registerSlash(client){

  const commands = [
    new SlashCommandBuilder().setName("admin").setDescription("Админ панель"),
    new SlashCommandBuilder().setName("panic").setDescription("Откат роли")
  ].map(c=>c.toJSON());

  const rest = new REST({version:"10"}).setToken(TOKEN);

  await rest.put(
    Routes.applicationCommands((await client.application.fetch()).id),
    { body:commands }
  );

  console.log("⚡ Slash зарегистрированы");
}
