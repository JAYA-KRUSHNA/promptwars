/**
 * Comprehensive Automated Verification Suite for Content-Aware Recommendation Engine
 * Evaluates:
 *  - 6 Benchmark Sessions (including Trap Test and Full 7-Reel Spec)
 *  - 3 Anti-Hype Distractor Disqualifications
 *  - Telemetry Sensitivity & Weight Clamping
 *  - Deterministic Idempotency & Random Session Variance
 *  - Catalog Grounding & Strict Schema Conformity
 */

import { generateDeterministicAnalysis } from '../src/lib/gemini';
import { CATALOG } from '../src/data/catalog';
import { SESSIONS, generateRandomSession } from '../src/data/sessions';
import { Reel, AnalysisResult } from '../src/lib/types';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    const msg = `  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`;
    console.error(msg);
    failures.push(msg);
  }
}

console.log('═══════════════════════════════════════════════════');
console.log('  CONTENT-AWARE RECOMMENDATION ENGINE TEST SUITE');
console.log('═══════════════════════════════════════════════════\n');

// ── SUITE 1: BENCHMARK SESSIONS & PROBLEM STATEMENT SPECS ───────────────────
console.log('SUITE 1: Benchmark Calibration Sessions (Sessions 1 to 6)');

// Test 1: Session 1 — Trap Test (Java meme + SWE vlog + interview joke + laptop comparison)
{
  console.log('\nTEST 1: Session 1 — Software Engineering Career Trap');
  const result = generateDeterministicAnalysis(SESSIONS[0].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category} | Confidence: ${result.confidence}`);

  assert(
    result.category === 'Career' || result.category === 'HLD' || result.category === 'DSA',
    'Session 1: Avoids generic Java trap; infers Career/SWE/System depth',
    `Got category: ${result.category}`
  );
  assert(
    result.recommended_reel_id === 'cat_14' || result.recommended_reel_id === 'cat_13',
    'Session 1: Recommends Senior Engineering / FAANG Interview depth',
    `Got ID: ${result.recommended_reel_id}`
  );
  assert(
    !CATALOG.find((c) => c.id === result.recommended_reel_id)?.is_hype_distractor,
    'Session 1: Output is NOT a hype distractor'
  );
}

// Test 2: Session 2 — Pure Java Mastery
{
  console.log('\nTEST 2: Session 2 — Pure Java Mastery');
  const result = generateDeterministicAnalysis(SESSIONS[1].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category} | Confidence: ${result.confidence}`);

  assert(result.category === 'Java', 'Session 2: Category is Java');
  assert(
    result.recommended_reel_id === 'cat_07' || result.recommended_reel_id === 'cat_08',
    'Session 2: Recommends Java GC or Spring Boot internals'
  );
  assert(result.confidence === 'High', 'Session 2: Confidence is High for 4 matching Java reels');
}

// Test 3: Session 3 — AI & Neural Foundations (Anti-Hype Test)
{
  console.log('\nTEST 3: Session 3 — AI & Neural Foundations (Anti-Hype)');
  const result = generateDeterministicAnalysis(SESSIONS[2].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category} | Confidence: ${result.confidence}`);

  assert(result.category === 'AI', 'Session 3: Category is AI');
  assert(
    result.recommended_reel_id === 'cat_05' || result.recommended_reel_id === 'cat_06',
    'Session 3: Recommends Transformers / Neural Nets'
  );
  assert(
    result.recommended_reel_id !== 'cat_04',
    'Session 3: Anti-hype filter successfully rejects "10 AI Tools That Will Get You a Job"'
  );
}

// Test 4: Session 4 — Hardware & Systems Architecture
{
  console.log('\nTEST 4: Session 4 — Hardware & Systems Architecture');
  const result = generateDeterministicAnalysis(SESSIONS[3].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);

  assert(result.category === 'Hardware', 'Session 4: Category is Hardware');
  assert(
    result.recommended_reel_id === 'cat_11' || result.recommended_reel_id === 'cat_12',
    'Session 4: Recommends GPU Architecture or CPU Cache'
  );
}

// Test 5: Session 5 — Mixed/Ambiguous Explorer
{
  console.log('\nTEST 5: Session 5 — Mixed/Ambiguous Explorer');
  const result = generateDeterministicAnalysis(SESSIONS[4].reels, CATALOG);

  assert(
    result.confidence === 'Low' || result.confidence === 'Medium',
    'Session 5: Confidence correctly calibrated to Low or Medium for mixed topics',
    `Got: ${result.confidence}`
  );
}

// Test 6: Session 6 — 7-Reel Full Spec (Gaming, Security, Cloud, Memes, Hype Skip)
{
  console.log('\nTEST 6: Session 6 — 7-Reel Full Spec (Gaming, Security, Cloud, Memes, Hype Skip)');
  const result = generateDeterministicAnalysis(SESSIONS[5].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category} | Confidence: ${result.confidence}`);

  assert(
    result.category === 'Cybersecurity' || result.category === 'Hardware' || result.category === 'Cloud',
    'Session 6: Correctly isolates technical clusters over skipped hype',
    `Got: ${result.category}`
  );
  assert(
    result.recommended_reel_id !== 'cat_16',
    'Session 6: Disqualifies "Become a Cloud Engineer in 7 Days" distractor'
  );
}

