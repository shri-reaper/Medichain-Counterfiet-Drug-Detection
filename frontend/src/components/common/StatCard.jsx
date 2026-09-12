import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'emerald',
  onClick,
  active = false,
}) {
  const schemes = {
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      activeBorder: 'border-emerald-500 ring-1 ring-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.15)]',
      accentText: 'text-emerald-400',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      activeBorder: 'border-rose-500 ring-1 ring-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400',
      glow: 'hover:shadow-[0_0_20px_-3px_rgba(244,63,94,0.15)]',
      accentText: 'text-rose-400',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      activeBorder: 'border-amber-500 ring-1 ring-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.15)]',
      accentText: 'text-amber-400',
    },
    blue: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      activeBorder: 'border-cyan-500 ring-1 ring-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.15)]',
      accentText: 'text-cyan-400',
    },
  };

  const scheme = schemes[colorScheme] || schemes.emerald;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-slate-900/90 border p-5 transition-all duration-200 ${
        active ? scheme.activeBorder : scheme.border
      } ${scheme.glow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${scheme.iconBg}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
