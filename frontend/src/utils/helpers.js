/**
 * Check if the temperature and humidity meet the chaincode safe storage criteria:
 * Supports dynamic crop-specific rules when provided, otherwise falls back to standard 2-8°C / 40-60% RH.
 */
export const evaluateConditions = (temp, hum, rules = null) => {
  const t = Number(temp);
  const h = Number(hum);
  if (isNaN(t) || isNaN(h)) return 'UNKNOWN';

  const minTemp = rules?.minTemperature !== undefined ? rules.minTemperature : (rules?.minTemp !== undefined ? rules.minTemp : 2);
  const maxTemp = rules?.maxTemperature !== undefined ? rules.maxTemperature : (rules?.maxTemp !== undefined ? rules.maxTemp : 8);
  const minHum = rules?.minHumidity !== undefined ? rules.minHumidity : 40;
  const maxHum = rules?.maxHumidity !== undefined ? rules.maxHumidity : 60;

  if (t >= minTemp && t <= maxTemp && h >= minHum && h <= maxHum) {
    return 'SAFE';
  }
  return 'CONDITION_FAILED';
};

/**
 * Format ISO timestamp into a clean readable string
 */
export const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
};

/**
 * Return human readable status configuration
 */
export const getStatusConfig = (status) => {
  switch (status) {
    case 'SAFE':
      return {
        label: 'SAFE',
        description: 'Conditions compliant (2-8°C, 40-60% RH)',
        badgeBg: 'bg-emerald-500/10',
        badgeBorder: 'border-emerald-500/30',
        badgeText: 'text-emerald-400',
        iconColor: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
        cardBorder: 'border-emerald-500/20',
      };
    case 'CONDITION_FAILED':
      return {
        label: 'CONDITION FAILED',
        description: 'Out of safety bounds (Risk of spoilage)',
        badgeBg: 'bg-rose-500/10',
        badgeBorder: 'border-rose-500/30',
        badgeText: 'text-rose-400',
        iconColor: 'text-rose-400',
        dotColor: 'bg-rose-400',
        cardBorder: 'border-rose-500/20',
      };
    case 'NOT_MONITORED':
    default:
      return {
        label: 'NOT MONITORED',
        description: 'Awaiting sensor telemetry upload',
        badgeBg: 'bg-amber-500/10',
        badgeBorder: 'border-amber-500/30',
        badgeText: 'text-amber-400',
        iconColor: 'text-amber-400',
        dotColor: 'bg-amber-400',
        cardBorder: 'border-amber-500/20',
      };
  }
};

/**
 * Return style configuration for supply chain custody roles
 */
export const getRoleBadgeConfig = (role) => {
  switch (String(role || '').toUpperCase()) {
    case 'FARMER':
      return {
        label: 'Farmer',
        code: 'FARMER',
        badgeBg: 'bg-emerald-500/10',
        badgeBorder: 'border-emerald-500/30',
        badgeText: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
        iconName: 'User',
      };
    case 'TRANSPORTER':
      return {
        label: 'Transporter',
        code: 'TRANSPORTER',
        badgeBg: 'bg-blue-500/10',
        badgeBorder: 'border-blue-500/30',
        badgeText: 'text-blue-400',
        dotColor: 'bg-blue-400',
        iconName: 'Truck',
      };
    case 'DISTRIBUTOR':
      return {
        label: 'Distributor',
        code: 'DISTRIBUTOR',
        badgeBg: 'bg-amber-500/10',
        badgeBorder: 'border-amber-500/30',
        badgeText: 'text-amber-400',
        dotColor: 'bg-amber-400',
        iconName: 'Building2',
      };
    case 'RETAILER':
      return {
        label: 'Retailer',
        code: 'RETAILER',
        badgeBg: 'bg-purple-500/10',
        badgeBorder: 'border-purple-500/30',
        badgeText: 'text-purple-400',
        dotColor: 'bg-purple-400',
        iconName: 'Store',
      };
    default:
      return {
        label: role || 'Unknown',
        code: role || 'UNKNOWN',
        badgeBg: 'bg-slate-500/10',
        badgeBorder: 'border-slate-500/30',
        badgeText: 'text-slate-400',
        dotColor: 'bg-slate-400',
        iconName: 'Shield',
      };
  }
};

