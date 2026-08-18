import React, { useState, useEffect } from 'react';
import { CatalogReel } from '../lib/types';
import { X, Search, Filter, AlertTriangle, CheckCircle, Database, ShieldAlert, Sparkles } from 'lucide-react';

interface CatalogModalProps {
  catalog: CatalogReel[];
  isOpen: boolean;
  onClose: () => void;
  selectedId?: string;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  catalog,
  isOpen,
  onClose,
  selectedId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['ALL', 'HLD', 'DSA', 'AI', 'Java', 'Cloud', 'Hardware', 'Career', 'Cybersecurity', 'Other'];

  const filtered = catalog.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fadeIn"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xs">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <h3 id="catalog-modal-title" className="text-base font-extrabold text-slate-900">
                Curated Tech Reel Recommendation Catalog
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {catalog.length} candidate educational reels • 3 deliberate anti-hype test distractors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close catalog modal"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog titles, tags, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden shadow-2xs"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog List Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No matching tech reels found for "{searchQuery}".
            </div>
          ) : (
            filtered.map((item) => {
              const isSelectedWinner = selectedId === item.id;
              const isHype = item.is_hype_distractor;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${
                    isSelectedWinner
                      ? 'border-emerald-400 bg-emerald-50/50 shadow-glow-emerald/15 ring-2 ring-emerald-500/30'
                      : isHype
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl shadow-2xs">
                      {item.iconEmoji || '🎯'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {item.id}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                          {item.category}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {item.difficulty}
                        </span>

                        {isHype && (
                          <span className="flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800 uppercase tracking-tight">
                            <ShieldAlert className="h-3 w-3" /> Hype Distractor
                          </span>
                        )}

                        {isSelectedWinner && (
                          <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-tight shadow-xs">
                            <Sparkles className="h-3 w-3" /> Active Winner
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.description}</p>

                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
