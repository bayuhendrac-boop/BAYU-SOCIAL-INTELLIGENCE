import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActiveRoute,
  AppSettings,
  ContentItem,
  ContentTypePerformanceSummary,
  DatabaseSchema,
  MetricGrowth,
  PeriodKPIs,
  PlatformPerformanceSummary,
  RecommendationItem,
  SocialPlatform,
  TimeSeriesPoint,
  TimelinePeriod,
} from '../types';
import {
  loadDatabase,
  saveDatabase,
  resetDatabase as dbReset,
  exportDatabaseBackup,
  restoreDatabaseBackup,
  generateFingerprint,
  generateTestDataset,
} from '../services/database';
import { getCurrentPeriodData, getPreviousPeriodData } from '../services/filterEngine';
import {
  calculateKPIs,
  calculatePlatformPerformance,
  calculateContentTypePerformance,
  calculateDailyTimeSeries,
} from '../services/analyticsEngine';
import { calculateGrowth } from '../services/growthEngine';
import { generateRecommendations } from '../services/recommendationEngine';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  db: DatabaseSchema;
  activeRoute: ActiveRoute;
  setActiveRoute: (route: ActiveRoute) => void;
  timelinePeriod: TimelinePeriod;
  setTimelinePeriod: (period: TimelinePeriod) => void;
  platformFilter: SocialPlatform | 'all';
  setPlatformFilter: (p: SocialPlatform | 'all') => void;

  // Data Actions
  addContent: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'fingerprint'>) => void;
  updateContent: (item: ContentItem) => void;
  deleteContent: (id: string) => void;
  deleteBatch: (batchId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: () => void;
  loadSampleTestData: () => void;
  exportBackup: () => void;
  restoreBackupFile: (jsonText: string) => boolean;

  // Analytics & Intelligence State
  currentPeriodItems: ContentItem[];
  previousPeriodItems: ContentItem[];
  currentKPIs: PeriodKPIs;
  previousKPIs: PeriodKPIs;
  growth: {
    views: MetricGrowth;
    reach: MetricGrowth;
    engagement: MetricGrowth;
    followersGained: MetricGrowth;
    contentCount: MetricGrowth;
    engagementRate: MetricGrowth;
  };
  platformPerformance: PlatformPerformanceSummary[];
  contentTypePerformance: ContentTypePerformanceSummary[];
  timeSeriesData: TimeSeriesPoint[];
  recommendations: RecommendationItem[];

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DatabaseSchema>(() => loadDatabase());
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>('dashboard');
  const [timelinePeriod, setTimelinePeriod] = useState<TimelinePeriod>(
    () => db.settings.defaultTimeline || '30 Days'
  );
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Automatically sync to LocalStorage on state change
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Determine current active platform filter based on route
  const effectivePlatformFilter = useMemo<SocialPlatform | 'all'>(() => {
    if (activeRoute === 'analytics-youtube') return 'YouTube';
    if (activeRoute === 'analytics-instagram') return 'Instagram';
    if (activeRoute === 'analytics-tiktok') return 'TikTok';
    if (activeRoute === 'analytics-facebook') return 'Facebook';
    return platformFilter;
  }, [activeRoute, platformFilter]);

  // Current & Previous Period filtered items
  const currentPeriodItems = useMemo(() => {
    return getCurrentPeriodData(db.content, timelinePeriod, effectivePlatformFilter);
  }, [db.content, timelinePeriod, effectivePlatformFilter]);

  const previousPeriodItems = useMemo(() => {
    return getPreviousPeriodData(db.content, timelinePeriod, effectivePlatformFilter);
  }, [db.content, timelinePeriod, effectivePlatformFilter]);

  // Central Analytics Engine KPI calculations
  const currentKPIs = useMemo(() => {
    return calculateKPIs(currentPeriodItems);
  }, [currentPeriodItems]);

  const previousKPIs = useMemo(() => {
    return calculateKPIs(previousPeriodItems);
  }, [previousPeriodItems]);

  // Central Growth Engine calculations
  const hasComparison = timelinePeriod !== 'All Time';
  const growth = useMemo(() => {
    return {
      views: calculateGrowth(currentKPIs.views, previousKPIs.views, hasComparison),
      reach: calculateGrowth(currentKPIs.reach, previousKPIs.reach, hasComparison),
      engagement: calculateGrowth(currentKPIs.engagement, previousKPIs.engagement, hasComparison),
      followersGained: calculateGrowth(currentKPIs.followersGained, previousKPIs.followersGained, hasComparison),
      contentCount: calculateGrowth(currentKPIs.contentCount, previousKPIs.contentCount, hasComparison),
      engagementRate: calculateGrowth(currentKPIs.engagementRate, previousKPIs.engagementRate, hasComparison),
    };
  }, [currentKPIs, previousKPIs, hasComparison]);

  // Platform Performance & Ranking
  const platformPerformance = useMemo(() => {
    return calculatePlatformPerformance(currentPeriodItems);
  }, [currentPeriodItems]);

  // Content Type Performance
  const contentTypePerformance = useMemo(() => {
    return calculateContentTypePerformance(currentPeriodItems);
  }, [currentPeriodItems]);

  // Time-series breakdown for trends
  const timeSeriesData = useMemo(() => {
    return calculateDailyTimeSeries(currentPeriodItems);
  }, [currentPeriodItems]);

  // Central Recommendation Engine
  const recommendations = useMemo(() => {
    return generateRecommendations({
      currentItems: currentPeriodItems,
      previousItems: previousPeriodItems,
      currentKPIs,
      previousKPIs,
      platformPerformance,
      contentTypePerformance,
      period: timelinePeriod,
      hasComparison,
    });
  }, [
    currentPeriodItems,
    previousPeriodItems,
    currentKPIs,
    previousKPIs,
    platformPerformance,
    contentTypePerformance,
    timelinePeriod,
    hasComparison,
  ]);

  // CRUD Operations
  const addContent = useCallback(
    (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'fingerprint'>) => {
      const nowIso = new Date().toISOString();
      const fingerprint = generateFingerprint(item.platform, item.title, item.date);
      const newItem: ContentItem = {
        ...item,
        id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fingerprint,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setDb((prev) => {
        const next = {
          ...prev,
          content: [newItem, ...prev.content],
        };
        saveDatabase(next);
        return next;
      });

      addToast(`Content entry "${item.title}" saved successfully.`, 'success');
    },
    [addToast]
  );

  const updateContent = useCallback(
    (item: ContentItem) => {
      const nowIso = new Date().toISOString();
      const fingerprint = generateFingerprint(item.platform, item.title, item.date);
      const updatedItem: ContentItem = {
        ...item,
        fingerprint,
        updatedAt: nowIso,
      };

      setDb((prev) => {
        const next = {
          ...prev,
          content: prev.content.map((c) => (c.id === item.id ? updatedItem : c)),
        };
        saveDatabase(next);
        return next;
      });

      addToast(`Updated "${item.title}".`, 'success');
    },
    [addToast]
  );

  const deleteContent = useCallback(
    (id: string) => {
      setDb((prev) => {
        const next = {
          ...prev,
          content: prev.content.filter((c) => c.id !== id),
        };
        saveDatabase(next);
        return next;
      });

      addToast('Content entry removed.', 'info');
    },
    [addToast]
  );

  const deleteBatch = useCallback(
    (batchId: string) => {
      setDb((prev) => {
        // Cascade delete all associated records
        const nextContent = prev.content.filter((c) => c.batchId !== batchId);
        const nextImports = prev.imports.filter((b) => b.id !== batchId);
        const removedCount = prev.content.length - nextContent.length;

        const nextDb: DatabaseSchema = {
          ...prev,
          content: nextContent,
          imports: nextImports,
        };
        saveDatabase(nextDb);
        return nextDb;
      });

      addToast(`Batch deleted along with all associated records.`, 'info');
    },
    [addToast]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setDb((prev) => {
        const next = {
          ...prev,
          settings: {
            ...prev.settings,
            ...newSettings,
          },
        };
        saveDatabase(next);
        return next;
      });

      if (newSettings.defaultTimeline) {
        setTimelinePeriod(newSettings.defaultTimeline);
      }

      addToast('Settings updated.', 'success');
    },
    [addToast]
  );

  const resetAllData = useCallback(() => {
    const empty = dbReset();
    setDb(empty);
    addToast('All data cleared. Database has been reset to zero.', 'info');
  }, [addToast]);

  const loadSampleTestData = useCallback(() => {
    const testItems = generateTestDataset();
    setDb((prev) => {
      const next: DatabaseSchema = {
        ...prev,
        content: [...testItems, ...prev.content],
      };
      saveDatabase(next);
      return next;
    });
    addToast(`Loaded ${testItems.length} real-world structured sample records across 4 platforms.`, 'success');
  }, [addToast]);

  const exportBackup = useCallback(() => {
    const jsonStr = exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bayu_social_intelligence_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Backup exported successfully.', 'success');
  }, [addToast]);

  const restoreBackupFile = useCallback(
    (jsonText: string): boolean => {
      const res = restoreDatabaseBackup(jsonText);
      if (res.success && res.db) {
        setDb(res.db);
        addToast(`Restored ${res.db.content.length} records from backup.`, 'success');
        return true;
      } else {
        addToast(res.error || 'Failed to restore backup.', 'error');
        return false;
      }
    },
    [addToast]
  );

  return (
    <AppContext.Provider
      value={{
        db,
        activeRoute,
        setActiveRoute,
        timelinePeriod,
        setTimelinePeriod,
        platformFilter: effectivePlatformFilter,
        setPlatformFilter,
        addContent,
        updateContent,
        deleteContent,
        deleteBatch,
        updateSettings,
        resetAllData,
        loadSampleTestData,
        exportBackup,
        restoreBackupFile,
        currentPeriodItems,
        previousPeriodItems,
        currentKPIs,
        previousKPIs,
        growth,
        platformPerformance,
        contentTypePerformance,
        timeSeriesData,
        recommendations,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
