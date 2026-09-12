import {
  ContentItem,
  PeriodKPIs,
  PlatformPerformanceSummary,
  ContentTypePerformanceSummary,
  SocialPlatform,
  ContentFormat,
  TimeSeriesPoint,
} from '../types';

export const ALL_PLATFORMS: SocialPlatform[] = ['YouTube', 'Instagram', 'TikTok', 'Facebook'];
export const ALL_CONTENT_FORMATS: ContentFormat[] = ['Shorts', 'Reels', 'Video', 'Photo', 'Post', 'Live', 'Other'];

/**
 * Calculates primary KPI summary for a list of content records.
 * Follows exact formula:
 * Engagement = Likes + Comments + Shares + Saves
 * Engagement Rate = Reach > 0 ? (Engagement / Reach) * 100 : (Views > 0 ? (Engagement / Views) * 100 : 0)
 */
export function calculateKPIs(items: ContentItem[]): PeriodKPIs {
  if (!items || items.length === 0) {
    return {
      views: 0,
      reach: 0,
      engagement: 0,
      engagementRate: 0,
      followersGained: 0,
      contentCount: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    };
  }

  let views = 0;
  let reach = 0;
  let likes = 0;
  let comments = 0;
  let shares = 0;
  let saves = 0;
  let followersGained = 0;

  for (const item of items) {
    views += Number(item.views) || 0;
    reach += Number(item.reach) || 0;
    likes += Number(item.likes) || 0;
    comments += Number(item.comments) || 0;
    shares += Number(item.shares) || 0;
    saves += Number(item.saves) || 0;
    followersGained += Number(item.followersGained) || 0;
  }

  const engagement = likes + comments + shares + saves;
  let engagementRate = 0;

  if (reach > 0) {
    engagementRate = (engagement / reach) * 100;
  } else if (views > 0) {
    engagementRate = (engagement / views) * 100;
  }

  return {
    views,
    reach,
    engagement,
    engagementRate: Math.round(engagementRate * 100) / 100,
    followersGained,
    contentCount: items.length,
    likes,
    comments,
    shares,
    saves,
  };
}

/**
 * Calculates platform-specific performance breakdown, scores, and rankings.
 */
export function calculatePlatformPerformance(items: ContentItem[]): PlatformPerformanceSummary[] {
  const result: PlatformPerformanceSummary[] = ALL_PLATFORMS.map((platform) => {
    const platformItems = items.filter((it) => it.platform === platform);
    const kpis = calculateKPIs(platformItems);

    return {
      platform,
      contentCount: kpis.contentCount,
      views: kpis.views,
      reach: kpis.reach,
      engagement: kpis.engagement,
      engagementRate: kpis.engagementRate,
      followersGained: kpis.followersGained,
      score: 0,
      rank: 1,
    };
  });

  // Calculate composite score (0-100) based on views, engagement, and followers relative to total
  const totalViews = result.reduce((acc, p) => acc + p.views, 0);
  const totalEng = result.reduce((acc, p) => acc + p.engagement, 0);
  const totalFollowers = result.reduce((acc, p) => acc + p.followersGained, 0);

  result.forEach((p) => {
    if (p.contentCount === 0) {
      p.score = 0;
      return;
    }
    const viewShare = totalViews > 0 ? (p.views / totalViews) * 40 : 0;
    const engShare = totalEng > 0 ? (p.engagement / totalEng) * 40 : 0;
    const followerShare = totalFollowers > 0 ? (p.followersGained / totalFollowers) * 20 : 0;
    
    // Efficiency multiplier based on engagement rate (capped at +20 bonus)
    const erBonus = Math.min(20, (p.engagementRate || 0) * 2);
    
    p.score = Math.min(100, Math.round(viewShare + engShare + followerShare + erBonus));
  });

  // Sort descending by score then views to compute rank
  const sorted = [...result].sort((a, b) => b.score - a.score || b.views - a.views);
  sorted.forEach((p, idx) => {
    const target = result.find((item) => item.platform === p.platform);
    if (target) {
      target.rank = p.contentCount > 0 ? idx + 1 : 4;
    }
  });

  return result;
}

/**
 * Calculates performance breakdown by content format (Reels, Shorts, Video, Photo, Post, Live, etc.)
 */
export function calculateContentTypePerformance(items: ContentItem[]): ContentTypePerformanceSummary[] {
  if (!items || items.length === 0) return [];

  const map = new Map<ContentFormat, ContentItem[]>();

  for (const item of items) {
    const format = item.contentType || 'Other';
    if (!map.has(format)) {
      map.set(format, []);
    }
    map.get(format)!.push(item);
  }

  const summaries: ContentTypePerformanceSummary[] = [];

  map.forEach((formatItems, format) => {
    const kpis = calculateKPIs(formatItems);
    summaries.push({
      contentType: format,
      contentCount: kpis.contentCount,
      views: kpis.views,
      reach: kpis.reach,
      engagement: kpis.engagement,
      avgEngagementRate: kpis.engagementRate,
      avgViews: Math.round(kpis.views / formatItems.length),
    });
  });

  return summaries.sort((a, b) => b.views - a.views);
}

/**
 * Aggregates daily time-series data for charting.
 */
export function calculateDailyTimeSeries(items: ContentItem[]): TimeSeriesPoint[] {
  if (!items || items.length === 0) return [];

  const map = new Map<string, { views: number; reach: number; engagement: number; followersGained: number; count: number }>();

  for (const item of items) {
    const dateKey = item.date.substring(0, 10);
    const eng = (item.likes || 0) + (item.comments || 0) + (item.shares || 0) + (item.saves || 0);

    const prev = map.get(dateKey) || { views: 0, reach: 0, engagement: 0, followersGained: 0, count: 0 };
    map.set(dateKey, {
      views: prev.views + (Number(item.views) || 0),
      reach: prev.reach + (Number(item.reach) || 0),
      engagement: prev.engagement + eng,
      followersGained: prev.followersGained + (Number(item.followersGained) || 0),
      count: prev.count + 1,
    });
  }

  const points: TimeSeriesPoint[] = [];
  map.forEach((val, dateKey) => {
    points.push({
      date: dateKey,
      views: val.views,
      reach: val.reach,
      engagement: val.engagement,
      followersGained: val.followersGained,
      contentCount: val.count,
    });
  });

  return points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
