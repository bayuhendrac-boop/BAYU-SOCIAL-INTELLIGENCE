import React from 'react';
import { History, Trash2, FileSpreadsheet, Upload, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ImportHistoryView: React.FC = () => {
  const { db, deleteBatch, setActiveRoute } = useApp();

  const batches = db.imports || [];

  const handleDelete = (batchId: string, filename: string) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus batch "${filename}"? Seluruh data konten yang diimpor dari batch ini akan dihapus secara berantai untuk mencegah data yatim (orphan).`
      )
    ) {
      deleteBatch(batchId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-extrabold text-white">Riwayat & Batch Impor</h2>
          </div>
          <p className="text-xs text-slate-400">
            Lacak riwayat unggahan batch file. Menghapus batch akan menghapus otomatis seluruh data terkait.
          </p>
        </div>

        <button
          onClick={() => setActiveRoute('data-import')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          <Upload className="w-4 h-4" />
          Impor File Baru
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-800/30">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Belum Ada Riwayat Impor</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Anda belum pernah mengimpor spreadsheet CSV atau Excel. Unggah file untuk melihat pelacakan batch dan opsi rollback.
          </p>
          <button
            onClick={() => setActiveRoute('data-import')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Impor File Sekarang
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Nama File</th>
                  <th className="pb-3 font-semibold">ID Batch</th>
                  <th className="pb-3 font-semibold">Saluran</th>
                  <th className="pb-3 font-semibold">Waktu Impor</th>
                  <th className="pb-3 font-semibold text-right">Jml Catatan</th>
                  <th className="pb-3 font-semibold text-right">Duplikat Ditangani</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                      <span>{b.filename}</span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400 text-[11px]">{b.id}</td>
                    <td className="py-3.5 text-slate-300">{b.platform}</td>
                    <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(b.importedAt).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 text-right font-mono text-white font-bold">
                      {b.recordCount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-400">
                      {(b.duplicateCount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {b.status === 'Completed' ? 'Selesai' : b.status === 'Partially Imported' ? 'Sebagian' : 'Gagal'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(b.id, b.filename)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-500/20 transition"
                        title="Hapus batch ini dan semua catatan terkait"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Batch</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
