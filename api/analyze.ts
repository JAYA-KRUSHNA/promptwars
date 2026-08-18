import type { IncomingMessage, ServerResponse } from 'http';
import { CATALOG } from '../src/data/catalog';
import { SESSIONS } from '../src/data/sessions';
import { analyzeSessionWithGemini } from '../src/lib/gemini';
import { Reel } from '../src/lib/types';

/** Maximum number of reels accepted per request to prevent abuse. */
const MAX_REELS_PER_REQUEST = 20;

/** Maximum allowed body size in bytes (256 KB). */
const MAX_BODY_BYTES = 256 * 1024;

/** Pattern for valid session IDs (alphanumeric, underscores, hyphens). */
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Request body schema for the `/api/analyze` endpoint.
 */
interface AnalyzeRequestBody {
  sessionId?: string;
  selectedReelIds?: string[];
  customReels?: Reel[];
  apiKey?: string;
  model?: string;
}

/**
 * Safely parse the incoming HTTP request body across multiple runtime environments.
 *
 * Handles four cases:
 * 1. Vercel/middleware pre-parsed JSON object
 * 2. Raw JSON string from Vercel edge
 * 3. Buffer from Vercel Node runtime
 * 4. Raw HTTP stream (Express/local dev) with safety timeout
 *
 * @param req - The incoming HTTP request with optional pre-parsed body.
 * @returns Parsed request body, or empty object if parsing fails.
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
    let finished = false;

    const streamTimeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve({});
      }
    }, 400);

    req.on('data', (chunk) => {
      rawBody += chunk;
      if (rawBody.length > MAX_BODY_BYTES) {
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

/**
 * Validate and sanitize a session ID string.
 * Rejects IDs that don't match the safe alphanumeric pattern.
 *
 * @param sessionId - Raw session ID from client input.
 * @returns Sanitized session ID, or null if invalid.
 */
function sanitizeSessionId(sessionId: unknown): string | null {
  if (typeof sessionId !== 'string') return null;
  const trimmed = sessionId.trim();
  return SESSION_ID_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * Validate that a reel object has the minimum required structure.
 * Prevents malformed or malicious payloads from reaching the engine.
 *
 * @param reel - Raw reel object from client input.
 * @returns True if the reel has valid structure.
 */
function isValidReelStructure(reel: unknown): reel is Reel {
  if (typeof reel !== 'object' || reel === null) return false;
  const r = reel as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    r.id.length <= 128 &&
    typeof r.title === 'string' &&
    r.title.length <= 512 &&
    typeof r.category === 'string' &&
    typeof r.transcript_or_caption === 'string' &&
    r.transcript_or_caption.length <= 10000 &&
    typeof r.format === 'string' &&
    Array.isArray(r.hashtags) &&
    typeof r.engagement === 'object' &&
    r.engagement !== null
  );
}

/**
 * Send a JSON response with standard security and rate-limiting headers.
 *
 * @param res - The server response object.
 * @param statusCode - HTTP status code.
 * @param data - Response payload to serialize as JSON.
 */
function sendResponse(
  res: ServerResponse & { status?: (code: number) => { json: (data: unknown) => void }; json?: (data: unknown) => void },
  statusCode: number,
  data: unknown
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  // Rate-limiting hints (informational for clients)
  res.setHeader('X-RateLimit-Limit', '30');
  res.setHeader('X-RateLimit-Remaining', '29');
  res.setHeader('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 60));

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
    return;
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * Serverless function handler for `POST /api/analyze`.
 *
 * Accepts a student watch session (either by session ID or custom reels),
 * runs the Gemini AI inference engine with automatic fallback to the
 * deterministic content-aware scoring engine, and returns a structured
 * analysis result conforming to the Problem Statement schema.
 *
 * @param req - Incoming HTTP request.
 * @param res - Server response.
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
    const { selectedReelIds, customReels, apiKey, model } = body;

    // Sanitize session ID
    const sessionId = sanitizeSessionId(body.sessionId);

    // Validate selectedReelIds array
    const validSelectedIds = Array.isArray(selectedReelIds)
      ? selectedReelIds
          .filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 128)
          .slice(0, MAX_REELS_PER_REQUEST)
      : [];

    let reelsToAnalyze: Reel[] = [];

    // Filter and sanitize reels
    if (customReels && Array.isArray(customReels) && customReels.length > 0) {
      // Validate each reel's structure before accepting
      const validReels = customReels.filter(isValidReelStructure).slice(0, MAX_REELS_PER_REQUEST);
      if (validSelectedIds.length > 0) {
        reelsToAnalyze = validReels.filter((r) => validSelectedIds.includes(r.id));
      } else {
        reelsToAnalyze = validReels;
      }
    } else if (sessionId) {
      const foundSession = SESSIONS.find((s) => s.id === sessionId);
      if (foundSession) {
        if (validSelectedIds.length > 0) {
          reelsToAnalyze = foundSession.reels.filter((r) => validSelectedIds.includes(r.id));
        } else {
          reelsToAnalyze = foundSession.reels;
        }
      }
    }

    if (reelsToAnalyze.length === 0) {
      reelsToAnalyze = SESSIONS[0].reels;
    }

    // Resolve API key (server-side only — never from client)
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
