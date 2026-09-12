import React, { useState, useEffect } from 'react';
import { X, Save, Film, Eye, Users, Heart, MessageSquare, Share2, Bookmark, UserPlus, Calendar } from 'lucide-react';
import { ContentFormat, ContentItem, SocialPlatform } from '../../types';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  initialData?: ContentItem | null;
}

const PLATFORMS: SocialPlatform[] = ['YouTube', 'Instagram', 'TikTok', 'Facebook'];
const FORMATS: ContentFormat[] = ['Shorts', 'Reels', 'Video', 'Photo', 'Post', 'Live', 'Other'];

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [platform, setPlatform] = useState<SocialPlatform>('YouTube');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [contentType, setContentType] = useState<ContentFormat>('Video');
  const [views, setViews] = useState<number>(0);
  const [reach, setReach] = useState<number>(0);
  const [likes, setLikes] = useState<number>(0);
  const [comments, setComments] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [saves, setSaves] = useState<number>(0);
  const [followersGained, setFollowersGained] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setPlatform(initialData.platform);
      setTitle(initialData.title);
      setDate(initialData.date.substring(0, 10));
      setContentType(initialData.contentType);
      setViews(initialData.views || 0);
      setReach(initialData.reach || 0);
      setLikes(initialData.likes || 0);
      setComments(initialData.comments || 0);
      setShares(initialData.shares || 0);
      setSaves(initialData.saves || 0);
      setFollowersGained(initialData.followersGained || 0);
    } else {
      // Default new entry
      setPlatform('YouTube');
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setContentType('Video');
      setViews(0);
      setReach(0);
      setLikes(0);
      setComments(0);
      setShares(0);
      setSaves(0);
      setFollowersGained(0);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Mohon masukkan judul konten atau caption.');
      return;
    }
    if (!date) {
      setError('Mohon tentukan tanggal publikasi yang valid.');
      return;
    }

    const payload = {
      platform,
      title: title.trim(),
      date,
      contentType,
      views: Number(views) || 0,
      reach: Number(reach) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      saves: Number(saves) || 0,
      followersGained: Number(followersGained) || 0,
    };

    if (initialData) {
      onSave({ ...initialData, ...payload });
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h3 className="text-lg font-bold text-white">
              {initialData ? 'Edit Data Konten' : 'Input Konten Manual'}
            </h3>
            <p className="text-xs text-slate-400">
              Simpan metrik publikasi media sosial aktual ke dalam database lokal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 text-xs font-medium rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {error}
            </div>
          )}

          {/* Platform & Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tipe / Format Konten *
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentFormat)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Judul / Caption / Deskripsi Konten *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Strategi Efektif Meningkatkan Jangkauan Organik 2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Tanggal Publikasi *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Primary Metrics Grid */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Metrik Jangkauan & Audiens
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-blue-400" /> Tayangan / Plays (Views)
                </label>
                <input
                  type="number"
                  min="0"
                  value={views}
                  onChange={(e) => setViews(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" /> Jangkauan (Akun Unik)
                </label>
                <input
                  type="number"
                  min="0"
                  value={reach}
                  onChange={(e) => setReach(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <UserPlus className="w-3 h-3 text-emerald-400" /> Pengikut Baru Didapat
                </label>
                <input
                  type="number"
                  min="0"
                  value={followersGained}
                  onChange={(e) => setFollowersGained(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Engagement Breakdown */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Rincian Interaksi (Suka + Komentar + Bagikan + Simpan)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" /> Suka (Likes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={likes}
                  onChange={(e) => setLikes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-amber-400" /> Komentar
                </label>
                <input
                  type="number"
                  min="0"
                  value={comments}
                  onChange={(e) => setComments(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-indigo-400" /> Bagikan (Shares)
                </label>
                <input
                  type="number"
                  min="0"
                  value={shares}
                  onChange={(e) => setShares(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-purple-400" /> Disimpan (Saves)
                </label>
                <input
                  type="number"
                  min="0"
                  value={saves}
                  onChange={(e) => setSaves(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Total Interaksi Terhitung:</span>
            <span className="font-bold text-white font-mono text-sm">
              {(likes + comments + shares + saves).toLocaleString('id-ID')} interaksi
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan ke Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
