import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, AnalysisResponse, CatalogReel, Reel } from './types';
import { CATALOG } from '../data/catalog';
import { SYSTEM_INSTRUCTION, buildUserPrompt } from './recommendationPrompt';

// ═══════════════════════════════════════════════════════════════════════
// Shared Gemini client singleton
// ═══════════════════════════════════════════════════════════════════════
let aiClient: GoogleGenAI | null = null;
let lastUsedKey: string | null = null;

function getAiClient(overrideKey?: string): GoogleGenAI | null {
  const key =
    (overrideKey && overrideKey.trim().length > 10 ? overrideKey.trim() : null) ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;

  if (!key || key === 'MY_GEMINI_API_KEY' || key === 'your_api_key_here' || key.trim().length < 10) {
    return null;
  }

  const cleanKey = key.trim();
  if (!aiClient || lastUsedKey !== cleanKey) {
    aiClient = new GoogleGenAI({
      apiKey: cleanKey,
    });
    lastUsedKey = cleanKey;
  }
  return aiClient;
}

// ═══════════════════════════════════════════════════════════════════════
// Post-validation: ensures catalog grounding and anti-hype compliance
// ═══════════════════════════════════════════════════════════════════════
function postValidateAnalysis(
  parsed: AnalysisResult,
  catalog: CatalogReel[]
): { result: AnalysisResult; isValid: boolean } {
  // Ensure array guarantees for safe rendering
  parsed.reel_signals = Array.isArray(parsed.reel_signals) ? parsed.reel_signals : [];
  parsed.candidate_evaluations = Array.isArray(parsed.candidate_evaluations)
    ? parsed.candidate_evaluations
    : [];

  const matched = catalog.find((c) => c.id === parsed.recommended_reel_id);

  // If the recommended item doesn't exist in catalog, mark invalid
  if (!matched) {
    console.warn(
      `[PostValidation] recommended_reel_id "${parsed.recommended_reel_id}" not found in catalog`
    );
    return { result: parsed, isValid: false };
  }

  // Sync title/category/difficulty from catalog source of truth
  parsed.recommended_tech_reel = matched.title;
  parsed.category = matched.category;
  parsed.difficulty = matched.difficulty;

  // CRITICAL: Anti-hype guard — reject if Gemini selected a hype distractor
  if (matched.is_hype_distractor) {
    console.warn(
      `[AntiHype] Gemini selected hype distractor "${matched.title}" (${matched.id}). Auto-correcting...`
    );

    // Try to find a non-hype "selected" candidate from the evaluations
    const fallbackCandidate = parsed.candidate_evaluations?.find((cand) => {
      if (cand.evaluated_status !== 'selected') return false;
      if (cand.catalog_id === parsed.recommended_reel_id) return false;
      const catItem = catalog.find((c) => c.id === cand.catalog_id);
      return catItem && !catItem.is_hype_distractor;
    });

    if (fallbackCandidate) {
      const fallbackItem = catalog.find((c) => c.id === fallbackCandidate.catalog_id)!;
      parsed.recommended_reel_id = fallbackItem.id;
      parsed.recommended_tech_reel = fallbackItem.title;
      parsed.category = fallbackItem.category;
      parsed.difficulty = fallbackItem.difficulty;
      console.log(
        `[AntiHype] Auto-corrected to "${fallbackItem.title}" (${fallbackItem.id})`
      );
    } else {
      // No valid candidate found in evaluations — mark as invalid for full fallback
      return { result: parsed, isValid: false };
    }
  }

  // Validate alternative recommendation if present
  if (parsed.alternative_recommendation) {
    const altItem = catalog.find(
      (c) => c.id === parsed.alternative_recommendation?.catalog_id
    );
    if (altItem) {
      parsed.alternative_recommendation.title = altItem.title;
      parsed.alternative_recommendation.category = altItem.category;
      // If alternative is a hype distractor, remove it
      if (altItem.is_hype_distractor) {
        parsed.alternative_recommendation = undefined;
      }
    } else {
      // Alternative not found in catalog — remove it
      parsed.alternative_recommendation = undefined;
    }
  }

  return { result: parsed, isValid: true };
}

