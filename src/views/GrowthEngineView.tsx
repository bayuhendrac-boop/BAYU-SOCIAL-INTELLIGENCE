import React from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/EmptyState';
import { TimelinePeriod } from '../types';
import { formatTimelineLabel } from '../services/filterEngine';

const TIMELINES: TimelinePeriod[] = ['Today', '7 Days', '14 Days', '30 Days', '60 Days', '90 Days', 'All Time'];

export const GrowthEngineView: React.FC<{ onOpenAddModal: () => void }> = ({ onOpenAddModal }) => {
  const {
    currentKPIs,
    previousKPIs,
    growth,
    timelinePeriod,
    setTimelinePeriod,
    currentPeriodItems,
    previousPeriodItems,
  } = useApp();

  const hasData = currentPeriodItems.length > 0 || previousPeriodItems.length > 0;
  const activeTimelineLabel = formatTimelineLabel(timelinePeriod);

  const metricsTable = [
    {
      name: 'Total Tayangan / Pemutaran (Views)',
      current: currentKPIs.views,
      previous: previousKPIs.views,
      growth: growth.views,
    },
    {
      name: 'Total Jangkauan (Akun Unik)',
      current: currentKPIs.reach,
      previous: previousKPIs.reach,
      growth: growth.reach,
    },
    {
      name: 'Total Interaksi (Suka + Komentar + Bagikan + Simpan)',
      current: currentKPIs.engagement,
      previous: previousKPIs.engagement,
      growth: growth.engagement,
    },
    {
      name: 'Pengikut Baru (Bersih)',
      current: currentKPIs.followersGained,
      previous: previousKPIs.followersGained,
      growth: growth.followersGained,
    },
    {
      name: 'Jumlah Konten Diterbitkan',
      current: currentKPIs.contentCount,
      previous: previousKPIs.contentCount,
      growth: growth.contentCount,
    },
    {
      name: 'Rata-rata Rasio Interaksi (%)',
      current: currentKPIs.engagementRate,
      previous: previousKPIs.engagementRate,
      growth: growth.engagementRate,
      isRate: true,
    },
  ];

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case 'positive':
        return 'Positif';
      case 'negative':
        return 'Negatif';
      case 'neutral':
        return 'Netral';
      case 'new':
        return 'Baru';
      case 'no-data':
      default:
        return 'Tanpa Acuan';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold text-white">Mesin Pertumbuhan (Growth Engine)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Komparasi matematis periode berjalan vs periode sebelumnya: <code>((Saat Ini - Sebelumnya) / Sebelumnya) × 100</code>
          </p>
        </div>

        {/* Live Timeline Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1.5 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-blue-400 ml-2" />
          <span className="text-xs font-semibold text-slate-400">Rentang:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {TIMELINES.map((t) => (
              <button
                key={t}
                onClick={() => setTimelinePeriod(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  timelinePeriod === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {formatTimelineLabel(t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Period Explanation Banner */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-blue-300">
            <Layers className="w-4 h-4" />
            <span>Pencocokan Jendela Durasi Berimbang</span>
          </div>
          <p className="text-slate-400">
            {timelinePeriod === 'All Time' ? (
              'Mode Semua Waktu mencerminkan seluruh riwayat database tanpa dasar pembanding periode lampau.'
            ) : (
              <>
                Rentang saat ini {activeTimelineLabel} ({currentPeriodItems.length} konten) dibandingkan secara presisi terhadap {activeTimelineLabel} sebelumnya ({previousPeriodItems.length} konten).
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700 shrink-0">
          <span className="text-blue-400">Saat Ini: {currentPeriodItems.length} postingan</span>
          <span className="text-slate-600">vs</span>
          <span className="text-slate-400">Sebelumnya: {previousPeriodItems.length} postingan</span>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="Tidak Ada Data untuk Komparasi Pertumbuhan"
          description="Mesin pertumbuhan membutuhkan data catatan riil untuk menghitung persentase pertumbuhan antar periode."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Konten"
        />
      ) : (
        <>
          {/* Main Growth Calculations Table */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Rincian Pertumbuhan Periode-ke-Periode ({activeTimelineLabel})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Metrik</th>
                    <th className="pb-3 font-semibold text-right">Periode Saat Ini</th>
                    <th className="pb-3 font-semibold text-right">Periode Sebelumnya</th>
                    <th className="pb-3 font-semibold text-right">Selisih Mutlak</th>
                    <th className="pb-3 font-semibold text-right">Pertumbuhan %</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {metricsTable.map((m) => {
                    const diff = m.current - m.previous;
                    const formattedDiff = m.isRate
                      ? (diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`)
                      : (diff >= 0 ? `+${diff.toLocaleString('id-ID')}` : `${diff.toLocaleString('id-ID')}`);

                    return (
                      <tr key={m.name} className="hover:bg-slate-700/30 transition">
                        <td className="py-3.5 font-semibold text-white">{m.name}</td>
                        <td className="py-3.5 text-right font-mono font-bold text-white">
                          {m.isRate ? `${m.current.toFixed(1)}%` : m.current.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 text-right font-mono text-slate-400">
                          {m.isRate ? `${m.previous.toFixed(1)}%` : m.previous.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 text-right font-mono text-slate-300">
                          {formattedDiff}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold">
                          {m.growth.status === 'positive' && (
                            <span className="text-emerald-400">{m.growth.displayText}</span>
                          )}
                          {m.growth.status === 'negative' && (
                            <span className="text-rose-400">{m.growth.displayText}</span>
                          )}
                          {m.growth.status === 'neutral' && (
                            <span className="text-slate-400">{m.growth.displayText}</span>
                          )}
                          {m.growth.status === 'new' && (
                            <span className="text-blue-400">Baru (Awal: 0)</span>
                          )}
                          {m.growth.status === 'no-data' && (
                            <span className="text-slate-500">Tanpa Data Pembanding</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              m.growth.status === 'positive'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : m.growth.status === 'negative'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : m.growth.status === 'new'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {getStatusBadgeText(m.growth.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Integrity & Zero Division Safeguards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Proteksi Pembagian Nol & Nilai Tak Hingga
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saat metrik periode sebelumnya adalah 0 dan periode saat ini positif, sistem menghasilkan status <strong>Baru</strong> alih-alih nilai error <code>Infinity</code> atau <code>NaN</code>. Jika kedua periode bernilai 0, sistem menghasilkan <strong>0.0%</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                Dinamisme Perhitungan Rentang Waktu
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Memilih antara <strong>7 Hari</strong>, <strong>30 Hari</strong>, dan <strong>90 Hari</strong> secara dinamis menghitung ulang rasio pertumbuhan berdasarkan batasan tanggal kalender yang akurat.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