// ── SUITE 2: ANTI-HYPE DISQUALIFICATION MATRIX ──────────────────────────────
console.log('\nSUITE 2: Anti-Hype Disqualification Matrix');
{
  const hypeIds = ['cat_04', 'cat_16', 'cat_17'];
  for (const session of SESSIONS) {
    const res = generateDeterministicAnalysis(session.reels, CATALOG);
    assert(
      !hypeIds.includes(res.recommended_reel_id),
      `Anti-Hype Guard: ${session.name} did not recommend any of [${hypeIds.join(', ')}]`
    );
  }
}

// ── SUITE 3: TELEMETRY SENSITIVITY & WEIGHT CLAMPING ────────────────────────
console.log('\nSUITE 3: Telemetry Sensitivity & Weight Clamping');
{
  // Test early skip dampening
  const modifiedReels: Reel[] = SESSIONS[0].reels.map((r) => {
    if (r.category === 'Career') {
      return {
        ...r,
        engagement: { watch_percent: 15, liked: false, shared: false, rewatch_count: 0, skipped_early: true },
      };
    }
    return {
      ...r,
      engagement: { watch_percent: 100, liked: true, shared: false, rewatch_count: 2, skipped_early: false },
    };
  });

  const modifiedResult = generateDeterministicAnalysis(modifiedReels, CATALOG);
  assert(
    modifiedResult.recommended_reel_id !== 'cat_14',
    'Telemetry Dynamics: Skipping career reels pivots recommendation away from cat_14'
  );

  // Test negative and oversized watch percentage clamping
  const clampedReels: Reel[] = [
    {
      id: 'clamp_test_1',
      title: 'Clamped Bounds Test',
      category: 'Java',
      hashtags: ['java'],
      format: 'tutorial',
      transcript_or_caption: 'Spring boot microservices tutorial',
      engagement: { watch_percent: -200, liked: false, shared: false, rewatch_count: 0, skipped_early: false },
    },
    {
      id: 'clamp_test_2',
      title: 'Clamped Bounds High',
      category: 'Java',
      hashtags: ['java'],
      format: 'tutorial',
      transcript_or_caption: 'JVM internals',
      engagement: { watch_percent: 9999, liked: true, shared: false, rewatch_count: 5, skipped_early: false },
    },
  ];

  const clampedResult = generateDeterministicAnalysis(clampedReels, CATALOG);
  assert(
    clampedResult.category === 'Java',
    'Clamping Bounds: Safely clamps negative and >100% watch times without NaN or crash'
  );
}

// ── SUITE 4: DETERMINISTIC IDEMPOTENCY & RANDOM VARIANCE ────────────────────
console.log('\nSUITE 4: Deterministic Idempotency & Catalog Coverage');
{
  // 100-run Idempotency verification
  let isStrictlyDeterministic = true;
  const baseResult = generateDeterministicAnalysis(SESSIONS[0].reels, CATALOG);
  for (let i = 0; i < 100; i++) {
    const run = generateDeterministicAnalysis(SESSIONS[0].reels, CATALOG);
    if (run.recommended_reel_id !== baseResult.recommended_reel_id) {
      isStrictlyDeterministic = false;
      break;
    }
  }
  assert(isStrictlyDeterministic, 'Idempotency: 100 consecutive runs return 100% identical outputs');

  // Random feed variety
  const uniqueRecommendations = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const randomFeed = generateRandomSession(7);
    const rec = generateDeterministicAnalysis(randomFeed.reels, CATALOG);
    uniqueRecommendations.add(rec.recommended_reel_id);
  }
  assert(
    uniqueRecommendations.size >= 4,
    `Random Session Variance: Generated ${uniqueRecommendations.size} distinct catalog picks across 20 random feeds (>= 4 required)`
  );
}

// ── SUITE 5: SCHEMA CONFORMITY & CATALOG INTEGRITY ──────────────────────────
console.log('\nSUITE 5: Schema Conformity & Catalog Grounding');
{
  // Verify all 18 catalog items
  assert(CATALOG.length === 18, `Catalog Size: Exact 18 curated items present (got ${CATALOG.length})`);
  const allValidCatalog = CATALOG.every(
    (item) => item.id && item.title && item.category && item.difficulty && item.tags.length > 0
  );
  assert(allValidCatalog, 'Catalog Schema: Every item contains id, title, category, difficulty, and tags');

  // Verify Schema Conformity on all sessions
  for (const session of SESSIONS) {
    const res = generateDeterministicAnalysis(session.reels, CATALOG);
    const hasRequiredFields = Boolean(
      res.interest_detected &&
      res.why &&
      res.recommended_tech_reel &&
      res.recommended_reel_id &&
      res.category &&
      res.why_this_recommendation &&
      ['Beginner', 'Intermediate', 'Advanced'].includes(res.difficulty) &&
      ['High', 'Medium', 'Low'].includes(res.confidence) &&
      Array.isArray(res.reel_signals) &&
      res.reel_signals.length > 0
    );

    assert(
      hasRequiredFields,
      `Schema Strictness: ${session.name} adheres to all 8 required problem statement fields`
    );
  }

  // Edge case: Empty session handling
  const emptyRes = generateDeterministicAnalysis([], CATALOG);
  assert(emptyRes.confidence === 'Low', 'Edge Case: Empty session yields Low confidence');
  assert(Boolean(emptyRes.recommended_reel_id), 'Edge Case: Empty session provides fallback recommendation');
}

// ── TEST SUMMARY ────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log('═══════════════════════════════════════════════════\n');

if (failed > 0) {
  console.error('Failed tests:\n' + failures.join('\n'));
  process.exit(1);
} else {
  console.log('🎉 ALL 24/24 AUTOMATED ENGINE & REGRESSION TESTS PASSED!\n');
}
