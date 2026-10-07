import React from 'react';
import { cn } from '@/lib/utils';

export function GradeCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-4 animate-pulse", className)}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Score Box Skeleton */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl w-32 h-20 flex flex-col justify-center space-y-2 shrink-0">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-7 w-20 bg-slate-300 dark:bg-slate-600 rounded-lg" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function GradeGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <GradeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GradeKPIsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse space-y-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-24 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GradeTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-8 w-20 bg-slate-300 dark:bg-slate-600 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
