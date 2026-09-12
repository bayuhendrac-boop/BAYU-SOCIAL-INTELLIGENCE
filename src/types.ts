export type SocialPlatform = 'YouTube' | 'Instagram' | 'TikTok' | 'Facebook';

export type ContentFormat = 'Shorts' | 'Reels' | 'Video' | 'Foto' | 'Post' | 'Live' | 'Lainnya' | 'Photo' | 'Other';

export type TimelinePeriod =
  | 'Hari Ini'
  | '7 Hari'
  | '14 Hari'
  | '30 Hari'
  | '60 Hari'
  | '90 Hari'
  | 'Semua Waktu'
  | 'Today'
  | '7 Days'
  | '14 Days'
  | '30 Days'
  | '60 Days'
  | '90 Days'
  | 'All Time';

export interface ContentItem {
  id: string;
  platform: SocialPlatform;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  contentType: ContentFormat;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
  fingerprint: string;
  batchId?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportBatch {
  id: string;
  filename: string;
  platform: SocialPlatform | 'Multi-Platform';
  importedAt: string;
  recordCount: number;
  duplicateCount: number;
  status: 'Completed' | 'Partially Imported' | 'Failed';
}

export interface AppSettings {
  appName: string;
  currency: string;
  numberFormat: 'en-US' | 'id-ID' | 'de-DE';
  defaultTimeline: TimelinePeriod;
  theme: 'dark' | 'light' | 'system';
}

export interface DatabaseSchema {
  version: number;
  platforms: SocialPlatform[];
  content: ContentItem[];
  imports: ImportBatch[];
  settings: AppSettings;
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
  days: number;
}

export interface MetricGrowth {
  current: number;
  previous: number;
  growthPct: number | null; // null if previous === 0 or no previous data
  status: 'positive' | 'negative' | 'neutral' | 'new' | 'no-data';
  displayText: string;
}

export interface PeriodKPIs {
  views: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  followersGained: number;
  contentCount: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface PlatformPerformanceSummary {
  platform: SocialPlatform;
  contentCount: number;
  views: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  followersGained: number;
  score: number; // 0 to 100 benchmark score
  rank: number;
}

export interface ContentTypePerformanceSummary {
  contentType: ContentFormat;
  contentCount: number;
  views: number;
  reach: number;
  engagement: number;
  avgEngagementRate: number;
  avgViews: number;
}

export interface RecommendationItem {
  id: string;
  issue: string;
  evidence: string;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
  target: string;
  category: 'Engagement' | 'Reach' | 'Content Cadence' | 'Platform Imbalance' | 'Format Optimization';
}

export interface TimeSeriesPoint {
  date: string;
  views: number;
  reach: number;
  engagement: number;
  followersGained: number;
  contentCount: number;
}

export type ActiveRoute =
  | 'dashboard'
  | 'analytics-overview'
  | 'analytics-youtube'
  | 'analytics-instagram'
  | 'analytics-tiktok'
  | 'analytics-facebook'
  | 'intelligence-content'
  | 'intelligence-audience'
  | 'intelligence-growth'
  | 'intelligence-exposure'
  | 'intelligence-recommendations'
  | 'reports'
  | 'data-import'
  | 'data-history'
  | 'data-management'
  | 'settings';
