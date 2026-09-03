import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateStreak } from '../utils/streakCalculator.js';
import { calculateUserRank } from '../utils/gamification.js';

const router = Router();

// Validation schemas
const exerciseCreateSchema = z.object({
  name: z.string().min(2),
  muscleGroup: z.enum(['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE']),
  equipment: z.enum(['BARBELL', 'DUMBBELL', 'BODYWEIGHT', 'MACHINE', 'CABLES']),
  description: z.string().optional(),
  instructions: z.string().optional(),
});

const routineDaySchema = z.object({
  dayOfWeek: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]),
  title: z.string().min(2),
  isRestDay: z.boolean().default(false),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string(),
        orderIndex: z.number().int().default(0),
        targetSets: z.number().int().min(1).default(3),
        targetReps: z.number().int().min(1).default(10),
        targetWeightKg: z.number().positive().optional(),
        restSeconds: z.number().int().default(60),
      })
    )
    .optional(),
});

const createRoutineSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  isDefault: z.boolean().default(true),
  days: z.array(routineDaySchema).min(1, 'Please configure at least one day in your weekly split'),
});

const logWorkoutSchema = z.object({
  routineId: z.string().optional(),
  title: z.string().min(2),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      setsCompleted: z.number().int().min(1),
      repsCompleted: z.number().int().min(1),
      weightUsedKg: z.number().positive().optional(),
    })
  ).min(1, 'At least one exercise must be completed to log a workout'),
});

/**
 * @route GET /api/workouts/exercises
 * @desc Browse exercise library, optionally filter by muscle group
 */
router.get('/exercises', async (req, res, next): Promise<void> => {
  try {
    const muscleGroup = req.query.muscleGroup as string | undefined;
    const where = muscleGroup ? { muscleGroup: muscleGroup.toUpperCase() } : {};

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/workouts/exercises
 * @desc Add a custom exercise to the library
 */
router.post(
  '/exercises',
  authenticateToken,
  validateBody(exerciseCreateSchema),
  async (req, res, next): Promise<void> => {
    try {
      const exercise = await prisma.exercise.create({
        data: req.body,
      });

      res.status(201).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/workouts/routines
 * @desc List all weekly workout routines created by the user
 */
router.get('/routines', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const routines = await prisma.workoutRoutine.findMany({
      where: { userId: req.user!.userId },
      include: {
        days: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: routines,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/workouts/routines
 * @desc Create a personalized weekly workout routine (Monday-Sunday split)
 */
router.post(
  '/routines',
  authenticateToken,
  validateBody(createRoutineSchema),
  async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
    try {
      const { title, description, isDefault, days } = req.body;
      const userId = req.user!.userId;

      if (isDefault) {
        // Unset previous default routines for user
        await prisma.workoutRoutine.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const routine = await prisma.workoutRoutine.create({
        data: {
          userId,
          title,
          description,
          isDefault,
          days: {
            create: days.map((day: any) => ({
              dayOfWeek: day.dayOfWeek,
              title: day.title,
              isRestDay: day.isRestDay,
              exercises: {
                create: (day.exercises || []).map((ex: any) => ({
                  exerciseId: ex.exerciseId,
                  orderIndex: ex.orderIndex,
                  targetSets: ex.targetSets,
                  targetReps: ex.targetReps,
                  targetWeightKg: ex.targetWeightKg,
                  restSeconds: ex.restSeconds,
                })),
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              exercises: {
                include: { exercise: true },
              },
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Weekly workout routine created successfully!',
        data: routine,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/workouts/routines/:id
 * @desc Get details of a specific weekly routine
 */
router.get('/routines/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const routineId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const routine = await prisma.workoutRoutine.findFirst({
      where: { id: routineId, userId: req.user!.userId },
      include: {
        days: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!routine) {
      res.status(404).json({ success: false, error: 'Routine not found' });
      return;
    }

    res.json({ success: true, data: routine });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/workouts/log
 * @desc Log completed workout session -> Updates Duolingo streak & awards XP towards ranks!
 */
router.post(
  '/log',
  authenticateToken,
  validateBody(logWorkoutSchema),
  async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { routineId, title, durationMinutes, notes, exercises } = req.body;

      // 1. Record Workout Log
      const baseWorkoutXp = 50;
      const workoutLog = await prisma.workoutLog.create({
        data: {
          userId,
          routineId,
          title,
          durationMinutes,
          notes,
          xpAwarded: baseWorkoutXp,
          exercisesCompleted: {
            create: exercises.map((ex: any) => ({
              exerciseId: ex.exerciseId,
              setsCompleted: ex.setsCompleted,
              repsCompleted: ex.repsCompleted,
              weightUsedKg: ex.weightUsedKg,
            })),
          },
        },
        include: {
          exercisesCompleted: {
            include: { exercise: true },
          },
        },
      });

      // 2. Process Duolingo-style Streak Update
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

      // 3. Award XP & Advance Gamification Ranks
      const totalXpEarned = baseWorkoutXp + streakResult.bonusXp;

      let userRank = await prisma.userRank.findUnique({ where: { userId } });
      if (!userRank) {
        userRank = await prisma.userRank.create({
          data: { userId, xp: 0, tier: 'Novice', badge: '🥉 Iron Novice', level: 1 },
        });
      }

      const newTotalXp = userRank.xp + totalXpEarned;
      const rankInfo = calculateUserRank(newTotalXp);

      const updatedRank = await prisma.userRank.update({
        where: { userId },
        data: {
          xp: newTotalXp,
          tier: rankInfo.tier,
          badge: rankInfo.badge,
          level: rankInfo.level,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Workout logged successfully! Consistency pays off.',
        data: {
          workoutLog,
          streak: {
            currentStreak: updatedStreak.currentStreak,
            longestStreak: updatedStreak.longestStreak,
            freezesRemaining: updatedStreak.freezeCount,
            notification: streakResult.message,
            streakIncreased: streakResult.streakIncreased,
          },
          gamification: {
            xpAwardedThisSession: totalXpEarned,
            totalXp: updatedRank.xp,
            currentTier: rankInfo.tier,
            badge: rankInfo.badge,
            level: rankInfo.level,
            nextTier: rankInfo.nextTier,
            xpNeededForNextTier: rankInfo.xpNeededForNextTier,
            progressPercent: rankInfo.progressPercent,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/workouts/history
 * @desc Get user's workout log history
 */
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const history = await prisma.workoutLog.findMany({
      where: { userId: req.user!.userId },
      include: {
        exercisesCompleted: {
          include: { exercise: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 30,
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
