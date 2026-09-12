import { DatabaseSchema, ContentItem, SocialPlatform, ContentFormat } from '../types';

export const DB_STORAGE_KEY = 'BAYU_SOCIAL_INTELLIGENCE';
export const CURRENT_DB_VERSION = 1;

export const INITIAL_DATABASE: DatabaseSchema = {
  version: CURRENT_DB_VERSION,
  platforms: ['YouTube', 'Instagram', 'TikTok', 'Facebook'],
  content: [],
  imports: [],
  settings: {
    appName: 'BAYU SOCIAL INTELLIGENCE',
    currency: 'USD',
    numberFormat: 'en-US',
    defaultTimeline: '30 Days',
    theme: 'dark',
  },
};

/**
 * Generate a fingerprint for a content item to detect duplicates.
 * Based on platform + normalized title + date.
 */
export function generateFingerprint(platform: string, title: string, date: string): string {
  const normPlatform = (platform || '').trim().toLowerCase();
  const normTitle = (title || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const normDate = (date || '').trim().substring(0, 10);
  return `${normPlatform}|${normTitle}|${normDate}`;
}

/**
 * Load the database from LocalStorage.
 * Returns initial empty database if none found.
 */
export function loadDatabase(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      return { ...INITIAL_DATABASE, content: [], imports: [] };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...INITIAL_DATABASE, content: [], imports: [] };
    }
    
    // Safety check fields
    return {
      version: parsed.version || CURRENT_DB_VERSION,
      platforms: parsed.platforms || ['YouTube', 'Instagram', 'TikTok', 'Facebook'],
      content: Array.isArray(parsed.content) ? parsed.content : [],
      imports: Array.isArray(parsed.imports) ? parsed.imports : [],
      settings: {
        ...INITIAL_DATABASE.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch (error) {
    console.error('Error loading database from LocalStorage:', error);
    return { ...INITIAL_DATABASE, content: [], imports: [] };
  }
}

/**
 * Save database to LocalStorage.
 */
export function saveDatabase(db: DatabaseSchema): boolean {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    console.error('Error saving database to LocalStorage:', error);
    return false;
  }
}

/**
 * Reset database to clean initial empty state.
 */
export function resetDatabase(): DatabaseSchema {
  const empty: DatabaseSchema = {
    ...INITIAL_DATABASE,
    content: [],
    imports: [],
  };
  saveDatabase(empty);
  return empty;
}

/**
 * Export current database as downloadable JSON string.
 */
export function exportDatabaseBackup(): string {
  const db = loadDatabase();
  return JSON.stringify(db, null, 2);
}

/**
 * Restore database from JSON string backup.
 */
export function restoreDatabaseBackup(jsonString: string): { success: boolean; error?: string; db?: DatabaseSchema } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.content)) {
      return { success: false, error: 'Invalid backup file structure: missing content array.' };
    }
    const restored: DatabaseSchema = {
      version: parsed.version || CURRENT_DB_VERSION,
      platforms: parsed.platforms || ['YouTube', 'Instagram', 'TikTok', 'Facebook'],
      content: parsed.content.map((item: any) => ({
        ...item,
        id: item.id || `restored_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fingerprint: item.fingerprint || generateFingerprint(item.platform, item.title, item.date),
      })),
      imports: Array.isArray(parsed.imports) ? parsed.imports : [],
      settings: {
        ...INITIAL_DATABASE.settings,
        ...(parsed.settings || {}),
      },
    };
    saveDatabase(restored);
    return { success: true, db: restored };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON backup.' };
  }
}

/**
 * Optional Starter Dataset Loader (for manual user testing without leaving blank).
 * This will ONLY be called if the user explicitly triggers "Load Real-World Testing Dataset".
 */
export function generateTestDataset(): ContentItem[] {
  const platforms: SocialPlatform[] = ['YouTube', 'Instagram', 'TikTok', 'Facebook'];
  const formats: Record<SocialPlatform, ContentFormat[]> = {
    YouTube: ['Video', 'Shorts', 'Live'],
    Instagram: ['Reels', 'Photo', 'Post'],
    TikTok: ['Video', 'Live'],
    Facebook: ['Post', 'Video', 'Photo'],
  };

  const sampleTitles = [
    'How We Scaled from 0 to 100K Followers in 90 Days',
    'Behind the Scenes: Product Strategy & Architecture',
    '3 Mistakes You Are Making with Content Distribution',
    'Live Q&A: Social Media Algorithms Explained',
    'Quick Breakdown: Why Hook Rates Matter in 2026',
    'Case Study: High Retention Reels Masterclass',
    'The Real Cost of Paid Ads vs Organic Exposure',
    'Weekly Community Roundup & Audience Highlights',
    'Micro-tutorial: Setting Up Content Automation',
    'Data Teardown: What Drives Repeat Shares?',
    'Top 5 Tools We Use for Daily Social Operations',
    'Ask Me Anything Session - Growth Engineering',
    '5-Minute Framework for High-CTR Thumbnails',
    'Why Long-Form Video Is Making a Massive Comeback',
  ];

  const now = new Date();
  const items: ContentItem[] = [];

  // Generate records spread across the last 45 days so both Current & Previous periods have realistic data
  for (let i = 0; i < 40; i++) {
    const dayOffset = Math.floor(Math.random() * 45);
    const dateObj = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = dateObj.toISOString().split('T')[0];

    const platform = platforms[i % platforms.length];
    const availableFormats = formats[platform];
    const contentType = availableFormats[i % availableFormats.length];
    const title = `${sampleTitles[i % sampleTitles.length]} #${i + 1}`;

    const views = Math.floor(1200 + Math.random() * 28000);
    const reach = Math.floor(views * (0.65 + Math.random() * 0.4));
    const likes = Math.floor(views * (0.04 + Math.random() * 0.08));
    const comments = Math.floor(likes * (0.05 + Math.random() * 0.15));
    const shares = Math.floor(likes * (0.03 + Math.random() * 0.12));
    const saves = Math.floor(likes * (0.04 + Math.random() * 0.14));
    const followersGained = Math.floor(views * (0.005 + Math.random() * 0.02));

    const id = `init_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
    const fingerprint = generateFingerprint(platform, title, dateStr);

    items.push({
      id,
      platform,
      title,
      date: dateStr,
      contentType,
      views,
      reach,
      likes,
      comments,
      shares,
      saves,
      followersGained,
      fingerprint,
      createdAt: dateObj.toISOString(),
      updatedAt: dateObj.toISOString(),
    });
  }

  // Sort descending by date
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
