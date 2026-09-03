export interface RankTier {
  tier: string;
  badge: string;
  level: number;
  minXp: number;
  maxXp: number | null;
  description: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    tier: 'Novice',
    badge: '🥉 Iron Novice',
    level: 1,
    minXp: 0,
    maxXp: 200,
    description: 'Taking the first crucial steps into the Fitness Arena.',
  },
  {
    tier: 'Beginner',
    badge: '🥈 Bronze Lifter',
    level: 2,
    minXp: 201,
    maxXp: 600,
    description: 'Building routine habits and learning core movement patterns.',
  },
  {
    tier: 'Consistent',
    badge: '🥇 Silver Athlete',
    level: 3,
    minXp: 601,
    maxXp: 1500,
    description: 'Consistency is unlocking noticeable physique and strength progress.',
  },
  {
    tier: 'Intermediate',
    badge: '💎 Gold Gladiator',
    level: 4,
    minXp: 1501,
    maxXp: 3500,
    description: 'Dedicated discipline. Form, volume, and nutrition are dialed in.',
  },
  {
    tier: 'Advanced',
    badge: '🏆 Platinum Beast',
    level: 5,
    minXp: 3501,
    maxXp: 7000,
    description: 'Superior conditioning, heavyweight performance, and steady body recomp.',
  },
  {
    tier: 'Elite',
    badge: '⚡ Diamond Champion',
    level: 6,
    minXp: 7001,
    maxXp: 12000,
    description: 'Among the top athletes in the Arena. Unyielding work ethic.',
  },
  {
    tier: 'Titan',
    badge: '👑 Titan of the Arena',
    level: 7,
    minXp: 12001,
    maxXp: null,
    description: 'Legendary status. Peak physical consistency and mastery.',
  },
];

export interface UserRankProgress {
  currentXp: number;
  tier: string;
  badge: string;
  level: number;
  description: string;
  nextTier: string | null;
  xpNeededForNextTier: number;
  progressPercent: number;
}

export function calculateUserRank(xp: number): UserRankProgress {
  let matchedTier = RANK_TIERS[0];
  let nextTier: RankTier | null = null;

  for (let i = 0; i < RANK_TIERS.length; i++) {
    const tier = RANK_TIERS[i];
    if (xp >= tier.minXp && (tier.maxXp === null || xp <= tier.maxXp)) {
      matchedTier = tier;
      nextTier = RANK_TIERS[i + 1] || null;
      break;
    }
  }

  let xpNeededForNextTier = 0;
  let progressPercent = 100;

  if (nextTier && matchedTier.maxXp !== null) {
    const tierSpan = matchedTier.maxXp - matchedTier.minXp;
    const progressInTier = xp - matchedTier.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / tierSpan) * 100)));
    xpNeededForNextTier = nextTier.minXp - xp;
  }

  return {
    currentXp: xp,
    tier: matchedTier.tier,
    badge: matchedTier.badge,
    level: matchedTier.level,
    description: matchedTier.description,
    nextTier: nextTier ? nextTier.tier : null,
    xpNeededForNextTier: Math.max(0, xpNeededForNextTier),
    progressPercent,
  };
}
