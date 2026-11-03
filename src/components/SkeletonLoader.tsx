import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-4 flex-1 bg-slate-200 rounded max-w-md"></div>
          <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
          <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-12 bg-slate-200 rounded-md"></div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-slate-200 rounded"></div>
        <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="mt-4 h-8 w-16 bg-slate-200 rounded"></div>
      <div className="mt-2 h-3 w-32 bg-slate-100 rounded"></div>
    </div>
  );
};

