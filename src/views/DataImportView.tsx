import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Layers,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  parseUploadedFile,
  ParsedFileResult,
  ColumnMapping,
  DuplicateAction,
  executeImport,
} from '../services/importEngine';
import { SocialPlatform } from '../types';

export const DataImportView: React.FC = () => {
  const { db, addToast, setActiveRoute } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFileResult | null>(null);

  const [mapping, setMapping] = useState<ColumnMapping>({
    platform: '',
    title: '',
    date: '',
    contentType: '',
    views: '',
    reach: '',
    likes: '',
    comments: '',
    shares: '',
    saves: '',
    followersGained: '',
  });

  const [defaultPlatform, setDefaultPlatform] = useState<SocialPlatform>('YouTube');
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>('update');
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setImportResult(null);
    setLoading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
        throw new Error('Harap unggah file spreadsheet CSV, XLSX, atau XLS yang valid.');
      }

      const res = await parseUploadedFile(file);
      setParsedData(res);
      setMapping(res.suggestedMapping);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses file.');
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectChange = (field: keyof ColumnMapping, val: string) => {
    setMapping((prev) => ({ ...prev, [field]: val }));
  };

  const handleExecuteImport = () => {
    if (!parsedData) return;

    try {
      setLoading(true);
      const res = executeImport(
        parsedData.rawRows,
        mapping,
        defaultPlatform,
        db.content,
        parsedData.filename,
        duplicateAction
      );

      // Save into DB state
      const nextDb = {
        ...db,
        content: res.importedItems,
        imports: [res.batch, ...db.imports],
      };

      // Direct write and update
      localStorage.setItem('BAYU_SOCIAL_INTELLIGENCE', JSON.stringify(nextDb));
      window.location.reload(); // Refresh to ensure entire state & local engines rebuild cleanly
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengimpor data.');
      setLoading(false);
    }
  };

  const fieldLabels: Record<keyof ColumnMapping, string> = {
    platform: 'Saluran (Platform)',
    title: 'Judul Konten',
    date: 'Tanggal Terbit',
    contentType: 'Format / Tipe Konten',
    views: 'Tayangan (Views)',
    reach: 'Jangkauan (Reach)',
    likes: 'Suka (Likes)',
    comments: 'Komentar (Comments)',
    shares: 'Bagikan (Shares)',
    saves: 'Simpan (Saves)',
    followersGained: 'Pertambahan Pengikut',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold text-white">Impor Analitik Media Sosial</h2>
          </div>
          <p className="text-xs text-slate-400">
            Unggah file CSV atau XLSX dari platform analitik dengan pemetaan kolom otomatis, proteksi duplikasi, dan pencatatan batch
          </p>
        </div>

        <button
          onClick={() => setActiveRoute('data-history')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          Lihat Riwayat Impor
        </button>
      </div>

      {/* File Upload Dropzone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mb-4 shadow-sm">
          <FileSpreadsheet className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {parsedData ? `File Terpilih: ${parsedData.filename}` : 'Seret & lepas file CSV atau XLSX Anda di sini'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Mendukung ekspor YouTube Analytics, Meta Business Suite, TikTok Creator Center, atau file tabel kustom
        </p>

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20">
          Pilih File Spreadsheet
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Uploaded File Config & Column Mapping */}
      {parsedData && (
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pemetaan Kolom & Deteksi Otomatis
              </h3>
              <p className="text-xs text-slate-400">
                Terdeteksi {parsedData.rawRows.length} baris data dan {parsedData.headers.length} kolom pada file {parsedData.filename}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Siap dipetakan
            </div>
          </div>

          {/* Import Settings: Default Platform & Duplicate Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Saluran Bawaan (Default)
              </label>
              <select
                value={defaultPlatform}
                onChange={(e) => setDefaultPlatform(e.target.value as SocialPlatform)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Digunakan apabila file yang diunggah tidak memuat kolom saluran khusus
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Kebijakan Penanganan Duplikasi
              </label>
              <select
                value={duplicateAction}
                onChange={(e) => setDuplicateAction(e.target.value as DuplicateAction)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="update">Perbarui catatan yang sudah ada jika cocok</option>
                <option value="skip">Lewati data duplikat (pertahankan data lama)</option>
                <option value="import_all">Impor semua (abaikan pemeriksaan duplikat)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Catatan dicocokkan berdasarkan kombinasi unik: (saluran + judul + tanggal)
              </p>
            </div>
          </div>

          {/* Mapping Selectors Grid */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Pemetaan Bidang Data (Field Mapping)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(mapping) as Array<keyof ColumnMapping>).map((field) => (
                <div key={field} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    {fieldLabels[field] || String(field)} {(field === 'title' || field === 'date') && '*'}
                  </label>
                  <select
                    value={mapping[field]}
                    onChange={(e) => handleSelectChange(field, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Abaikan / Tidak ada di file --</option>
                    {parsedData.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview of first 3 rows */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pratinjau Sampel File (3 Baris Pertama)
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-left text-xs bg-slate-900">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    {parsedData.headers.slice(0, 6).map((h) => (
                      <th key={h} className="p-2.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {parsedData.rawRows.slice(0, 3).map((row, i) => (
                    <tr key={i}>
                      {parsedData.headers.slice(0, 6).map((h) => (
                        <td key={h} className="p-2.5 text-slate-300 truncate max-w-[150px]">
                          {String(row[h] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => setParsedData(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
            >
              Batal
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Jalankan Impor & Kalkulasi Ulang Sistem</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
