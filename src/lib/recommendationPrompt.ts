/**
 * @file recommendationPrompt.ts
 * @description Prompt engineering module for the Gemini-powered Reels Recommendation System.
 *
 * Contains the system instruction (persona definition + core inference principles)
 * and the dynamic user prompt builder that serializes session reels and catalog
 * items into a structured prompt for Gemini's structured JSON output mode.
 */

import { Reel, CatalogReel } from './types';

/**
 * System instruction that defines the AI agent's persona, core inference principles,
 * and behavioral constraints for the Gemini model.
 *
 * Key principles enforced:
 * 1. Surface vs Underlying intent differentiation (anti-keyword-matching)
 * 2. Engagement-weighted signal extraction (positive/negative/neutral)
 * 3. Anti-hype distractor filtering (must never select clickbait catalog items)
 * 4. Catalog grounding (must select by exact ID from provided catalog)
 * 5. Honest confidence calibration (High/Medium/Low based on signal convergence)
 */
export const SYSTEM_INSTRUCTION = `You are the Reels Recommendation System's Senior Interest Inference & Tech Reel Recommendation Agent.
Analyze student short-form video watch telemetry, penetrate past surface keywords and clickbait formats to infer true underlying technical interest, and select EXACTLY ONE high-quality educational tech Reel from the provided curated catalog.

CORE PRINCIPLES:
1. SURFACE vs UNDERLYING: A student watching a Java meme, a FAANG SWE vlog, an interview skit, and a laptop setup comparison is interested in "Software Engineering Career / Architecture", NOT "Java syntax". Naive keyword counting fails.
2. ENGAGEMENT WEIGHTING:
   - High watch % (>80%), rewatches, likes = strong positive signal.
   - Early skips (<30% watch, skipped_early=true) = negative signal / topic rejection.
3. ANTI-HYPE FILTER: The catalog contains deliberate hype distractors (marked or clickbait such as "10 AI Tools...", "Become a Cloud Engineer in 7 Days"). NEVER select a hype distractor.
4. CATALOG GROUNDING: Must select from the provided catalog by exact ID.
5. HONEST CONFIDENCE: High (3+ converging signals), Medium (2 signals), Low (mixed/ambiguous history).

Return valid JSON strictly matching the schema.`;

/**
 * Build the user prompt that serializes a student's watch session reels
 * and the curated recommendation catalog into a structured text block
 * for Gemini inference.
 *
 * The prompt format is optimized for token density while preserving all
 * semantically relevant fields needed for accurate interest inference.
 *
 * @param sessionReels - Array of reels from the student's watch session.
 * @param catalog - Array of curated educational tech reel candidates.
 * @returns Formatted prompt string ready for Gemini's `contents` parameter.
 *
 * @example
 * ```ts
 * const prompt = buildUserPrompt(session.reels, CATALOG);
 * // Returns a multi-line string with STUDENT WATCH SESSION and CURATED TECH CATALOG sections
 * ```
 */
export function buildUserPrompt(sessionReels: Reel[], catalog: CatalogReel[]): string {
  const reelsSummary = sessionReels
    .map(
      (r, i) =>
        `#${i + 1} [${r.id}] "${r.title}" (Cat: ${r.category}, Format: ${r.format}, Watch: ${r.engagement.watch_percent}%${r.engagement.liked ? ', Liked' : ''}${r.engagement.skipped_early ? ', Skipped' : ''}, Tags: #${r.hashtags.join(' #')}, Caption: "${r.transcript_or_caption}")`
    )
    .join('\n');

  const catalogSummary = catalog
    .map(
      (c) =>
        `[${c.id}] "${c.title}" | Cat: ${c.category} | Diff: ${c.difficulty} | Tags: #${c.tags.join(' #')}${c.is_hype_distractor ? ' | [HYPE DISTRACTOR - DO NOT SELECT]' : ''}`
    )
    .join('\n');

  return `STUDENT WATCH SESSION REELS:
${reelsSummary}

CURATED TECH CATALOG (Select exactly ONE non-hype winner):
${catalogSummary}

Analyze the session, infer latent intent, and output structured JSON.`;
}
