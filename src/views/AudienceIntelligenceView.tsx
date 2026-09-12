import React from 'react';
import { Users, UserPlus, TrendingUp, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { SimpleLineChart } from '../components/charts/SimpleLineChart';
import { EmptyState } from '../components/common/EmptyState';
import { formatTimelineLabel } from '../services/filterEngine';

export const AudienceIntelligenceView: React.FC<{ onOpenAddModal: () => void }> = ({
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Intelijen Audiens</h2>
          </div>
          <p className="text-xs text-slate-400">
            Kecepatan akuisisi pengikut, kontribusi saluran, dan akselerasi audiens untuk rentang {activeTimelineLabel}
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400 font-bold">
          +{currentKPIs.followersGained.toLocaleString('id-ID')} Pengikut Baru Bersih
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Pengikut Baru Bersih"
          value={currentKPIs.followersGained}
          growth={growth.followersGained}
          icon={<UserPlus className="w-5 h-5 text-emerald-400" />}
        />
        <KpiCard
          label="Akun Unik Terjangkau (Reach)"
          value={currentKPIs.reach}
          growth={growth.reach}
          icon={<Users className="w-5 h-5 text-cyan-400" />}
        />
        <KpiCard
          label="Total Titik Temu Konten"
          value={currentKPIs.contentCount}
          growth={growth.contentCount}
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
        />
      </div>

      {!hasData ? (
        <EmptyState
          title="Tidak Ada Catatan Pertumbuhan Audiens"
          description="Intelijen audiens dihitung langsung dari data pertambahan pengikut yang tercatat pada postingan konten Anda."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Konten"
        />
      ) : (
        <>
          {/* Growth Trend */}
          <SimpleLineChart
            data={timeSeriesData}
            metricKey="followersGained"
            title="Kurva Pertambahan Pengikut Harian"
            color="#10b981"
            height={220}
          />

          {/* Platform Contribution to Audience Growth */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Pertumbuhan Audiens Berdasarkan Saluran
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Porsi kontribusi perolehan pengikut baru di setiap ekosistem media sosial
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformPerformance.map((p) => {
                const totalFollowers = currentKPIs.followersGained || 1;
                const sharePct = totalFollowers > 0 ? (p.followersGained / totalFollowers) * 100 : 0;

                return (
                  <div key={p.platform} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">{p.platform}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        +{p.followersGained.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.max(2, sharePct)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Porsi Audiens:</span>
                      <span className="font-mono text-slate-300 font-semibold">{sharePct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demographic Data Notice - Strictly Following Prompt Rule */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-blue-400 shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                Demografi Audiens & Rincian Persona
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong>Data Demografi Belum Tersedia.</strong> Sesuai dengan prinsip arsitektur berbasis data nyata, data demografi (kelompok usia, rasio gender, sebaran wilayah) tidak dimanipulasi atau dibuat-buat secara sembarangan. Untuk meninjau demografi mendalam, impor file CSV/XLSX yang memuat data analitik demografi resmi dari masing-masing platform.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
