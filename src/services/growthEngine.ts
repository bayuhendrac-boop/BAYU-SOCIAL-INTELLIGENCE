import { MetricGrowth } from '../types';

/**
 * Calculates percentage growth between two periods of identical duration.
 * Strictly prevents NaN and Infinity.
 * Correctly labels 'New' when previous period was 0, or 'No Previous Data' if comparison period is missing.
 */
export function calculateGrowth(
  current: number,
  previous: number | undefined | null,
  hasComparison: boolean = true
): MetricGrowth {
  if (!hasComparison || previous === undefined || previous === null) {
    return {
      current,
      previous: 0,
      growthPct: null,
      status: 'no-data',
      displayText: 'Tidak Ada Data Sebelumnya',
    };
  }

  // If both are 0
  if (previous === 0 && current === 0) {
    return {
      current,
      previous: 0,
      growthPct: 0,
      status: 'neutral',
      displayText: '0.0%',
    };
  }

  // If previous was 0 and now we have activity
  if (previous === 0 && current > 0) {
    return {
      current,
      previous: 0,
      growthPct: null,
      status: 'new',
      displayText: 'Baru',
    };
  }

  // Standard percentage growth formula: ((Current - Previous) / Previous) * 100
  const rawPct = ((current - previous) / previous) * 100;
  
  if (isNaN(rawPct) || !isFinite(rawPct)) {
    return {
      current,
      previous,
      growthPct: null,
      status: 'no-data',
      displayText: 'Tidak Ada Data Sebelumnya',
    };
  }

  const rounded = Math.round(rawPct * 10) / 10;

  if (rounded > 0) {
    return {
      current,
      previous,
      growthPct: rounded,
      status: 'positive',
      displayText: `+${rounded.toFixed(1)}%`,
    };
  } else if (rounded < 0) {
    return {
      current,
      previous,
      growthPct: rounded,
      status: 'negative',
      displayText: `${rounded.toFixed(1)}%`,
    };
  }

  return {
    current,
    previous,
    growthPct: 0,
    status: 'neutral',
    displayText: '0.0%',
  };
}
