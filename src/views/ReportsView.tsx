import React from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  TrendingUp,
  Award,
  Users,
  Eye,
  Heart,
  Share2,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/EmptyState';
import { formatTimelineLabel } from '../services/filterEngine';

export const ReportsView: React.FC<{ onOpenAddModal: () => void }> = ({ onOpenAddModal }) => {
  const {
    currentKPIs,
    growth,
    timelinePeriod,
    currentPeriodItems,
    platformPerformance,
    contentTypePerformance,
    recommendations,
    addToast,
  } = useApp();

  const [copied, setCopied] = React.useState(false);

  const hasData = currentPeriodItems.length > 0;
  const activeTimelineLabel = formatTimelineLabel(timelinePeriod);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# BAYU SOCIAL INTELLIGENCE — LAPORAN EKSEKUTIF
**Rentang Waktu:** ${activeTimelineLabel}
**Tanggal Pembuatan:** ${new Date().toISOString().split('T')[0]}

## 1. RINGKASAN EKSEKUTIF
- Total Aset Konten: ${currentKPIs.contentCount}
- Total Tayangan (Views): ${currentKPIs.views.toLocaleString('id-ID')} (Pertumbuhan: ${growth.views.displayText})
- Total Jangkauan (Reach): ${currentKPIs.reach.toLocaleString('id-ID')} (Pertumbuhan: ${growth.reach.displayText})
- Total Interaksi: ${currentKPIs.engagement.toLocaleString('id-ID')} (Pertumbuhan: ${growth.engagement.displayText})
- Rasio Interaksi (ER): ${currentKPIs.engagementRate.toFixed(1)}%
- Pengikut Baru (Net): +${currentKPIs.followersGained.toLocaleString('id-ID')}

## 2. PERFORMA SALURAN (PLATFORM)
${platformPerformance
  .map(
    (p) =>
      `- ${p.platform}: ${p.contentCount} postingan, ${p.views.toLocaleString('id-ID')} tayangan, ${p.engagementRate.toFixed(
        1
      )}% ER, Skor: ${p.score} (Peringkat #${p.rank})`
  )
  .join('\n')}

## 3. REKOMENDASI STRATEGIS
${recommendations.map((r, i) => `${i + 1}. [Prioritas ${r.priority === 'High' ? 'Tinggi' : r.priority === 'Medium' ? 'Sedang' : 'Rendah'}] ${r.issue} -> Tindakan: ${r.action}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    addToast('Laporan format Markdown berhasil disalin ke clipboard.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Laporan Intelijen Eksekutif</h2>
          </div>
          <p className="text-xs text-slate-400">
            Laporan ringkasan terformat untuk pemangku kepentingan, dihitung murni dari data aktif aplikasi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>Salin Markdown</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="Tidak Ada Data untuk Membuat Laporan"
          description="Laporan intelijen eksekutif membutuhkan catatan analitik media sosial pada rentang waktu yang dipilih."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Konten"
        />
      ) : (
        <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg space-y-8 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          {/* Report Header */}
          <div className="border-b border-slate-700 pb-6 print:border-gray-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white print:text-black tracking-tight uppercase">
                  BAYU SOCIAL INTELLIGENCE
                </h1>
                <p className="text-xs font-bold text-blue-400 print:text-blue-700 uppercase tracking-widest mt-0.5">
                  AUDIT PERFORMA EKSEKUTIF & DOSIR STRATEGI
                </p>
              </div>

              <div className="text-right text-xs text-slate-400 print:text-gray-600 font-mono">
                <div>Rentang Waktu: <strong className="text-white print:text-black">{activeTimelineLabel}</strong></div>
                <div>Diterbitkan: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive KPI Summary */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 print:text-gray-500 mb-3">
              1. Performa KPI Makro & Akselerasi
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 print:border-gray-300 print:bg-gray-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mb-1">
                  Total Tayangan
                </div>
                <div className="text-lg font-black text-white print:text-black font-mono">
                  {currentKPIs.views.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pertumbuhan: {growth.views.displayText}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 print:border-gray-300 print:bg-gray-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mb-1">
                  Jangkauan Unik
                </div>
                <div className="text-lg font-black text-white print:text-black font-mono">
                  {currentKPIs.reach.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pertumbuhan: {growth.reach.displayText}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 print:border-gray-300 print:bg-gray-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mb-1">
                  Interaksi
                </div>
                <div className="text-lg font-black text-white print:text-black font-mono">
                  {currentKPIs.engagement.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pertumbuhan: {growth.engagement.displayText}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 print:border-gray-300 print:bg-gray-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mb-1">
                  Rasio Interaksi
                </div>
                <div className="text-lg font-black text-emerald-400 print:text-emerald-700 font-mono">
                  {currentKPIs.engagementRate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Interaksi / Jangkauan</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 print:border-gray-300 print:bg-gray-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mb-1">
                  Pengikut Bersih
                </div>
                <div className="text-lg font-black text-white print:text-black font-mono">
                  +{currentKPIs.followersGained.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pertumbuhan: {growth.followersGained.displayText}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 print:border-gray-300 print:bg-gray-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mb-1">
                  Konten Diterbitkan
                </div>
                <div className="text-lg font-black text-white print:text-black font-mono">
                  {currentKPIs.contentCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pertumbuhan: {growth.contentCount.displayText}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Platform Breakdown */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 print:text-gray-500 mb-3">
              2. Tolok Ukur & Peringkat Saluran
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 print:border-gray-300 text-slate-400 print:text-gray-600 uppercase text-[10px]">
                    <th className="pb-2 font-bold">Saluran</th>
                    <th className="pb-2 font-bold text-right">Volume</th>
                    <th className="pb-2 font-bold text-right">Tayangan</th>
                    <th className="pb-2 font-bold text-right">Jangkauan</th>
                    <th className="pb-2 font-bold text-right">Interaksi</th>
                    <th className="pb-2 font-bold text-right">Rasio ER</th>
                    <th className="pb-2 font-bold text-right">Pengikut</th>
                    <th className="pb-2 font-bold text-right">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {platformPerformance.map((p) => (
                    <tr key={p.platform}>
                      <td className="py-2.5 font-bold text-white print:text-black">{p.platform}</td>
                      <td className="py-2.5 text-right font-mono">{p.contentCount}</td>
                      <td className="py-2.5 text-right font-mono font-semibold">{p.views.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 text-right font-mono">{p.reach.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 text-right font-mono">{p.engagement.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 text-right font-mono text-emerald-400 print:text-emerald-700 font-bold">
                        {p.engagementRate.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right font-mono">+{p.followersGained.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 text-right font-mono font-bold">
                        #{p.rank} ({p.score} poin)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Recommendations */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 print:text-gray-500 mb-3">
              3. Rekomendasi Strategis & Rencana Aksi
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 print:border-gray-300 print:bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white print:text-black">
                      {rec.issue}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 print:border print:border-gray-400">
                      Prioritas {rec.priority === 'High' ? 'Tinggi' : rec.priority === 'Medium' ? 'Sedang' : 'Rendah'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 print:text-gray-600">
                    <strong>Bukti:</strong> {rec.evidence}
                  </div>
                  <div className="text-xs text-blue-300 print:text-blue-800">
                    <strong>Tindakan Disarankan:</strong> {rec.action}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-gray-500">
                    <strong>Target:</strong> {rec.target}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
