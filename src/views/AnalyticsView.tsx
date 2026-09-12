import React from 'react';
import {
  Eye,
  Users,
  Heart,
  UserPlus,
  FileSpreadsheet,
  Share2,
  Bookmark,
  MessageSquare,
  Sparkles,
  Youtube,
  Instagram,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { SimpleLineChart } from '../components/charts/SimpleLineChart';
import { EmptyState } from '../components/common/EmptyState';
import { SocialPlatform } from '../types';
import { formatTimelineLabel } from '../services/filterEngine';

interface AnalyticsViewProps {
  platformFilter?: SocialPlatform | 'all';
  onOpenAddModal: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  platformFilter = 'all',
  onOpenAddModal,
}) => {
  const {
    currentKPIs,
    growth,
    currentPeriodItems,
    timelinePeriod,
    contentTypePerformance,
    timeSeriesData,
  } = useApp();

  const hasData = currentPeriodItems.length > 0;
  const activeTimelineLabel = formatTimelineLabel(timelinePeriod);

  const platformTitle =
    platformFilter === 'all'
      ? 'Ikhtisar Analitik Lintas Platform'
      : `Analisis Mendalam ${platformFilter}`;

  const renderPlatformBadge = () => {
    if (platformFilter === 'YouTube') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
          <Youtube className="w-4 h-4" /> Saluran YouTube
        </span>
      );
    }
    if (platformFilter === 'Instagram') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
          <Instagram className="w-4 h-4" /> Akun Instagram
        </span>
      );
    }
    if (platformFilter === 'TikTok') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
          <span className="font-black">TT</span> Profil TikTok
        </span>
      );
    }
    if (platformFilter === 'Facebook') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="font-black">FB</span> Halaman Facebook
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        <Filter className="w-3.5 h-3.5" /> Gabungan Semua Saluran
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-extrabold text-white">{platformTitle}</h2>
            {renderPlatformBadge()}
          </div>
          <p className="text-xs text-slate-400">
            Mengevaluasi kinerja untuk rentang {activeTimelineLabel} murni berdasarkan data terverifikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-mono text-slate-300 border border-slate-700">
            {currentPeriodItems.length} Konten Dianalisis
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total Tayangan (Views)"
          value={currentKPIs.views}
          growth={growth.views}
          icon={<Eye className="w-5 h-5" />}
        />
        <KpiCard
          label="Total Jangkauan (Reach)"
          value={currentKPIs.reach}
          growth={growth.reach}
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          label="Total Interaksi"
          value={currentKPIs.engagement}
          growth={growth.engagement}
          icon={<Heart className="w-5 h-5" />}
        />
        <KpiCard
          label="Pengikut Baru"
          value={currentKPIs.followersGained}
          growth={growth.followersGained}
          icon={<UserPlus className="w-5 h-5" />}
        />
        <KpiCard
          label="Konten Diterbitkan"
          value={currentKPIs.contentCount}
          growth={growth.contentCount}
          icon={<FileSpreadsheet className="w-5 h-5" />}
        />
      </div>

      {!hasData ? (
        <EmptyState
          title={`Tidak Ada Data Tersedia untuk ${platformFilter === 'all' ? 'Semua Saluran' : platformFilter}`}
          description={`Belum ada data konten yang tersimpan untuk filter ini pada rentang waktu ${activeTimelineLabel}. Tambahkan konten manual atau impor file analitik Anda.`}
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Konten"
        />
      ) : (
        <>
          {/* Interaction Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Total Suka (Likes)
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {currentKPIs.likes.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Komentar
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {currentKPIs.comments.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Bagikan / Repost
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {currentKPIs.shares.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" /> Disimpan (Saves)
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {currentKPIs.saves.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <SimpleLineChart
            data={timeSeriesData}
            metricKey="views"
            title={`${platformTitle} — Distribusi Tayangan Harian`}
            color="#38bdf8"
            height={220}
          />

          {/* Content Format Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Performa Berdasarkan Format Konten
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Rincian komparasi Reels, Shorts, Video, Foto, dan format lainnya dalam filter aktif
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Format Konten</th>
                    <th className="pb-3 font-semibold text-right">Jumlah</th>
                    <th className="pb-3 font-semibold text-right">Total Tayangan</th>
                    <th className="pb-3 font-semibold text-right">Rata-rata Tayangan</th>
                    <th className="pb-3 font-semibold text-right">Total Jangkauan</th>
                    <th className="pb-3 font-semibold text-right">Total Interaksi</th>
                    <th className="pb-3 font-semibold text-right">Rata-rata Rasio Interaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {contentTypePerformance.map((ct) => (
                    <tr key={ct.contentType} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 font-semibold text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-200 border border-slate-600/40">
                          {ct.contentType}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {ct.contentCount}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300 font-semibold">
                        {ct.views.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-blue-400 font-semibold">
                        {ct.avgViews.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {ct.reach.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {ct.engagement.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-bold">
                        {ct.avgEngagementRate.toFixed(1)}%
                      </td>
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