// ═══════════════════════════════════════════════════════════════════════
// Gemini Live Inference (with fixed model names & multi-model fallback)
// ═══════════════════════════════════════════════════════════════════════
export async function analyzeSessionWithGemini(
  sessionReels: Reel[],
  catalog: CatalogReel[] = CATALOG,
  overrideApiKey?: string,
  overrideModel?: string
): Promise<AnalysisResponse> {
  const ai = getAiClient(overrideApiKey);
  const startTime = Date.now();

  if (ai) {
    try {
      const userPrompt = buildUserPrompt(sessionReels, catalog);

      // Candidate models in prioritized order
      const candidateModels = [
        overrideModel,
        process.env.GEMINI_MODEL,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-3.6-flash',
      ].filter(Boolean) as string[];

      let responseText: string | null = null;
      let usedModel = candidateModels[0];

      for (const modelName of candidateModels) {
        // Each model gets up to 2 attempts
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: userPrompt,
              config: {
                abortSignal: AbortSignal.timeout(18000), // 18s timeout for structured JSON
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                temperature: 0.2,
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    interest_detected: { type: Type.STRING },
                    underlying_cluster_summary: { type: Type.STRING },
                    why: { type: Type.STRING },
                    surface_vs_underlying: { type: Type.STRING },
                    reel_signals: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          reel_id: { type: Type.STRING },
                          reel_title: { type: Type.STRING },
                          surface_topic: { type: Type.STRING },
                          implied_signal: { type: Type.STRING },
                          signal_strength: {
                            type: Type.STRING,
                            enum: ['positive', 'negative', 'neutral'],
                          },
                          weight_explanation: { type: Type.STRING },
                        },
                        required: [
                          'reel_id',
                          'reel_title',
                          'surface_topic',
                          'implied_signal',
                          'signal_strength',
                          'weight_explanation',
                        ],
                      },
                    },
                    candidate_evaluations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          catalog_id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          evaluated_status: {
                            type: Type.STRING,
                            enum: ['selected', 'rejected_hype', 'rejected_redundant', 'rejected_mismatch'],
                          },
                          rationale: { type: Type.STRING },
                        },
                        required: ['catalog_id', 'title', 'evaluated_status', 'rationale'],
                      },
                    },
                    recommended_reel_id: { type: Type.STRING },
                    recommended_tech_reel: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      enum: ['HLD', 'DSA', 'AI', 'Java', 'Cloud', 'Hardware', 'Career', 'Cybersecurity', 'Other'],
                    },
                    why_this_recommendation: { type: Type.STRING },
                    difficulty: {
                      type: Type.STRING,
                      enum: ['Beginner', 'Intermediate', 'Advanced'],
                    },
                    confidence: {
                      type: Type.STRING,
                      enum: ['High', 'Medium', 'Low'],
                    },
                    confidence_reasoning: { type: Type.STRING },
                    alternative_recommendation: {
                      type: Type.OBJECT,
                      properties: {
                        catalog_id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        category: {
                          type: Type.STRING,
                          enum: ['HLD', 'DSA', 'AI', 'Java', 'Cloud', 'Hardware', 'Career', 'Cybersecurity', 'Other'],
                        },
                        reason: { type: Type.STRING },
                      },
                    },
                  },
                  required: [
                    'interest_detected',
                    'underlying_cluster_summary',
                    'why',
                    'surface_vs_underlying',
                    'reel_signals',
                    'candidate_evaluations',
                    'recommended_reel_id',
                    'recommended_tech_reel',
                    'category',
                    'why_this_recommendation',
                    'difficulty',
                    'confidence',
                    'confidence_reasoning',
                  ],
                },
              },
            });

            if (response.text) {
              responseText = response.text;
              usedModel = modelName;
              break;
            }
          } catch (modelErr: unknown) {
            const is503 =
              modelErr instanceof Error &&
              (modelErr.message.includes('503') || modelErr.message.includes('UNAVAILABLE'));
            const isTimeout =
              modelErr instanceof Error &&
              (modelErr.name === 'TimeoutError' || modelErr.name === 'AbortError');

            if (is503 && attempt === 0) {
              // Wait 2s before retry on 503
              console.warn(`[Gemini] ${modelName} returned 503, retrying in 2s...`);
              await new Promise((r) => setTimeout(r, 2000));
              continue;
            }

            console.warn(
              `[Gemini] ${modelName} attempt ${attempt + 1} failed:`,
              modelErr instanceof Error ? modelErr.message : modelErr
            );
            break; // Move to next model
          }
        }
        if (responseText) break; // Got a response, stop trying models
      }

      const latencyMs = Date.now() - startTime;

      if (!responseText) {
        throw new Error('All Gemini candidate models returned empty or unavailable responses.');
      }

      const parsed = JSON.parse(responseText) as AnalysisResult;
      const { result, isValid } = postValidateAnalysis(parsed, catalog);

      if (isValid) {
        console.log(
          `[Gemini] Live analysis (${usedModel}) completed in ${latencyMs}ms — recommended: "${result.recommended_tech_reel}" (${result.recommended_reel_id})`
        );
        return { analysis: result, source: 'gemini', latencyMs };
      }

      console.warn('[Gemini] Response could not be catalog-validated. Seamlessly falling back to deterministic reasoning.');
    } catch (err: unknown) {
      const isTimeout =
        (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) ||
        (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'TimeoutError');
      const errorMessage = isTimeout
        ? 'Gemini API call timed out after 30 seconds.'
        : err instanceof Error
          ? err.message
          : 'Gemini live analysis failed';
      console.warn(`[Gemini] Live call issue (${errorMessage}). Seamlessly falling back to deterministic reasoning engine.`);
    }
  } else {
    console.log('[Gemini] No active API key configured, using deterministic fallback engine');
  }

  // Fallback intelligent reasoning engine (guarantees 100% demo resilience)
  const fallbackResult = generateDeterministicAnalysis(sessionReels, catalog);
  const latencyMs = Date.now() - startTime;
  return { analysis: fallbackResult, source: 'fallback', latencyMs };
}


