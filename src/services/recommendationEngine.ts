import {
  ContentItem,
  PeriodKPIs,
  PlatformPerformanceSummary,
  ContentTypePerformanceSummary,
  RecommendationItem,
  TimelinePeriod,
} from '../types';
import { calculateGrowth } from './growthEngine';
import { formatTimelineLabel } from './filterEngine';

export interface RecommendationContext {
  currentItems: ContentItem[];
  previousItems: ContentItem[];
  currentKPIs: PeriodKPIs;
  previousKPIs: PeriodKPIs;
  platformPerformance: PlatformPerformanceSummary[];
  contentTypePerformance: ContentTypePerformanceSummary[];
  period: TimelinePeriod;
  hasComparison: boolean;
}

/**
 * Mesin Rekomendasi:
 * Pipeline: DATA -> METRICS -> TREN -> DETEKSI MASALAH -> REKOMENDASI -> TINDAKAN
 * Mengikuti rentang waktu aktif secara dinamis.
 */
export function generateRecommendations(ctx: RecommendationContext): RecommendationItem[] {
  const {
    currentItems,
    previousItems,
    currentKPIs,
    previousKPIs,
    platformPerformance,
    contentTypePerformance,
    period,
    hasComparison,
  } = ctx;

  const periodLabel = formatTimelineLabel(period);
  const recommendations: RecommendationItem[] = [];

  if (currentItems.length === 0) {
    return [
      {
        id: 'rec_no_data',
        issue: 'Belum ada data konten pada rentang waktu ini.',
        evidence: `Dataset saat ini berisi 0 catatan dalam rentang ${periodLabel}.`,
        action: 'Tambahkan catatan konten manual atau impor file CSV/XLSX analitik untuk memulai intelijen kinerja.',
        priority: 'Medium',
        target: 'Catat setidaknya 3-5 postingan yang telah terbit untuk menghasilkan wawasan terukur.',
        category: 'Content Cadence',
      },
    ];
  }

  // 1. Cek Pertumbuhan/Penurunan Interaksi (Engagement)
  if (hasComparison && previousItems.length > 0) {
    const engGrowth = calculateGrowth(currentKPIs.engagement, previousKPIs.engagement, true);
    if (engGrowth.growthPct !== null && engGrowth.growthPct < -10) {
      recommendations.push({
        id: `rec_eng_drop_${period}`,
        issue: `Interaksi (engagement) menurun pada periode ${periodLabel}.`,
        evidence: `Total interaksi turun ${Math.abs(engGrowth.growthPct)}% dibandingkan periode ${periodLabel} sebelumnya (${currentKPIs.engagement.toLocaleString('id-ID')} vs ${previousKPIs.engagement.toLocaleString('id-ID')}).`,
        action: 'Evaluasi caption, ajakan bertindak (call-to-action), dan balas komentar di 60 menit pertama setelah unggah.',
        priority: engGrowth.growthPct < -25 ? 'High' : 'Medium',
        target: `Balikkan tren negatif dan pulihkan setidaknya ${Math.abs(engGrowth.growthPct)}% volume interaksi di periode berikutnya.`,
        category: 'Engagement',
      });
    }

    // 2. Cek Penurunan Tayangan (Views)
    const viewGrowth = calculateGrowth(currentKPIs.views, previousKPIs.views, true);
    if (viewGrowth.growthPct !== null && viewGrowth.growthPct < -15) {
      recommendations.push({
        id: `rec_views_drop_${period}`,
        issue: `Tayangan & impresi konten mengalami penurunan pada periode ${periodLabel}.`,
        evidence: `Total tayangan turun ${Math.abs(viewGrowth.growthPct)}% (${currentKPIs.views.toLocaleString('id-ID')} vs ${previousKPIs.views.toLocaleString('id-ID')}).`,
        action: 'Tingkatkan hook 3 detik pertama video, kontras thumbnail, dan judul yang memicu rasa ingin tahu.',
        priority: 'High',
        target: `Stabilkan tayangan dan targetkan pemulihan +15% tayangan pada ${periodLabel} berikutnya.`,
        category: 'Reach',
      });
    }

    // 3. Penurunan Frekuensi Posting (Cadence)
    const countGrowth = calculateGrowth(currentKPIs.contentCount, previousKPIs.contentCount, true);
    if (countGrowth.growthPct !== null && countGrowth.growthPct < -20) {
      recommendations.push({
        id: `rec_cadence_drop_${period}`,
        issue: 'Kecepatan dan konsistensi publikasi konten menurun signifikan.',
        evidence: `Mempublikasikan ${currentKPIs.contentCount} konten di ${periodLabel} dibandingkan ${previousKPIs.contentCount} konten pada periode sebelumnya.`,
        action: 'Susun kalender editorial terstruktur dengan draf cadangan agar distribusi algoritma tidak dingin.',
        priority: 'Medium',
        target: `Samai atau lampaui baseline publikasi sebelumnya (${previousKPIs.contentCount} postingan).`,
        category: 'Content Cadence',
      });
    }
  }

  // 4. Deteksi Ketimpangan Performa Platform
  const activePlatforms = platformPerformance.filter((p) => p.contentCount > 0);
  if (activePlatforms.length >= 2) {
    const bestErPlatform = [...activePlatforms].sort((a, b) => b.engagementRate - a.engagementRate)[0];
    const worstErPlatform = [...activePlatforms].sort((a, b) => a.engagementRate - b.engagementRate)[0];

    if (bestErPlatform && worstErPlatform && bestErPlatform.engagementRate > worstErPlatform.engagementRate * 2.2 && bestErPlatform.contentCount > 0) {
      recommendations.push({
        id: `rec_platform_er_${bestErPlatform.platform}`,
        issue: `${bestErPlatform.platform} memberikan efisiensi interaksi yang jauh lebih tinggi.`,
        evidence: `${bestErPlatform.platform} mencatatkan rasio interaksi ${bestErPlatform.engagementRate.toFixed(1)}% berbanding ${worstErPlatform.platform} di ${worstErPlatform.engagementRate.toFixed(1)}%.`,
        action: `Daur ulang ide konten terbaik dari ${bestErPlatform.platform} ke platform lain, atau alokasikan frekuensi posting lebih banyak ke ${bestErPlatform.platform}.`,
        priority: 'Medium',
        target: `Manfaatkan momentum ${bestErPlatform.platform} untuk memperluas jangkauan audiens ke saluran lainnya.`,
        category: 'Platform Imbalance',
      });
    }
  }

  // 5. Optimalisasi Format Konten
  if (contentTypePerformance.length >= 2) {
    const sortedByViews = [...contentTypePerformance].sort((a, b) => b.avgViews - a.avgViews);
    const topFormat = sortedByViews[0];
    const lowestFormat = sortedByViews[sortedByViews.length - 1];

    if (topFormat && lowestFormat && topFormat.avgViews > lowestFormat.avgViews * 1.8) {
      recommendations.push({
        id: `rec_format_${topFormat.contentType}`,
        issue: `Format ${topFormat.contentType} jauh melampaui format lainnya dalam distribusi tayangan.`,
        evidence: `Format ${topFormat.contentType} rata-rata memperoleh ${topFormat.avgViews.toLocaleString('id-ID')} tayangan per konten dibandingkan ${lowestFormat.contentType} yang hanya ${lowestFormat.avgViews.toLocaleString('id-ID')} tayangan.`,
        action: `Tingkatkan porsi produksi konten format ${topFormat.contentType} dalam jadwal produksi mingguan Anda.`,
        priority: 'High',
        target: `Tingkatkan proporsi format ${topFormat.contentType} hingga minimal 40% dari total publikasi.`,
        category: 'Format Optimization',
      });
    }
  }

  // 6. Retensi Sehat / Penguatan Pertumbuhan
  if (recommendations.length === 0 && currentItems.length > 0) {
    recommendations.push({
      id: 'rec_steady_growth',
      issue: 'Indikator performa stabil dengan retensi audiens yang konsisten.',
      evidence: `Rentang ${periodLabel} mempertahankan distribusi sehat di seluruh ${currentItems.length} konten dengan tingkat interaksi ${currentKPIs.engagementRate.toFixed(1)}%.`,
      action: 'Pertahankan pilar konten yang terbukti berhasil, buat polling atau sesi tanya-jawab untuk mempererat hubungan komunitas.',
      priority: 'Low',
      target: 'Jaga konsistensi output dan lakukan pengujian variasi visual thumbnail.',
      category: 'Format Optimization',
    });
  }

  return recommendations;
}
