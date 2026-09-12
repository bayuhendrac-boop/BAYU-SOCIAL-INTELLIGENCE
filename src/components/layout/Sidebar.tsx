import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Youtube,
  Instagram,
  Sparkles,
  Users,
  TrendingUp,
  Radio,
  Lightbulb,
  FileText,
  Upload,
  History,
  Database,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveRoute } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeRoute, setActiveRoute, db } = useApp();

  const handleNavClick = (route: ActiveRoute) => {
    setActiveRoute(route);
    onCloseMobile();
  };

  const navItemClass = (route: ActiveRoute) => {
    const isActive = activeRoute === route;
    return `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
    }`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/90 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
            B
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight uppercase">
              BAYU SOCIAL
            </h1>
            <p className="text-[10px] font-bold text-blue-400 tracking-wider">
              INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Dashboard */}
          <div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full ${navItemClass('dashboard')}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dasbor Utama</span>
            </button>
          </div>

          {/* Analytics Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Analitik Saluran
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('analytics-overview')}
                className={`w-full ${navItemClass('analytics-overview')}`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Ikhtisar Lintas Platform</span>
              </button>
              <button
                onClick={() => handleNavClick('analytics-youtube')}
                className={`w-full ${navItemClass('analytics-youtube')}`}
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube</span>
              </button>
              <button
                onClick={() => handleNavClick('analytics-instagram')}
                className={`w-full ${navItemClass('analytics-instagram')}`}
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram</span>
              </button>
              <button
                onClick={() => handleNavClick('analytics-tiktok')}
                className={`w-full ${navItemClass('analytics-tiktok')}`}
              >
                <div className="w-4 h-4 flex items-center justify-center font-black text-xs text-teal-400">
                  TT
                </div>
                <span>TikTok</span>
              </button>
              <button
                onClick={() => handleNavClick('analytics-facebook')}
                className={`w-full ${navItemClass('analytics-facebook')}`}
              >
                <div className="w-4 h-4 flex items-center justify-center font-black text-xs text-blue-400">
                  fb
                </div>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Intelligence Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Intelijen & Pertumbuhan
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('intelligence-content')}
                className={`w-full ${navItemClass('intelligence-content')}`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Intelijen Konten</span>
              </button>
              <button
                onClick={() => handleNavClick('intelligence-audience')}
                className={`w-full ${navItemClass('intelligence-audience')}`}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Intelijen Audiens</span>
              </button>
              <button
                onClick={() => handleNavClick('intelligence-growth')}
                className={`w-full ${navItemClass('intelligence-growth')}`}
              >
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Mesin Pertumbuhan</span>
              </button>
              <button
                onClick={() => handleNavClick('intelligence-exposure')}
                className={`w-full ${navItemClass('intelligence-exposure')}`}
              >
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>Intelijen Jangkauan</span>
              </button>
              <button
                onClick={() => handleNavClick('intelligence-recommendations')}
                className={`w-full ${navItemClass('intelligence-recommendations')}`}
              >
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Rekomendasi Strategis</span>
              </button>
            </div>
          </div>

          {/* Reports */}
          <div>
            <button
              onClick={() => handleNavClick('reports')}
              className={`w-full ${navItemClass('reports')}`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Laporan Eksekutif</span>
            </button>
          </div>

          {/* Data Group */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Manajemen Data
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('data-import')}
                className={`w-full ${navItemClass('data-import')}`}
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Impor Data File</span>
              </button>
              <button
                onClick={() => handleNavClick('data-history')}
                className={`w-full ${navItemClass('data-history')}`}
              >
                <History className="w-4 h-4 text-purple-400" />
                <span>Riwayat Impor</span>
              </button>
              <button
                onClick={() => handleNavClick('data-management')}
                className={`w-full ${navItemClass('data-management')}`}
              >
                <Database className="w-4 h-4 text-sky-400" />
                <span>Basis Data Konten</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div>
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full ${navItemClass('settings')}`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Pengaturan & Cadangan</span>
            </button>
          </div>
        </div>

        {/* Bottom Database Info */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Database Lokal
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-700 text-slate-300">
              v{db.version}
            </span>
          </div>
          <div className="text-[11px] flex justify-between items-center text-slate-400">
            <span>Data Tersimpan:</span>
            <span className="font-bold text-white font-mono">{db.content.length}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
