import * as XLSX from 'xlsx';
import { ContentFormat, ContentItem, ImportBatch, SocialPlatform } from '../types';
import { generateFingerprint } from './database';

export interface ColumnMapping {
  platform: string;
  title: string;
  date: string;
  contentType: string;
  views: string;
  reach: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  followersGained: string;
}

export interface ParsedFileResult {
  filename: string;
  headers: string[];
  rawRows: any[];
  suggestedMapping: ColumnMapping;
}

export type DuplicateAction = 'skip' | 'update' | 'import_all';

export interface ImportExecutionResult {
  batch: ImportBatch;
  importedItems: ContentItem[];
  updatedItemsCount: number;
  skippedItemsCount: number;
  addedItemsCount: number;
}

/**
 * Auto-mapping dictionary based on common social media platform export headers.
 */
const AUTO_MAPPING_RULES: Record<keyof ColumnMapping, string[]> = {
  title: ['title', 'name', 'video', 'content', 'caption', 'post title', 'video title', 'text', 'post description'],
  date: ['date', 'published', 'time', 'day', 'publish date', 'posted at', 'created at', 'upload time', 'timestamp'],
  views: ['view', 'views', 'play', 'plays', 'impression', 'impressions', 'total views', 'video views'],
  reach: ['reach', 'accounts reached', 'unique', 'unique viewers', 'unique reach', 'impressions unique'],
  likes: ['like', 'likes', 'reaction', 'reactions', 'upvotes', 'hearts'],
  comments: ['comment', 'comments', 'reply', 'replies'],
  shares: ['share', 'shares', 'reposts', 'retweets'],
  saves: ['save', 'saves', 'bookmark', 'bookmarks', 'favorites'],
  followersGained: ['follower', 'followers', 'followers gained', 'subscribers gained', 'net followers', 'new followers'],
  platform: ['platform', 'network', 'channel', 'source', 'social platform'],
  contentType: ['type', 'content type', 'format', 'media', 'post type', 'video type'],
};

/**
 * Find best matching column from headers based on candidate words.
 */
function findBestColumnMatch(headers: string[], candidates: string[]): string {
  const normHeaders = headers.map((h) => ({ original: h, clean: h.toLowerCase().trim().replace(/[^a-z0-9]/g, '') }));

  // Exact or contains match
  for (const cand of candidates) {
    const cleanCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const h of normHeaders) {
      if (h.clean === cleanCand || h.clean.includes(cleanCand)) {
        return h.original;
      }
    }
  }
  return '';
}

/**
 * Parses an uploaded CSV or XLSX file and extracts headers and raw rows.
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded file does not contain any spreadsheet sheets.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of objects
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('The spreadsheet sheet appears to be empty.');
  }

  const headers = Object.keys(rawRows[0] || {});

  // Build suggested column mapping
  const suggestedMapping: ColumnMapping = {
    platform: findBestColumnMatch(headers, AUTO_MAPPING_RULES.platform),
    title: findBestColumnMatch(headers, AUTO_MAPPING_RULES.title),
    date: findBestColumnMatch(headers, AUTO_MAPPING_RULES.date),
    contentType: findBestColumnMatch(headers, AUTO_MAPPING_RULES.contentType),
    views: findBestColumnMatch(headers, AUTO_MAPPING_RULES.views),
    reach: findBestColumnMatch(headers, AUTO_MAPPING_RULES.reach),
    likes: findBestColumnMatch(headers, AUTO_MAPPING_RULES.likes),
    comments: findBestColumnMatch(headers, AUTO_MAPPING_RULES.comments),
    shares: findBestColumnMatch(headers, AUTO_MAPPING_RULES.shares),
    saves: findBestColumnMatch(headers, AUTO_MAPPING_RULES.saves),
    followersGained: findBestColumnMatch(headers, AUTO_MAPPING_RULES.followersGained),
  };

  return {
    filename: file.name,
    headers,
    rawRows,
    suggestedMapping,
  };
}

/**
 * Normalizes platform name
 */
export function normalizePlatform(raw: any, defaultPlatform: SocialPlatform = 'YouTube'): SocialPlatform {
  const str = String(raw || '').trim().toLowerCase();
  if (str.includes('insta')) return 'Instagram';
  if (str.includes('tiktok') || str.includes('tik tok')) return 'TikTok';
  if (str.includes('face') || str.includes('fb')) return 'Facebook';
  if (str.includes('tube') || str.includes('yt')) return 'YouTube';
  return defaultPlatform;
}

/**
 * Normalizes content format
 */
