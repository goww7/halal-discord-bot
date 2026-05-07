import { request } from 'undici';

const BASE_URL = process.env.HALAL_API_BASE || 'https://api.halalterminal.com';

function apiKey() {
  const key = process.env.HALAL_TERMINAL_API_KEY;
  if (!key) throw new Error('HALAL_TERMINAL_API_KEY is not set. Get a free key at https://halalterminal.com');
  return key;
}

async function call(method, path, body) {
  const url = `${BASE_URL}${path}`;
  const res = await request(url, {
    method,
    headers: {
      'X-API-Key': apiKey(),
      'Content-Type': 'application/json',
      'User-Agent': 'halal-discord-bot/0.1',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.body.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (res.statusCode >= 400) {
    const msg = json?.error || json?.message || `HTTP ${res.statusCode}`;
    throw new Error(msg);
  }
  return json;
}

export const halal = {
  screen: (symbol) => call('POST', `/api/screen/${encodeURIComponent(symbol.toUpperCase())}`, {}),
  result: (symbol) => call('GET', `/api/result/${encodeURIComponent(symbol.toUpperCase())}`),
  portfolio: (symbols) => call('POST', '/api/portfolio/scan', { symbols }),
  trending: () => call('GET', '/api/trending'),
  quotes: (symbols) => call('POST', '/api/quotes/batch', { symbols }),
  news: (symbol) => call('GET', `/api/news?symbol=${encodeURIComponent(symbol)}`),
};
