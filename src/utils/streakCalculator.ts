export interface StreakCalculationInput {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | string | null;
  freezeCount: number;
  currentDate?: Date;
  isRestDay?: boolean;
}

export interface StreakCalculationResult {
  newCurrentStreak: number;
  newLongestStreak: number;
  newFreezeCount: number;
  streakMaintained: boolean;
  streakIncreased: boolean;
  streakFrozen: boolean;
  streakReset: boolean;
  bonusXp: number;
  message: string;
}

/**
 * Strips time to calculate pure day differences
 */
export function getStartOfDay(date: Date): number {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export function calculateDayDifference(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const t1 = getStartOfDay(date1);
  const t2 = getStartOfDay(date2);
  return Math.round(Math.abs(t1 - t2) / msPerDay);
}

export function updateStreak(input: StreakCalculationInput): StreakCalculationResult {
  const now = input.currentDate || new Date();
  const { currentStreak, longestStreak, freezeCount, isRestDay } = input;

  // Case 1: First activity ever
  if (!input.lastActiveDate) {
    return {
      newCurrentStreak: 1,
      newLongestStreak: Math.max(1, longestStreak),
      newFreezeCount: freezeCount,
      streakMaintained: true,
      streakIncreased: true,
      streakFrozen: false,
      streakReset: false,
      bonusXp: 10,
      message: '🔥 Streak started! Day 1 complete. Keep up the consistency!',
    };
  }

  const lastActive = new Date(input.lastActiveDate);
  const daysApart = calculateDayDifference(now, lastActive);

  // Case 2: Same day activity (Idempotent)
  if (daysApart === 0) {
    return {
      newCurrentStreak: currentStreak,
      newLongestStreak: longestStreak,
      newFreezeCount: freezeCount,
      streakMaintained: true,
      streakIncreased: false,
      streakFrozen: false,
      streakReset: false,
      bonusXp: 0,
      message: `⚡ You are already active today! Current streak: ${currentStreak} day(s).`,
    };
  }

  // Case 3: Exactly 1 day apart (Consecutive day - Success!)
  if (daysApart === 1) {
    const nextStreak = currentStreak + 1;
    const nextLongest = Math.max(nextStreak, longestStreak);
    // Extra bonus XP for milestones (7-day, 14-day, 30-day, 100-day)
    let bonusXp = 10;
    if (nextStreak % 30 === 0) bonusXp += 100;
    else if (nextStreak % 7 === 0) bonusXp += 35;

    return {
      newCurrentStreak: nextStreak,
      newLongestStreak: nextLongest,
      newFreezeCount: freezeCount,
      streakMaintained: true,
      streakIncreased: true,
      streakFrozen: false,
      streakReset: false,
      bonusXp,
      message: `🔥 Streak extended! You're on a ${nextStreak}-day streak! Keep the fire burning!`,
    };
  }

  // Case 4: Missed days (daysApart > 1)
  // Check if freeze shield is available or if scheduled rest day was preserved
  if (daysApart === 2 && (freezeCount > 0 || isRestDay)) {
    // Save streak using a freeze shield or rest day
    const consumedFreeze = isRestDay ? freezeCount : freezeCount - 1;
    const nextStreak = currentStreak + 1;
    const nextLongest = Math.max(nextStreak, longestStreak);

    return {
      newCurrentStreak: nextStreak,
      newLongestStreak: nextLongest,
      newFreezeCount: consumedFreeze,
      streakMaintained: true,
      streakIncreased: true,
      streakFrozen: true,
      streakReset: false,
      bonusXp: 10,
      message: isRestDay
        ? `🛡️ Rest Day honored! Streak preserved and extended to ${nextStreak} day(s).`
        : `🛡️ Streak Freeze used! Your ${nextStreak}-day streak was saved from breaking!`,
    };
  }

  // Case 5: Streak broken - reset to Day 1
  return {
    newCurrentStreak: 1,
    newLongestStreak: longestStreak,
    newFreezeCount: freezeCount,
    streakMaintained: false,
    streakIncreased: false,
    streakFrozen: false,
    streakReset: true,
    bonusXp: 5,
    message: `⚠️ Streak lost after ${daysApart} days of inactivity. Don't worry, start fresh today! Day 1 started.`,
  };
}
