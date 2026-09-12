import React, { useState, useMemo } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Eye,
  Heart,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContentItem, SocialPlatform } from '../types';
import { EmptyState } from '../components/common/EmptyState';

interface DataManagementViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (item: ContentItem) => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { db, deleteContent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const filteredContent = useMemo(() => {
    return db.content.filter((item) => {
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
      if (formatFilter !== 'all' && item.contentType !== formatFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(term) ||
          item.platform.toLowerCase().includes(term) ||
          item.contentType.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [db.content, platformFilter, formatFilter, searchTerm]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus permanen "${title}"?`)) {
      deleteContent(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-extrabold text-white">Manajemen Data Konten</h2>
          </div>
          <p className="text-xs text-slate-400">
            Pencatatan manual, pengeditan langsung, penghapusan, dan manajemen basis data lokal
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Catatan Konten
        </button>
      </div>

      {db.content.length === 0 ? (
        <EmptyState
          title="Basis Data Masih Kosong"
          description="Belum ada catatan konten di penyimpanan lokal. Tambahkan konten pertama Anda secara manual atau impor dari file CSV/XLSX."
          onAction={onOpenAddModal}
          actionText="Tambah Catatan Pertama"
        />
      ) : (
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul, platform, format konten..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Semua Saluran</option>
                  <option value="YouTube" className="bg-slate-900">YouTube</option>
                  <option value="Instagram" className="bg-slate-900">Instagram</option>
                  <option value="TikTok" className="bg-slate-900">TikTok</option>
                  <option value="Facebook" className="bg-slate-900">Facebook</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Semua Format</option>
                  <option value="Shorts" className="bg-slate-900">Shorts</option>
                  <option value="Reels" className="bg-slate-900">Reels</option>
                  <option value="Video" className="bg-slate-900">Video</option>
                  <option value="Photo" className="bg-slate-900">Photo</option>
                  <option value="Post" className="bg-slate-900">Post</option>
                  <option value="Live" className="bg-slate-900">Live</option>
                </select>
              </div>

              <span className="text-xs text-slate-400 font-mono ml-2">
                Menampilkan {filteredContent.length} dari {db.content.length} catatan
              </span>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Judul Konten</th>
                  <th className="pb-3 font-semibold">Saluran</th>
                  <th className="pb-3 font-semibold">Format</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold text-right">Tayangan</th>
                  <th className="pb-3 font-semibold text-right">Jangkauan</th>
                  <th className="pb-3 font-semibold text-right">Suka</th>
                  <th className="pb-3 font-semibold text-right">Komentar</th>
                  <th className="pb-3 font-semibold text-right">Bagikan</th>
                  <th className="pb-3 font-semibold text-right">Simpan</th>
                  <th className="pb-3 font-semibold text-right">Pengikut</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 font-semibold text-white max-w-xs truncate pr-4">
                      {item.title}
                    </td>
                    <td className="py-3 font-medium text-slate-300">{item.platform}</td>
                    <td className="py-3 text-slate-400">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700/50 text-slate-300">
                        {item.contentType}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{item.date}</td>
                    <td className="py-3 text-right font-mono font-bold text-white">
                      {item.views.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300">
                      {item.reach.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right font-mono text-rose-400">
                      {item.likes.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right font-mono text-amber-400">
                      {item.comments.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400">
                      {item.shares.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400">
                      {item.saves.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right font-mono text-emerald-400 font-semibold">
                      +{item.followersGained.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                          title="Ubah catatan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/20 transition"
                          title="Hapus catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
