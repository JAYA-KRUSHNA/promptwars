import type { IncomingMessage, ServerResponse } from 'http';
import { CATALOG } from '../src/data/catalog';
import { SESSIONS } from '../src/data/sessions';

/**
 * Health check endpoint: GET /api/health.
 */
export default function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method && req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ status: 'error', error: 'Method Not Allowed. Use GET.' }));
    return;
  }

  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;

  const hasValidKey = Boolean(
    rawKey &&
    rawKey !== 'MY_GEMINI_API_KEY' &&
    rawKey !== 'your_api_key_here' &&
    rawKey.trim().length > 10
  );

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      hasApiKey: hasValidKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      catalogSize: CATALOG.length,
      sessionCount: SESSIONS.length,
      timestamp: new Date().toISOString(),
    })
  );
}
