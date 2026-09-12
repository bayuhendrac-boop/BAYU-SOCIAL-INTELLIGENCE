import React from 'react';
import { Database, Plus, Upload, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showSampleDataOption?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Belum Ada Data Tersedia',
  description = 'Tidak ditemukan catatan untuk rentang waktu atau filter yang dipilih. Tambahkan konten manual atau impor file ekspor analitik untuk melihat intelijen kinerja langsung.',
  actionText,
  onAction,
  showSampleDataOption = true,
}) => {
  const { setActiveRoute, loadSampleTestData } = useApp();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-800/30 my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Database className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAction && actionText ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {actionText}
          </button>
        ) : (
          <button
            onClick={() => setActiveRoute('data-management')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Konten Pertama
          </button>
        )}

        <button
          onClick={() => setActiveRoute('data-import')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all active:scale-95"
        >
          <Upload className="w-4 h-4 text-slate-400" />
          Impor CSV / XLSX
        </button>

        {showSampleDataOption && (
          <button
            onClick={loadSampleTestData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-medium text-sm transition-all active:scale-95"
            title="Muat 40 data multi-platform realistis untuk 45 hari terakhir untuk pengujian sistem langsung"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Muat Data Uji Contoh
          </button>
        )}
      </div>
    </div>
  );
};
