import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, AnalysisResponse, CatalogReel, Reel } from './types';
import { CATALOG } from '../data/catalog';
import { SYSTEM_INSTRUCTION, buildUserPrompt } from './recommendationPrompt';

// Shared Gemini client singleton
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key === 'your_api_key_here' || key.trim().length < 10) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Post-validates a Gemini response to ensure catalog grounding and anti-hype compliance.
 * If the recommended reel is a hype distractor or doesn't exist in the catalog,
 * attempts to auto-correct by selecting the best non-hype candidate from the evaluations.
 */
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

export async function analyzeSessionWithGemini(
  sessionReels: Reel[],
  catalog: CatalogReel[] = CATALOG
): Promise<AnalysisResponse> {
  const ai = getAiClient();
  const startTime = Date.now();

  if (ai) {
    try {
      const userPrompt = buildUserPrompt(sessionReels, catalog);
      const candidateModels = [
        process.env.GEMINI_MODEL || 'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.7-flash',
      ].filter((v, i, a) => a.indexOf(v) === i);

      let responseText: string | null = null;
      let usedModel = candidateModels[0];

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              abortSignal: AbortSignal.timeout(15000),
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
          console.warn(`[Gemini] ${modelName} call failed, trying next candidate model if available:`, modelErr instanceof Error ? modelErr.message : modelErr);
        }
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
        ? 'Gemini API call timed out after 20 seconds.'
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
  const reelSignals = reels.map((r) => {
    const isSkipped = r.engagement.skipped_early || r.engagement.watch_percent < 30;
    const isPositive = !isSkipped && (r.engagement.watch_percent >= 75 || r.engagement.liked || r.engagement.rewatch_count > 0);
    const strength: 'positive' | 'negative' | 'neutral' = isSkipped ? 'negative' : isPositive ? 'positive' : 'neutral';

    const signalMap: Record<string, { surface: string; implied: string }> = {
      reel_01:  { surface: 'Java Syntax / Compile Error', implied: 'Relatable programmer identity & collegiate developer humor' },
      reel_02:  { surface: 'Google Microkitchen & Lifestyle', implied: 'Professional software engineering career aspiration' },
      reel_03:  { surface: 'Job Interview Skit', implied: 'Active preparation for technical & behavioral hiring pipelines' },
      reel_04:  { surface: 'Laptop Buying Guide', implied: 'Developer tooling ergonomics and Docker container environments' },
      reel_05:  { surface: 'AI Productivity Extensions', implied: 'Strong rejection of low-substance clickbait' },
      reel_06:  { surface: 'Git CLI Command Syntax', implied: 'Team collaboration hygiene and version control standards' },
      reel_201: { surface: 'Java Eden Memory', implied: 'Low-level JVM heap layout and minor GC promotion thresholds' },
      reel_202: { surface: 'Synchronized vs Locks', implied: 'Concurrency mechanics and AbstractQueuedSynchronizer' },
      reel_203: { surface: 'Spring @Autowired', implied: 'Enterprise IoC container reflection and microservices architecture' },
      reel_204: { surface: 'Java Generics Erasure', implied: 'Bytecode type erasure and synthetic bridge methods' },
      reel_301: { surface: '3D Backprop Animation', implied: 'Mathematical multivariate calculus for neural training' },
      reel_302: { surface: 'Attention Softmax Formula', implied: 'Theoretical self-attention matrix math and temperature scaling' },
      reel_303: { surface: 'AI Will Replace Coders Skit', implied: 'Rejection of apocalyptic clickbait fearmongering' },
      reel_304: { surface: 'Python For-Loop Benchmark', implied: 'SIMD vectorization and contiguous memory layout in NumPy' },
      reel_401: { surface: 'TSMC Lithography', implied: 'Physical semiconductor fabrication and EUV lithography' },
      reel_402: { surface: 'Cache vs RAM Speed', implied: 'Memory hierarchy latency physics and cache-aligned data layout' },
      reel_403: { surface: 'GPU Cores vs CPU Cores', implied: 'Throughput parallel SIMD vs low-latency out-of-order execution' },
    };

    const mapped = signalMap[r.id];
    const surface = mapped ? mapped.surface : r.category;
    const implied = mapped
      ? mapped.implied
      : isPositive
      ? `Genuine interest in ${r.category} concepts`
      : isSkipped
      ? `Rejection of superficial ${r.category} format`
      : `Casual peripheral ${r.category} browsing`;

    let weightText = `${r.engagement.watch_percent}% watch time`;
    if (r.engagement.rewatch_count > 0) weightText += ` + ${r.engagement.rewatch_count} rewatch`;
    if (r.engagement.liked) weightText += ` + Liked`;
    if (r.engagement.shared) weightText += ` + Shared`;
    if (isSkipped) weightText = `Skipped early (${r.engagement.watch_percent}%) — negative penalty`;

    return { reel_id: r.id, reel_title: r.title, surface_topic: surface, implied_signal: implied, signal_strength: strength, weight_explanation: weightText };
  });

  // ── 2. Compute Affinity Scores ──────────────────────────────────────
  const scores: Record<string, number> = {};
  catalog.forEach((c) => { scores[c.id] = 0; });

  // Mapping: each catalog item → what reel IDs / hashtags boost it, and by how much
  const affinityRules: { match: (r: Reel) => boolean; boosts: Record<string, number> }[] = [
    // Interview skit / prep → FAANG Interview (strong) + Senior Engineers (moderate)
    { match: (r) => r.id === 'reel_03' || r.hashtags.some(t => ['techinterview', 'faangprep', 'behavioralprep'].includes(t)),
      boosts: { cat_13: 4.0, cat_14: 1.5 } },
    // Google vlog / engineering culture → Senior Engineers (strong) + FAANG Interview (moderate) + REST/GraphQL (light)
    { match: (r) => r.id === 'reel_02' || r.hashtags.some(t => ['swe', 'google', 'techcareer'].includes(t)),
      boosts: { cat_14: 3.5, cat_13: 1.8, cat_03: 1.5 } },
    // Git rebase / team workflow → Senior Engineers + REST/GraphQL
    { match: (r) => r.id === 'reel_06' || r.hashtags.some(t => ['git', 'engineeringbestpractices', 'versioncontrol'].includes(t)),
      boosts: { cat_14: 3.0, cat_03: 2.0, cat_04: 1.0 } },
    // Java meme → light developer culture, very low Java GC weight
    { match: (r) => r.id === 'reel_01' || r.hashtags.some(t => ['javameme', 'codinghumor'].includes(t)),
      boosts: { cat_14: 1.0, cat_07: 0.2 } },
    // Hardware setup / ergonomics → light cache + career
    { match: (r) => r.id === 'reel_04' || r.hashtags.some(t => ['developergear', 'macbook', 'setuptour'].includes(t)),
      boosts: { cat_14: 0.8, cat_12: 0.6 } },
    // JVM Internals (Eden/Locks/Generics)
    { match: (r) => ['reel_201', 'reel_202', 'reel_204'].includes(r.id) || r.hashtags.some(t => ['jvm', 'locks', 'memoryallocation', 'generics'].includes(t)),
      boosts: { cat_07: 4.0, cat_08: 2.0 } },
    // Spring Boot
    { match: (r) => r.id === 'reel_203' || r.hashtags.some(t => ['springboot', 'javaframework'].includes(t)),
      boosts: { cat_08: 4.5, cat_07: 2.0 } },
    // Backprop / Attention math → Transformers (strong) + Neural Net coding (moderate)
    { match: (r) => ['reel_301', 'reel_302'].includes(r.id) || r.hashtags.some(t => ['backprop', 'attentionmechanism', 'transformers', 'deeplearningmath'].includes(t)),
      boosts: { cat_05: 4.0, cat_06: 2.5 } },
    // NumPy / Python ML → Neural Net coding (strong) + Transformers (moderate)
    { match: (r) => r.id === 'reel_304' || r.hashtags.some(t => ['numpy', 'pythonperformance'].includes(t)),
      boosts: { cat_06: 4.0, cat_05: 2.0 } },
    // GPU / SIMD → GPU tensor (strong) + CPU cache (moderate)
    { match: (r) => r.id === 'reel_403' || r.hashtags.some(t => ['gpu', 'simd'].includes(t)),
      boosts: { cat_11: 4.5, cat_12: 2.5 } },
    // TSMC / CPU cache latency → CPU cache (strong) + GPU tensor (moderate)
    { match: (r) => ['reel_401', 'reel_402'].includes(r.id) || r.hashtags.some(t => ['cpu', 'semiconductors', 'memorylatency', 'chipdesign'].includes(t)),
      boosts: { cat_12: 4.0, cat_11: 2.0 } },
    // Lifestyle / web / entertainment → DNS (light) + Binary Search (light)
    { match: (r) => r.hashtags.some(t => ['cooking', 'pets', 'css', 'webdesign', 'keyboards'].includes(t)),
      boosts: { cat_01: 1.5, cat_02: 1.0 } },
  ];

  reels.forEach((r) => {
    const isSkipped = r.engagement.skipped_early || r.engagement.watch_percent < 30;
    const engagementWeight = isSkipped
      ? -2.0
      : (r.engagement.watch_percent / 100) * 1.5
        + r.engagement.rewatch_count * 1.0
        + (r.engagement.liked ? 0.8 : 0)
        + (r.engagement.shared ? 1.0 : 0);

    for (const rule of affinityRules) {
      if (rule.match(r)) {
        for (const [catId, multiplier] of Object.entries(rule.boosts)) {
          scores[catId] = (scores[catId] || 0) + engagementWeight * multiplier;
        }
      }
    }
  });

  // ── 3. Select Winner (excluding hype distractors) ───────────────────
  const ranked = catalog
    .filter((c) => !c.is_hype_distractor)
    .map((c) => ({ ...c, score: scores[c.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  const winner = ranked[0];
  const runnerUp = ranked[1];
  const hypeItem = catalog.find((c) => c.is_hype_distractor) || catalog[15];

  // ── 4. Build Candidate Audit Log ────────────────────────────────────
  const evaluations = [
    { catalog_id: winner.id, title: winner.title, evaluated_status: 'selected' as const,
      rationale: `Top convergence match (score ${winner.score.toFixed(1)}): directly satisfies the student's strongest engagement signals.` },
    { catalog_id: runnerUp.id, title: runnerUp.title, evaluated_status: 'selected' as const,
      rationale: `Strong alternative (score ${runnerUp.score.toFixed(1)}): technical bridge for continuous progression.` },
    { catalog_id: hypeItem.id, title: hypeItem.title, evaluated_status: 'rejected_hype' as const,
      rationale: 'Rejected: Disqualified by anti-hype filter to preserve educational depth.' },
  ];

  // ── 5. Generate Dynamic Intent Summary ──────────────────────────────
  const categoryDescriptions: Record<string, { interestTemplate: string; summary: string; why: string; trap: string }> = {
    Career: {
      interestTemplate: winner.id === 'cat_13' ? 'FAANG Technical & Behavioral Interview Mastery' : 'Software Engineering Career Velocity & Senior Architecture',
      summary: 'The active watch selection demonstrates a focused transition into professional Big Tech engineering culture, behavioral hiring pipelines, and production team standards.',
      why: 'The student prioritized engineering vlogs, interview preparation, and collaboration tooling while rejecting hype content.',
      trap: 'A naive keyword matcher flags "Java" or "Hardware". The agent infers the true latent ambition: mastering engineering career velocity.',
    },
    Java: {
      interestTemplate: winner.id === 'cat_08' ? 'Spring Boot Enterprise Microservices Architecture' : 'Java & JVM Low-Level Systems Engineering',
      summary: 'Consistently deep engagement with JVM memory layouts, multithreading locks, and enterprise Spring framework.',
      why: 'The watched reels exhibit technical depth on memory allocation and thread synchronization with high completion rates.',
      trap: 'Unlike casual Java meme watchers, deep technical watch completion confirms genuine JVM backend systems engineering.',
    },
    AI: {
      interestTemplate: winner.id === 'cat_06' ? 'Hands-On Neural Network Implementation & NumPy Optimization' : 'Deep Learning & Transformer Attention Mathematics',
      summary: 'Analytical focus on foundational matrix calculus, temperature scaling, and vectorized dot products for machine learning.',
      why: 'High completion on mathematical backpropagation and attention mechanisms combined with rejection of AI clickbait.',
      trap: 'A naive matcher recommends AI tool listicles; the agent detects mathematical ML dedication and recommends theory.',
    },
    Hardware: {
      interestTemplate: winner.id === 'cat_11' ? 'GPU Massively Parallel Architecture & Tensor Acceleration' : 'Computer Systems Architecture & Memory Hierarchy Physics',
      summary: 'High curiosity regarding semiconductor lithography, memory latency hierarchies, and SIMD parallel processor designs.',
      why: 'Sustained high watch times on physical semiconductor mechanics and processor architecture tradeoffs.',
      trap: 'Surface hardware curiosity connects directly to low-level cache-aligned performance software engineering.',
    },
    HLD: {
      interestTemplate: 'System Design & Internet Infrastructure Foundations',
      summary: 'Exploratory browsing across lifestyle and surface concepts without a concentrated technical specialization.',
      why: 'Dispersed watch history across varied topics without a strong recurring technical anchor.',
      trap: 'A naive model would overfit to isolated keywords; the agent honestly recognizes diffuse exploration.',
    },
    DSA: {
      interestTemplate: 'Algorithmic Problem Solving & Interview Preparation',
      summary: 'Interest in foundational computer science algorithms and data structure patterns.',
      why: 'Watch patterns suggest preparation for coding interviews or computer science coursework.',
      trap: 'Surface topic matching misses the underlying problem-solving focus.',
    },
  };

  const desc = categoryDescriptions[winner.category] || categoryDescriptions['HLD'];
  const positiveCount = reelSignals.filter((s) => s.signal_strength === 'positive').length;
  const negativeCount = reelSignals.filter((s) => s.signal_strength === 'negative').length;
  const confidence: 'High' | 'Medium' | 'Low' =
    winner.score <= 0 ? 'Low' : positiveCount >= 3 ? 'High' : positiveCount >= 1 ? 'Medium' : 'Low';
  const confidenceReasoning =
    confidence === 'High'
      ? `Strong signal convergence across ${positiveCount} positive reels${negativeCount > 0 ? ` with ${negativeCount} active negative filter` : ''}.`
      : confidence === 'Medium'
      ? `Moderate signal from ${positiveCount} reel${positiveCount !== 1 ? 's' : ''}. Additional watch data would strengthen inference.`
      : `Sparse or exploratory signals across disparate categories require calibrated Low confidence.`;

  return {
    interest_detected: desc.interestTemplate,
    underlying_cluster_summary: desc.summary,
    why: desc.why,
    surface_vs_underlying: desc.trap,
    reel_signals: reelSignals,
    candidate_evaluations: evaluations,
    recommended_reel_id: winner.id,
    recommended_tech_reel: winner.title,
    category: winner.category,
    why_this_recommendation: `This recommendation matches the inflection point in the student's active selection: ${winner.description}`,
    difficulty: winner.difficulty,
    confidence,
    confidence_reasoning: confidenceReasoning,
    alternative_recommendation: {
      catalog_id: runnerUp.id,
      title: runnerUp.title,
      category: runnerUp.category,
      reason: `Expands on the active watch signals from a complementary angle: ${runnerUp.description}`,
    },
  };
}

