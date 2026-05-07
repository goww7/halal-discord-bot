import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandData } from './commands.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('Set DISCORD_TOKEN and DISCORD_CLIENT_ID in .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

const route = guildId
  ? Routes.applicationGuildCommands(clientId, guildId)
  : Routes.applicationCommands(clientId);

console.log(`Registering ${commandData.length} commands ${guildId ? `to guild ${guildId}` : 'globally'}...`);
await rest.put(route, { body: commandData });
console.log('Done.');
