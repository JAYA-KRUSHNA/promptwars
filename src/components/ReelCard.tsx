import React from 'react';
import { Reel } from '../lib/types';
import { Heart, Share2, Eye, FastForward, CheckSquare, Square } from 'lucide-react';

interface ReelCardProps {
  reel: Reel;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  index: number;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isSelected,
  onToggleSelect,
  index,
}) => {
  const isSkipped = reel.engagement.skipped_early || reel.engagement.watch_percent < 30;

  const formatColor: Record<string, string> = {
    meme: 'bg-amber-50 text-amber-700 border-amber-200',
    vlog: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    skit: 'bg-purple-50 text-purple-700 border-purple-200',
    comparison: 'bg-blue-50 text-blue-700 border-blue-200',
    news: 'bg-rose-50 text-rose-700 border-rose-200',
    tutorial: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    explainer: 'bg-teal-50 text-teal-700 border-teal-200',
    podcast: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return (
    <div
      onClick={() => onToggleSelect(reel.id)}
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 transition-all cursor-pointer shadow-xs ${
        isSelected
          ? 'border-indigo-500/80 ring-2 ring-indigo-500/20'
          : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Top bar: Format, Category & Checkbox */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex h-5 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">
              #{index + 1}
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                formatColor[reel.format] || 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {reel.format}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {reel.category}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(reel.id);
            }}
            className="text-slate-400 hover:text-indigo-600 focus:outline-hidden"
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-indigo-600" />
            ) : (
              <Square className="h-5 w-5 text-slate-300" />
            )}
          </button>
        </div>

        {/* Title and Thumbnail */}
        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl shadow-inner">
            {reel.emoji || '🎬'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
              {reel.title}
            </h4>
          </div>
        </div>

        {/* Caption snippet */}
        <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
          "{reel.transcript_or_caption}"
        </p>

        {/* Hashtags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {reel.hashtags.map((tag) => (
            <span key={tag} className="text-[10px] text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Engagement Telemetry */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <span className="font-medium">Watch Completion</span>
          <span
            className={`font-bold ${
              isSkipped ? 'text-rose-600' : reel.engagement.watch_percent >= 85 ? 'text-emerald-600' : 'text-slate-700'
            }`}
          >
            {reel.engagement.watch_percent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all rounded-full ${
              isSkipped
                ? 'bg-rose-500'
                : reel.engagement.watch_percent >= 85
                ? 'bg-emerald-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, reel.engagement.watch_percent))}%` }}
          />
        </div>

        {/* Engagement Badges */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            {reel.engagement.liked && (
              <span className="flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                <Heart className="h-3 w-3 fill-rose-600" /> Liked
              </span>
            )}
            {reel.engagement.shared && (
              <span className="flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                <Share2 className="h-3 w-3" /> Shared
              </span>
            )}
            {reel.engagement.rewatch_count > 0 && (
              <span className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                <Eye className="h-3 w-3" /> +{reel.engagement.rewatch_count} rewatch
              </span>
            )}
          </div>

          {isSkipped && (
            <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
              <FastForward className="h-3 w-3" /> Skipped Early
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
