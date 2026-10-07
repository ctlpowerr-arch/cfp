import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Robust lazy import with automatic retry and stale bundle recovery
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const module = await factory();
      sessionStorage.removeItem('lazy_retry_refreshed');
      return module;
    } catch (error: any) {
      console.warn('Dynamic import failed, attempting recovery:', error);
      
      const isDynamicImportError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('error loading dynamically imported module');

      if (isDynamicImportError) {
        const hasRefreshed = sessionStorage.getItem('lazy_retry_refreshed');
        if (!hasRefreshed) {
          sessionStorage.setItem('lazy_retry_refreshed', 'true');
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw error;
    }
  });
}