export function normalizeContentType(raw: any): ContentFormat {
  const str = String(raw || '').trim().toLowerCase();
  if (str.includes('short')) return 'Shorts';
  if (str.includes('reel')) return 'Reels';
  if (str.includes('live') || str.includes('stream')) return 'Live';
  if (str.includes('photo') || str.includes('image') || str.includes('carousel')) return 'Photo';
  if (str.includes('post') || str.includes('text') || str.includes('feed')) return 'Post';
  if (str.includes('video')) return 'Video';
  return 'Video';
}

/**
 * Normalizes date string into YYYY-MM-DD
 */
export function normalizeDate(raw: any): string {
  if (!raw) {
    return new Date().toISOString().split('T')[0];
  }
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toISOString().split('T')[0];
  }
  const str = String(raw).trim();
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Normalizes integer numbers cleanly
 */
function parseNum(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.max(0, Math.round(val));
  if (!val) return 0;
  const clean = String(val).replace(/[^0-9.-]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : Math.max(0, Math.round(n));
}

/**
 * Execute import with duplicate protection and batch creation.
 */
export function executeImport(
  rawRows: any[],
  mapping: ColumnMapping,
  defaultPlatform: SocialPlatform,
  existingItems: ContentItem[],
  filename: string,
  duplicateAction: DuplicateAction
): ImportExecutionResult {
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  const existingFingerprints = new Map<string, ContentItem>();
  existingItems.forEach((it) => existingFingerprints.set(it.fingerprint, it));

  let addedItems: ContentItem[] = [];
  let updatedItems: ContentItem[] = [];
  let skippedCount = 0;

  // Process rows
  rawRows.forEach((row, index) => {
    const rawTitle = mapping.title ? row[mapping.title] : '';
    const title = String(rawTitle || `Imported Item #${index + 1}`).trim();
    const date = normalizeDate(mapping.date ? row[mapping.date] : '');
    const platform = mapping.platform ? normalizePlatform(row[mapping.platform], defaultPlatform) : defaultPlatform;
    const contentType = mapping.contentType ? normalizeContentType(row[mapping.contentType]) : 'Video';

    const views = parseNum(mapping.views ? row[mapping.views] : 0);
    const reach = parseNum(mapping.reach ? row[mapping.reach] : views * 0.85);
    const likes = parseNum(mapping.likes ? row[mapping.likes] : 0);
    const comments = parseNum(mapping.comments ? row[mapping.comments] : 0);
    const shares = parseNum(mapping.shares ? row[mapping.shares] : 0);
    const saves = parseNum(mapping.saves ? row[mapping.saves] : 0);
    const followersGained = parseNum(mapping.followersGained ? row[mapping.followersGained] : 0);

    const fingerprint = generateFingerprint(platform, title, date);
    const existing = existingFingerprints.get(fingerprint);

    if (existing) {
      if (duplicateAction === 'skip') {
        skippedCount++;
        return;
      } else if (duplicateAction === 'update') {
        updatedItems.push({
          ...existing,
          platform,
          title,
          date,
          contentType,
          views,
          reach,
          likes,
          comments,
          shares,
          saves,
          followersGained,
          batchId: existing.batchId || batchId,
          updatedAt: nowIso,
        });
        return;
      }
    }

    // New item or import_all
    const newItem: ContentItem = {
      id: `content_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      platform,
      title,
      date,
      contentType,
      views,
      reach,
      likes,
      comments,
      shares,
      saves,
      followersGained,
      fingerprint,
      batchId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    addedItems.push(newItem);
    existingFingerprints.set(fingerprint, newItem);
  });

  // Assemble full dataset
  let nextAllItems: ContentItem[] = [];
  if (duplicateAction === 'update') {
    const updatedMap = new Map(updatedItems.map((u) => [u.id, u]));
    nextAllItems = existingItems.map((item) => updatedMap.get(item.id) || item);
    nextAllItems.push(...addedItems);
  } else {
    nextAllItems = [...existingItems, ...addedItems];
  }

  const batch: ImportBatch = {
    id: batchId,
    filename,
    platform: defaultPlatform,
    importedAt: nowIso,
    recordCount: addedItems.length + updatedItems.length,
    duplicateCount: skippedCount,
    status: addedItems.length + updatedItems.length > 0 ? 'Completed' : 'Partially Imported',
  };

  return {
    batch,
    importedItems: nextAllItems,
    addedItemsCount: addedItems.length,
    updatedItemsCount: updatedItems.length,
    skippedItemsCount: skippedCount,
  };
}
