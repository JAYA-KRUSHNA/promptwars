import React from 'react';
import { AnalysisResult, AnalysisSource, CatalogReel } from '../lib/types';
import { Award, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Bookmark, ExternalLink } from 'lucide-react';

interface RecommendationCardProps {
  analysis: AnalysisResult;
  catalog: CatalogReel[];
  onOpenReasoning: () => void;
  source?: AnalysisSource | null;
  latencyMs?: number | null;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  analysis,
  catalog,
  onOpenReasoning,
  source,
  latencyMs,
}) => {
  const recommendedItem = catalog.find((c) => c.id === analysis.recommended_reel_id);
  const alternativeItem = analysis.alternative_recommendation
    ? catalog.find((c) => c.id === analysis.alternative_recommendation?.catalog_id)
    : null;

  return (
    <div className="space-y-6">
      {/* Main Selected Recommendation Spotlight */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-gradient-to-b from-white to-indigo-50/20 p-6 sm:p-8 shadow-sm">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
              <Award className="h-3.5 w-3.5" /> Curated Catalog Pick
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              ID: {analysis.recommended_reel_id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
              {analysis.category}
            </span>
            <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700">
              {analysis.difficulty} Difficulty
            </span>
          </div>
        </div>

        {/* Card Main Header & Icon */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-3xl text-white shadow-md shadow-indigo-200">
            {recommendedItem?.iconEmoji || '🎯'}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {analysis.recommended_tech_reel}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {recommendedItem?.description}
            </p>

            {/* Tags */}
            {recommendedItem?.tags && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {recommendedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deep Justification Section */}
        <div className="mt-6 rounded-2xl bg-white border border-indigo-100 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Why This Specific Tech Reel Was Recommended:</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {analysis.why_this_recommendation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-indigo-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified against 3 Anti-Hype Distractors & Keyword Traps</span>
            {source && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ml-1 ${
                  source === 'gemini'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {source === 'gemini' ? '⚡ Gemini' : '🔧 Fallback'}
                {latencyMs != null && ` · ${(latencyMs / 1000).toFixed(1)}s`}
              </span>
            )}
          </div>

          <button
            onClick={onOpenReasoning}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <span>View Staged Reasoning Graph</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Alternative Recommendation Card */}
      {analysis.alternative_recommendation && alternativeItem && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Alternative Next Step
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {alternativeItem.category}
              </span>
            </div>
            <span className="text-xs text-slate-400">ID: {alternativeItem.id}</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
              {alternativeItem.iconEmoji}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{alternativeItem.title}</h4>
              <p className="mt-0.5 text-xs text-slate-600">{alternativeItem.description}</p>
              <p className="mt-2 text-xs text-indigo-700 italic">
                <strong>Why alternative:</strong> {analysis.alternative_recommendation.reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
