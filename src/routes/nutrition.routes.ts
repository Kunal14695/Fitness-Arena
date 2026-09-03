import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { calculateUserRank } from '../utils/gamification.js';

const router = Router();

const logMealSchema = z.object({
  mealName: z.string().min(2),
  category: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'PRE_WORKOUT', 'POST_WORKOUT', 'SNACK']),
  calories: z.number().int().positive(),
  proteinGrams: z.number().nonnegative(),
  carbsGrams: z.number().nonnegative(),
  fatsGrams: z.number().nonnegative(),
});

/**
 * @route GET /api/nutrition/meals
 * @desc Get all available meal recipes in the catalog
 */
router.get('/meals', async (req, res, next): Promise<void> => {
  try {
    const { category, goalType, dietType } = req.query;
    const where: any = {};
    if (category) where.category = String(category).toUpperCase();
    if (goalType) where.goalType = { in: [String(goalType).toUpperCase(), 'ANY'] };
    if (dietType) {
      const diet = String(dietType).toUpperCase();
      if (diet === 'VEGAN') where.dietType = { in: ['VEGAN', 'ANY'] };
      else if (diet === 'VEGETARIAN') where.dietType = { in: ['VEGAN', 'VEGETARIAN', 'ANY'] };
      else where.dietType = { in: [diet, 'ANY'] };
    }

    const meals = await prisma.meal.findMany({ where });
    res.json({
      success: true,
      data: meals.map((m) => ({
        ...m,
        ingredients: JSON.parse(m.ingredients),
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/nutrition/daily-plan
 * @desc Generate a customized full-day meal plan (Breakfast, Lunch, Pre-Workout, Post-Workout, Dinner, Snack) tailored to user's weight, goal, and dietary preference (Vegan, Vegetarian, Non-Veg)
 */
router.get('/daily-plan', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      res.status(400).json({
        success: false,
        error: 'Please complete your biometrics profile (height, weight, goal, diet) first at PUT /api/profile',
      });
      return;
    }

    const userGoal = profile.goal; // "BULK", "CUT", "MAINTAIN"
    const goalFilter = userGoal === 'MAINTAIN' ? ['ANY', 'BULK', 'CUT'] : [userGoal, 'ANY'];

    // Dietary preference filtering: Vegan vs Vegetarian vs Non-Vegetarian
    const dietPref = profile.dietaryPreference || 'NON_VEGETARIAN';
    let dietFilter: string[] = ['ANY'];
    if (dietPref === 'VEGAN') {
      dietFilter = ['VEGAN', 'ANY'];
    } else if (dietPref === 'VEGETARIAN') {
      dietFilter = ['VEGETARIAN', 'VEGAN', 'ANY'];
    } else {
      // Non-Vegetarian can consume all diet types
      dietFilter = ['NON_VEGETARIAN', 'VEGETARIAN', 'VEGAN', 'ANY'];
    }

    // Retrieve meals for each category matching goal and diet preference
    const [breakfasts, lunches, preWorkouts, postWorkouts, dinners, snacks] = await Promise.all([
      prisma.meal.findMany({
        where: { category: 'BREAKFAST', goalType: { in: goalFilter }, dietType: { in: dietFilter } },
      }),
      prisma.meal.findMany({
        where: { category: 'LUNCH', goalType: { in: goalFilter }, dietType: { in: dietFilter } },
      }),
      prisma.meal.findMany({
        where: { category: 'PRE_WORKOUT', goalType: { in: goalFilter }, dietType: { in: dietFilter } },
      }),
      prisma.meal.findMany({
        where: { category: 'POST_WORKOUT', goalType: { in: goalFilter }, dietType: { in: dietFilter } },
      }),
      prisma.meal.findMany({
        where: { category: 'DINNER', goalType: { in: goalFilter }, dietType: { in: dietFilter } },
      }),
      prisma.meal.findMany({
        where: { category: 'SNACK', goalType: { in: goalFilter }, dietType: { in: dietFilter } },
      }),
    ]);

    // Pick top recommended meal for each category
    const breakfast = breakfasts[0] || null;
    const lunch = lunches[0] || null;
    const preWorkout = preWorkouts[0] || null;
    const postWorkout = postWorkouts[0] || null;
    const dinner = dinners[0] || null;
    const snack = snacks[0] || null;

    const plannedMeals = [breakfast, lunch, preWorkout, postWorkout, dinner, snack].filter(Boolean);
    const totalPlanCalories = plannedMeals.reduce((acc, m) => acc + (m?.calories || 0), 0);
    const totalPlanProtein = plannedMeals.reduce((acc, m) => acc + (m?.proteinGrams || 0), 0);
    const totalPlanCarbs = plannedMeals.reduce((acc, m) => acc + (m?.carbsGrams || 0), 0);
    const totalPlanFats = plannedMeals.reduce((acc, m) => acc + (m?.fatsGrams || 0), 0);

    const parseIngredients = (meal: any) =>
      meal ? { ...meal, ingredients: JSON.parse(meal.ingredients) } : null;

    res.json({
      success: true,
      data: {
        goal: userGoal,
        dietaryPreference: dietPref,
        userTargets: {
          targetCalories: profile.targetCalories,
          targetProteinGrams: profile.targetProtein,
          targetCarbsGrams: profile.targetCarbs,
          targetFatsGrams: profile.targetFats,
        },
        planSummary: {
          totalPlanCalories,
          totalPlanProteinGrams: totalPlanProtein,
          totalPlanCarbsGrams: totalPlanCarbs,
          totalPlanFatsGrams: totalPlanFats,
          caloricDifference: totalPlanCalories - profile.targetCalories,
        },
        meals: {
          breakfast: parseIngredients(breakfast),
          lunch: parseIngredients(lunch),
          preWorkout: parseIngredients(preWorkout),
          postWorkout: parseIngredients(postWorkout),
          dinner: parseIngredients(dinner),
          snack: parseIngredients(snack),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/nutrition/log
 * @desc Log an ingested meal and earn XP
 */
router.post(
  '/log',
  authenticateToken,
  validateBody(logMealSchema),
  async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { mealName, category, calories, proteinGrams, carbsGrams, fatsGrams } = req.body;

      const mealLog = await prisma.mealLog.create({
        data: {
          userId,
          mealName,
          category,
          calories,
          proteinGrams,
          carbsGrams,
          fatsGrams,
        },
      });

      // Award +20 XP for tracking nutrition
      const userRank = await prisma.userRank.findUnique({ where: { userId } });
      if (userRank) {
        const newXp = userRank.xp + 20;
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
      }

      res.status(201).json({
        success: true,
        message: 'Meal logged successfully! +20 XP earned for hitting your nutrition targets.',
        data: mealLog,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/nutrition/today-summary
 * @desc Summary of today's consumed nutrition vs user daily goals
 */
router.get('/today-summary', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfDay },
      },
    });

    const consumedCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
    const consumedProtein = todayLogs.reduce((sum, log) => sum + log.proteinGrams, 0);
    const consumedCarbs = todayLogs.reduce((sum, log) => sum + log.carbsGrams, 0);
    const consumedFats = todayLogs.reduce((sum, log) => sum + log.fatsGrams, 0);

    res.json({
      success: true,
      data: {
        target: profile
          ? {
              calories: profile.targetCalories,
              protein: profile.targetProtein,
              carbs: profile.targetCarbs,
              fats: profile.targetFats,
            }
          : null,
        consumed: {
          calories: consumedCalories,
          protein: Math.round(consumedProtein),
          carbs: Math.round(consumedCarbs),
          fats: Math.round(consumedFats),
        },
        remainingCalories: profile ? Math.max(0, profile.targetCalories - consumedCalories) : null,
        logs: todayLogs,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
