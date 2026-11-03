import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  badge,
  badgeColor = 'blue',
  onClick,
}) => {
  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {badge && (
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getBadgeClasses()}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400 font-medium">
          {subtitle}
        </p>
      )}

      {/* Subtle indicator bar on hover */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-transparent transition-colors group-hover:bg-indigo-500" />
    </div>
  );
};