// ═══════════════════════════════════════════════════════════════════════
// ═══════════ CONTENT-AWARE DETERMINISTIC SCORING ENGINE ══════════════
// ═══════════════════════════════════════════════════════════════════════

// ── Stopwords for keyword extraction ──────────────────────────────────
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we',
  'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
  'our', 'their', 'not', 'no', 'nor', 'so', 'if', 'then', 'than',
  'too', 'very', 'just', 'about', 'up', 'out', 'all', 'also', 'how',
  'what', 'when', 'where', 'which', 'who', 'why', 'vs', 'using',
  'while', 'into', 'over', 'after', 'before', 'between', 'under',
  'during', 'without', 'within', 'through', 'against', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only',
]);

/**
 * Extract meaningful keywords from a text string.
 * Removes stopwords, short tokens, and normalizes to lowercase.
 */
function extractKeywords(text: string): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9#+\-_]/g, ' ')  // Keep letters, numbers, #, +, -, _
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
  );
}

/**
 * Compute the overlap ratio between two keyword sets.
 * Returns a value between 0.0 and 1.0 (Jaccard-like similarity).
 */
function keywordOverlap(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  // Use the smaller set size for normalization (more generous than pure Jaccard)
  const minSize = Math.min(setA.size, setB.size);
  return intersection / minSize;
}

/**
 * Semantic category mapping: maps reel-level categories to catalog item IDs
 * with relative affinity weights. This is the "brain" of the content-aware engine.
 */
const CATEGORY_CATALOG_AFFINITY: Record<string, { id: string; weight: number }[]> = {
  'Java': [
    { id: 'cat_07', weight: 4.0 },  // Java GC Deep Dive
    { id: 'cat_08', weight: 3.5 },  // Spring Boot Microservices
    { id: 'cat_14', weight: 1.0 },  // Senior Engineers (backend career)
  ],
  'AI': [
    { id: 'cat_05', weight: 4.0 },  // Transformers / Attention
    { id: 'cat_06', weight: 3.5 },  // Neural Network in Python
    { id: 'cat_11', weight: 1.0 },  // GPU tensor acceleration (adjacent)
  ],
  'Hardware': [
    { id: 'cat_11', weight: 3.5 },  // GPU Architecture
    { id: 'cat_12', weight: 4.0 },  // CPU Cache Hierarchy
  ],
  'Career': [
    { id: 'cat_13', weight: 4.0 },  // FAANG Interview Prep
    { id: 'cat_14', weight: 3.5 },  // Senior Engineers
    { id: 'cat_03', weight: 1.0 },  // REST vs GraphQL (practical skills)
  ],
  'Web': [
    { id: 'cat_01', weight: 2.0 },  // DNS Resolution
    { id: 'cat_03', weight: 3.5 },  // REST vs GraphQL
    { id: 'cat_04', weight: 2.5 },  // Rate Limiter
    { id: 'cat_15', weight: 1.5 },  // SQL Injection (web security)
  ],
  'Cloud': [
    { id: 'cat_09', weight: 4.0 },  // AWS Lambda vs EC2
    { id: 'cat_10', weight: 3.5 },  // Kubernetes
    { id: 'cat_04', weight: 1.5 },  // Rate Limiter (distributed systems)
  ],
  'Cybersecurity': [
    { id: 'cat_15', weight: 4.5 },  // SQL Injection
    { id: 'cat_03', weight: 1.0 },  // API security awareness
  ],
  'DSA': [
    { id: 'cat_02', weight: 4.0 },  // Binary Search
    { id: 'cat_04', weight: 2.5 },  // Rate Limiter (algorithm design)
    { id: 'cat_13', weight: 1.5 },  // FAANG Interview (DSA bridge)
  ],
  'HLD': [
    { id: 'cat_01', weight: 3.0 },  // DNS
    { id: 'cat_03', weight: 3.5 },  // REST vs GraphQL
    { id: 'cat_04', weight: 3.0 },  // Rate Limiter
    { id: 'cat_10', weight: 2.0 },  // Kubernetes
  ],
  'Other': [
    { id: 'cat_14', weight: 2.0 },  // Senior Engineers (general engineering)
    { id: 'cat_03', weight: 2.0 },  // REST vs GraphQL
    { id: 'cat_04', weight: 1.5 },  // Rate Limiter
  ],
  // Non-tech categories — give gentle exploration defaults
  'Lifestyle': [
    { id: 'cat_01', weight: 1.0 },  // DNS (beginner friendly)
    { id: 'cat_02', weight: 1.0 },  // Binary Search (beginner)
    { id: 'cat_13', weight: 0.8 },  // FAANG Interview (aspirational)
  ],
  'Entertainment': [
    { id: 'cat_01', weight: 0.8 },  // DNS (exploratory)
    { id: 'cat_02', weight: 0.8 },  // Binary Search
    { id: 'cat_13', weight: 0.5 },  // FAANG Interview
  ],
};

