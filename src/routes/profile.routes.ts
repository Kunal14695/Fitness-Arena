import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  calculateNutritionTargets,
  Gender,
  FitnessGoal,
  ActivityLevel,
} from '../utils/nutritionCalculator.js';

const router = Router();

const updateProfileSchema = z.object({
  age: z.number().int().min(12).max(120, 'Age must be between 12 and 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  heightCm: z.number().positive().min(50).max(280, 'Height must be in cm (e.g., 175)'),
  currentWeightKg: z.number().positive().min(20).max(350, 'Weight must be in kg (e.g., 75.5)'),
  targetWeightKg: z.number().positive().min(20).max(350).optional(),
  goal: z.enum(['BULK', 'CUT', 'MAINTAIN']),
  activityLevel: z.enum([
    'SEDENTARY',
    'LIGHT',
    'MODERATE',
    'VERY_ACTIVE',
    'EXTREMELY_ACTIVE',
  ]),
  dietaryPreference: z.enum(['VEGAN', 'VEGETARIAN', 'NON_VEGETARIAN']).default('NON_VEGETARIAN'),
});

/**
 * @route GET /api/profile
 * @desc Get current user's profile and calculated metrics
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Profile not yet completed. Please update your height, weight, and fitness goal.',
      });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/profile
 * @desc Set or update biometrics, recalculates BMR, TDEE, and daily caloric/macro targets
 */
router.put(
  '/',
  authenticateToken,
  validateBody(updateProfileSchema),
  async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
    try {
      const {
        age,
        gender,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        goal,
        activityLevel,
        dietaryPreference,
      } = req.body;

      // Run calculation engine
      const metrics = calculateNutritionTargets({
        age,
        gender: gender as Gender,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        goal: goal as FitnessGoal,
        activityLevel: activityLevel as ActivityLevel,
      });

      const profile = await prisma.profile.upsert({
        where: { userId: req.user!.userId },
        update: {
          age,
          gender,
          heightCm,
          currentWeightKg,
          targetWeightKg: targetWeightKg || currentWeightKg,
          goal,
          activityLevel,
          dietaryPreference: dietaryPreference || 'NON_VEGETARIAN',
          bmr: metrics.bmr,
          tdee: metrics.tdee,
          targetCalories: metrics.targetCalories,
          targetProtein: metrics.targetProtein,
          targetCarbs: metrics.targetCarbs,
          targetFats: metrics.targetFats,
        },
        create: {
          userId: req.user!.userId,
          age,
          gender,
          heightCm,
          currentWeightKg,
          targetWeightKg: targetWeightKg || currentWeightKg,
          goal,
          activityLevel,
          dietaryPreference: dietaryPreference || 'NON_VEGETARIAN',
          bmr: metrics.bmr,
          tdee: metrics.tdee,
          targetCalories: metrics.targetCalories,
          targetProtein: metrics.targetProtein,
          targetCarbs: metrics.targetCarbs,
          targetFats: metrics.targetFats,
        },
      });

      res.json({
        success: true,
        message: 'Biometrics and nutrition targets updated successfully!',
        data: {
          profile,
          metricsBreakdown: metrics,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
