import React, { useEffect, useState } from 'react';
import {
  KYU_RANKS,
  DAN_RANKS,
  formatBeltRank,
  parseBeltRank,
} from '../../utils/belt';
import { BeltBadge } from '../common/Badge';

interface BeltRankSelectorProps {
  value?: string;
  onChange: (formattedRank: string) => void;
  showPreview?: boolean;
}

export const BeltRankSelector: React.FC<BeltRankSelectorProps> = ({
  value,
  onChange,
  showPreview = true,
}) => {
  const parsed = parseBeltRank(value);
  const [baseRank, setBaseRank] = useState<string>(parsed.baseId);
  const [danRank, setDanRank] = useState<number>(parsed.dan);

  useEffect(() => {
    const p = parseBeltRank(value);
    setBaseRank(p.baseId);
    setDanRank(p.dan);
  }, [value]);

  const handleBaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBase = e.target.value;
    setBaseRank(newBase);
    const formatted = formatBeltRank(newBase, danRank);
    onChange(formatted);
  };

  const handleDanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDan = parseInt(e.target.value, 10) || 1;
    setDanRank(newDan);
    const formatted = formatBeltRank(baseRank, newDan);
    onChange(formatted);
  };

  const currentFormatted = formatBeltRank(baseRank, danRank);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md font-semibold text-on-surface flex items-center justify-between">
          <span>Belt Rank (Kyu / Dan Grade)</span>
          {showPreview && <BeltBadge belt={currentFormatted} showKyu />}
        </label>
        <select
          value={baseRank}
          onChange={handleBaseChange}
          className="w-full bg-surface-container-lowest border border-surface-container-high rounded-xl px-3.5 py-2.5 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer shadow-xs"
        >
          {KYU_RANKS.map((rank) => (
            <option key={rank.id} value={rank.id}>
              {rank.name} {rank.grade !== 'No Grade' ? `— ${rank.grade}` : ''}
            </option>
          ))}
        </select>
      </div>

      {baseRank === 'black' && (
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200 bg-surface-container-low/40 p-3 rounded-xl border border-surface-container-low">
          <label className="font-label-sm font-semibold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">military_tech</span>
            <span>Dan Rank (Yudansha Degree)</span>
          </label>
          <select
            value={danRank}
            onChange={handleDanChange}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-xl px-3.5 py-2.5 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer shadow-xs"
          >
            {DAN_RANKS.map((dan) => (
              <option key={dan.dan} value={dan.dan}>
                {dan.name}
              </option>
            ))}
          </select>
          <span className="font-body-sm text-xs text-secondary mt-0.5">
            Select the Judoka's official Black Belt degree conferred by the federation.
          </span>
        </div>
      )}
    </div>
  );
};
