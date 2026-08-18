import React from 'react';
import { Reel } from '../lib/types';
import { Heart, Eye, FastForward, CheckSquare, Square } from 'lucide-react';

interface ReelCardProps {
  reel: Reel;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateEngagement?: (id: string, updated: Partial<Reel['engagement']>) => void;
  index: number;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isSelected,
  onToggleSelect,
  onUpdateEngagement,
  index,
}) => {
  const isSkipped = reel.engagement.skipped_early || reel.engagement.watch_percent < 30;

  const formatColor: Record<string, string> = {
    meme: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
    vlog: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60',
    skit: 'bg-purple-50/80 text-purple-700 border-purple-200/60',
    comparison: 'bg-blue-50/80 text-blue-700 border-blue-200/60',
    news: 'bg-rose-50/80 text-rose-700 border-rose-200/60',
    tutorial: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60',
    explainer: 'bg-teal-50/80 text-teal-700 border-teal-200/60',
    podcast: 'bg-cyan-50/80 text-cyan-700 border-cyan-200/60',
  };

  const handleSetWatch = (e: React.MouseEvent, pct: number, skip = false) => {
    e.stopPropagation();
    if (onUpdateEngagement) {
      onUpdateEngagement(reel.id, {
        watch_percent: pct,
        skipped_early: skip,
      });
    }
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateEngagement) {
      onUpdateEngagement(reel.id, {
        liked: !reel.engagement.liked,
      });
    }
  };

  const handleToggleRewatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateEngagement) {
      const nextRewatch = reel.engagement.rewatch_count > 0 ? 0 : 1;
      onUpdateEngagement(reel.id, {
        rewatch_count: nextRewatch,
      });
    }
  };

  return (
    <div
      onClick={() => onToggleSelect(reel.id)}
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'border-indigo-600 bg-white shadow-soft ring-1 ring-indigo-600/20'
          : 'border-slate-200/80 bg-white/70 opacity-75 hover:opacity-100 hover:border-slate-300 hover:bg-white shadow-2xs'
      }`}
    >
      <div>
        {/* Top bar: Format, Category & Checkbox */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex h-5 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500 font-mono">
              #{index + 1}
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                formatColor[reel.format] || 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {reel.format}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {reel.category}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(reel.id);
            }}
            className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-hidden"
          >
            {isSelected ? (
              <CheckSquare className="h-4.5 w-4.5 text-indigo-600" />
            ) : (
              <Square className="h-4.5 w-4.5 text-slate-300" />
            )}
          </button>
        </div>

        {/* Title and Icon */}
        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-2xl shadow-2xs">
            {reel.emoji || '🎬'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
              {reel.title}
            </h4>
          </div>
        </div>

        {/* Caption snippet */}
        <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-normal">
          "{reel.transcript_or_caption}"
        </p>

        {/* Hashtags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {reel.hashtags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Engagement Telemetry & Simulator Controls */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <span className="text-[11px] font-medium text-slate-500">Watch Retention</span>
          <span
            className={`font-bold font-mono text-[11px] ${
              isSkipped ? 'text-rose-600' : reel.engagement.watch_percent >= 85 ? 'text-emerald-600' : 'text-slate-700'
            }`}
          >
            {reel.engagement.watch_percent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isSkipped
                ? 'bg-rose-500'
                : reel.engagement.watch_percent >= 85
                ? 'bg-emerald-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, reel.engagement.watch_percent))}%` }}
          />
        </div>

        {/* Quick Watch Time Presets */}
        {onUpdateEngagement && (
          <div className="mt-2.5 flex items-center justify-between gap-1 text-[10px]">
            <span className="text-slate-400 font-medium text-[9px] uppercase tracking-wider">Simulate:</span>
            <div className="flex items-center gap-1 font-medium">
              <button
                type="button"
                onClick={(e) => handleSetWatch(e, 15, true)}
                className={`px-1.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  isSkipped
                    ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                    : 'bg-slate-50 text-slate-500 border-slate-200/80 hover:bg-slate-100'
                }`}
                title="Simulate user skipping early (<30%)"
              >
                15% Skip
              </button>
              <button
                type="button"
                onClick={(e) => handleSetWatch(e, 50, false)}
                className={`px-1.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  reel.engagement.watch_percent >= 40 && reel.engagement.watch_percent <= 65 && !isSkipped
                    ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                    : 'bg-slate-50 text-slate-500 border-slate-200/80 hover:bg-slate-100'
                }`}
                title="Simulate 50% partial watch"
              >
                50%
              </button>
              <button
                type="button"
                onClick={(e) => handleSetWatch(e, 100, false)}
                className={`px-1.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  reel.engagement.watch_percent >= 90
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                    : 'bg-slate-50 text-slate-500 border-slate-200/80 hover:bg-slate-100'
                }`}
                title="Simulate 100% full completion"
              >
                100% Full
              </button>
            </div>
          </div>
        )}

        {/* Engagement Action Badges */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleLike}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                reel.engagement.liked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-400 border border-slate-200/70 hover:text-slate-600'
              }`}
              title="Toggle Liked Telemetry"
            >
              <Heart className={`h-3 w-3 ${reel.engagement.liked ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{reel.engagement.liked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleRewatch}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                reel.engagement.rewatch_count > 0
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-400 border border-slate-200/70 hover:text-slate-600'
              }`}
              title="Toggle Rewatch (+1)"
            >
              <Eye className="h-3 w-3" />
              <span>+{reel.engagement.rewatch_count}</span>
            </button>
          </div>

          {isSkipped && (
            <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md text-[10px]">
              <FastForward className="h-3 w-3" /> Skipped
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
