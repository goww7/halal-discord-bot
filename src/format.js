import { EmbedBuilder } from 'discord.js';

const COLOR_PASS = 0x10b981;
const COLOR_FAIL = 0xef4444;
const COLOR_WARN = 0xf59e0b;
const COLOR_NEUTRAL = 0x6366f1;

const FOOTER = {
  text: 'Powered by Halal Terminal • halalterminal.com',
};

function methodologySummary(r) {
  // Build a compact line: "AAOIFI ✓  DJIM ✓  FTSE ✗  MSCI ✓  S&P ✓"
  const cells = [
    ['AAOIFI', r.aaoifi_compliant],
    ['DJIM', r.djim_compliant],
    ['FTSE', r.ftse_compliant],
    ['MSCI', r.msci_compliant],
    ['S&P', r.sp_compliant],
  ];
  return cells
    .map(([k, v]) => `**${k}** ${v === true ? '✓' : v === false ? '✗' : '–'}`)
    .join('  ·  ');
}

function failureReason(r) {
  if (r.business_screen_pass === false && r.business_screen_reason) {
    return r.business_screen_reason;
  }
  if (r.financial_screen_pass === false) {
    return 'Failed financial screen — debt or interest exposure above the AAOIFI threshold.';
  }
  return r.business_screen_reason || 'Failed AAOIFI screening.';
}

export function screenEmbed(symbol, r) {
  // /api/screen/{symbol} returns the verdict object directly at top level —
  // no `result` wrapper.
  if (!r || typeof r !== 'object') r = {};

  const ic = r.is_compliant;
  const isPass = ic === true;
  const isFail = ic === false;
  const color = isPass ? COLOR_PASS : isFail ? COLOR_FAIL : COLOR_WARN;
  const label = isPass ? '✅ Halal' : isFail ? '❌ Non-compliant' : '⚠️ Pending';

  const embed = new EmbedBuilder()
    .setTitle(`${(r.symbol || symbol).toUpperCase()} — ${label}`)
    .setColor(color);

  if (r.name) embed.setDescription(r.name);

  const facts = [];
  if (r.sector) facts.push({ name: 'Sector', value: String(r.sector), inline: true });
  if (r.industry) facts.push({ name: 'Industry', value: String(r.industry), inline: true });
  if (typeof r.market_cap === 'number') {
    const mc =
      r.market_cap >= 1e12
        ? `$${(r.market_cap / 1e12).toFixed(2)}T`
        : r.market_cap >= 1e9
          ? `$${(r.market_cap / 1e9).toFixed(1)}B`
          : `$${(r.market_cap / 1e6).toFixed(0)}M`;
    facts.push({ name: 'Market cap', value: mc, inline: true });
  }
  if (facts.length) embed.addFields(...facts);

  // Reason (only when failed)
  if (isFail) {
    embed.addFields({ name: 'Why non-compliant', value: failureReason(r) });
  }

  // Per-methodology breakdown
  embed.addFields({ name: 'Methodology breakdown', value: methodologySummary(r) });

  // Key financial ratios (when present)
  const ratioPairs = [
    ['Debt / market cap', r.debt_to_market_cap_ratio],
    ['Cash / market cap', r.cash_to_market_cap_ratio],
    ['Liquidity / market cap', r.liquidity_to_market_cap_ratio],
    ['Receivables / assets', r.accounts_receivable_to_assets_ratio],
    ['Interest income / revenue', r.interest_income_to_revenue_ratio],
  ].filter(([, v]) => typeof v === 'number');

  if (ratioPairs.length) {
    const lines = ratioPairs
      .slice(0, 5)
      .map(([k, v]) => `**${k}:** ${(v * 100).toFixed(2)}%`);
    embed.addFields({ name: 'Financial ratios', value: lines.join('\n') });
  }

  if (typeof r.purification_rate === 'number') {
    // API returns this already as a percentage (e.g. 3.37 means 3.37%), not a decimal.
    embed.addFields({
      name: 'Purification rate',
      value: `${r.purification_rate.toFixed(2)}% of dividend income`,
      inline: true,
    });
  }

  embed.setFooter(FOOTER);
  return embed;
}

