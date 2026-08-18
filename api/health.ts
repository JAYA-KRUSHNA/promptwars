import type { IncomingMessage, ServerResponse } from 'http';
import { CATALOG } from '../src/data/catalog';
import { SESSIONS } from '../src/data/sessions';

export default function handler(req: IncomingMessage, res: ServerResponse & { json?: (data: unknown) => void }) {
  const rawKey = process.env.GEMINI_API_KEY;
  const hasValidKey = Boolean(
    rawKey &&
    rawKey !== 'MY_GEMINI_API_KEY' &&
    rawKey !== 'your_api_key_here' &&
    rawKey.trim().length > 10
  );

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      hasApiKey: hasValidKey,
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      catalogSize: CATALOG.length,
      sessionCount: SESSIONS.length,
    })
  );
}
