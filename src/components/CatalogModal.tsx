import React, { useState } from 'react';
import { CatalogReel } from '../lib/types';
import { X, Search, Filter, AlertTriangle, CheckCircle, Database } from 'lucide-react';

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

  if (!isOpen) return null;

  const categories = ['ALL', 'HLD', 'DSA', 'AI', 'Java', 'Cloud', 'Hardware', 'Career', 'Cybersecurity'];

  const filtered = catalog.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Curated Tech Reel Recommendation Catalog
              </h3>
              <p className="text-xs text-slate-500">
                {catalog.length} candidate reels • 3 deliberate anti-hype test distractors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog titles, tags, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filtered.map((item) => {
            const isCurrentlySelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isCurrentlySelected
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : item.is_hype_distractor
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl shadow-inner">
                      {item.iconEmoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {item.id}
                        </span>
                        <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          {item.category}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {item.difficulty}
                        </span>
                        {item.is_hype_distractor ? (
                          <span className="flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            <AlertTriangle className="h-3 w-3" /> Hype Distractor (Test Target)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle className="h-3 w-3" /> Substantive Tech
                          </span>
                        )}
                        {isCurrentlySelected && (
                          <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            Currently Recommended
                          </span>
                        )}
                      </div>

                      <h4 className="mt-1.5 text-sm font-bold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
