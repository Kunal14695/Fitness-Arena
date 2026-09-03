export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type FitnessGoal = 'BULK' | 'CUT' | 'MAINTAIN';
export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHT'
  | 'MODERATE'
  | 'VERY_ACTIVE'
  | 'EXTREMELY_ACTIVE';

export interface NutritionProfileInput {
  age: number;
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg?: number;
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
}

export interface CalculatedNutritionMetrics {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number;   // in grams
  targetFats: number;    // in grams
  calorieAdjustment: number;
  summary: string;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,          // Little or no exercise, desk job
  LIGHT: 1.375,            // Light exercise 1-3 days/week
  MODERATE: 1.55,          // Moderate exercise 3-5 days/week
  VERY_ACTIVE: 1.725,      // Hard exercise 6-7 days/week
  EXTREMELY_ACTIVE: 1.9,   // Very hard exercise, physical job or 2x/day training
};

export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'MALE') {
    return Math.round(base + 5);
  } else if (gender === 'FEMALE') {
    return Math.round(base - 161);
  } else {
    // Averaged baseline for OTHER
    return Math.round(base - 78);
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateNutritionTargets(input: NutritionProfileInput): CalculatedNutritionMetrics {
  const bmr = calculateBMR(input.gender, input.currentWeightKg, input.heightCm, input.age);
  const tdee = calculateTDEE(bmr, input.activityLevel);

  let calorieAdjustment = 0;
  let proteinRatio = 1.8; // grams per kg

  if (input.goal === 'BULK') {
    // Clean caloric surplus: +400 kcal
    calorieAdjustment = 400;
    proteinRatio = 2.0;
  } else if (input.goal === 'CUT') {
    // Moderate caloric deficit: -500 kcal (preserving lean mass)
    calorieAdjustment = -500;
    proteinRatio = 2.2;
  } else {
    // Maintenance
    calorieAdjustment = 0;
    proteinRatio = 1.8;
  }

  const targetCalories = Math.max(1200, tdee + calorieAdjustment);

  // Protein calculation: proteinRatio * weight in kg
  const targetProtein = Math.round(input.currentWeightKg * proteinRatio);
  const proteinCalories = targetProtein * 4;

  // Fat calculation: ~25% of total target calories (9 kcal/gram)
  const fatCalories = targetCalories * 0.25;
  const targetFats = Math.round(fatCalories / 9);

  // Carb calculation: remaining calories (4 kcal/gram)
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const targetCarbs = Math.round(remainingCaloriesForCarbs / 4);

  let summary = '';
  if (input.goal === 'BULK') {
    summary = `Bulking plan: +${calorieAdjustment} kcal surplus over TDEE (${tdee} kcal) to support progressive overload and muscle hypertrophy.`;
  } else if (input.goal === 'CUT') {
    summary = `Cutting plan: ${calorieAdjustment} kcal deficit below TDEE (${tdee} kcal) with elevated protein (${targetProtein}g) to shred body fat while retaining muscle.`;
  } else {
    summary = `Maintenance plan: Matching TDEE (${tdee} kcal) for body recomposition and energy balance.`;
  }

  return {
    bmr,
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFats,
    calorieAdjustment,
    summary,
  };
}