/**
 * Format-based intent signals: what the reel format implies about the viewer's depth.
 */
const FORMAT_INTENT: Record<string, { difficultyBias: string; intentWeight: number }> = {
  'tutorial': { difficultyBias: 'Intermediate', intentWeight: 1.3 },
  'explainer': { difficultyBias: 'Intermediate', intentWeight: 1.4 },
  'comparison': { difficultyBias: 'Intermediate', intentWeight: 1.2 },
  'meme': { difficultyBias: 'Beginner', intentWeight: 0.7 },
  'skit': { difficultyBias: 'Beginner', intentWeight: 0.8 },
  'vlog': { difficultyBias: 'Beginner', intentWeight: 0.9 },
  'news': { difficultyBias: 'Beginner', intentWeight: 0.6 },
  'podcast': { difficultyBias: 'Intermediate', intentWeight: 1.1 },
};

/**
 * Per-reel signal extraction with content-aware implied signals.
 */
function extractReelSignal(r: Reel) {
  const isSkipped = r.engagement.skipped_early || r.engagement.watch_percent < 30;
  const isPositive = !isSkipped && (r.engagement.watch_percent >= 75 || r.engagement.liked || r.engagement.rewatch_count > 0);
  const strength: 'positive' | 'negative' | 'neutral' = isSkipped ? 'negative' : isPositive ? 'positive' : 'neutral';

  // Build a content-aware implied signal from the reel's actual data
  const keywords = extractKeywords(r.transcript_or_caption);
  const topKeywords = Array.from(keywords).slice(0, 5).join(', ');

  let implied: string;
  if (isSkipped) {
    implied = `Rejection of ${r.category} content — skipped at ${r.engagement.watch_percent}%, indicating format or topic mismatch`;
  } else if (isPositive) {
    implied = `Strong genuine interest in ${r.category} (${topKeywords}) — high engagement confirms deep resonance`;
  } else {
    implied = `Passive exposure to ${r.category} concepts (${topKeywords}) — moderate watch without strong commitment signals`;
  }

  // Build weight explanation from telemetry
  let weightText = `${r.engagement.watch_percent}% watch time`;
  if (r.engagement.rewatch_count > 0) weightText += ` + ${r.engagement.rewatch_count} rewatch`;
  if (r.engagement.liked) weightText += ` + Liked`;
  if (r.engagement.shared) weightText += ` + Shared`;
  if (isSkipped) weightText = `Skipped early (${r.engagement.watch_percent}%) — negative penalty`;

  return {
    reel_id: r.id,
    reel_title: r.title,
    surface_topic: r.category,
    implied_signal: implied,
    signal_strength: strength,
    weight_explanation: weightText,
  };
}

/**
 * Compute engagement weight for a single reel.
 * Positive engagement amplifies affinity, negative suppresses.
 */
function computeEngagementWeight(r: Reel): number {
  const isSkipped = r.engagement.skipped_early || r.engagement.watch_percent < 30;

  if (isSkipped) {
    return -2.5; // Strong negative — actively rejected
  }

  // Continuous score based on engagement depth
  const watchScore = (r.engagement.watch_percent / 100) * 1.5;  // 0.0 – 1.5
  const rewatchScore = r.engagement.rewatch_count * 1.2;         // 0 or 1.2+
  const likeScore = r.engagement.liked ? 0.8 : 0;
  const shareScore = r.engagement.shared ? 1.0 : 0;

  // Neutral floor: even without likes, moderate watch time contributes
  const neutralFloor = r.engagement.watch_percent >= 40 ? 0.3 : 0;

  return watchScore + rewatchScore + likeScore + shareScore + neutralFloor;
}


