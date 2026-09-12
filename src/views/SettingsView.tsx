import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimelinePeriod } from '../types';

export const SettingsView: React.FC = () => {
  const {
    db,
    updateSettings,
    exportBackup,
    restoreBackupFile,
    resetAllData,
    loadSampleTestData,
  } = useApp();

  const [appName, setAppName] = useState(db.settings.appName || 'BAYU SOCIAL INTELLIGENCE');
  const [defaultTimeline, setDefaultTimeline] = useState<TimelinePeriod>(
    db.settings.defaultTimeline || '30 Days'
  );
  const [numberFormat, setNumberFormat] = useState<'en-US' | 'id-ID' | 'de-DE'>(
    db.settings.numberFormat || 'en-US'
  );
  const [currency, setCurrency] = useState(db.settings.currency || 'USD');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      appName,
      defaultTimeline,
      numberFormat,
      currency,
    });
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          restoreBackupFile(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearConfirm = () => {
    if (
      window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin menghapus seluruh data dan menyetel ulang basis data ke nol? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.'
      )
    ) {
      resetAllData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-extrabold text-white">Pengaturan Sistem & Cadangan</h2>
          </div>
          <p className="text-xs text-slate-400">
            Konfigurasi preferensi default, ekspor/impor cadangan JSON, dan kelola integritas penyimpanan lokal
          </p>
        </div>
      </div>

      {/* General Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm space-y-5"
      >
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Konfigurasi Platform
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nama Aplikasi
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Rentang Waktu Bawaan (Default Timeline)
            </label>
            <select
              value={defaultTimeline}
              onChange={(e) => setDefaultTimeline(e.target.value as TimelinePeriod)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Today">Hari Ini (Today)</option>
              <option value="7 Days">7 Hari Terakhir</option>
              <option value="14 Days">14 Hari Terakhir</option>
              <option value="30 Days">30 Hari Terakhir</option>
              <option value="60 Days">60 Hari Terakhir</option>
              <option value="90 Days">90 Hari Terakhir</option>
              <option value="All Time">Sepanjang Waktu (All Time)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Format Penomoran Lokal
            </label>
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="id-ID">Indonesia (12.345,67)</option>
              <option value="en-US">English (12,345.67)</option>
              <option value="de-DE">Eropa (12.345,67)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mata Uang Referensi
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
          >
            Simpan Pengaturan
          </button>
        </div>
      </form>

      {/* Backup & Restore Section */}
      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Cadangan & Migrasi Data (JSON)
          </h3>
          <p className="text-xs text-slate-400">
            Ekspor seluruh snapshot database JSON secara mandiri atau pulihkan data dari file cadangan sebelumnya
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={exportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Ekspor Cadangan (.json)
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Pulihkan Dari JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Real-World Testing Dataset Loader */}
      <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Dataset Pengujian Nyata
          </h3>
          <span className="text-[11px] text-indigo-400 font-mono">Utilitas Pengembangan & QA</span>
        </div>
        <p className="text-xs text-indigo-200/80 leading-relaxed">
          Ingin langsung menguji mesin pertumbuhan (Growth Engine 7-hari vs 30-hari), peringkat lintas platform, dan rekomendasi cerdas? Muat dataset sampel terstruktur 40 catatan yang mencakup 45 hari terakhir.
        </p>

        <button
          onClick={loadSampleTestData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          Muat 40 Catatan Sampel di 4 Saluran
        </button>
      </div>

      {/* Danger Zone: Clear & Reset */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Zona Bahaya
          </h3>
          <p className="text-xs text-slate-400">
            Tindakan permanen yang akan mengosongkan seluruh data penyimpanan lokal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20 active:scale-95"
          >
            <Trash2 className="w-3 h-4" />
            Setel Ulang Basis Data ke Nol
          </button>
        </div>
      </div>
    </div>
  );
};
