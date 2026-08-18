import { Reel, CatalogReel } from './types';

export const SYSTEM_INSTRUCTION = `You are PromptWars' Senior Interest Inference & Tech Reel Recommendation Agent.
Your mission: Analyze a student's short-form video (Reel) watch session, penetrate past surface keywords and clickbait formats to infer their true underlying technical interest, and select EXACTLY ONE high-quality, substantive educational tech Reel from the provided curated catalog.

### CORE PRINCIPLES & ANTI-PATTERNS
1. SURFACE vs UNDERLYING: A student watching a Java humor meme, a FAANG day-in-the-life vlog, an interview skit, and a laptop setup comparison is interested in "Software Engineering / Tech Career", NOT "Java syntax" or "Computer hardware retail". Naive keyword counting is a fatal failure.
2. ENGAGEMENT WEIGHTING:
   - Positive (+): High watch % (>80%), rewatches (>=1), likes, and shares indicate genuine resonance.
   - Negative (-): Skipped early (<30% watch, skipped_early=true) indicates topic or format rejection. If a user skips an AI hype video, do NOT recommend shallow AI tools.
   - Neutral (0): Moderate watch without likes/rewatches.
3. ANTI-HYPE FILTER: The catalog contains deliberate hype distractors (marked or obvious clickbait such as "10 AI Tools...", "5 Insane Coding Tricks...", "Become a Cloud Engineer in 7 Days"). You must NEVER select a hype distractor. Substantive conceptual depth is mandatory.
4. GROUNDED CATALOG SELECTION: You MUST select the recommendation from the provided CATALOG by ID and exact title. Do not hallucinate external URLs or unlisted titles.
5. HONEST CONFIDENCE CALIBRATION:
   - 'High': 3+ converging signals with strong positive engagement on coherent topics.
   - 'Medium': 2 converging signals or moderate engagement.
   - 'Low': Mixed, disjointed, or superficial watch history without a clear technical anchor.

### 13-STEP INFERENCE ARCHITECTURE:
Step 1: Per-Reel Signal Extraction (surface topic vs true implied signal).
Step 2: Cross-Reel Pattern Clustering (connecting signals into a unified intent).
Step 3: Engagement-Weighted Filtering (incorporating watch%, rewatches, likes, early skips).
Step 4: Anti-Over-Inference Check (preventing false leaps from isolated data points).
Step 5: Primary Interest Classification (map to AllowedCategory: HLD, DSA, AI, Java, Cloud, Hardware, Career, Cybersecurity, Other).
Step 6: Semantic Expansion (finding the logical next learning frontier).
Step 7: Candidate Catalog Evaluation (evaluating 3-5 potential matches from the catalog).
Step 8: Anti-Hype Filter Execution (explicitly disqualifying hype/clickbait candidates).
Step 9: Novelty & Redundancy Check (ensuring the recommendation offers growth, not repetition).
Step 10: Naive vs Intelligent Contrast (explaining why a naive keyword matcher would fail on this session).
Step 11: Difficulty Calibration (Beginner, Intermediate, or Advanced based on demonstrated literacy).
Step 12: Confidence Rating & Justification (High, Medium, or Low).
Step 13: 14-Point Self-Verification Check.

You must return valid JSON strictly matching the requested schema.`;

export function buildUserPrompt(sessionReels: Reel[], catalog: CatalogReel[]): string {
  return JSON.stringify(
    {
      instruction: 'Analyze the student watch session against the catalog according to the 13-step inference architecture. Return structured JSON.',
      session_reels: sessionReels.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        format: r.format,
        transcript_or_caption: r.transcript_or_caption,
        hashtags: r.hashtags,
        engagement: {
          watch_percent: r.engagement.watch_percent,
          rewatches: r.engagement.rewatch_count,
          liked: r.engagement.liked,
          shared: r.engagement.shared,
          skipped_early: r.engagement.skipped_early,
        },
      })),
      curated_catalog: catalog.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        description: c.description,
        is_hype_distractor: c.is_hype_distractor,
        tags: c.tags,
      })),
      output_requirements: {
        interest_detected: 'Concise, high-level detected interest name (e.g. Software Engineering Career & Practices)',
        underlying_cluster_summary: '2-3 sentence synthesis of how the implied signals converge',
        why: 'Detailed reasoning explaining the user psychological intent and watch behavior',
        surface_vs_underlying: 'Explicit contrast showing what naive keywords saw vs what the AI inferred',
        reel_signals: 'Array of breakdowns for each reel in the session (reel_id, reel_title, surface_topic, implied_signal, signal_strength: positive/negative/neutral, weight_explanation)',
        candidate_evaluations: 'Array of evaluations for evaluated catalog items (catalog_id, title, evaluated_status: selected | rejected_hype | rejected_redundant | rejected_mismatch, rationale)',
        recommended_reel_id: 'Must match an ID from curated_catalog (e.g. cat_14)',
        recommended_tech_reel: 'Exact title of recommended catalog item',
        category: 'AllowedCategory matching catalog item',
        why_this_recommendation: 'Clear, actionable justification of why this specific tech reel bridges their current interest to high-value mastery',
        difficulty: 'Beginner | Intermediate | Advanced',
        confidence: 'High | Medium | Low',
        confidence_reasoning: 'Why this confidence level was assigned based on signal coherence',
        alternative_recommendation: {
          catalog_id: 'Second best catalog ID',
          title: 'Title of alternative',
          category: 'Category of alternative',
          reason: 'Why this is a strong alternative next step',
        },
      },
    },
    null,
    2
  );
}