export function portfolioEmbed(symbols, scan) {
  // /api/portfolio/scan returns { results: { AAPL: {...}, MSFT: {...} },
  //                               summary: { total, compliant, non_compliant, pending,
  //                                          avg_purification_rate } }
  const resultsMap =
    scan && typeof scan.results === 'object' && !Array.isArray(scan.results)
      ? scan.results
      : {};
  const summary = scan?.summary || {};

  const lines = symbols.slice(0, 25).map((sym) => {
    const r = resultsMap[sym] || {};
    const ic = r.is_compliant;
    const ok = ic === true;
    const bad = ic === false;
    const icon = ok ? '✅' : bad ? '❌' : '⚠️';
    const verdict = ok ? 'Compliant' : bad ? 'Non-compliant' : 'Pending';
    const tag = bad && r.business_screen_pass === false ? ' (sector)' : bad ? ' (financial)' : '';
    return `${icon} \`${sym.padEnd(6)}\` ${verdict}${tag}`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`Portfolio scan — ${symbols.length} holdings`)
    .setColor(COLOR_NEUTRAL)
    .setDescription(lines.length ? lines.join('\n') : 'No results returned.');

  const summaryLines = [];
  const total = summary.total ?? symbols.length;
  const compliant = summary.compliant;
  const nonCompliant = summary.non_compliant;
  if (typeof compliant === 'number' && typeof total === 'number' && total > 0) {
    summaryLines.push(`**Compliant:** ${compliant} / ${total} (${((compliant / total) * 100).toFixed(1)}%)`);
  }
  if (typeof nonCompliant === 'number' && nonCompliant > 0) {
    summaryLines.push(`**Non-compliant:** ${nonCompliant}`);
  }
  if (typeof summary.avg_purification_rate === 'number') {
    summaryLines.push(`**Avg purification:** ${summary.avg_purification_rate.toFixed(2)}% of dividend income`);
  }
  if (summaryLines.length) {
    embed.addFields({ name: 'Summary', value: summaryLines.join('\n') });
  }

  embed.setFooter(FOOTER);
  return embed;
}

export function trendingEmbed(trending) {
  // /api/trending returns a flat array: [{symbol, name, change, price, volume}, ...]
  // No compliance status — users can run /halal SYMBOL to check any of these.
  const items = Array.isArray(trending) ? trending : trending?.items || trending?.results || [];
  const list = items.slice(0, 12);

  const lines = list.map((it) => {
    const sym = (it.symbol || it.ticker || '?').toUpperCase();
    const name = it.name || it.shortName || '';
    const price = typeof it.price === 'number' ? `$${it.price.toFixed(2)}` : '';
    const change = it.change ?? '';
    const changeIcon =
      typeof change === 'string' && change.startsWith('+')
        ? '🟢'
        : typeof change === 'string' && change.startsWith('-')
          ? '🔴'
          : '◼';
    return `${changeIcon} \`${sym.padEnd(6)}\` ${price.padEnd(10)} ${change}  ${name}`;
  });

  const embed = new EmbedBuilder()
    .setTitle('Trending stocks')
    .setColor(COLOR_NEUTRAL)
    .setDescription(lines.length ? lines.join('\n') : 'No trending data.')
    .setFooter({
      text: 'Use /halal SYMBOL to check Shariah compliance · Powered by Halal Terminal',
    });

  return embed;
}

export function errorEmbed(err) {
  const isAuth = err?.code === 'INVALID_API_KEY' || err?.status === 401;
  const isQuota = err?.code === 'RATE_LIMITED' || err?.status === 429;

  const friendly = isAuth
    ? 'The Halal Terminal API key configured for this bot is invalid. The bot owner needs to update HALAL_TERMINAL_API_KEY.'
    : isQuota
      ? 'Halal Terminal API quota exhausted for this bot. Try again later or contact the bot owner.'
      : err?.message || String(err);

  return new EmbedBuilder()
    .setTitle("Couldn't complete that request")
    .setDescription(friendly)
    .setColor(COLOR_FAIL)
    .setFooter(FOOTER);
}
