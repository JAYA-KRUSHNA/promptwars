import type { IncomingMessage, ServerResponse } from 'http';
import { CATALOG } from '../src/data/catalog';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ catalog: CATALOG }));
}
