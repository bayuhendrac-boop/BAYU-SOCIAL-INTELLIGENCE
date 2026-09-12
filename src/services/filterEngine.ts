import { ContentItem, SocialPlatform, TimelinePeriod } from '../types';

export interface DateWindow {
  start: Date;
  end: Date;
  days: number;
}

export interface PeriodComparisonRange {
  current: DateWindow;
  previous: DateWindow | null;
  label: string;
}

/**
 * Determines anchor date for date filtering.
 * If data exists and the latest record is more than 30 days in the past,
 * it anchors to the latest record's date so historical data files are cleanly analyzed.
 * Otherwise, anchors to the current real-time moment.
 */
export function getEffectiveAnchorDate(items: ContentItem[]): Date {
  if (!items || items.length === 0) return new Date();
  
  let maxTime = 0;
  for (const item of items) {
    const t = new Date(item.date).getTime();
    if (!isNaN(t) && t > maxTime) {
      maxTime = t;
    }
  }

  const now = new Date();
  if (maxTime > 0) {
    const diffDays = (now.getTime() - maxTime) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      // Anchoring to latest historical entry
      const anchor = new Date(maxTime);
      anchor.setHours(23, 59, 59, 999);
      return anchor;
    }
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

export function formatTimelineLabel(period: string): string {
  const map: Record<string, string> = {
    'Today': 'Hari Ini',
    '7 Days': '7 Hari',
    '14 Days': '14 Hari',
    '30 Days': '30 Hari',
    '60 Days': '60 Hari',
    '90 Days': '90 Hari',
    'All Time': 'Semua Waktu',
    'Hari Ini': 'Hari Ini',
    '7 Hari': '7 Hari',
    '14 Hari': '14 Hari',
    '30 Hari': '30 Hari',
    '60 Hari': '60 Hari',
    '90 Hari': '90 Hari',
    'Semua Waktu': 'Semua Waktu',
  };
  return map[period] || period;
}

/**
 * Computes exact start and end timestamps for the Current Period and Previous Period
 * guaranteeing identical durations.
 */
export function getPeriodRange(period: TimelinePeriod, anchorDate: Date = new Date()): PeriodComparisonRange {
  const endOfAnchor = new Date(anchorDate);
  endOfAnchor.setHours(23, 59, 59, 999);

  let days = 30;
  if (period === 'Today' || period === 'Hari Ini') days = 1;
  else if (period === '7 Days' || period === '7 Hari') days = 7;
  else if (period === '14 Days' || period === '14 Hari') days = 14;
  else if (period === '30 Days' || period === '30 Hari') days = 30;
  else if (period === '60 Days' || period === '60 Hari') days = 60;
  else if (period === '90 Days' || period === '90 Hari') days = 90;
  else if (period === 'All Time' || period === 'Semua Waktu') days = 36500; // 100 years

  if (period === 'All Time' || period === 'Semua Waktu') {
    const pastAll = new Date('1970-01-01T00:00:00.000Z');
    return {
      current: { start: pastAll, end: endOfAnchor, days: 36500 },
      previous: null, // No comparison period for All Time
      label: 'Semua Waktu',
    };
  }

  // Current period duration: exactly `days` days ending at endOfAnchor
  const currentStart = new Date(endOfAnchor.getTime() - (days * 24 * 60 * 60 * 1000) + 1);
  currentStart.setHours(0, 0, 0, 0);

  // Previous period duration: exactly `days` days immediately preceding currentStart
  const prevEnd = new Date(currentStart.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - (days * 24 * 60 * 60 * 1000) + 1);
  prevStart.setHours(0, 0, 0, 0);

  return {
    current: { start: currentStart, end: endOfAnchor, days },
    previous: { start: prevStart, end: prevEnd, days },
    label: period,
  };
}

/**
 * Filter items by date range and optional platform
 */
export function filterItems(
  items: ContentItem[],
  range: DateWindow,
  platformFilter?: SocialPlatform | 'all'
): ContentItem[] {
  if (!items || items.length === 0) return [];
  const startTs = range.start.getTime();
  const endTs = range.end.getTime();

  return items.filter((item) => {
    if (platformFilter && platformFilter !== 'all' && item.platform !== platformFilter) {
      return false;
    }
    // Convert item date to UTC/local timestamp
    const itemDate = new Date(`${item.date.substring(0, 10)}T12:00:00`);
    const t = itemDate.getTime();
    return t >= startTs && t <= endTs;
  });
}

/**
 * Central function to retrieve Current Period dataset.
 */
export function getCurrentPeriodData(
  items: ContentItem[],
  period: TimelinePeriod,
  platformFilter?: SocialPlatform | 'all'
): ContentItem[] {
  if (!items || items.length === 0) return [];
  const anchor = getEffectiveAnchorDate(items);
  const ranges = getPeriodRange(period, anchor);
  return filterItems(items, ranges.current, platformFilter);
}

/**
 * Central function to retrieve Previous Period dataset (same duration).
 */
export function getPreviousPeriodData(
  items: ContentItem[],
  period: TimelinePeriod,
  platformFilter?: SocialPlatform | 'all'
): ContentItem[] {
  if (!items || items.length === 0) return [];
  const anchor = getEffectiveAnchorDate(items);
  const ranges = getPeriodRange(period, anchor);
  if (!ranges.previous) return [];
  return filterItems(items, ranges.previous, platformFilter);
}
