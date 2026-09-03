import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { updateStreak, calculateDayDifference } from '../utils/streakCalculator.js';
import { calculateUserRank } from '../utils/gamification.js';

const router = Router();

/**
 * @route GET /api/streak
 * @desc Get user's current streak statistics and today's status
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const userId = req.user!.userId;
    let streak = await prisma.streak.findUnique({ where: { userId } });

    if (!streak) {
      streak = await prisma.streak.create({
        data: { userId, currentStreak: 0, longestStreak: 0, freezeCount: 1 },
      });
    }

    let isActiveToday = false;
    if (streak.lastActiveDate) {
      isActiveToday = calculateDayDifference(new Date(), new Date(streak.lastActiveDate)) === 0;
    }

    res.json({
      success: true,
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
        freezeCount: streak.freezeCount,
        isActiveToday,
        statusText: isActiveToday
          ? `🔥 Streak safe for today! ${streak.currentStreak} day streak.`
          : '⚡ Complete a workout or check in today to keep your streak alive!',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/streak/check-in
 * @desc Daily check-in / rest-day activity to preserve or extend streak
 */
router.post('/check-in', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const isRestDay = Boolean(req.body?.isRestDay);

    let streak = await prisma.streak.findUnique({ where: { userId } });
    if (!streak) {
      streak = await prisma.streak.create({
        data: { userId, currentStreak: 0, longestStreak: 0, freezeCount: 1 },
      });
    }

    const streakResult = updateStreak({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      freezeCount: streak.freezeCount,
      currentDate: new Date(),
      isRestDay,
    });

    const updatedStreak = await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: streakResult.newCurrentStreak,
        longestStreak: streakResult.newLongestStreak,
        freezeCount: streakResult.newFreezeCount,
        lastActiveDate: new Date(),
      },
    });

    // Award check-in bonus XP
    let userRank = await prisma.userRank.findUnique({ where: { userId } });
    if (!userRank) {
      userRank = await prisma.userRank.create({
        data: { userId, xp: 0, tier: 'Novice', badge: '🥉 Iron Novice', level: 1 },
      });
    }

    const newXp = userRank.xp + streakResult.bonusXp;
    const rankInfo = calculateUserRank(newXp);

    await prisma.userRank.update({
      where: { userId },
      data: {
        xp: newXp,
        tier: rankInfo.tier,
        badge: rankInfo.badge,
        level: rankInfo.level,
      },
    });

    res.json({
      success: true,
      message: streakResult.message,
      data: {
        currentStreak: updatedStreak.currentStreak,
        longestStreak: updatedStreak.longestStreak,
        freezesRemaining: updatedStreak.freezeCount,
        xpEarned: streakResult.bonusXp,
        streakIncreased: streakResult.streakIncreased,
        streakReset: streakResult.streakReset,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
