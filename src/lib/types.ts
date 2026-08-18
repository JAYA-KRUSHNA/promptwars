export type ReelFormat =
  | 'meme'
  | 'vlog'
  | 'skit'
  | 'comparison'
  | 'news'
  | 'tutorial'
  | 'podcast'
  | 'explainer';

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

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Confidence = 'High' | 'Medium' | 'Low';

export interface Engagement {
  watch_percent: number;
  rewatch_count: number;
  liked: boolean;
  shared: boolean;
  skipped_early: boolean;
}

export interface Reel {
  id: string;
  title: string;
  category: string;
  transcript_or_caption: string;
  format: ReelFormat;
  hashtags: string[];
  engagement: Engagement;
  emoji?: string;
}

export interface Session {
  id: string;
  name: string;
  tagline: string;
  description: string;
  expected_inference: string;
  trap_warning?: string;
  reels: Reel[];
}

export interface CatalogReel {
  id: string;
  title: string;
  category: AllowedCategory;
  difficulty: Difficulty;
  description: string;
  is_hype_distractor: boolean;
  tags: string[];
  iconEmoji: string;
}

export interface ReelSignalBreakdown {
  reel_id: string;
  reel_title: string;
  surface_topic: string;
  implied_signal: string;
  signal_strength: 'positive' | 'negative' | 'neutral';
  weight_explanation: string;
}

export interface CandidateEvaluation {
  catalog_id: string;
  title: string;
  evaluated_status: 'selected' | 'rejected_hype' | 'rejected_redundant' | 'rejected_mismatch';
  rationale: string;
}

export interface AnalysisResult {
  interest_detected: string;
  underlying_cluster_summary: string;
  why: string;
  surface_vs_underlying: string;
  reel_signals: ReelSignalBreakdown[];
  candidate_evaluations: CandidateEvaluation[];
  recommended_reel_id: string;
  recommended_tech_reel: string;
  category: AllowedCategory;
  why_this_recommendation: string;
  difficulty: Difficulty;
  confidence: Confidence;
  confidence_reasoning: string;
  alternative_recommendation?: {
    catalog_id: string;
    title: string;
    category: AllowedCategory;
    reason: string;
  };
}

export type AnalysisSource = 'gemini' | 'fallback';

export interface AnalysisResponse {
  analysis: AnalysisResult;
  source: AnalysisSource;
  latencyMs: number;
}
