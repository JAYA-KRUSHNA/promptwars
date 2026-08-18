import type { IncomingMessage, ServerResponse } from 'http';
import { CATALOG } from '../src/data/catalog';
import { SESSIONS } from '../src/data/sessions';
import { analyzeSessionWithGemini } from '../src/lib/gemini';
import { Reel } from '../src/lib/types';

interface AnalyzeRequestBody {
  sessionId?: string;
  selectedReelIds?: string[];
  customReels?: Reel[];
  apiKey?: string;
  model?: string;
}

/**
 * Safely parse and sanitize incoming JSON payload with byte length limits.
 */
async function parseAndValidateBody(
  req: IncomingMessage & { body?: unknown }
): Promise<AnalyzeRequestBody> {
  if (req.body && typeof req.body === 'object') {
    return req.body as AnalyzeRequestBody;
  }

  return new Promise((resolve, reject) => {
    let rawBody = '';
    const maxBytes = 256 * 1024; // 256 KB max payload limit

    req.on('data', (chunk) => {
      rawBody += chunk;
      if (rawBody.length > maxBytes) {
        reject(new Error('Payload too large: maximum 256 KB exceeded'));
      }
    });

    req.on('end', () => {
      try {
        if (!rawBody.trim()) {
          resolve({});
          return;
        }
        const parsed = JSON.parse(rawBody);
        if (typeof parsed !== 'object' || parsed === null) {
          resolve({});
          return;
        }
        resolve(parsed as AnalyzeRequestBody);
      } catch (err) {
        reject(new Error('Invalid JSON format in request body'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

/**
 * Serverless function handler for POST /api/analyze.
 */
export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string },
  res: ServerResponse
) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  try {
    const body = await parseAndValidateBody(req);
    const { sessionId, selectedReelIds, customReels, apiKey, model } = body;

    let reelsToAnalyze: Reel[] = [];

    // Sanitize and filter reels
    if (customReels && Array.isArray(customReels) && customReels.length > 0) {
      // Bound to maximum 20 reels for safety
      const boundedReels = customReels.slice(0, 20);
      if (Array.isArray(selectedReelIds) && selectedReelIds.length > 0) {
        reelsToAnalyze = boundedReels.filter((r) => selectedReelIds.includes(r.id));
      } else {
        reelsToAnalyze = boundedReels;
      }
    } else if (sessionId && typeof sessionId === 'string') {
      const foundSession = SESSIONS.find((s) => s.id === sessionId);
      if (foundSession) {
        if (Array.isArray(selectedReelIds) && selectedReelIds.length > 0) {
          reelsToAnalyze = foundSession.reels.filter((r) => selectedReelIds.includes(r.id));
        } else {
          reelsToAnalyze = foundSession.reels;
        }
      }
    }

    // Fallback to Session 1 if no valid reels provided
    if (reelsToAnalyze.length === 0) {
      reelsToAnalyze = SESSIONS[0].reels;
    }

    // Sanitize apiKey string
    const sanitizedApiKey = typeof apiKey === 'string' && apiKey.trim().length > 10 ? apiKey.trim() : undefined;
    const sanitizedModel = typeof model === 'string' && model.trim().length > 0 ? model.trim() : undefined;

    const response = await analyzeSessionWithGemini(
      reelsToAnalyze,
      CATALOG,
      sanitizedApiKey,
      sanitizedModel
    );

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
    const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: errorMessage }));
  }
}
