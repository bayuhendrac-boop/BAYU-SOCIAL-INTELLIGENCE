import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Trophy,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Eye,
  Heart,
  Users,
  Share2,
  Bookmark,
  MessageSquare,
  BarChart2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/EmptyState';
import { ContentItem } from '../types';
import { formatTimelineLabel } from '../services/filterEngine';

type SortMetric = 'views' | 'reach' | 'engagement' | 'engagementRate' | 'shares' | 'saves' | 'comments';

export const ContentIntelligenceView: React.FC<{ onOpenAddModal: () => void }> = ({
  onOpenAddModal,
}) => {
  const { currentPeriodItems, contentTypePerformance, timelinePeriod, currentKPIs } = useApp();
  const [sortMetric, setSortMetric] = useState<SortMetric>('views');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const hasData = currentPeriodItems.length > 0;
  const activeTimelineLabel = formatTimelineLabel(timelinePeriod);

  // Calculate engagement & rate for each item
  const enrichedItems = useMemo(() => {
    return currentPeriodItems.map((item) => {
      const eng = (item.likes || 0) + (item.comments || 0) + (item.shares || 0) + (item.saves || 0);
      const er = item.reach > 0 ? (eng / item.reach) * 100 : item.views > 0 ? (eng / item.views) * 100 : 0;
      return {
        ...item,
        computedEngagement: eng,
        computedER: Math.round(er * 100) / 100,
      };
    });
  }, [currentPeriodItems]);

  // Filtered by format
  const filteredItems = useMemo(() => {
    if (formatFilter === 'all') return enrichedItems;
    return enrichedItems.filter((it) => it.contentType === formatFilter);
  }, [enrichedItems, formatFilter]);

  // Sorted list
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortMetric === 'views') {
        valA = a.views;
        valB = b.views;
      } else if (sortMetric === 'reach') {
        valA = a.reach;
        valB = b.reach;
      } else if (sortMetric === 'engagement') {
        valA = a.computedEngagement;
        valB = b.computedEngagement;
      } else if (sortMetric === 'engagementRate') {
        valA = a.computedER;
        valB = b.computedER;
      } else if (sortMetric === 'shares') {
        valA = a.shares;
        valB = b.shares;
      } else if (sortMetric === 'saves') {
        valA = a.saves;
        valB = b.saves;
      } else if (sortMetric === 'comments') {
        valA = a.comments;
        valB = b.comments;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [filteredItems, sortMetric, sortOrder]);

  const topPerformer = enrichedItems.length > 0 ? [...enrichedItems].sort((a, b) => b.views - a.views)[0] : null;
  const worstPerformer = enrichedItems.length > 1 ? [...enrichedItems].sort((a, b) => a.views - b.views)[0] : null;

  const avgViewsPerPost = hasData ? Math.round(currentKPIs.views / currentPeriodItems.length) : 0;
  const avgEngagementPerPost = hasData ? Math.round(currentKPIs.engagement / currentPeriodItems.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">Mesin Intelijen Konten</h2>
          </div>
          <p className="text-xs text-slate-400">
            Peringkat algoritmik, efisiensi format, dan identifikasi performa terbaik untuk rentang {activeTimelineLabel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
            {currentPeriodItems.length} Aset Konten
          </span>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="Tidak Ada Konten untuk Dianalisis"
          description="Intelijen konten membutuhkan data postingan riil yang tersimpan untuk menghitung performa teratas dan tolok ukur format."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Konten"
        />
      ) : (
        <>
          {/* Benchmarks & Extremes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Top Asset */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Konten Terbaik (Tayangan)
                </span>
                <span className="text-[10px] text-slate-400">{topPerformer?.platform}</span>
              </div>
              <div className="text-sm font-bold text-white line-clamp-1 mb-2">
                {topPerformer?.title}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Tayangan: <strong className="text-white font-mono">{topPerformer?.views.toLocaleString('id-ID')}</strong></span>
                <span>Rasio: <strong className="text-emerald-400 font-mono">{topPerformer?.computedER.toFixed(1)}%</strong></span>
              </div>
            </div>

            {/* Worst / Needs Improvement Asset */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Butuh Optimasi (Jangkauan Terendah)
                </span>
                <span className="text-[10px] text-slate-400">{worstPerformer?.platform}</span>
              </div>
              <div className="text-sm font-bold text-white line-clamp-1 mb-2">
                {worstPerformer?.title || 'N/A'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Tayangan: <strong className="text-white font-mono">{worstPerformer?.views.toLocaleString('id-ID') || 0}</strong></span>
                <span>Rasio: <strong className="text-slate-300 font-mono">{worstPerformer?.computedER.toFixed(1) || 0}%</strong></span>
              </div>
            </div>

            {/* Average Views Benchmark */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-400" /> Rata-rata Tayangan / Konten
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mb-1">
                {avgViewsPerPost.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-400">Distribusi rata-rata pada timeline aktif</p>
            </div>

            {/* Average Interactions Benchmark */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" /> Rata-rata Interaksi / Konten
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mb-1">
                {avgEngagementPerPost.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-400">Total likes, komentar, share, & simpan</p>
            </div>
          </div>

          {/* Format Intelligence Table */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Perbandingan Kinerja Format Konten
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Format</th>
                    <th className="pb-3 font-semibold text-right">Volume</th>
                    <th className="pb-3 font-semibold text-right">Total Tayangan</th>
                    <th className="pb-3 font-semibold text-right">Rata-rata Tayangan</th>
                    <th className="pb-3 font-semibold text-right">Total Jangkauan</th>
                    <th className="pb-3 font-semibold text-right">Rata-rata Rasio Interaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {contentTypePerformance.map((ct) => (
                    <tr key={ct.contentType} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 font-semibold text-white">{ct.contentType}</td>
                      <td className="py-3 text-right font-mono text-slate-300">{ct.contentCount}</td>
                      <td className="py-3 text-right font-mono text-slate-300">{ct.views.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-right font-mono text-blue-400 font-bold">
                        {ct.avgViews.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">{ct.reach.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-bold">
                        {ct.avgEngagementRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ranked Content Table with Controls */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Daftar Konten Terurut Berdasarkan Kinerja
                </h3>
                <p className="text-xs text-slate-400">
                  Urutkan dan evaluasi efisiensi setiap konten terhadap metrik kunci
                </p>
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">Semua Format</option>
                    <option value="Shorts" className="bg-slate-900">Shorts</option>
                    <option value="Reels" className="bg-slate-900">Reels</option>
                    <option value="Video" className="bg-slate-900">Video</option>
                    <option value="Photo" className="bg-slate-900">Foto (Photo)</option>
                    <option value="Post" className="bg-slate-900">Postingan</option>
                    <option value="Live" className="bg-slate-900">Siaran Langsung</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                  <span className="text-slate-400">Urutkan:</span>
                  <select
                    value={sortMetric}
                    onChange={(e) => setSortMetric(e.target.value as SortMetric)}
                    className="bg-transparent text-blue-400 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="views" className="bg-slate-900">Tayangan (Views)</option>
                    <option value="reach" className="bg-slate-900">Jangkauan (Reach)</option>
                    <option value="engagement" className="bg-slate-900">Total Interaksi</option>
                    <option value="engagementRate" className="bg-slate-900">Rasio Interaksi (ER)</option>
                    <option value="shares" className="bg-slate-900">Dibagikan (Shares)</option>
                    <option value="saves" className="bg-slate-900">Disimpan (Saves)</option>
                    <option value="comments" className="bg-slate-900">Komentar</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="text-slate-400 hover:text-white ml-1 p-0.5"
                    title={sortOrder === 'desc' ? 'Urutan Menurun' : 'Urutan Menaik'}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Judul / Konten</th>
                    <th className="pb-3 font-semibold">Saluran</th>
                    <th className="pb-3 font-semibold">Format</th>
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 font-semibold text-right">Tayangan</th>
                    <th className="pb-3 font-semibold text-right">Jangkauan</th>
                    <th className="pb-3 font-semibold text-right">Interaksi</th>
                    <th className="pb-3 font-semibold text-right">Rasio Interaksi</th>
                    <th className="pb-3 font-semibold text-right">Dibagikan</th>
                    <th className="pb-3 font-semibold text-right">Disimpan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sortedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 font-medium text-white max-w-xs truncate pr-4">
                        <span className="text-slate-500 font-mono mr-2">#{idx + 1}</span>
                        {item.title}
                      </td>
                      <td className="py-3 font-semibold text-slate-300">{item.platform}</td>
                      <td className="py-3 text-slate-400">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700/50 text-slate-300">
                          {item.contentType}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">{item.date}</td>
                      <td className="py-3 text-right font-mono text-white font-bold">
                        {item.views.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {item.reach.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {item.computedEngagement.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-bold">
                        {item.computedER.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">{item.shares.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-right font-mono text-slate-400">{item.saves.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
