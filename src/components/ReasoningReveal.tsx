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
  Filter,
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
  const [currentStage, setCurrentStage] = useState<number>(4); // Default to full reveal
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
    <div className="rounded-3xl border border-indigo-100/90 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header & Playback Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-sm">
              <Network className="h-4 w-4" />
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Live Reasoning & Inference Graph
            </h3>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Reasoning Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Interactive 4-stage pipeline demonstrating how raw watch telemetry transforms into a grounded educational recommendation.
          </p>
        </div>

        {/* Stage Buttons & Playback */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartAutoPlay}
            disabled={isPlaying}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" /> Playing Pipeline...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white" /> Replay Pipeline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stage Step Indicator Bar */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
              className={`flex flex-col rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'border-indigo-600 bg-gradient-to-b from-indigo-50 to-white shadow-glow-indigo/15 ring-2 ring-indigo-500/30 font-bold'
                  : isPassed
                  ? 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 font-semibold'
                  : 'border-slate-100 bg-white opacity-40 hover:opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold ${
                    isCurrent ? 'text-indigo-950' : isPassed ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {st.title}
                </span>
                {isPassed && (
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                )}
              </div>
              <span className="mt-1 text-[11px] text-slate-500 line-clamp-1">{st.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Staged Body */}
      <div className="mt-6 space-y-6">
        {/* STAGE 1: Individual Reel Signal Breakdown */}
        {currentStage >= 1 && (
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  1
                </span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Step 1: Raw Signals Extracted from Watch Telemetry
                </h4>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {analysis.reel_signals.length} Signals Decoded
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.reel_signals.map((sig, idx) => {
                const isPositive = sig.signal_strength === 'positive';
                const isNegative = sig.signal_strength === 'negative';

                return (
                  <div
                    key={sig.reel_id || idx}
                    className={`rounded-2xl border bg-white p-4 shadow-2xs transition-all ${
                      isPositive
                        ? 'border-emerald-200/90 ring-1 ring-emerald-500/10'
                        : isNegative
                        ? 'border-rose-200/90 bg-rose-50/20 ring-1 ring-rose-500/10'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">
                        <span className="text-slate-400 font-mono mr-1 text-[10px]">#{idx + 1}</span>
                        {sig.reel_title}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isNegative
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sig.signal_strength}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5 text-xs">
                      <div className="text-[11px] text-slate-400">
                        <span className="font-medium text-slate-500">Surface Topic:</span>{' '}
                        <span className="line-through text-slate-400">{sig.surface_topic}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        <span className="font-bold text-indigo-600">→ Implied Intent:</span>{' '}
                        {sig.implied_signal}
                      </div>
                      <div className="text-[10px] text-slate-500 italic mt-1.5 pt-1.5 border-t border-slate-100">
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
          <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-5 transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  2
                </span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                  Step 2: Cross-Reel Pattern Convergence & Clustering
                </h4>
              </div>
              <span className="text-xs font-bold text-indigo-700">Synthesized Pattern</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs font-normal">
              {analysis.underlying_cluster_summary}
            </p>
          </div>
        )}

        {/* STAGE 3: Emergence of True Underlying Interest (With Naive vs Intelligent Contrast) */}
        {currentStage >= 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition-all animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                3
              </span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Step 3: Inferred Latent Interest vs Naive Keyword Matcher
              </h4>
            </div>

            {/* Inferred Primary Interest Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-300">
                  Primary Inferred Latent Interest
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-1">
                  {analysis.interest_detected}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-bold backdrop-blur-xs border border-white/10 text-indigo-200">
                  Confidence: <strong className="text-white font-mono">{analysis.confidence}</strong>
                </span>
                <span className="rounded-xl bg-indigo-500/20 px-3.5 py-1.5 text-xs font-bold border border-indigo-400/30 text-white">
                  Domain: <strong>{analysis.category}</strong>
                </span>
              </div>
            </div>

            {/* Surface vs Underlying Contrast Box */}
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs">
              <div className="flex items-center gap-2 font-black text-amber-900 mb-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>Why Naive Keyword Matchers Fail on this Session:</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">{analysis.surface_vs_underlying}</p>
            </div>
          </div>
        )}

        {/* STAGE 4: Grounded Catalog Recommendation & Anti-Hype Candidate Rejections */}
        {currentStage >= 4 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 sm:p-6 shadow-xs transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                  4
                </span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                  Step 4: Selected Curated Tech Reel & Anti-Hype Disqualifications
                </h4>
              </div>
              <span className="rounded-full bg-emerald-100 border border-emerald-300/60 px-3 py-0.5 text-xs font-bold text-emerald-800">
                Catalog Grounded
              </span>
            </div>

            {/* Selected Reel Spotlight */}
            <div className="rounded-2xl border border-emerald-300 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl shadow-2xs">
                    {matchedCatalogItem?.iconEmoji || '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase font-mono">
                        Selected #{analysis.recommended_reel_id}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {analysis.category}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {analysis.difficulty}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base sm:text-lg font-bold text-slate-900">
                      {analysis.recommended_tech_reel}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {matchedCatalogItem?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="mt-3.5 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Selection Rationale:
                </span>
                <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                  {analysis.why_this_recommendation}
                </p>
              </div>
            </div>

            {/* Candidate Disqualifications / Anti-Hype Audit Log */}
            {analysis.candidate_evaluations && analysis.candidate_evaluations.length > 0 && (
              <div className="mt-5">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-500" /> Catalog Candidate Audit Log (Anti-Hype & Mismatch Filter)
                </h5>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {analysis.candidate_evaluations.map((cand, idx) => {
                    const isSelected = cand.evaluated_status === 'selected';
                    const isHype = cand.evaluated_status === 'rejected_hype';

                    return (
                      <div
                        key={cand.catalog_id || idx}
                        className={`rounded-xl border p-3 text-xs transition-all ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50/70 shadow-2xs'
                            : isHype
                            ? 'border-rose-300 bg-rose-50/60 shadow-2xs'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold gap-2">
                          <span className="truncate max-w-[200px] text-slate-900">
                            {cand.title}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight ${
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
