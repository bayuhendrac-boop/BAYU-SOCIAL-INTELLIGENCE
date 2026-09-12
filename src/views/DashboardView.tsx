import React from 'react';
import {
  Eye,
  Users,
  Heart,
  UserPlus,
  FileSpreadsheet,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Youtube,
  Instagram,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { SimpleLineChart } from '../components/charts/SimpleLineChart';
import { EmptyState } from '../components/common/EmptyState';
import { SocialPlatform } from '../types';
import { formatTimelineLabel } from '../services/filterEngine';

interface DashboardViewProps {
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddModal }) => {
  const {
    currentKPIs,
    growth,
    currentPeriodItems,
    timelinePeriod,
    platformPerformance,
    timeSeriesData,
    recommendations,
    setActiveRoute,
  } = useApp();

  const hasData = currentPeriodItems.length > 0;
  const activeTimelineLabel = formatTimelineLabel(timelinePeriod);

  const renderPlatformIcon = (p: SocialPlatform) => {
    switch (p) {
      case 'YouTube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'TikTok':
        return <span className="font-bold text-xs text-teal-400">TT</span>;
      case 'Facebook':
        return <span className="font-bold text-xs text-blue-400">FB</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300">
              Filter Rentang Waktu Aktif: <strong className="text-blue-400">{activeTimelineLabel}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Metrik & persentase pertumbuhan dihitung murni dari data catatan nyata yang tersimpan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            {currentPeriodItems.length} konten terbit pada rentang ini
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
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
          title="Belum Ada Data untuk Rentang Waktu Ini"
          description="Saat ini belum ada catatan dalam filter rentang waktu yang dipilih. Tambahkan konten manual atau impor file CSV/XLSX analitik Anda untuk membuka seluruh fitur intelijen."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Pertama"
        />
      ) : (
        <>
          {/* Main Charts & Trend Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SimpleLineChart
                data={timeSeriesData}
                metricKey="views"
                title="Kecepatan Tayangan & Impresi Harian"
                color="#3b82f6"
                height={240}
              />

              <SimpleLineChart
                data={timeSeriesData}
                metricKey="engagement"
                title="Tren Interaksi & Keterlibatan Harian"
                color="#ec4899"
                height={220}
              />
            </div>

            {/* Quick Intelligence & Recommendations Highlight */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Sorotan Intelijen
                    </span>
                    <button
                      onClick={() => setActiveRoute('intelligence-recommendations')}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {recommendations.length > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-white leading-snug">
                            {recommendations[0].issue}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              recommendations[0].priority === 'High'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {recommendations[0].priority === 'High' ? 'Tinggi' : recommendations[0].priority === 'Medium' ? 'Sedang' : 'Rendah'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                          {recommendations[0].evidence}
                        </p>
                        <div className="text-[11px] text-blue-300 font-medium bg-blue-950/40 p-2 rounded-lg border border-blue-800/30">
                          <strong>Tindakan:</strong> {recommendations[0].action}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Tidak ada peringatan kritis terdeteksi.</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
                  <span>Tingkat Interaksi (Eng. Rate):</span>
                  <span className="font-bold text-white font-mono">
                    {currentKPIs.engagementRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Quick Platform Leaderboard */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Peringkat Saluran
                  </h4>
                  <span className="text-[11px] text-slate-400">Skor Tolok Ukur (0-100)</span>
                </div>

                <div className="space-y-2.5">
                  {platformPerformance.map((p) => (
                    <div
                      key={p.platform}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          #{p.rank}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {renderPlatformIcon(p.platform)}
                          <span className="text-xs font-semibold text-slate-200">
                            {p.platform}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {p.contentCount} postingan
                        </span>
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.max(4, p.score)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-blue-400 font-mono w-7 text-right">
                          {p.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Platform Performance Table */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Rincian Performa Saluran
                </h3>
                <p className="text-xs text-slate-400">
                  Performa komprehensif, volume interaksi, dan tolok ukur skor platform
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Saluran</th>
                    <th className="pb-3 font-semibold text-right">Diterbitkan</th>
                    <th className="pb-3 font-semibold text-right">Tayangan</th>
                    <th className="pb-3 font-semibold text-right">Jangkauan</th>
                    <th className="pb-3 font-semibold text-right">Interaksi</th>
                    <th className="pb-3 font-semibold text-right">Rasio Interaksi</th>
                    <th className="pb-3 font-semibold text-right">Pengikut Baru</th>
                    <th className="pb-3 font-semibold text-right">Peringkat / Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {platformPerformance.map((p) => (
                    <tr key={p.platform} className="hover:bg-slate-700/30 transition">
                      <td className="py-3.5 font-medium text-white flex items-center gap-2">
                        {renderPlatformIcon(p.platform)}
                        <span>{p.platform}</span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-300">
                        {p.contentCount}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-300 font-semibold">
                        {p.views.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-300">
                        {p.reach.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-300">
                        {p.engagement.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 text-right font-mono text-blue-400 font-bold">
                        {p.engagementRate.toFixed(1)}%
                      </td>
                      <td className="py-3.5 text-right font-mono text-emerald-400 font-semibold">
                        +{p.followersGained.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          #{p.rank} • {p.score} poin
                        </span>
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
