import { Reel, CatalogReel } from './types';

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
