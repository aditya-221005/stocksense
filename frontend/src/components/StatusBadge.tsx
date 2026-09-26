import React from 'react';
import { DocumentStatus } from '../types';

interface StatusBadgeProps {
  status: DocumentStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (status) {
    case 'DONE':
      badgeStyle = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50';
      break;
    case 'READY':
      badgeStyle = 'bg-indigo-950/80 text-indigo-400 border-indigo-800/50';
      break;
    case 'WAITING':
      badgeStyle = 'bg-amber-950/80 text-amber-400 border-amber-800/50';
      break;
    case 'DRAFT':
      badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
      break;
    case 'CANCELED':
      badgeStyle = 'bg-rose-950/80 text-rose-400 border-rose-800/50';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}
    >
      {status}
    </span>
  );
};
