import React from 'react';

interface AthleteLimitBadgeProps {
  individualCount: number;
  teamCount: number;
  compact?: boolean;
}

export const AthleteLimitBadge: React.FC<AthleteLimitBadgeProps> = ({
  individualCount,
  teamCount,
  compact = false,
}) => {
  const isIndFull = individualCount >= 2;
  const isTeamFull = teamCount >= 2;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono">
        <span
          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${
            isIndFull
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
          title="Acara Individu (Maksimum 2)"
        >
          Ind: {individualCount}/2
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${
            isTeamFull
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
          title="Acara Berpasukan (Maksimum 2)"
        >
          Pas: {teamCount}/2
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${
          isIndFull
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Individu:</span>
        <strong className={isIndFull ? 'text-amber-800 font-bold' : 'text-slate-900'}>
          {individualCount}/2
        </strong>
        {isIndFull && <span className="text-[10px] text-amber-600 font-bold">(Penuh)</span>}
      </div>

      <div
        className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${
          isTeamFull
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        <span>Berpasukan:</span>
        <strong className={isTeamFull ? 'text-amber-800 font-bold' : 'text-slate-900'}>
          {teamCount}/2
        </strong>
        {isTeamFull && <span className="text-[10px] text-amber-600 font-bold">(Penuh)</span>}
      </div>
    </div>
  );
};
