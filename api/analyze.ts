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
 * Safely parse incoming body across Vercel Node runtime, Express, and raw HTTP streams.
 */
function parseRequestBody(
  req: IncomingMessage & { body?: unknown }
): Promise<AnalyzeRequestBody> {
  // Case 1: Vercel or middleware already parsed JSON into an object
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body as AnalyzeRequestBody);
  }

  // Case 2: Vercel passed body as raw JSON string
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      return Promise.resolve((parsed && typeof parsed === 'object') ? parsed as AnalyzeRequestBody : {});
    } catch {
      return Promise.resolve({});
    }
  }

  // Case 3: Vercel passed body as Buffer
  if (Buffer.isBuffer(req.body)) {
    try {
      const parsed = JSON.parse(req.body.toString('utf-8'));
      return Promise.resolve((parsed && typeof parsed === 'object') ? parsed as AnalyzeRequestBody : {});
    } catch {
      return Promise.resolve({});
    }
  }

  // Case 4: Raw HTTP Stream with safety timeout (prevents hanging if stream is drained)
  return new Promise((resolve) => {
    let rawBody = '';
    const maxBytes = 256 * 1024;
    let finished = false;

    const streamTimeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve({});
      }
    }, 400);

    req.on('data', (chunk) => {
      rawBody += chunk;
      if (rawBody.length > maxBytes) {
        if (!finished) {
          finished = true;
          clearTimeout(streamTimeout);
          resolve({});
        }
      }
    });

    req.on('end', () => {
      if (!finished) {
        finished = true;
        clearTimeout(streamTimeout);
        try {
          if (!rawBody.trim()) {
            resolve({});
            return;
          }
          const parsed = JSON.parse(rawBody);
          resolve((parsed && typeof parsed === 'object') ? parsed as AnalyzeRequestBody : {});
        } catch {
          resolve({});
        }
      }
    });

    req.on('error', () => {
      if (!finished) {
        finished = true;
        clearTimeout(streamTimeout);
        resolve({});
      }
    });
  });
}

function sendResponse(
  res: ServerResponse & { status?: (code: number) => { json: (data: unknown) => void }; json?: (data: unknown) => void },
  statusCode: number,
  data: unknown
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
    return;
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * Serverless function handler for POST /api/analyze.
 */
export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string },
  res: ServerResponse & { status?: (code: number) => { json: (data: unknown) => void }; json?: (data: unknown) => void }
) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = await parseRequestBody(req);
    const { sessionId, selectedReelIds, customReels, apiKey, model } = body;

    let reelsToAnalyze: Reel[] = [];

    // Filter and sanitize reels
    if (customReels && Array.isArray(customReels) && customReels.length > 0) {
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

    if (reelsToAnalyze.length === 0) {
      reelsToAnalyze = SESSIONS[0].reels;
    }

    // Resolve API key
    const serverKey =
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.API_KEY;

    // Run inference with Gemini
    const result = await analyzeSessionWithGemini(
      reelsToAnalyze,
      CATALOG,
      serverKey,
      model
    );

    return sendResponse(res, 200, {
      success: true,
      analysis: result.analysis,
      source: result.source,
      latencyMs: result.latencyMs,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown inference error occurred';
    console.error('API /api/analyze error:', errorMessage);

    return sendResponse(res, 500, {
      success: false,
      error: errorMessage,
    });
  }
}
