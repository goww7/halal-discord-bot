<p align="center">
  <h1 align="center">Halal Discord Bot</h1>
  <p align="center"><strong>Shariah-compliant stock screening, right in your Discord server.</strong></p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white" alt="Node 20+"></a>
  <a href="https://discord.js.org"><img src="https://img.shields.io/badge/discord.js-14-5865F2?logo=discord&logoColor=white" alt="discord.js 14"></a>
  <a href="https://halalterminal.com"><img src="https://img.shields.io/badge/HalalTerminal-API-10b981" alt="Halal Terminal API"></a>
</p>

```
/halal AAPL                       → ✅ Halal — AAOIFI methodology, debt 28% of mcap
/portfolio AAPL,MSFT,JNJ,TSLA     → portfolio scan with per-holding badges + summary
/trending                         → trending tickers with halal status overlay
```

---

## Why this bot

Most Muslim investors in trading communities (Discord, Telegram, Reddit) ask the same question over and over: *"Is X halal?"*. This bot answers it inline so server admins don't have to copy-paste from a screening site every time.

- **MIT-licensed**, self-hosted — your bot, your server, your rules.
- **Powered by [Halal Terminal API](https://halalterminal.com)** — 5 methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P), live ratios, 8000+ tickers.
- **3 commands**, zero config beyond two API keys.

---

## Quickstart

### 1. Get keys

- **Halal Terminal API key (free)** — sign up at [halalterminal.com](https://halalterminal.com), copy your `ht_...` key.
- **Discord bot token** — [Discord Developer Portal](https://discord.com/developers/applications) → New Application → Bot → copy token; under OAuth2 → URL Generator pick `applications.commands` + `bot` scopes and the `Send Messages`/`Embed Links` permissions, then add the bot to your server.

### 2. Install

```bash
git clone https://github.com/goww7/halal-discord-bot.git
cd halal-discord-bot
npm install
cp .env.example .env
# fill in HALAL_TERMINAL_API_KEY, DISCORD_TOKEN, DISCORD_CLIENT_ID
```

### 3. Register slash commands

```bash
npm run register
```

For instant testing, set `DISCORD_GUILD_ID` in `.env` first — guild commands appear immediately. Without it, global commands take up to an hour to propagate.

### 4. Run

```bash
npm start
```

That's it. Try `/halal TSLA` in your server.

---

## Deploy

### Docker

```bash
docker build -t halal-discord-bot .
docker run --env-file .env halal-discord-bot
```

### Railway / Fly / Render

This is a standard Node 20 worker process. Set the env vars from `.env.example`, point the deploy at `npm start`, and you're done.

---

## Commands

| Command | What it does |
|---|---|
| `/halal <symbol>` | Full Shariah screen for a single ticker (verdict, methodology, ratios, reasons) |
| `/portfolio <symbols>` | Comma-separated tickers — returns per-holding compliance + portfolio summary |
| `/trending` | Trending stocks with compliance icons inline |

---

## Configuration

| Env var | Required | Description |
|---|---|---|
| `HALAL_TERMINAL_API_KEY` | yes | Get a free key at [halalterminal.com](https://halalterminal.com) |
| `DISCORD_TOKEN` | yes | Bot token from the Discord Developer Portal |
| `DISCORD_CLIENT_ID` | yes | Application ID from the Developer Portal |
| `DISCORD_GUILD_ID` | no | Set this during dev to register commands to one server (instant); leave empty for global |
| `HALAL_API_BASE` | no | Override the API base URL (default: `https://api.halalterminal.com`) |

---

## Disclaimer

This bot returns automated screening results from public methodologies; it is **not a fatwa or investment advice**. Consult a qualified scholar for personal rulings.

---

## Learn more

- [Halal Terminal blog](https://www.halalterminal.com/blog)
- [What is Islamic finance?](https://www.halalterminal.com/research/what-is-islamic-finance)
- [Shariah-compliant ETFs compared (2026)](https://www.halalterminal.com/research/sharia-etf-comprehensive-analysis)
- [Is my stock halal? Screener](https://www.halalterminal.com/stocks)
- [API reference](https://api.halalterminal.com/api-reference)

## Part of the Halal Terminal ecosystem

[Website](https://www.halalterminal.com) · [API](https://api.halalterminal.com/api-reference) · [Python SDK](https://github.com/goww7/halalterminal-sdk-python) · [JS SDK](https://github.com/goww7/halalterminal-sdk-js) · [MCP server](https://github.com/goww7/halalterminal-mcp) · [Claude plugin](https://github.com/goww7/halalterminal-claude-skills) · [TradingView indicator](https://github.com/goww7/halal-pine) · [Portfolio tracker](https://github.com/goww7/halal-portfolio-tracker)

---

## Related projects

Other open-source tools in the Halal Terminal ecosystem:

| Project | What it is |
|---|---|
| [**halal-portfolio-tracker**](https://github.com/goww7/halal-portfolio-tracker) | Next.js portfolio compliance tracker (one-click Vercel deploy) |
| [**halal-pine**](https://github.com/goww7/halal-pine) | TradingView Pine v5 indicator with daily-refreshed compliance data |
| [**halalterminal-claude-skills**](https://github.com/goww7/halalterminal-claude-skills) | Claude Code plugin with screening skills + portfolio-builder subagent |
| [**halalterminal-mcp**](https://github.com/goww7/halalterminal-mcp) | MCP server for any MCP-compatible client (Cursor, Cline, Codex…) |
| [**yassir-oss**](https://github.com/goww7/yassir-oss) | Open-source ReAct agent for financial research |

---

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  Built with ❤️ on top of <a href="https://halalterminal.com">Halal Terminal</a>.
  <br>
  <sub>Get a free API key — 50 requests/month, no credit card.</sub>
</p>