// ═══════════════════════════════════════════════════════════════════════
// ═══════════ MAIN DETERMINISTIC ANALYSIS ENGINE ══════════════════════
// ═══════════════════════════════════════════════════════════════════════

export function generateDeterministicAnalysis(
  reels: Reel[],
  catalog: CatalogReel[] = CATALOG
): AnalysisResult {
  if (!reels || reels.length === 0) {
    const defaultItem = catalog.find((c) => c.id === 'cat_01') || catalog[0];
    return {
      interest_detected: 'Exploratory Lifestyle & Casual Computing',
      underlying_cluster_summary: 'No active watch sessions selected.',
      why: 'No engagement data provided.',
      surface_vs_underlying: 'No signal present to differentiate.',
      reel_signals: [],
      candidate_evaluations: [
        { catalog_id: defaultItem.id, title: defaultItem.title, evaluated_status: 'selected', rationale: 'Baseline recommendation.' },
      ],
      recommended_reel_id: defaultItem.id,
      recommended_tech_reel: defaultItem.title,
      category: defaultItem.category,
      why_this_recommendation: defaultItem.description,
      difficulty: defaultItem.difficulty,
      confidence: 'Low',
      confidence_reasoning: 'Empty watch session.',
    };
  }

  // ── 1. Extract Signals ──────────────────────────────────────────────
  const reelSignals = reels.map(extractReelSignal);

  // ── 2. Initialize Catalog Scores ────────────────────────────────────
  const scores: Record<string, number> = {};
  catalog.forEach((c) => { scores[c.id] = 0; });

  // Pre-compute catalog keyword sets for transcript matching
  const catalogKeywordSets: Record<string, Set<string>> = {};
  catalog.forEach((c) => {
    const combined = `${c.title} ${c.description} ${c.tags.join(' ')}`;
    catalogKeywordSets[c.id] = extractKeywords(combined);
  });

  // ── 3. FACTOR 1: Category Affinity (weight: 3.0) ───────────────────
  //    Map each reel's category to catalog items via semantic mapping
  reels.forEach((r) => {
    const engWeight = computeEngagementWeight(r);
    const category = r.category;

    const affinities = CATEGORY_CATALOG_AFFINITY[category];
    if (affinities) {
      for (const { id, weight } of affinities) {
        if (scores[id] !== undefined) {
          scores[id] += engWeight * weight * 0.75; // Factor 1 global scale
        }
      }
    }
  });

  // ── 4. FACTOR 2: Hashtag → Catalog Tag Overlap (weight: 2.5) ───────
  //    Compare reel hashtags against catalog item tags
  reels.forEach((r) => {
    const engWeight = computeEngagementWeight(r);
    const reelHashtags = new Set(r.hashtags.map((h) => h.toLowerCase()));

    catalog.forEach((c) => {
      // Normalize catalog tags for comparison
      const catalogTags = new Set(
        c.tags.map((t) => t.toLowerCase().replace(/\s+/g, ''))
      );
      // Also create individual word tokens from multi-word tags
      const catalogTagWords = new Set<string>();
      c.tags.forEach((t) => {
        t.toLowerCase().split(/\s+/).forEach((word) => {
          if (word.length >= 3) catalogTagWords.add(word);
        });
      });

      // Check direct overlap: hashtag matches a joined tag
      let overlapScore = 0;
      for (const hashtag of reelHashtags) {
        if (catalogTags.has(hashtag)) {
          overlapScore += 2.0; // Direct match is very strong
        } else if (catalogTagWords.has(hashtag)) {
          overlapScore += 1.2; // Partial word match
        } else {
          // Check if hashtag is a substring of any tag or vice versa
          for (const tag of catalogTags) {
            if (tag.includes(hashtag) || hashtag.includes(tag)) {
              overlapScore += 0.6;
              break;
            }
          }
        }
      }

      if (overlapScore > 0) {
        // Normalize by hashtag count to avoid bias toward reels with many tags
        const normalized = overlapScore / Math.max(reelHashtags.size, 1);
        scores[c.id] += engWeight * normalized * 2.5; // Factor 2 scale
      }
    });
  });

  // ── 5. FACTOR 3: Transcript Keyword → Catalog Description (weight: 2.0)
  //    Content-aware: extract keywords from transcript and match catalog descriptions
  reels.forEach((r) => {
    const engWeight = computeEngagementWeight(r);
    const reelKeywords = extractKeywords(r.transcript_or_caption);

    // Also include title keywords
    const titleKeywords = extractKeywords(r.title);
    titleKeywords.forEach((k) => reelKeywords.add(k));

    catalog.forEach((c) => {
      const catKeywords = catalogKeywordSets[c.id];
      const overlap = keywordOverlap(reelKeywords, catKeywords);

      if (overlap > 0) {
        scores[c.id] += engWeight * overlap * 6.0; // Factor 3 scale (strong influence)
      }
    });
  });

  // ── 6. FACTOR 4: Format-Based Intent Signals (weight: 1.0) ─────────
  //    Tutorial/explainer viewers → boost intermediate/advanced items
  //    Meme/skit viewers → boost beginner-friendly items
  reels.forEach((r) => {
    const engWeight = computeEngagementWeight(r);
    if (engWeight <= 0) return; // Skip negative-engagement reels

    const formatInfo = FORMAT_INTENT[r.format] || { difficultyBias: 'Beginner', intentWeight: 0.8 };

    catalog.forEach((c) => {
      if (c.is_hype_distractor) return;

      // Boost catalog items whose difficulty matches the format's implied depth
      let formatBoost = 0;
      if (c.difficulty === formatInfo.difficultyBias) {
        formatBoost = 0.5 * formatInfo.intentWeight;
      } else if (
        (formatInfo.difficultyBias === 'Intermediate' && c.difficulty === 'Advanced') ||
        (formatInfo.difficultyBias === 'Advanced' && c.difficulty === 'Intermediate')
      ) {
        formatBoost = 0.3 * formatInfo.intentWeight; // Adjacent difficulty
      }

      if (formatBoost > 0) {
        scores[c.id] += engWeight * formatBoost; // Factor 4 scale
      }
    });
  });

  // ── 7. FACTOR 5: Cross-Reel Cluster Detection (weight: 1.5) ────────
  //    If multiple reels share the same category, amplify that category's catalog items
  const categoryCounts: Record<string, { count: number; totalEngagement: number }> = {};
  reels.forEach((r) => {
    const engWeight = computeEngagementWeight(r);
    if (!categoryCounts[r.category]) {
      categoryCounts[r.category] = { count: 0, totalEngagement: 0 };
    }
    categoryCounts[r.category].count++;
    categoryCounts[r.category].totalEngagement += engWeight;
  });

  for (const [category, { count, totalEngagement }] of Object.entries(categoryCounts)) {
    if (count >= 2 && totalEngagement > 0) {
      // Cluster bonus: 2 reels = 1.5x, 3 reels = 2.0x, 4+ reels = 2.5x
      const clusterMultiplier = Math.min(1.0 + (count - 1) * 0.5, 2.5);

      const affinities = CATEGORY_CATALOG_AFFINITY[category];
      if (affinities) {
        for (const { id, weight } of affinities) {
          if (scores[id] !== undefined) {
            scores[id] += totalEngagement * weight * clusterMultiplier * 0.4; // Cluster bonus scale
          }
        }
      }
    }
  }

  // ── 8. Anti-Hype Penalty ────────────────────────────────────────────
  //    Ensure hype distractors never win even if they somehow scored
  catalog.forEach((c) => {
    if (c.is_hype_distractor) {
      scores[c.id] = -Infinity;
    }
  });

  // ── 9. Select Winner ───────────────────────────────────────────────
  const ranked = catalog
    .filter((c) => !c.is_hype_distractor)
    .map((c) => ({ ...c, score: scores[c.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  const winner = ranked[0];
  const runnerUp = ranked[1];
  const hypeItem = catalog.find((c) => c.is_hype_distractor) || catalog[15];

  // ── 10. Build Candidate Audit Log ───────────────────────────────────
  // Show top 5 candidates for transparency
  const evaluations: { catalog_id: string; title: string; evaluated_status: 'selected' | 'rejected_hype' | 'rejected_redundant' | 'rejected_mismatch'; rationale: string }[] = [
    {
      catalog_id: winner.id,
      title: winner.title,
      evaluated_status: 'selected' as const,
      rationale: `Top convergence match (score ${winner.score.toFixed(1)}): strongest multi-factor alignment with the student's active engagement signals across category affinity, content keywords, and hashtag overlap.`,
    },
    {
      catalog_id: runnerUp.id,
      title: runnerUp.title,
      evaluated_status: 'selected' as const,
      rationale: `Strong alternative (score ${runnerUp.score.toFixed(1)}): complementary technical depth from a different angle.`,
    },
    {
      catalog_id: hypeItem.id,
      title: hypeItem.title,
      evaluated_status: 'rejected_hype' as const,
      rationale: 'Rejected: Disqualified by anti-hype filter to preserve educational depth.',
    },
  ];

  // Add the 3rd-5th ranked items as rejected_mismatch for transparency
  for (let i = 2; i < Math.min(5, ranked.length); i++) {
    evaluations.push({
      catalog_id: ranked[i].id,
      title: ranked[i].title,
      evaluated_status: 'rejected_mismatch' as const,
      rationale: `Score ${ranked[i].score.toFixed(1)}: weaker multi-factor alignment compared to top candidates.`,
    });
  }

  // ── 11. Generate Dynamic Intent Summary ─────────────────────────────
  // Build intent summary from the actual content, not hardcoded templates
  const positiveReels = reels.filter((r) => {
    const engW = computeEngagementWeight(r);
    return engW > 0;
  });
  const negativeReels = reels.filter((r) => {
    return r.engagement.skipped_early || r.engagement.watch_percent < 30;
  });
  const positiveCount = reelSignals.filter((s) => s.signal_strength === 'positive').length;
  const negativeCount = reelSignals.filter((s) => s.signal_strength === 'negative').length;

  // Find the dominant category from positive reels
  const dominantCategory = Object.entries(categoryCounts)
    .filter(([_, v]) => v.totalEngagement > 0)
    .sort((a, b) => b[1].totalEngagement - a[1].totalEngagement)[0]?.[0] || 'General';

  // Count distinct positive categories for dispersion analysis
  const distinctPositiveCategories = new Set(
    positiveReels.map((r) => r.category)
  ).size;

  // Generate interest description based on winner and dominant signals
  const interestDetected = generateInterestLabel(winner, dominantCategory, distinctPositiveCategories);
  const clusterSummary = generateClusterSummary(positiveReels, negativeReels, winner, dominantCategory);
  const whyText = generateWhyText(positiveReels, negativeReels, winner);
  const trapText = generateTrapText(reels, winner, dominantCategory);

  // ── 12. Confidence Calibration ──────────────────────────────────────
  const confidence: 'High' | 'Medium' | 'Low' =
    winner.score <= 0
      ? 'Low'
      : positiveCount >= 3 && distinctPositiveCategories <= 2
        ? 'High'
        : positiveCount >= 2
          ? 'Medium'
          : 'Low';

  const confidenceReasoning =
    confidence === 'High'
      ? `Strong signal convergence: ${positiveCount} positive reels concentrated in ${distinctPositiveCategories} categor${distinctPositiveCategories === 1 ? 'y' : 'ies'}${negativeCount > 0 ? ` with ${negativeCount} active rejection filter${negativeCount > 1 ? 's' : ''}` : ''}. Winner score: ${winner.score.toFixed(1)}.`
      : confidence === 'Medium'
        ? `Moderate signal from ${positiveCount} positive reel${positiveCount !== 1 ? 's' : ''} across ${distinctPositiveCategories} categories. Score gap: ${(winner.score - runnerUp.score).toFixed(1)}. Additional watch data would strengthen inference.`
        : `Sparse or scattered signals across ${distinctPositiveCategories} disparate categories without a concentrated technical anchor. Calibrated Low confidence to avoid false precision.`;

  return {
    interest_detected: interestDetected,
    underlying_cluster_summary: clusterSummary,
    why: whyText,
    surface_vs_underlying: trapText,
    reel_signals: reelSignals,
    candidate_evaluations: evaluations,
    recommended_reel_id: winner.id,
    recommended_tech_reel: winner.title,
    category: winner.category,
    why_this_recommendation: generateWhyThisRecommendation(positiveReels, negativeReels, winner, dominantCategory),
    difficulty: winner.difficulty,
    confidence,
    confidence_reasoning: confidenceReasoning,
    alternative_recommendation: {
      catalog_id: runnerUp.id,
      title: runnerUp.title,
      category: runnerUp.category,
      reason: `Complementary depth from a different angle: ${runnerUp.description}`,
    },
  };
}


// ═══════════════════════════════════════════════════════════════════════
// ═══════════ DYNAMIC INTENT NARRATIVE GENERATORS ═════════════════════
// ═══════════════════════════════════════════════════════════════════════

function generateInterestLabel(
  winner: CatalogReel & { score: number },
  dominantCategory: string,
  distinctCategories: number
): string {
  // Only show "Exploratory" when there's genuinely no strong signal
  // (many categories AND weak winner score). If the winner scored strongly,
  // the engine found a clear convergence despite diverse input.
  if (distinctCategories >= 4 && winner.score < 5.0) {
    return 'Exploratory Multi-Topic Browsing & Discovery';
  }

  const categoryLabels: Record<string, string[]> = {
    'Career': ['Software Engineering Career & Professional Growth', 'FAANG Interview Mastery & Tech Career Velocity'],
    'Java': ['Java & JVM Systems Engineering Mastery', 'Spring Boot Enterprise Architecture & Backend Depth'],
    'AI': ['Deep Learning & Neural Architecture Foundations', 'Hands-On ML Implementation & Mathematical Rigor'],
    'Hardware': ['Computer Systems Architecture & Low-Level Engineering', 'GPU/CPU Architecture & Memory Hierarchy Physics'],
    'HLD': ['System Design & Internet Infrastructure Foundations', 'Distributed Systems Architecture & API Design'],
    'DSA': ['Algorithmic Problem Solving & Interview Preparation', 'Data Structures & Computational Complexity'],
    'Cloud': ['Cloud Infrastructure & Container Orchestration', 'Serverless Architecture & DevOps Engineering'],
    'Cybersecurity': ['Application Security & Vulnerability Analysis', 'Web Security Engineering & OWASP Fundamentals'],
    'Web': ['Web Engineering & API Architecture', 'Frontend/Backend Integration Patterns'],
  };

  const labels = categoryLabels[winner.category] || categoryLabels[dominantCategory] || ['Technical Interest & Learning'];
  // Use winner.id to deterministically pick between variants
  const idx = parseInt(winner.id.replace('cat_', ''), 10) % labels.length;
  return labels[idx];
}

function generateClusterSummary(
  positiveReels: Reel[],
  negativeReels: Reel[],
  winner: CatalogReel & { score: number },
  dominantCategory: string
): string {
  if (positiveReels.length === 0) {
    return 'No clear positive engagement signals detected. Watch history is either skipped or passively consumed without commitment indicators.';
  }

  const posCategories = [...new Set(positiveReels.map((r) => r.category))];
  const negCategories = [...new Set(negativeReels.map((r) => r.category))];

  let summary = `The active watch selection demonstrates ${posCategories.length <= 2 ? 'focused' : 'broad'} engagement across ${posCategories.join(', ')}`;

  if (negativeReels.length > 0) {
    summary += `, while actively rejecting ${negCategories.join(', ')} content`;
  }

  summary += `. The convergence pattern points toward ${winner.title} as the strongest next learning frontier.`;

  return summary;
}

function generateWhyText(
  positiveReels: Reel[],
  negativeReels: Reel[],
  winner: CatalogReel & { score: number }
): string {
  const parts: string[] = [];

  if (positiveReels.length > 0) {
    const highEngagement = positiveReels.filter(
      (r) => r.engagement.watch_percent >= 85 || r.engagement.rewatch_count > 0
    );
    if (highEngagement.length > 0) {
      parts.push(
        `${highEngagement.length} reel${highEngagement.length > 1 ? 's' : ''} received deep engagement (85%+ watch time or rewatches): "${highEngagement.map((r) => r.title).join('", "')}"`
      );
    }

    const likedReels = positiveReels.filter((r) => r.engagement.liked);
    if (likedReels.length > 0) {
      parts.push(
        `${likedReels.length} reel${likedReels.length > 1 ? 's were' : ' was'} explicitly liked, confirming deliberate interest`
      );
    }
  }

  if (negativeReels.length > 0) {
    parts.push(
      `${negativeReels.length} reel${negativeReels.length > 1 ? 's were' : ' was'} skipped early (<30% watch), acting as negative filters against superficial or mismatched content`
    );
  }

  return parts.length > 0
    ? parts.join('. ') + '.'
    : `Watch patterns suggest ${winner.category} interest based on content alignment with "${winner.title}".`;
}

function generateTrapText(
  reels: Reel[],
  winner: CatalogReel & { score: number },
  dominantCategory: string
): string {
  const allCategories = [...new Set(reels.map((r) => r.category))];
  const naiveKeywords = allCategories.join(', ');

  return `A naive keyword matcher sees surface categories: [${naiveKeywords}] and would likely match the most frequent keyword. The content-aware engine instead analyzes transcript semantics, engagement depth, hashtag-to-catalog tag overlap, and cross-reel clustering to identify that the true underlying intent converges on "${winner.title}" (${winner.category}).`;
}

function generateWhyThisRecommendation(
  positiveReels: Reel[],
  negativeReels: Reel[],
  winner: CatalogReel & { score: number },
  dominantCategory: string
): string {
  const topTopics = [...new Set(positiveReels.map((r) => r.category))].slice(0, 3).join(', ');
  const likedCount = positiveReels.filter((r) => r.engagement.liked).length;
  const rewatchedCount = positiveReels.filter((r) => r.engagement.rewatch_count > 0).length;

  let connection = `Based on deep engagement with ${topTopics || dominantCategory} content`;
  if (likedCount > 0 || rewatchedCount > 0) {
    connection += ` (${likedCount > 0 ? `${likedCount} liked` : ''}${likedCount > 0 && rewatchedCount > 0 ? ', ' : ''}${rewatchedCount > 0 ? `${rewatchedCount} rewatched` : ''})`;
  }
  connection += `, "${winner.title}" provides the highest-impact conceptual bridge: ${winner.description}`;

  return connection;
}
