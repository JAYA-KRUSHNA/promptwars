import React from 'react';
import { Sparkles, Compass, Database, Zap, Film } from 'lucide-react';
import { AnalysisSource } from '../lib/types';

interface HeaderProps {
  onOpenCatalog: () => void;
  onRegenerate: () => void;
  isAnalyzing: boolean;
  activeView: 'reels' | 'analysis' | 'recommendation';
  setActiveView: (view: 'reels' | 'analysis' | 'recommendation') => void;
  hasAnalysis: boolean;
  analysisSource?: AnalysisSource | null;
  analysisLatency?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCatalog,
  onRegenerate,
  isAnalyzing,
  activeView,
  setActiveView,
  hasAnalysis,
  analysisSource,
  analysisLatency,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-sm shadow-indigo-200">
            <Sparkles className="h-4.5 w-4.5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Reels Recommendation System
              </span>
              <span className="hidden sm:inline-flex rounded-md bg-indigo-50/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                AI Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Latent interest inference & educational tech reel recommendation
            </p>
          </div>
        </div>

        {/* View Navigation Pill */}
        {hasAnalysis && (
          <div className="hidden lg:flex items-center rounded-xl border border-slate-200/80 bg-slate-100/70 p-1">
            <button
              onClick={() => setActiveView('reels')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'reels'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="h-3.5 w-3.5 text-slate-500" />
              <span>1. Watched Feed</span>
            </button>
            <button
              onClick={() => setActiveView('analysis')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'analysis'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-indigo-600" />
              <span>2. Inferred Intent</span>
            </button>
            <button
              onClick={() => setActiveView('recommendation')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'recommendation'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>3. Recommendation</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini Live Status */}
          {analysisSource && (
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                analysisSource === 'gemini'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  analysisSource === 'gemini' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {analysisSource === 'gemini' ? 'Gemini Live' : 'Fallback Engine'}
                {analysisLatency != null && ` · ${(analysisLatency / 1000).toFixed(1)}s`}
              </span>
            </div>
          )}

          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
            title="Inspect candidate tech reels and test hype distractors"
          >
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Catalog</span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
              18
            </span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Zap className={`h-3.5 w-3.5 text-yellow-300 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Infer'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
