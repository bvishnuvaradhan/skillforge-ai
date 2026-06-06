"use client";

import React from 'react';

export function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderPulse = () => {
    switch (type) {
      case 'recommendation':
        return (
          <div className="w-full bg-slate-900/30 border border-white/5 rounded-3xl p-5 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/10 rounded w-1/4" />
                <div className="h-5 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-5/6" />
              </div>
              <div className="h-10 bg-white/10 rounded-full w-12" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-10 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
            </div>
            <div className="h-2 bg-white/10 rounded-full w-full" />
            <div className="flex gap-2">
              <div className="h-8 bg-white/10 rounded w-1/3" />
              <div className="h-8 bg-white/10 rounded w-1/3" />
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="w-full bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-6 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-2">
                <div className="h-8 bg-white/10 rounded w-64" />
                <div className="h-4 bg-white/10 rounded w-48" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-white/10 rounded-full w-24" />
                <div className="h-6 bg-white/10 rounded-full w-24" />
                <div className="h-6 bg-white/10 rounded-full w-24" />
              </div>
            </div>
            <div className="bg-slate-950/20 rounded-2xl p-5 space-y-4">
              <div className="h-4 bg-white/10 rounded w-48" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
              </div>
            </div>
          </div>
        );

      case 'graph-node':
        return (
          <div className="w-[130px] h-[75px] bg-slate-900/50 border border-white/10 rounded-xl p-2.5 animate-pulse flex flex-col justify-between">
            <div className="h-3 bg-white/10 rounded w-3/4" />
            <div className="h-2 bg-white/10 rounded w-1/2" />
            <div className="h-1.5 bg-white/10 rounded-full w-full" />
          </div>
        );

      case 'sidebar':
        return (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/2 mb-6" />
            <div className="h-10 bg-white/10 rounded-xl w-full" />
            <div className="h-10 bg-white/10 rounded-xl w-full" />
            <div className="h-10 bg-white/10 rounded-xl w-full" />
            <div className="h-10 bg-white/10 rounded-xl w-full" />
          </div>
        );

      case 'card':
      default:
        return (
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-8 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-full" />
            <div className="h-3 bg-white/10 rounded w-5/6" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderPulse()}</React.Fragment>
      ))}
    </div>
  );
}

export default SkeletonLoader;
