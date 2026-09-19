import { RiskLevel, CaseStatus, AMLPatternType } from '../types';

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  // Use Indian number grouping (lakhs & crores)
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const s = absAmount.toString();
  let result = '';

  if (s.length <= 3) {
    result = s;
  } else {
    const lastThree = s.substring(s.length - 3);
    const otherNumbers = s.substring(0, s.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = formattedOther + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}₹${result}`;
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    const cr = (amount / 10000000).toFixed(1).replace(/\.0$/, '');
    return `₹${cr} Cr`;
  }
  if (absAmount >= 100000) {
    const lakh = (amount / 100000).toFixed(1).replace(/\.0$/, '');
    return `₹${lakh} Lakh`;
  }
  if (absAmount >= 1000) {
    const k = (amount / 1000).toFixed(1).replace(/\.0$/, '');
    return `₹${k} K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatTimestamp(isoOrString: string): string {
  if (!isoOrString) return '';
  const date = new Date(isoOrString);
  if (isNaN(date.getTime())) {
    return isoOrString;
  }
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(isoOrString: string): string {
  if (!isoOrString) return '';
  const date = new Date(isoOrString);
  if (isNaN(date.getTime())) {
    return isoOrString;
  }
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRiskColorClass(risk: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  hex: string;
} {
  switch (risk) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
        hex: '#e11d48',
      };
    case 'HIGH_RISK':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800 border-red-300 font-semibold',
        hex: '#ef4444',
      };
    case 'SUSPICIOUS':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
        hex: '#f59e0b',
      };
    case 'NORMAL':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium',
        hex: '#10b981',
      };
  }
}

export function getPatternBadge(pattern: AMLPatternType | string): {
  label: string;
  className: string;
} {
  switch (pattern) {
    case 'LAYERING':
      return {
        label: 'Layering',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
      };
    case 'RAPID_MOVEMENT':
      return {
        label: 'Rapid Movement',
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'CIRCULAR_TRANSFER':
      return {
        label: 'Circular Flow',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'UNUSUAL_RELATIONSHIP':
      return {
        label: 'Unusual Relationship',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      };
    case 'HIGH_VALUE':
      return {
        label: 'High Value',
        className: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    default:
      return {
        label: 'Normal Flow',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}

export function getStatusBadge(status: CaseStatus | string): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'OPEN':
      return {
        label: 'Open',
        className: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    case 'UNDER_REVIEW':
    case 'UNDER_INVESTIGATION':
      return {
        label: 'Under Investigation',
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'ESCALATED':
    case 'ESCALATED_FIU':
      return {
        label: 'Escalated to FIU',
        className: 'bg-red-100 text-red-900 border-red-300 font-bold',
      };
    case 'CLOSED':
      return {
        label: 'Closed',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}

export const getCaseStatusBadge = getStatusBadge;
export const formatDate = formatDateTime;

