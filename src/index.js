import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { halal } from './halalApi.js';
import { screenEmbed, portfolioEmbed, trendingEmbed, errorEmbed } from './format.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN missing. See README.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply();

  try {
    if (interaction.commandName === 'halal') {
      const symbol = interaction.options.getString('symbol', true).trim();
      const result = await halal.screen(symbol);
      await interaction.editReply({ embeds: [screenEmbed(symbol, result)] });
      return;
    }

    if (interaction.commandName === 'portfolio') {
      const raw = interaction.options.getString('symbols', true);
      const symbols = raw
        .split(/[\s,]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 50);
      if (symbols.length === 0) {
        await interaction.editReply({ embeds: [errorEmbed(new Error('No symbols provided.'))] });
        return;
      }
      const scan = await halal.portfolio(symbols);
      await interaction.editReply({ embeds: [portfolioEmbed(symbols, scan)] });
      return;
    }

    if (interaction.commandName === 'trending') {
      const trending = await halal.trending();
      await interaction.editReply({ embeds: [trendingEmbed(trending)] });
      return;
    }
  } catch (err) {
    console.error('command error:', err);
    await interaction.editReply({ embeds: [errorEmbed(err)] });
  }
});

client.login(token);
