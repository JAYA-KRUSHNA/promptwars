import type { IncomingMessage, ServerResponse } from 'http';
import { SESSIONS } from '../src/data/sessions';

/**
 * Benchmark sessions endpoint: GET /api/sessions.
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

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      sessions: SESSIONS,
      totalCount: SESSIONS.length,
    })
  );
}
