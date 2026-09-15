export interface BeltInfo {
  name: string;
  kyu: string;
  colorClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hex: string;
}

export const BELT_RANKS: Record<string, BeltInfo> = {
  unranked: {
    name: 'Unranked',
    kyu: 'No Grade',
    colorClass: 'bg-neutral-800',
    bgClass: 'bg-neutral-100 dark:bg-neutral-800/40',
    textClass: 'text-neutral-800 dark:text-neutral-200',
    borderClass: 'border-neutral-800 dark:border-neutral-200',
    hex: '#a3a3a3',
  },
  white: {
    name: 'White',
    kyu: 'Rokkyu (6th Kyu)',
    colorClass: 'bg-white',
    bgClass: 'bg-neutral-100',
    textClass: 'text-neutral-800',
    borderClass: 'border-neutral-300',
    hex: '#ffffff',
  },
  yellow: {
    name: 'Yellow',
    kyu: 'Gokyu (5th Kyu)',
    colorClass: 'bg-amber-400',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300',
    hex: '#fbbf24',
  },
  orange: {
    name: 'Orange',
    kyu: 'Yonkyu (4th Kyu)',
    colorClass: 'bg-orange-500',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-300',
    hex: '#f97316',
  },
  green: {
    name: 'Green',
    kyu: 'Sankyu (3rd Kyu)',
    colorClass: 'bg-emerald-600',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-300',
    hex: '#16a34a',
  },
  blue: {
    name: 'Blue',
    kyu: 'Nikyu (2nd Kyu)',
    colorClass: 'bg-blue-600',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-300',
    hex: '#2563eb',
  },
  brown: {
    name: 'Brown',
    kyu: 'Ikkyu (1st Kyu)',
    colorClass: 'bg-amber-900',
    bgClass: 'bg-amber-950/10',
    textClass: 'text-amber-950',
    borderClass: 'border-amber-800',
    hex: '#78350f',
  },
  black: {
    name: 'Black',
    kyu: 'Dan (Yudansha)',
    colorClass: 'bg-neutral-900',
    bgClass: 'bg-neutral-100',
    textClass: 'text-neutral-900',
    borderClass: 'border-neutral-900',
    hex: '#171717',
  },
};

export interface KyuRankOption {
  id: string;
  name: string;
  grade: string;
  isDan?: boolean;
}

export const KYU_RANKS: KyuRankOption[] = [
  { id: 'unranked', name: 'Unranked', grade: 'No Grade' },
  { id: 'white', name: 'White Belt', grade: '6th Kyu (Rokkyu)' },
  { id: 'yellow', name: 'Yellow Belt', grade: '5th Kyu (Gokyu)' },
  { id: 'orange', name: 'Orange Belt', grade: '4th Kyu (Yonkyu)' },
  { id: 'green', name: 'Green Belt', grade: '3rd Kyu (Sankyu)' },
  { id: 'blue', name: 'Blue Belt', grade: '2nd Kyu (Nikyu)' },
  { id: 'brown', name: 'Brown Belt', grade: '1st Kyu (Ikkyu)' },
  { id: 'black', name: 'Black Belt', grade: 'Dan (Yudansha)', isDan: true },
];

export interface DanRankOption {
  dan: number;
  name: string;
  title: string;
}

export const DAN_RANKS: DanRankOption[] = [
  { dan: 1, name: '1st Dan (Shodan)', title: 'Shodan' },
  { dan: 2, name: '2nd Dan (Nidan)', title: 'Nidan' },
  { dan: 3, name: '3rd Dan (Sandan)', title: 'Sandan' },
  { dan: 4, name: '4th Dan (Yondan)', title: 'Yondan' },
  { dan: 5, name: '5th Dan (Godan)', title: 'Godan' },
  { dan: 6, name: '6th Dan (Rokudan)', title: 'Rokudan' },
  { dan: 7, name: '7th Dan (Shichidan)', title: 'Shichidan' },
  { dan: 8, name: '8th Dan (Hachidan)', title: 'Hachidan' },
  { dan: 9, name: '9th Dan (Kudan)', title: 'Kudan' },
  { dan: 10, name: '10th Dan (Judan)', title: 'Judan' },
];

export function formatBeltRank(baseRankId: string, danNumber?: number): string {
  if (baseRankId === 'unranked') return 'Unranked';
  if (baseRankId === 'black') {
    const dan = DAN_RANKS.find((d) => d.dan === (danNumber || 1)) || DAN_RANKS[0];
    return `Black Belt (${dan.name})`;
  }
  const kyu = KYU_RANKS.find((r) => r.id === baseRankId);
  return kyu ? `${kyu.name} (${kyu.grade})` : 'Unranked';
}

export function parseBeltRank(beltString?: string): { baseId: string; dan: number } {
  if (!beltString || beltString.toLowerCase().includes('unranked')) {
    return { baseId: 'unranked', dan: 1 };
  }
  const lower = beltString.toLowerCase();
  if (lower.includes('black')) {
    const match = lower.match(/(\d+)(?:st|nd|rd|th)?\s*dan/);
    const dan = match ? Math.min(10, Math.max(1, parseInt(match[1], 10))) : 1;
    return { baseId: 'black', dan };
  }
  for (const rank of KYU_RANKS) {
    if (rank.id !== 'unranked' && rank.id !== 'black' && lower.includes(rank.id)) {
      return { baseId: rank.id, dan: 1 };
    }
  }
  return { baseId: 'unranked', dan: 1 };
}

export function getBeltInfo(beltString?: string): BeltInfo {
  if (!beltString) return BELT_RANKS.unranked;
  const lower = beltString.toLowerCase();
  if (lower.includes('unranked') || lower === 'none' || lower === '') {
    return BELT_RANKS.unranked;
  }
  if (lower.includes('black')) {
    const match = lower.match(/(\d+)(?:st|nd|rd|th)?\s*dan/);
    const danNum = match ? match[1] : null;
    const danOption = danNum ? DAN_RANKS.find((d) => d.dan === parseInt(danNum, 10)) : null;
    return {
      ...BELT_RANKS.black,
      kyu: danOption ? danOption.name : 'Dan (Yudansha)',
    };
  }
  for (const [key, val] of Object.entries(BELT_RANKS)) {
    if (key !== 'unranked' && lower.includes(key)) return val;
  }
  return BELT_RANKS.unranked;
}
