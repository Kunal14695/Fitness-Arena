import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  calculateNutritionTargets,
} from './nutritionCalculator.js';

describe('Nutrition Calculator', () => {
  it('calculates male BMR accurately with Mifflin-St Jeor', () => {
    // 80kg, 180cm, 25 years old male
    // 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
    const bmr = calculateBMR('MALE', 80, 180, 25);
    expect(bmr).toBe(1805);
  });

  it('calculates female BMR accurately with Mifflin-St Jeor', () => {
    // 60kg, 165cm, 28 years old female
    // 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
    const bmr = calculateBMR('FEMALE', 60, 165, 28);
    expect(bmr).toBe(1330);
  });

  it('calculates bulking targets with clean caloric surplus and high protein', () => {
    const metrics = calculateNutritionTargets({
      gender: 'MALE',
      age: 25,
      heightCm: 180,
      currentWeightKg: 80,
      goal: 'BULK',
      activityLevel: 'MODERATE', // 1.55 multiplier
    });

    expect(metrics.bmr).toBe(1805);
    expect(metrics.tdee).toBe(Math.round(1805 * 1.55)); // 2798
    expect(metrics.targetCalories).toBe(metrics.tdee + 400); // 3198
    expect(metrics.targetProtein).toBe(80 * 2.0); // 160g protein
    expect(metrics.targetFats).toBeGreaterThan(0);
    expect(metrics.targetCarbs).toBeGreaterThan(0);
  });

  it('calculates cutting targets with caloric deficit and elevated protein to preserve muscle', () => {
    const metrics = calculateNutritionTargets({
      gender: 'MALE',
      age: 25,
      heightCm: 180,
      currentWeightKg: 85,
      goal: 'CUT',
      activityLevel: 'MODERATE',
    });

    expect(metrics.calorieAdjustment).toBe(-500);
    expect(metrics.targetCalories).toBe(metrics.tdee - 500);
    expect(metrics.targetProtein).toBe(Math.round(85 * 2.2)); // 187g protein
  });
});
