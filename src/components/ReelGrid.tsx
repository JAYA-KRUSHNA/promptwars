import React from 'react';
import { Reel } from '../lib/types';
import { ReelCard } from './ReelCard';
import { Sparkles, CheckSquare, Square, RefreshCcw, SlidersHorizontal, Film } from 'lucide-react';

interface ReelGridProps {
  reels: Reel[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAnalyze: () => void;
  onUpdateEngagement?: (id: string, updated: Partial<Reel['engagement']>) => void;
  isAnalyzing: boolean;
}

export const ReelGrid: React.FC<ReelGridProps> = ({
  reels,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onAnalyze,
  onUpdateEngagement,
  isAnalyzing,
}) => {
  const allSelected = selectedIds.length === reels.length;

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/90 p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Film className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Watched Reel Feed Timeline</h3>
            <span className="rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/60 font-mono">
              {selectedIds.length}/{reels.length} Analyzed
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Click cards to include/exclude or use the <strong className="text-slate-700">Simulate</strong> buttons (15% Skip / 50% / 100%) to test real-time intent shifts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            {allSelected ? (
              <>
                <Square className="h-3.5 w-3.5 text-slate-400" /> Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-3.5 w-3.5 text-indigo-600" /> Select All
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || selectedIds.length === 0}
            className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin text-yellow-300" />
                <span>Inferring Intent...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-yellow-300 group-hover:rotate-12 transition-transform" />
                <span>Infer Latent Interests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Reels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reels.map((reel, idx) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            index={idx}
            isSelected={selectedIds.includes(reel.id)}
            onToggleSelect={onToggleSelect}
            onUpdateEngagement={onUpdateEngagement}
          />
        ))}
      </div>
    </div>
  );
};
