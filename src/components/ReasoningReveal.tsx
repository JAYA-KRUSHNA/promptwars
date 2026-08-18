import React, { useState, useEffect } from 'react';
import { AnalysisResult, CatalogReel } from '../lib/types';
import {
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  XCircle,
  HelpCircle,
  Network,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';

interface ReasoningRevealProps {
  analysis: AnalysisResult;
  catalog: CatalogReel[];
  onSelectRecommendation?: (reelId: string) => void;
}

export const ReasoningReveal: React.FC<ReasoningRevealProps> = ({
  analysis,
  catalog,
  onSelectRecommendation,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(4); // Default to full reveal, with playback
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const matchedCatalogItem = catalog.find((c) => c.id === analysis.recommended_reel_id);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStage < 4) {
          setCurrentStage((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1400);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStage]);

  const handleStartAutoPlay = () => {
    setCurrentStage(1);
    setIsPlaying(true);
  };

  const stages = [
    { num: 1, title: '1. Signal Extraction', desc: 'Surface topic vs Implied signal per Reel' },
    { num: 2, title: '2. Cluster Convergence', desc: 'Pattern clustering & engagement weighting' },
    { num: 3, title: '3. Latent Intent Emergence', desc: 'Primary interest & trap contrast' },
    { num: 4, title: '4. Grounded Catalog Rec', desc: 'Anti-hype filter & curated reel match' },
  ];

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
      {/* Header & Playback Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Network className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Live Reasoning & Inference Graph
            </h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              WOW Feature
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Interactive staged reveal tracing how raw watch telemetry transforms into a curated recommendation.
          </p>
        </div>

        {/* Stage Buttons & Playback */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleStartAutoPlay}
            disabled={isPlaying}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" /> Playing Stages...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white" /> Replay Reasoning
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stage Step Indicator Bar */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stages.map((st) => {
          const isPassed = currentStage >= st.num;
          const isCurrent = currentStage === st.num;

          return (
            <button
              key={st.num}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStage(st.num);
              }}
              className={`flex flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                  : isPassed
                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  : 'border-slate-100 bg-white opacity-40 hover:opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold ${
                    isCurrent ? 'text-indigo-900' : isPassed ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {st.title}
                </span>
                {isPassed && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                )}
              </div>
              <span className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">{st.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Staged Body */}
      <div className="mt-6 space-y-6">
        {/* STAGE 1: Individual Reel Signal Breakdown */}
        {currentStage >= 1 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  1
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Step 1: Raw Signals Extracted from Watch Telemetry
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                {analysis.reel_signals.length} Signals Decoded
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.reel_signals.map((sig, idx) => {
                const isPositive = sig.signal_strength === 'positive';
                const isNegative = sig.signal_strength === 'negative';

                return (
                  <div
                    key={sig.reel_id || idx}
                    className={`rounded-xl border bg-white p-3 shadow-2xs transition-all ${
                      isPositive
                        ? 'border-emerald-200/80 ring-1 ring-emerald-500/10'
                        : isNegative
                        ? 'border-rose-200/80 bg-rose-50/30 ring-1 ring-rose-500/10'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                        {sig.reel_title}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isNegative
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sig.signal_strength}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs">
                      <div className="text-[11px] text-slate-400">
                        <span className="font-medium text-slate-500">Surface Topic:</span>{' '}
                        <span className="line-through text-slate-400">{sig.surface_topic}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-800">
                        <span className="font-semibold text-indigo-600">→ Implied Intent:</span>{' '}
                        {sig.implied_signal}
                      </div>
                      <div className="text-[10px] text-slate-500 italic mt-1 pt-1 border-t border-slate-100">
                        {sig.weight_explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 2: Cluster Convergence & Engagement Weighting */}
        {currentStage >= 2 && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  2
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                  Step 2: Cross-Reel Pattern Convergence & Clustering
                </h4>
              </div>
              <span className="text-[11px] font-medium text-indigo-700">Synthesized Pattern</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
              {analysis.underlying_cluster_summary}
            </p>
          </div>
        )}

        {/* STAGE 3: Emergence of True Underlying Interest (With Naive vs Intelligent Contrast) */}
        {currentStage >= 3 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                3
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Step 3: Inferred Latent Interest vs Naive Keyword Matcher
              </h4>
            </div>

            {/* Inferred Primary Interest Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 p-4 text-white shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                  Confirmed Primary Inferred Interest
                </span>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                  {analysis.interest_detected}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-xs border border-white/10 text-indigo-200">
                  Confidence: <strong className="text-white">{analysis.confidence}</strong>
                </span>
                <span className="rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold border border-indigo-400/30 text-white">
                  Category: <strong>{analysis.category}</strong>
                </span>
              </div>
            </div>

            {/* Surface vs Underlying Contrast Box */}
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>Why Naive Keyword Matchers Fail Here:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{analysis.surface_vs_underlying}</p>
            </div>
          </div>
        )}

        {/* STAGE 4: Grounded Catalog Recommendation & Anti-Hype Candidate Rejections */}
        {currentStage >= 4 && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  4
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Step 4: Selected Curated Tech Reel & Anti-Hype Disqualifications
                </h4>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Catalog Grounded
              </span>
            </div>

            {/* Selected Reel Spotlight */}
            <div className="rounded-xl border border-emerald-300 bg-white p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                    {matchedCatalogItem?.iconEmoji || '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        Selected #{analysis.recommended_reel_id}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {analysis.category}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {analysis.difficulty}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      {analysis.recommended_tech_reel}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {matchedCatalogItem?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Selection Rationale:
                </span>
                <p className="mt-0.5 text-xs text-slate-700 leading-relaxed">
                  {analysis.why_this_recommendation}
                </p>
              </div>
            </div>

            {/* Candidate Disqualifications / Anti-Hype Audit Log */}
            {analysis.candidate_evaluations && analysis.candidate_evaluations.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Catalog Candidate Audit Log (Anti-Hype & Mismatch Filter)
                </h5>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {analysis.candidate_evaluations.map((cand, idx) => {
                    const isSelected = cand.evaluated_status === 'selected';
                    const isHype = cand.evaluated_status === 'rejected_hype';

                    return (
                      <div
                        key={cand.catalog_id || idx}
                        className={`rounded-lg border p-2.5 text-xs ${
                          isSelected
                            ? 'border-emerald-200 bg-emerald-50/60'
                            : isHype
                            ? 'border-rose-200 bg-rose-50/60'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="truncate max-w-[200px] text-slate-800">
                            {cand.title}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : isHype
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {cand.evaluated_status.replace('rejected_', 'Rejected: ')}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                          {cand.rationale}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
