import React from 'react';
import { Lightbulb, Target, AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/EmptyState';
import { TimelinePeriod } from '../types';
import { formatTimelineLabel } from '../services/filterEngine';

const TIMELINES: TimelinePeriod[] = ['Today', '7 Days', '14 Days', '30 Days', '60 Days', '90 Days', 'All Time'];

export const RecommendationsView: React.FC<{ onOpenAddModal: () => void }> = ({
  onOpenAddModal,
}) => {
  const { recommendations, timelinePeriod, setTimelinePeriod, currentPeriodItems } = useApp();

  const hasData = currentPeriodItems.length > 0;
  const activeTimelineLabel = formatTimelineLabel(timelinePeriod);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-extrabold text-white">Mesin Rekomendasi Terarah (Actionable)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Deteksi anomali algoritmik, bukti empiris, dan rencana tindakan strategis untuk rentang {activeTimelineLabel}
          </p>
        </div>

        {/* Timeline Filter */}
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

      {/* Intelligence Architecture Pipeline Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between overflow-x-auto gap-4 text-xs font-semibold">
        <span className="text-slate-400 uppercase tracking-wider">DATA</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-slate-400 uppercase tracking-wider">METRIK</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-slate-400 uppercase tracking-wider">TREN</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-blue-400 uppercase tracking-wider font-bold">DETEKSI MASALAH</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-amber-400 uppercase tracking-wider font-bold">REKOMENDASI</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-emerald-400 uppercase tracking-wider font-bold">TINDAKAN NYATA</span>
      </div>

      {!hasData ? (
        <EmptyState
          title="Tidak Ada Data untuk Analisis Rekomendasi"
          description="Mesin rekomendasi membutuhkan catatan konten nyata untuk mendeteksi penurunan performa, ketimpangan saluran, dan peluang akselerasi pertumbuhan."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Konten"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isHigh = rec.priority === 'High';
            const isMedium = rec.priority === 'Medium';

            return (
              <div
                key={rec.id}
                className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition hover:border-slate-600 ${
                  isHigh
                    ? 'bg-slate-800/90 border-rose-500/30'
                    : isMedium
                    ? 'bg-slate-800/80 border-amber-500/30'
                    : 'bg-slate-800/80 border-slate-700/60'
                }`}
              >
                <div className="space-y-4">
                  {/* Category & Priority Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-700/50">
                      {rec.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isMedium
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      Prioritas {isHigh ? 'Tinggi' : isMedium ? 'Sedang' : 'Rendah'}
                    </span>
                  </div>

                  {/* Issue */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Anomali / Masalah Teridentifikasi
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {rec.issue}
                    </h3>
                  </div>

                  {/* Evidence */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Bukti Empiris
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {rec.evidence}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      Langkah Tindakan Rekomendasi
                    </div>
                    <p className="text-xs text-blue-200 leading-relaxed">
                      {rec.action}
                    </p>
                  </div>
                </div>

                {/* Target */}
                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Target className="w-3.5 h-3.5 text-emerald-400" /> Target:
                  </span>
                  <span className="font-semibold text-white text-right">{rec.target}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
