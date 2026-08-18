import React from 'react';
import { Reel } from '../lib/types';
import { ReelCard } from './ReelCard';
import { Sparkles, CheckSquare, Square, RefreshCcw, Film } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Action Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Film className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Student Watched Reel Feed</h3>
            <span className="rounded-md bg-indigo-50/80 px-2 py-0.5 text-xs font-bold text-indigo-700 font-mono border border-indigo-100/70">
              {selectedIds.length}/{reels.length} Active
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Click cards to select/deselect or use the <strong className="text-slate-700">Simulate</strong> buttons to test live intent changes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
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
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin text-yellow-300" />
                <span>Inferring Intent...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-yellow-300" />
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
