import React from 'react';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { getStatusConfig } from '../../utils/helpers';

export default function StatusBadge({ status, size = 'md', showIcon = true }) {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size] || 14;

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (status) {
      case 'SAFE':
        return <CheckCircle2 size={iconSizes} className="shrink-0" />;
      case 'CONDITION_FAILED':
        return <AlertTriangle size={iconSizes} className="shrink-0" />;
      case 'NOT_MONITORED':
      default:
        return <Clock size={iconSizes} className="shrink-0" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${config.badgeBg} ${config.badgeBorder} ${config.badgeText} ${sizeClasses}`}
      title={config.description}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
