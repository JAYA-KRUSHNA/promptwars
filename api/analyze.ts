import type { IncomingMessage, ServerResponse } from 'http';
import { CATALOG } from '../src/data/catalog';
import { SESSIONS } from '../src/data/sessions';
import { analyzeSessionWithGemini } from '../src/lib/gemini';
import { Reel } from '../src/lib/types';

async function parseBody(req: IncomingMessage & { body?: unknown }): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: IncomingMessage & { body?: unknown; method?: string }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  try {
    const body = await parseBody(req);
    const { sessionId, selectedReelIds, customReels, apiKey, model } = body;

    let reelsToAnalyze: Reel[] = [];

    if (customReels && Array.isArray(customReels) && customReels.length > 0) {
      if (Array.isArray(selectedReelIds) && selectedReelIds.length > 0) {
        reelsToAnalyze = customReels.filter((r: Reel) => selectedReelIds.includes(r.id));
      } else {
        reelsToAnalyze = customReels;
      }
    } else if (sessionId) {
      const foundSession = SESSIONS.find((s) => s.id === sessionId);
      if (foundSession) {
        if (Array.isArray(selectedReelIds) && selectedReelIds.length > 0) {
          reelsToAnalyze = foundSession.reels.filter((r) => selectedReelIds.includes(r.id));
        } else {
          reelsToAnalyze = foundSession.reels;
        }
      }
    }

    if (reelsToAnalyze.length === 0) {
      reelsToAnalyze = SESSIONS[0].reels;
    }

    const response = await analyzeSessionWithGemini(reelsToAnalyze, CATALOG, apiKey, model);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        analysis: response.analysis,
        source: response.source,
        latencyMs: response.latencyMs,
      })
    );
  } catch (err: unknown) {
    console.error('API analyze error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: errorMessage }));
  }
}
