import { EmbedBuilder } from 'discord.js';

const COLOR_PASS = 0x10b981;
const COLOR_FAIL = 0xef4444;
const COLOR_WARN = 0xf59e0b;
const COLOR_NEUTRAL = 0x6366f1;

const FOOTER = {
  text: 'Powered by Halal Terminal • halalterminal.com',
};

export function screenEmbed(symbol, result) {
  const r = result?.result || result || {};
  const status = (r.status || r.compliance || r.verdict || 'unknown').toString();
  const isPass = /pass|compliant|halal/i.test(status);
  const isFail = /fail|non-?compliant|haram/i.test(status);
  const color = isPass ? COLOR_PASS : isFail ? COLOR_FAIL : COLOR_WARN;
  const label = isPass ? '✅ Halal' : isFail ? '❌ Non-compliant' : `⚠️ ${status}`;

  const methodology = r.methodology || r.standard || 'AAOIFI';
  const ratios = r.ratios || r.financial_ratios || {};
  const reasons = r.reasons || r.failures || r.notes || [];

  const embed = new EmbedBuilder()
    .setTitle(`${symbol.toUpperCase()} — ${label}`)
    .setColor(color)
    .addFields({ name: 'Methodology', value: String(methodology), inline: true });

  if (r.business_activity || r.sector) {
    embed.addFields({ name: 'Sector', value: String(r.business_activity || r.sector), inline: true });
  }

  const ratioLines = Object.entries(ratios)
    .slice(0, 6)
    .map(([k, v]) => `**${k}:** ${typeof v === 'number' ? v.toFixed?.(2) ?? v : v}`)
    .join('\n');
  if (ratioLines) embed.addFields({ name: 'Financial ratios', value: ratioLines });

  if (Array.isArray(reasons) && reasons.length) {
    embed.addFields({ name: 'Notes', value: reasons.slice(0, 5).map((x) => `• ${x}`).join('\n') });
  }

  embed.setFooter(FOOTER);
  return embed;
}

export function portfolioEmbed(symbols, scan) {
  const items = scan?.results || scan?.holdings || [];
  const summary = scan?.summary || {};
  const compliantPct = summary.compliant_pct ?? summary.percent_compliant ?? null;
  const purification = summary.purification_owed ?? summary.purification ?? null;

  const lines = items.slice(0, 25).map((it) => {
    const sym = it.symbol || it.ticker || '?';
    const status = (it.status || it.compliance || it.verdict || '?').toString();
    const ok = /pass|compliant|halal/i.test(status);
    const bad = /fail|non-?compliant|haram/i.test(status);
    const icon = ok ? '✅' : bad ? '❌' : '⚠️';
    return `${icon} \`${sym.padEnd(6)}\` ${status}`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`Portfolio scan — ${items.length || symbols.length} holdings`)
    .setColor(COLOR_NEUTRAL)
    .setDescription(lines.length ? lines.join('\n') : 'No results returned.');

  const summaryLines = [];
  if (compliantPct != null) summaryLines.push(`**Compliant:** ${Number(compliantPct).toFixed(1)}%`);
  if (purification != null) summaryLines.push(`**Purification owed:** ${purification}`);
  if (summaryLines.length) embed.addFields({ name: 'Summary', value: summaryLines.join('\n') });

  embed.setFooter(FOOTER);
  return embed;
}

export function trendingEmbed(trending) {
  const items = trending?.items || trending?.results || trending || [];
  const list = (Array.isArray(items) ? items : []).slice(0, 15);

  const lines = list.map((it) => {
    const sym = it.symbol || it.ticker || '?';
    const name = it.name || it.shortName || '';
    const price = it.price ?? it.regularMarketPrice;
    const status = (it.status || it.compliance || '').toString();
    const ok = /pass|compliant|halal/i.test(status);
    const bad = /fail|non-?compliant|haram/i.test(status);
    const icon = ok ? '✅' : bad ? '❌' : status ? '⚠️' : '•';
    return `${icon} \`${sym.padEnd(6)}\` ${name}${price ? ` — $${price}` : ''}`;
  });

  return new EmbedBuilder()
    .setTitle('Trending stocks')
    .setColor(COLOR_NEUTRAL)
    .setDescription(lines.length ? lines.join('\n') : 'No trending data.')
    .setFooter(FOOTER);
}

export function errorEmbed(err) {
  return new EmbedBuilder()
    .setTitle('Couldn\'t complete that request')
    .setDescription(err?.message || String(err))
    .setColor(COLOR_FAIL)
    .setFooter(FOOTER);
}
