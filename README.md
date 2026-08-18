# PromptWars — AI Interest Inference & Tech Reel Recommender

> AI agent that analyzes student short-form video (Reel) watch sessions, infers true underlying interests beyond surface keywords, and recommends high-quality educational tech Reels — with full staged reasoning transparency.

## What It Does

Students watch a mix of memes, vlogs, tutorials, and hype videos. A naive keyword matcher would recommend "Java tutorials" because they watched a Java meme, or "AI tools" because an AI clickbait video appeared in their feed.

**PromptWars goes deeper:**

1. **Signal Extraction** — Separates surface keywords from implied cognitive signals per Reel
2. **Cross-Reel Clustering** — Connects signals into a unified intent across the whole session
3. **Anti-Hype Filtering** — Actively rejects clickbait distractors the student skipped
4. **Catalog-Grounded Recommendation** — Selects from a curated catalog of substantive tech content
5. **Reasoning Transparency** — Shows the full 4-stage inference graph explaining *why*

## Architecture

- **Frontend**: React 19 + Tailwind CSS 4 + Lucide Icons + Framer Motion
- **Backend**: Express.js server with Gemini API integration
- **AI Model**: Gemini 3.7 Flash with structured JSON output schema
- **Fallback**: Deterministic rule-based engine ensures 100% demo resilience

## Key Features

| Feature | Description |
|---------|-------------|
| 🎯 **The Software Engineering Trap** | Session 1 tests if the agent sees past a "Java meme" to infer career interest |
| 🛡️ **Anti-Hype Filter** | 3 deliberate clickbait distractors in the catalog that must NEVER be recommended |
| 📊 **Staged Reasoning Graph** | Interactive 4-stage reveal showing signal → cluster → intent → recommendation |
| 🔍 **Catalog Grounding** | All recommendations verified against the curated 18-item tech catalog |
| ⚡ **Live Gemini Indicator** | UI shows whether the result came from live Gemini or the fallback engine |

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Test Sessions

| Session | Tests | Expected Outcome |
|---------|-------|-------------------|
| Session 1 | Keyword trap | Career/SWE, NOT "Java" |
| Session 2 | Deep specialization | Java/JVM mastery |
| Session 3 | Anti-hype filter | ML math, NOT AI clickbait |
| Session 4 | Hardware depth | Systems architecture |
| Session 5 | Ambiguous input | Low confidence calibration |

## Production Build

```bash
npm run build
npm start
```

## Tech Stack

- `@google/genai` — Gemini 3.7 Flash structured output
- `react` 19 + `react-dom` 19
- `tailwindcss` 4 + `@tailwindcss/vite`
- `express` 4 — API server
- `lucide-react` — Icons
- `motion` — Animations
- `vite` 6 — Build tooling
