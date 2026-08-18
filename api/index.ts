import express from 'express';
import { CATALOG } from '../src/data/catalog';
import { SESSIONS } from '../src/data/sessions';
import { analyzeSessionWithGemini } from '../src/lib/gemini';
import { Reel } from '../src/lib/types';

const app = express();

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const rawKey = process.env.GEMINI_API_KEY;
  const hasValidKey = Boolean(
    rawKey &&
    rawKey !== 'MY_GEMINI_API_KEY' &&
    rawKey !== 'your_api_key_here' &&
    rawKey.trim().length > 10
  );

  res.json({
    status: 'ok',
    hasApiKey: hasValidKey,
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    catalogSize: CATALOG.length,
    sessionCount: SESSIONS.length,
  });
});

// Get recommendation catalog
app.get('/api/catalog', (req, res) => {
  res.json({ catalog: CATALOG });
});

// Get test sessions
app.get('/api/sessions', (req, res) => {
  res.json({ sessions: SESSIONS });
});

// Analyze session reels with Gemini
app.post('/api/analyze', async (req, res) => {
  try {
    const { sessionId, selectedReelIds, customReels } = req.body;

    let reelsToAnalyze: Reel[] = [];

    if (customReels && Array.isArray(customReels) && customReels.length > 0) {
      if (Array.isArray(selectedReelIds) && selectedReelIds.length > 0) {
        reelsToAnalyze = customReels.filter((r) => selectedReelIds.includes(r.id));
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

    const response = await analyzeSessionWithGemini(reelsToAnalyze, CATALOG);
    return res.json({
      success: true,
      analysis: response.analysis,
      source: response.source,
      latencyMs: response.latencyMs,
    });
  } catch (err: unknown) {
    console.error('Analysis error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

export default app;
