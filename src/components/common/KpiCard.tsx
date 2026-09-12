import React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, HelpCircle } from 'lucide-react';
import { MetricGrowth } from '../../types';

interface KpiCardProps {
  label: string;
  value: number | string;
  growth?: MetricGrowth;
  icon: React.ReactNode;
  suffix?: string;
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  growth,
  icon,
  suffix = '',
  tooltip,
}) => {
  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString('id-ID') + suffix
      : value + suffix;

  const renderGrowthBadge = () => {
    if (!growth) return null;

    if (growth.status === 'positive') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          {growth.displayText}
        </span>
      );
    }

    if (growth.status === 'negative') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          {growth.displayText}
        </span>
      );
    }

    if (growth.status === 'new') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Baru
        </span>
      );
    }

    if (growth.status === 'neutral') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
          <Minus className="w-3.5 h-3.5" />
          0.0%
        </span>
      );
    }

    // no-data
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        <HelpCircle className="w-3 h-3" />
        Tidak Ada Data Sebelumnya
      </span>
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm hover:border-slate-600/80 transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </span>
        <div className="p-2 rounded-xl bg-slate-700/50 text-blue-400 border border-slate-600/40">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {formattedValue}
        </div>
        <div>{renderGrowthBadge()}</div>
      </div>

      {growth && growth.status !== 'no-data' && (
        <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-700/40 pt-2">
          <span>Sebelumnya: {growth.previous.toLocaleString('id-ID')}</span>
          <span className="text-slate-500">vs periode sebelumnya</span>
        </div>
      )}
    </div>
  );
};
