import React from 'react';
import { Reel } from '../lib/types';
import { ReelCard } from './ReelCard';
import { Sparkles, CheckSquare, Square, RefreshCcw } from 'lucide-react';

interface ReelGridProps {
  reels: Reel[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const ReelGrid: React.FC<ReelGridProps> = ({
  reels,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onAnalyze,
  isAnalyzing,
}) => {
  const allSelected = selectedIds.length === reels.length;

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Student Reel Feed History</h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {selectedIds.length} of {reels.length} Selected
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Click any card or toggle checkboxes to test partial session permutations against the AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            {allSelected ? (
              <>
                <Square className="h-4 w-4 text-slate-400" /> Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 text-indigo-600" /> Select All
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || selectedIds.length === 0}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>Inferring Intent...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze My Interests</span>
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
          />
        ))}
      </div>
    </div>
  );
};
