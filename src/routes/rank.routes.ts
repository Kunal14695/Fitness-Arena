import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateUserRank, RANK_TIERS } from '../utils/gamification.js';

const router = Router();

/**
 * @route GET /api/rank
 * @desc Get current user's rank status, badge, and progression details
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const userId = req.user!.userId;
    let userRank = await prisma.userRank.findUnique({ where: { userId } });

    if (!userRank) {
      userRank = await prisma.userRank.create({
        data: { userId, xp: 0, tier: 'Novice', badge: '🥉 Iron Novice', level: 1 },
      });
    }

    const rankProgress = calculateUserRank(userRank.xp);

    res.json({
      success: true,
      data: {
        currentRank: rankProgress,
        allTiers: RANK_TIERS,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/rank/leaderboard
 * @desc View top 20 athletes in the Fitness Arena
 */
router.get('/leaderboard', async (req, res, next): Promise<void> => {
  try {
    const topUsers = await prisma.userRank.findMany({
      take: 20,
      orderBy: { xp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            streak: {
              select: {
                currentStreak: true,
                longestStreak: true,
              },
            },
            profile: {
              select: {
                goal: true,
              },
            },
          },
        },
      },
    });

    const leaderboard = topUsers.map((entry, index) => ({
      position: index + 1,
      userId: entry.userId,
      name: entry.user.name,
      xp: entry.xp,
      tier: entry.tier,
      badge: entry.badge,
      level: entry.level,
      streakDays: entry.user.streak?.currentStreak || 0,
      goal: entry.user.profile?.goal || 'MAINTAIN',
    }));

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
