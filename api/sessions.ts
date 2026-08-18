import type { IncomingMessage, ServerResponse } from 'http';
import { SESSIONS } from '../src/data/sessions';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ sessions: SESSIONS }));
}
