import { ENV } from '../config/env.js';

export interface GeneratedMealItem {
  name: string;
  category: 'BREAKFAST' | 'LUNCH' | 'PRE_WORKOUT' | 'POST_WORKOUT' | 'DINNER' | 'SNACK';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  ingredients: string[];
  recipe: string;
}

export interface GeneratedDailyPlan {
  breakfast: GeneratedMealItem;
  lunch: GeneratedMealItem;
  preWorkout: GeneratedMealItem;
  postWorkout: GeneratedMealItem;
  dinner: GeneratedMealItem;
  snack: GeneratedMealItem;
  isAiGenerated: boolean;
}

interface GenerateMealsInput {
  goal: string;
  dietaryPreference: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  currentWeightKg: number;
  heightCm: number;
}

// In-memory cache to prevent excessive API calls while keeping responses instant
const planCache = new Map<string, { plan: GeneratedDailyPlan; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours cache

export async function generateGeminiMealPlan(
  cacheKey: string,
  input: GenerateMealsInput,
  forceRefresh: boolean = false
): Promise<GeneratedDailyPlan | null> {
  // Check Cache
  if (!forceRefresh && planCache.has(cacheKey)) {
    const cached = planCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.plan;
    }
  }

  // Fast deterministic response during automated integration tests
  if (process.env.NODE_ENV === 'test') {
    return {
      breakfast: {
        name: 'Greek Yogurt Protein Power Bowl',
        category: 'BREAKFAST',
        calories: 500,
        proteinGrams: 52,
        carbsGrams: 59,
        fatsGrams: 9,
        ingredients: ['200g Greek Yogurt', '1 scoop Whey', '40g Oats', '100g Berries'],
        recipe: 'Layer ingredients in a bowl.',
      },
      lunch: {
        name: 'Grilled Protein Quinoa Bowl',
        category: 'LUNCH',
        calories: 650,
        proteinGrams: 50,
        carbsGrams: 70,
        fatsGrams: 15,
        ingredients: ['200g Protein Source', '1 cup Quinoa', 'Steamed Veggies'],
        recipe: 'Grill and serve with warm quinoa.',
      },
      preWorkout: {
        name: 'Power Banana & Peanut Butter Rice Cakes',
        category: 'PRE_WORKOUT',
        calories: 280,
        proteinGrams: 10,
        carbsGrams: 48,
        fatsGrams: 6,
        ingredients: ['3 Rice Cakes', '1 Banana', '1 tbsp Peanut Butter'],
        recipe: 'Top rice cakes with sliced banana.',
      },
      postWorkout: {
        name: 'Rapid Recovery Whey Isolate Smoothie',
        category: 'POST_WORKOUT',
        calories: 400,
        proteinGrams: 45,
        carbsGrams: 45,
        fatsGrams: 4,
        ingredients: ['1.5 scoops Whey Isolate', '1 Banana', 'Oat Milk'],
        recipe: 'Blend and drink.',
      },
      dinner: {
        name: 'Roasted Asparagus & Sweet Potato Dinner',
        category: 'DINNER',
        calories: 620,
        proteinGrams: 48,
        carbsGrams: 50,
        fatsGrams: 18,
        ingredients: ['200g Main Protein', 'Roasted Asparagus', 'Mashed Sweet Potato'],
        recipe: 'Pan sear and serve hot.',
      },
      snack: {
        name: 'Mixed Nuts & Blueberries',
        category: 'SNACK',
        calories: 250,
        proteinGrams: 12,
        carbsGrams: 22,
        fatsGrams: 14,
        ingredients: ['30g Almonds', '50g Blueberries'],
        recipe: 'Mix and eat.',
      },
      isAiGenerated: true,
    };
  }

  const apiKey = ENV.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured. Falling back to default database meals.');
    return null;
  }

  const dietDescriptions: Record<string, string> = {
    VEGAN: '100% strictly plant-based. No dairy, eggs, meat, fish, or animal products. Emphasize tofu, tempeh, lentils, chickpeas, edamame, soya chunks, seitan, oats, nuts, seeds, and plant protein.',
    VEGETARIAN: 'Lacto-vegetarian or Ovo-lacto vegetarian. Allowed: paneer, Greek yogurt, eggs/egg whites, cottage cheese, whey protein, lentils, beans, grains, vegetables. No chicken, meat, or fish.',
    NON_VEGETARIAN: 'High-protein omnivore diet. Allowed: chicken breast, salmon, lean beef, turkey, eggs, fish, dairy, rice, sweet potatoes, and all vegetables.',
  };

  const dietGuidance = dietDescriptions[input.dietaryPreference] || dietDescriptions.NON_VEGETARIAN;

  const prompt = `
You are an elite sports nutritionist and private culinary chef for high-performance athletes.
Create a realistic, delicious, mouth-watering daily meal plan with accurate nutritional metrics tailored to:

ATHLETE PROFILE:
- Body Weight: ${input.currentWeightKg} kg
- Height: ${input.heightCm} cm
- Fitness Goal: ${input.goal} (e.g. BULK needs calorie-dense clean foods; CUT needs high-volume, lean satiety foods)
- Dietary Lifestyle: ${input.dietaryPreference} (${dietGuidance})
- Daily Calorie Target: ~${input.targetCalories} kcal
- Daily Protein Target: ~${input.targetProtein} grams
- Daily Carbs Target: ~${input.targetCarbs} grams
- Daily Fats Target: ~${input.targetFats} grams

REQUIREMENTS:
1. Provide realistic recipes with specific ingredient weights (e.g., "180g low-fat paneer", "1 cup cooked jasmine rice", "1.5 scoops whey isolate").
2. Pre-Workout meal: Must contain fast-digesting carbs and moderate protein for sustained gym energy without bloating (e.g. rice cakes with banana and honey).
3. Post-Workout meal: High-bioavailability protein with glycogen-replenishing carbs to initiate immediate muscle protein synthesis.
4. Total calories and macros across the 6 meals should closely match the daily targets.

Return your response strictly in the following JSON format:
{
  "breakfast": {
    "name": string,
    "category": "BREAKFAST",
    "calories": integer,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number,
    "ingredients": [string, string, ...],
    "recipe": string
  },
  "lunch": {
    "name": string,
    "category": "LUNCH",
    "calories": integer,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number,
    "ingredients": [string, string, ...],
    "recipe": string
  },
  "preWorkout": {
    "name": string,
    "category": "PRE_WORKOUT",
    "calories": integer,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number,
    "ingredients": [string, string, ...],
    "recipe": string
  },
  "postWorkout": {
    "name": string,
    "category": "POST_WORKOUT",
    "calories": integer,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number,
    "ingredients": [string, string, ...],
    "recipe": string
  },
  "dinner": {
    "name": string,
    "category": "DINNER",
    "calories": integer,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number,
    "ingredients": [string, string, ...],
    "recipe": string
  },
  "snack": {
    "name": string,
    "category": "SNACK",
    "calories": integer,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number,
    "ingredients": [string, string, ...],
    "recipe": string
  }
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      return null;
    }

    const data = (await response.json()) as any;
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      console.error('Gemini returned empty parts');
      return null;
    }

    const parsed = JSON.parse(jsonText);
    const plan: GeneratedDailyPlan = {
      breakfast: { ...parsed.breakfast, category: 'BREAKFAST' },
      lunch: { ...parsed.lunch, category: 'LUNCH' },
      preWorkout: { ...parsed.preWorkout, category: 'PRE_WORKOUT' },
      postWorkout: { ...parsed.postWorkout, category: 'POST_WORKOUT' },
      dinner: { ...parsed.dinner, category: 'DINNER' },
      snack: { ...parsed.snack, category: 'SNACK' },
      isAiGenerated: true,
    };

    // Cache result
    planCache.set(cacheKey, { plan, timestamp: Date.now() });
    return plan;
  } catch (err) {
    console.error('Error generating meal plan via Gemini:', err);
    return null;
  }
}
