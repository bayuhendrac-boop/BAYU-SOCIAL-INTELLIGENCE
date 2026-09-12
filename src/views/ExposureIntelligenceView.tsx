import React from 'react';
import { Radio, Eye, Users, TrendingUp, BarChart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { SimpleLineChart } from '../components/charts/SimpleLineChart';
import { EmptyState } from '../components/common/EmptyState';
import { formatTimelineLabel } from '../services/filterEngine';

export const ExposureIntelligenceView: React.FC<{ onOpenAddModal: () => void }> = ({
  onOpenAddModal,
}) => {
  const {
    currentKPIs,
    growth,
    currentPeriodItems,
    timelinePeriod,
    platformPerformance,
    timeSeriesData,
  } = useApp();

  const hasData = currentPeriodItems.length > 0;
  const activeTimelineLabel = formatTimelineLabel(timelinePeriod);

  const reachToViewRatio =
    currentKPIs.views > 0
      ? Math.round((currentKPIs.reach / currentKPIs.views) * 1000) / 10
      : 0;

  const avgViewsPerPost =
    currentPeriodItems.length > 0 ? Math.round(currentKPIs.views / currentPeriodItems.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white">Intelijen Eksposur & Distribusi</h2>
          </div>
          <p className="text-xs text-slate-400">
            Mengevaluasi jangkauan algoritmik, total tayangan impresi, dan penetrasi konten organik untuk rentang {activeTimelineLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400 font-bold">
            Rasio Jangkauan/Tayangan: {reachToViewRatio.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Tayangan (Views)"
          value={currentKPIs.views}
          growth={growth.views}
          icon={<Eye className="w-5 h-5 text-blue-400" />}
        />
        <KpiCard
          label="Jangkauan Unik (Reach)"
          value={currentKPIs.reach}
          growth={growth.reach}
          icon={<Users className="w-5 h-5 text-cyan-400" />}
        />
        <KpiCard
          label="Rata-rata Tayangan / Konten"
          value={avgViewsPerPost}
          icon={<BarChart className="w-5 h-5 text-purple-400" />}
        />
        <KpiCard
          label="Rasio Jangkauan vs Tayangan"
          value={`${reachToViewRatio.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {!hasData ? (
        <EmptyState
          title="Tidak Ada Data Eksposur Tersedia"
          description="Catat metrik tayangan dan jangkauan pada konten terbitan Anda untuk memvisualisasikan penetrasi distribusi."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Konten"
        />
      ) : (
        <>
          {/* Daily Exposure Trend */}
          <SimpleLineChart
            data={timeSeriesData}
            metricKey="reach"
            title="Tren Jangkauan Unik Harian"
            color="#06b6d4"
            height={220}
          />

          {/* Platform Contribution to Exposure */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Kontribusi Eksposur Berdasarkan Saluran
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Rincian total tayangan impresi dan jangkauan unik di setiap saluran media sosial
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformPerformance.map((p) => {
                const totalViews = currentKPIs.views || 1;
                const viewShare = totalViews > 0 ? (p.views / totalViews) * 100 : 0;

                return (
                  <div key={p.platform} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">{p.platform}</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {p.views.toLocaleString('id-ID')} tayangan
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.max(2, viewShare)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Porsi Eksposur:</span>
                      <span className="font-mono text-slate-300 font-semibold">{viewShare.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
