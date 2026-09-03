import { describe, it, expect } from 'vitest';
import { updateStreak } from './streakCalculator.js';

describe('Duolingo-style Streak Calculator', () => {
  it('starts new streak on day 1 for a new user', () => {
    const res = updateStreak({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezeCount: 1,
      currentDate: new Date('2026-09-01T10:00:00Z'),
    });

    expect(res.newCurrentStreak).toBe(1);
    expect(res.newLongestStreak).toBe(1);
    expect(res.streakIncreased).toBe(true);
    expect(res.streakReset).toBe(false);
  });

  it('keeps streak intact when user logs multiple times on the same calendar day', () => {
    const res = updateStreak({
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: new Date('2026-09-01T08:00:00Z'),
      freezeCount: 1,
      currentDate: new Date('2026-09-01T18:00:00Z'),
    });

    expect(res.newCurrentStreak).toBe(5);
    expect(res.streakIncreased).toBe(false);
    expect(res.streakMaintained).toBe(true);
  });

  it('increments streak on consecutive day', () => {
    const res = updateStreak({
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: new Date('2026-09-01T10:00:00Z'),
      freezeCount: 1,
      currentDate: new Date('2026-09-02T10:00:00Z'),
    });

    expect(res.newCurrentStreak).toBe(6);
    expect(res.newLongestStreak).toBe(6);
    expect(res.streakIncreased).toBe(true);
  });

  it('preserves streak using streak freeze when missing 1 day', () => {
    const res = updateStreak({
      currentStreak: 10,
      longestStreak: 10,
      lastActiveDate: new Date('2026-09-01T10:00:00Z'),
      freezeCount: 1,
      currentDate: new Date('2026-09-03T10:00:00Z'), // 2 days apart
    });

    expect(res.streakFrozen).toBe(true);
    expect(res.newFreezeCount).toBe(0); // consumed 1 freeze
    expect(res.newCurrentStreak).toBe(11);
    expect(res.streakReset).toBe(false);
  });

  it('resets streak to 1 if user was inactive for multiple days without freeze', () => {
    const res = updateStreak({
      currentStreak: 10,
      longestStreak: 10,
      lastActiveDate: new Date('2026-09-01T10:00:00Z'),
      freezeCount: 0,
      currentDate: new Date('2026-09-05T10:00:00Z'), // 4 days apart
    });

    expect(res.streakReset).toBe(true);
    expect(res.newCurrentStreak).toBe(1);
    expect(res.newLongestStreak).toBe(10); // longest streak preserved in history
  });
});
