import { SlashCommandBuilder } from 'discord.js';

export const commandData = [
  new SlashCommandBuilder()
    .setName('halal')
    .setDescription('Screen a stock for Shariah compliance')
    .addStringOption((o) =>
      o.setName('symbol').setDescription('Ticker, e.g. AAPL or MSFT').setRequired(true),
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('portfolio')
    .setDescription('Scan a portfolio for Shariah compliance')
    .addStringOption((o) =>
      o
        .setName('symbols')
        .setDescription('Comma-separated tickers, e.g. AAPL,MSFT,JNJ')
        .setRequired(true),
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('trending')
    .setDescription('Show trending stocks with Shariah compliance status')
    .toJSON(),
];
