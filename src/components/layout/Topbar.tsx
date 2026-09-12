import React from 'react';
import { Menu, Plus, Calendar, Clock, Upload, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimelinePeriod } from '../../types';
import { formatTimelineLabel } from '../../services/filterEngine';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
}

const TIMELINE_OPTIONS: { value: TimelinePeriod; label: string }[] = [
  { value: 'Hari Ini', label: 'Hari Ini' },
  { value: '7 Hari', label: '7 Hari Terakhir' },
  { value: '14 Hari', label: '14 Hari Terakhir' },
  { value: '30 Hari', label: '30 Hari Terakhir' },
  { value: '60 Hari', label: '60 Hari Terakhir' },
  { value: '90 Hari', label: '90 Hari Terakhir' },
  { value: 'Semua Waktu', label: 'Semua Waktu' },
];

const ROUTE_LABELS: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dasbor Intelijen Eksekutif',
    subtitle: 'Ikhtisar performa konsolidasi, skor platform, dan metrik utama',
  },
  'analytics-overview': {
    title: 'Ikhtisar Analitik Lintas Platform',
    subtitle: 'Analisis interaksi terpadu, jangkauan, dan distribusi di seluruh saluran',
  },
  'analytics-youtube': {
    title: 'Analitik Saluran YouTube',
    subtitle: 'Tayangan, estimasi retensi tonton, penambahan subscriber, dan performa video',
  },
  'analytics-instagram': {
    title: 'Analitik Akun Instagram',
    subtitle: 'Metrik interaksi Reels, Stories, Post, serta jangkauan akun',
  },
  'analytics-tiktok': {
    title: 'Analitik Kinerja TikTok',
    subtitle: 'Jangkauan viral, tayangan video, komentar, dan akselerasi pengikut baru',
  },
  'analytics-facebook': {
    title: 'Analitik Halaman Facebook',
    subtitle: 'Distribusi komunitas, bagikan postingan, reaksi, dan eksposur',
  },
  'intelligence-content': {
    title: 'Mesin Intelijen Konten',
    subtitle: 'Konten berkinerja tertinggi, konten terendah, tolok ukur format, dan rasio views-to-reach',
  },
  'intelligence-audience': {
    title: 'Intelijen Audiens & Pengikut',
    subtitle: 'Pertumbuhan pengikut bersih, kecepatan akuisisi, dan kontribusi platform',
  },
  'intelligence-growth': {
    title: 'Mesin Pertumbuhan & Komparasi Periode',
    subtitle: 'Kalkulasi matematis pertumbuhan periode saat ini vs periode sebelumnya yang seimbang',
  },
  'intelligence-exposure': {
    title: 'Intelijen Jangkauan & Eksposur',
    subtitle: 'Total impresi, jangkauan akun unik, dan rasio efisiensi distribusi saluran',
  },
  'intelligence-recommendations': {
    title: 'Intelijen & Rekomendasi Tindakan',
    subtitle: 'Deteksi masalah peka-periode, strategi berbasis bukti, dan target pemulihan',
  },
  reports: {
    title: 'Laporan Intelijen Eksekutif',
    subtitle: 'Laporan komprehensif yang siap dicetak dan diekspor ke ringkasan Markdown',
  },
  'data-import': {
    title: 'Impor File Analitik',
    subtitle: 'Unggah file CSV atau XLSX dengan pemetaan kolom otomatis & pencegahan duplikasi',
  },
  'data-history': {
    title: 'Riwayat Batch Impor',
    subtitle: 'Kelola riwayat impor dan hapus catatan secara berantai tanpa meninggalkan data yatim',
  },
  'data-management': {
    title: 'Manajemen Basis Data Konten',
    subtitle: 'Tambah, lihat, edit, dan hapus catatan postingan media sosial aktual',
  },
  settings: {
    title: 'Pengaturan Platform & Cadangan Data',
    subtitle: 'Ekspor/impor cadangan database JSON, preferensi lokal, dan muat data contoh',
  },
};

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu, onOpenAddModal }) => {
  const { activeRoute, timelinePeriod, setTimelinePeriod, db, setActiveRoute } = useApp();

  const routeInfo = ROUTE_LABELS[activeRoute] || {
    title: 'Intelijen Media Sosial',
    subtitle: 'Platform analitik berbasis data terverifikasi',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Kiri: Pemicu Menu Seluler & Judul Halaman */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base lg:text-lg font-bold text-white tracking-tight">
              {routeInfo.title}
            </h2>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              {db.content.length} data
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {routeInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Kanan: Pemilih Rentang Waktu Global & Tombol Aksi */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Dropdown Rentang Waktu */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 shadow-inner">
          <Calendar className="w-3.5 h-3.5 text-blue-400 mr-2 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 mr-1 hidden md:inline">
            Rentang Waktu:
          </span>
          <select
            value={formatTimelineLabel(timelinePeriod)}
            onChange={(e) => setTimelinePeriod(e.target.value as TimelinePeriod)}
            className="bg-transparent text-xs font-bold text-blue-400 focus:outline-none cursor-pointer pr-1"
          >
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Cepat Tambah Konten */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20 active:scale-95"
          title="Input Konten Manual"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Konten</span>
        </button>

        {/* Tombol Cepat Impor Data */}
        <button
          onClick={() => setActiveRoute('data-import')}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Impor file CSV atau Excel"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
