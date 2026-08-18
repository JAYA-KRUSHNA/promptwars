import React from 'react';
import { AnalysisResult, AnalysisSource, CatalogReel, Reel } from '../lib/types';
import { Award, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Bookmark, ExternalLink, Flame, BookOpen } from 'lucide-react';
import { OfficialOutputCard } from './OfficialOutputCard';

interface RecommendationCardProps {
  analysis: AnalysisResult;
  catalog: CatalogReel[];
  onOpenReasoning: () => void;
  source?: AnalysisSource | null;
  latencyMs?: number | null;
  activeReels?: Reel[];
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  analysis,
  catalog,
  onOpenReasoning,
  source,
  latencyMs,
  activeReels = [],
}) => {
  const recommendedItem = catalog.find((c) => c.id === analysis.recommended_reel_id);
  const alternativeItem = analysis.alternative_recommendation
    ? catalog.find((c) => c.id === analysis.alternative_recommendation?.catalog_id)
    : null;

  return (
    <div className="space-y-6">
      {/* Main Selected Recommendation Spotlight */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-white via-indigo-50/25 to-purple-50/20 p-6 sm:p-8 shadow-sm">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-pink-500/20 blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-black text-white shadow-xs">
              <Award className="h-3.5 w-3.5" /> Curated Pick
            </span>
            <span className="rounded-full bg-slate-100/90 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 font-mono">
              ID: {analysis.recommended_reel_id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100/80 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-800">
              Domain: {analysis.category}
            </span>
            <span className="rounded-full bg-slate-100/90 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
              {analysis.difficulty} Difficulty
            </span>
          </div>
        </div>

        {/* Card Main Header & Icon */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-3xl text-white shadow-md shadow-indigo-300 ring-2 ring-indigo-200">
            {recommendedItem?.iconEmoji || '🎯'}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {analysis.recommended_tech_reel}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {recommendedItem?.description}
            </p>

            {/* Tags */}
            {recommendedItem?.tags && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recommendedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-white border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 shadow-2xs hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deep Justification Section */}
        <div className="mt-6 rounded-2xl bg-white/95 border border-indigo-100/90 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Why This Specific Tech Reel Was Recommended:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {analysis.why_this_recommendation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-indigo-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified against 3 Anti-Hype Distractors & Keyword Traps</span>
            {source && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ml-1 ${
                  source === 'gemini'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {source === 'gemini' ? '⚡ Gemini 3.6 Flash' : '🔧 Fallback'}
                {latencyMs != null && ` · ${(latencyMs / 1000).toFixed(1)}s`}
              </span>
            )}
          </div>

          <button
            onClick={onOpenReasoning}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all cursor-pointer"
          >
            <span>Live Reasoning Pipeline</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Alternative Recommendation Card */}
      {analysis.alternative_recommendation && alternativeItem && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Alternative Next Step
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                {alternativeItem.category}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">ID: {alternativeItem.id}</span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl shadow-2xs">
              {alternativeItem.iconEmoji}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{alternativeItem.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{alternativeItem.description}</p>
              <p className="text-xs text-indigo-700 italic pt-1">
                <strong>Why alternative:</strong> {analysis.alternative_recommendation.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Official Required Schema Output Block */}
      <OfficialOutputCard analysis={analysis} activeReels={activeReels} />
    </div>
  );
};
