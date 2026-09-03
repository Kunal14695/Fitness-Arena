import { describe, it, expect } from 'vitest';
import { calculateUserRank } from './gamification.js';

describe('Gamification & Rank Calculator', () => {
  it('assigns Novice rank to user with 0-200 XP', () => {
    const rank = calculateUserRank(100);
    expect(rank.tier).toBe('Novice');
    expect(rank.level).toBe(1);
    expect(rank.nextTier).toBe('Beginner');
    expect(rank.xpNeededForNextTier).toBe(101);
  });

  it('promotes user to Consistent when reaching 601 XP', () => {
    const rank = calculateUserRank(650);
    expect(rank.tier).toBe('Consistent');
    expect(rank.level).toBe(3);
    expect(rank.nextTier).toBe('Intermediate');
  });

  it('promotes to Titan for legendary users with over 12000 XP', () => {
    const rank = calculateUserRank(15000);
    expect(rank.tier).toBe('Titan');
    expect(rank.level).toBe(7);
    expect(rank.nextTier).toBeNull();
    expect(rank.progressPercent).toBe(100);
  });
});
