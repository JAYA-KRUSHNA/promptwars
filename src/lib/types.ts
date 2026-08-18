/**
 * @file types.ts
 * @description Core TypeScript type definitions for the Reels Recommendation & Latent Interest Inference System.
 * Adheres strictly to the Problem Statement schema and evaluation criteria.
 */

/**
 * Valid formats for short-form video reels in watch telemetry.
 */
export type ReelFormat =
  | 'meme'
  | 'vlog'
  | 'skit'
  | 'comparison'
  | 'news'
  | 'tutorial'
  | 'podcast'
  | 'explainer';

/**
 * Allowed categories for tech reel recommendation catalog items.
 */
export type AllowedCategory =
  | 'HLD'
  | 'DSA'
  | 'AI'
  | 'Java'
  | 'Cloud'
  | 'Hardware'
  | 'Career'
  | 'Cybersecurity'
  | 'Other';

/**
 * Educational difficulty levels.
 */
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/**
 * Confidence calibration levels for agent inference.
 */
export type Confidence = 'High' | 'Medium' | 'Low';

/**
 * User interaction telemetry for a watched reel.
 */
export interface Engagement {
  /** Percentage of video duration watched (0 to 100). */
  watch_percent: number;
  /** Number of times the video was rewatched. */
  rewatch_count: number;
  /** Whether the user clicked like. */
  liked: boolean;
  /** Whether the user shared the reel. */
  shared: boolean;
  /** Whether the user skipped the reel early (<30% watch time). */
  skipped_early: boolean;
}

/**
 * Fictional/anonymized student watched reel entity.
 */
export interface Reel {
  /** Unique identifier for the reel (e.g. 'reel_101'). */
  id: string;
  /** Title or hook of the reel. */
  title: string;
  /** Surface category assigned by platform metadata. */
  category: string;
  /** Spoken transcript or caption snippet. */
  transcript_or_caption: string;
  /** Content format type. */
  format: ReelFormat;
  /** Associated hashtags. */
  hashtags: string[];
  /** Detailed telemetry metrics. */
  engagement: Engagement;
  /** Visual emoji icon. */
  emoji?: string;
}

/**
 * A curated benchmark watch session for evaluation.
 */
export interface Session {
  /** Unique session identifier (e.g. 'session_1'). */
  id: string;
  /** Human-readable session title. */
  name: string;
  /** Brief summary tagline. */
  tagline: string;
  /** Detailed psychological description of the student's behavior. */
  description: string;
  /** Ground truth or expected latent inference. */
  expected_inference: string;
  /** Trap warning explaining why keyword matchers fail on this session. */
  trap_warning?: string;
  /** Array of reels watched in sequence (6–8 reels). */
  reels: Reel[];
}

/**
 * A curated educational tech reel candidate in the recommendation catalog.
 */
export interface CatalogReel {
  /** Catalog identifier (e.g. 'cat_01'). */
  id: string;
  /** Recommended tech reel title. */
  title: string;
  /** Tech domain category. */
  category: AllowedCategory;
  /** Difficulty rating. */
  difficulty: Difficulty;
  /** Educational description and syllabus value. */
  description: string;
  /** True if this is an anti-hype test distractor meant to be disqualified. */
  is_hype_distractor: boolean;
  /** Semantic topic tags. */
  tags: string[];
  /** Visual emoji icon. */
  iconEmoji: string;
}

/**
 * Signal decomposition for an individual reel.
 */
export interface ReelSignalBreakdown {
  /** Reference reel identifier. */
  reel_id: string;
  /** Reference reel title. */
  reel_title: string;
  /** Superficial platform topic keyword. */
  surface_topic: string;
  /** Implied underlying cognitive signal. */
  implied_signal: string;
  /** Signal polarity based on watch telemetry. */
  signal_strength: 'positive' | 'negative' | 'neutral';
  /** Rationale for how telemetry weighted this signal. */
  weight_explanation: string;
}

/**
 * Candidate audit log entry demonstrating anti-hype filtering.
 */
export interface CandidateEvaluation {
  /** Catalog candidate identifier. */
  catalog_id: string;
  /** Catalog candidate title. */
  title: string;
  /** Evaluation result status. */
  evaluated_status: 'selected' | 'rejected_hype' | 'rejected_redundant' | 'rejected_mismatch';
  /** Rationale for selection or rejection. */
  rationale: string;
}

/**
 * Complete AI inference result adhering to the required Problem Statement schema.
 */
export interface AnalysisResult {
  /** INTEREST DETECTED: [topic / interest] */
  interest_detected: string;
  /** Cross-reel cluster synthesis. */
  underlying_cluster_summary: string;
  /** WHY: [evidence from content] */
  why: string;
  /** Contrast demonstrating why naive keyword matching fails. */
  surface_vs_underlying: string;
  /** Detailed per-reel signal breakdown. */
  reel_signals: ReelSignalBreakdown[];
  /** Anti-hype and catalog candidate evaluation audit trail. */
  candidate_evaluations: CandidateEvaluation[];
  /** Matched catalog candidate ID. */
  recommended_reel_id: string;
  /** RECOMMENDED TECH REEL: [topic/title] */
  recommended_tech_reel: string;
  /** CATEGORY: [AI / DSA / Java / HLD / Cybersecurity / Cloud / Hardware / Career / Other] */
  category: AllowedCategory;
  /** WHY THIS RECOMMENDATION: [connection to interest] */
  why_this_recommendation: string;
  /** DIFFICULTY: [Beginner / Intermediate / Advanced] */
  difficulty: Difficulty;
  /** CONFIDENCE: [High / Medium / Low] */
  confidence: Confidence;
  /** Confidence calibration explanation. */
  confidence_reasoning: string;
  /** Optional alternative next-step tech reel recommendation. */
  alternative_recommendation?: {
    catalog_id: string;
    title: string;
    category: AllowedCategory;
    reason: string;
  };
}

/**
 * Execution source indicating whether result was produced by Gemini or deterministic engine.
 */
export type AnalysisSource = 'gemini' | 'fallback';

/**
 * Top-level response wrapping the analysis with telemetry metadata.
 */
export interface AnalysisResponse {
  analysis: AnalysisResult;
  source: AnalysisSource;
  latencyMs: number;
}
