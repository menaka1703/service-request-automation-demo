import React from 'react';
import { Priority } from '../types/request';
import { ArrowUpRight, ArrowRight, ArrowDownRight, AlertOctagon } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority | string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (priority) {
      case 'Urgent':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
        };
      case 'High':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-orange-600" />,
        };
      case 'Medium':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          icon: <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />,
        };
      case 'Low':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200/80',
          icon: <ArrowDownRight className="w-3.5 h-3.5 text-slate-500" />,
        };
      default:
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: null,
        };
    }
  };

  const { bg, icon } = getBadgeConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      data-testid={`priority-badge-${priority.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-md border ${bg} ${sizeClasses} shadow-2xs`}
    >
      {icon}
      <span>{priority}</span>
    </span>
  );
};

