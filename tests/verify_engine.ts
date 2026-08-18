/**
 * Verification test for the content-aware recommendation engine.
 * Tests all 5 fixed sessions and random session variance.
 *
 * Run with: npx tsx tests/verify_engine.ts
 */
import { SESSIONS, generateRandomSession } from '../src/data/sessions';
import { CATALOG } from '../src/data/catalog';
import { generateDeterministicAnalysis } from '../src/lib/gemini';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail: string = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

console.log('\n═══════════════════════════════════════════════════');
console.log('  CONTENT-AWARE RECOMMENDATION ENGINE TESTS');
console.log('═══════════════════════════════════════════════════\n');

// ── Test 1: Session 1 (Career trap) ──────────────────────────────────
console.log('TEST 1: Session 1 — Software Engineering Career Trap');
{
  const result = generateDeterministicAnalysis(SESSIONS[0].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Confidence: ${result.confidence}`);
  assert(
    result.category === 'Career',
    'Category is Career (not Java or AI)',
    `Got: ${result.category}`
  );
  assert(
    result.recommended_reel_id === 'cat_13' || result.recommended_reel_id === 'cat_14',
    'Recommended FAANG Interview or Senior Engineers',
    `Got: ${result.recommended_reel_id}`
  );
  assert(
    !CATALOG.find(c => c.id === result.recommended_reel_id)?.is_hype_distractor,
    'Not a hype distractor'
  );
}

// ── Test 2: Session 2 (Pure Java) ────────────────────────────────────
console.log('\nTEST 2: Session 2 — Pure Java Mastery');
{
  const result = generateDeterministicAnalysis(SESSIONS[1].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Confidence: ${result.confidence}`);
  assert(
    result.category === 'Java',
    'Category is Java',
    `Got: ${result.category}`
  );
  assert(
    result.recommended_reel_id === 'cat_07' || result.recommended_reel_id === 'cat_08',
    'Recommended Java GC or Spring Boot',
    `Got: ${result.recommended_reel_id}`
  );
  assert(
    result.confidence === 'High',
    'Confidence is High (4 strong Java reels)',
    `Got: ${result.confidence}`
  );
}

// ── Test 3: Session 3 (AI anti-hype) ─────────────────────────────────
console.log('\nTEST 3: Session 3 — AI & Neural Foundations (Anti-Hype)');
{
  const result = generateDeterministicAnalysis(SESSIONS[2].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Confidence: ${result.confidence}`);
  assert(
    result.category === 'AI',
    'Category is AI',
    `Got: ${result.category}`
  );
  assert(
    result.recommended_reel_id === 'cat_05' || result.recommended_reel_id === 'cat_06',
    'Recommended Transformers or Neural Net (NOT hype)',
    `Got: ${result.recommended_reel_id}`
  );
  assert(
    !CATALOG.find(c => c.id === result.recommended_reel_id)?.is_hype_distractor,
    'Anti-hype filter passed'
  );
}

// ── Test 4: Session 4 (Hardware) ─────────────────────────────────────
console.log('\nTEST 4: Session 4 — Hardware & Systems Architecture');
{
  const result = generateDeterministicAnalysis(SESSIONS[3].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Confidence: ${result.confidence}`);
  assert(
    result.category === 'Hardware',
    'Category is Hardware',
    `Got: ${result.category}`
  );
  assert(
    result.recommended_reel_id === 'cat_11' || result.recommended_reel_id === 'cat_12',
    'Recommended GPU or CPU Cache',
    `Got: ${result.recommended_reel_id}`
  );
}

// ── Test 5: Session 5 (Ambiguous / Low confidence) ───────────────────
console.log('\nTEST 5: Session 5 — Mixed/Ambiguous Explorer');
{
  const result = generateDeterministicAnalysis(SESSIONS[4].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Confidence: ${result.confidence}`);
  assert(
    result.confidence === 'Low' || result.confidence === 'Medium',
    'Confidence is Low or Medium (ambiguous session)',
    `Got: ${result.confidence}`
  );
  assert(
    !CATALOG.find(c => c.id === result.recommended_reel_id)?.is_hype_distractor,
    'Not a hype distractor'
  );
}

// ── Test 5b: Session 6 (Full 7-Reel Spec: Gaming, Security, Cloud, Memes, Hype Skip) ──
console.log('\nTEST 5b: Session 6 — 7-Reel Full Spec (Gaming, Security, Cloud, Memes, Hype Skip)');
{
  const result = generateDeterministicAnalysis(SESSIONS[5].reels, CATALOG);
  console.log(`  Winner: ${result.recommended_tech_reel} (${result.recommended_reel_id})`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Confidence: ${result.confidence}`);
  assert(
    result.category === 'Cybersecurity' || result.category === 'Hardware' || result.category === 'Cloud',
    'Category is Cybersecurity, Hardware, or Cloud',
    `Got: ${result.category}`
  );
  assert(
    !CATALOG.find(c => c.id === result.recommended_reel_id)?.is_hype_distractor,
    'Anti-hype filter successfully rejected "Become a Cloud Engineer in 7 Days"'
  );
  assert(
    result.confidence === 'High' || result.confidence === 'Medium',
    'Confidence is High or Medium',
    `Got: ${result.confidence}`
  );
}

// ── Test 6: Random session variance ──────────────────────────────────
console.log('\nTEST 6: Random Session Variance (10 iterations)');
{
  const results = new Set<string>();
  for (let i = 0; i < 10; i++) {
    const randomSession = generateRandomSession(5);
    const result = generateDeterministicAnalysis(randomSession.reels, CATALOG);
    results.add(result.recommended_reel_id);
  }
  console.log(`  Distinct recommendations across 10 random feeds: ${results.size}`);
  console.log(`  IDs: ${[...results].join(', ')}`);
  assert(
    results.size >= 2,
    'At least 2 distinct recommendations from 10 random sessions',
    `Got only ${results.size} distinct results`
  );
}

// ── Test 7: Engagement toggle changes results ────────────────────────
console.log('\nTEST 7: Engagement Toggle — Skipping changes recommendation');
{
  const modifiedReels = SESSIONS[0].reels.map((r) => ({
    ...r,
    engagement: {
      ...r.engagement,
      ...(r.category === 'Career'
        ? { watch_percent: 5, skipped_early: true, liked: false, shared: false, rewatch_count: 0 }
        : {}),
    },
  }));
  const original = generateDeterministicAnalysis(SESSIONS[0].reels, CATALOG);
  const modified = generateDeterministicAnalysis(modifiedReels, CATALOG);
  console.log(`  Original winner: ${original.recommended_tech_reel} (${original.recommended_reel_id})`);
  console.log(`  Modified winner: ${modified.recommended_tech_reel} (${modified.recommended_reel_id})`);
  assert(
    original.recommended_reel_id !== modified.recommended_reel_id,
    'Skipping Career reels changes the recommendation',
    `Both got: ${original.recommended_reel_id}`
  );
}

// ── Test 8: Empty session ────────────────────────────────────────────
console.log('\nTEST 8: Empty Session Fallback');
{
  const result = generateDeterministicAnalysis([], CATALOG);
  assert(
    result.confidence === 'Low',
    'Empty session → Low confidence',
    `Got: ${result.confidence}`
  );
  assert(
    result.recommended_reel_id === 'cat_01',
    'Empty session → DNS baseline',
    `Got: ${result.recommended_reel_id}`
  );
}

// ── Summary ──────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log('═══════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
