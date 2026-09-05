import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        text: z.string(),
      })
    )
    .optional(),
});

/**
 * @route GET /api/chat/history
 * @desc Retrieve authenticated user's isolated chat history from database
 */
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 60,
      select: {
        id: true,
        role: true,
        text: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/chat/history
 * @desc Clear authenticated user's isolated chat history from database
 */
router.delete('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const userId = req.user!.userId;
    await prisma.chatMessage.deleteMany({
      where: { userId },
    });

    res.json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/chat
 * @desc Ask Coach Arena an AI fitness question; stores conversation in DB per profile
 */
router.post(
  '/',
  authenticateToken,
  validateBody(chatSchema),
  async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { message } = req.body;

      // 1. Fetch user data with complete profile, streak, rank, and routines
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          streak: true,
          rank: true,
          routines: {
            include: {
              days: {
                include: {
                  exercises: {
                    include: {
                      exercise: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // 2. Fetch past DB chat history for this specific user (up to 40 messages)
      const dbPastMessages = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 40,
      });

      // 3. Persist incoming user message to database
      await prisma.chatMessage.create({
        data: {
          userId,
          role: 'user',
          text: message,
        },
      });

      const p = user.profile;
      const s = user.streak;
      const r = user.rank;
      const activeRoutine = user.routines?.find((rt) => rt.isDefault) || user.routines?.[0];
      const routineSummary = activeRoutine
        ? `${activeRoutine.title} (${activeRoutine.days.map((d) => d.title).join(', ')})`
        : 'Default Full Body Split';

      const athleteContext = `
=== ATHLETE BIOMETRIC & GOAL DOSSIER ===
- Athlete Name: ${user.name}
- Age: ${p?.age ?? 'Not configured'} years
- Biological Gender: ${p?.gender ?? 'Not configured'}
- Height: ${p?.heightCm ?? 'Not configured'} cm
- Current Body Weight: ${p?.currentWeightKg ?? 'Not configured'} kg
- Target Goal Weight: ${p?.targetWeightKg ?? 'Not configured'} kg
- PRIMARY FITNESS GOAL: ${p?.goal ?? 'Not configured'}
  * Goal Definition: ${
    p?.goal === 'BULK'
      ? 'HYPERTROPHY BULKING (+400 kcal surplus to pack on clean lean muscle mass)'
      : p?.goal === 'CUT'
      ? 'FAT-LOSS CUTTING (-500 kcal deficit to shred body fat while preserving muscle)'
      : 'MAINTENANCE & RECOMPOSITION (Equilibrium energy balance to optimize performance and lean tone)'
  }
- Daily Activity Level: ${p?.activityLevel ?? 'MODERATE'}
- Dietary Lifestyle: ${p?.dietaryPreference ?? 'NON_VEGETARIAN'} (${
        p?.dietaryPreference === 'VEGAN'
          ? 'Strictly 100% Plant-Based'
          : p?.dietaryPreference === 'VEGETARIAN'
          ? 'Vegetarian (Dairy, Eggs, Grains, Whey, Paneer)'
          : 'High-Protein Omnivore (Chicken, Fish, Eggs, Meat, Dairy)'
      })
- Daily Nutritional Targets:
  * Calories: ${p?.targetCalories ?? 2500} kcal/day
  * Protein: ${p?.targetProtein ?? 150}g/day
  * Carbohydrates: ${p?.targetCarbs ?? 250}g/day
  * Dietary Fats: ${p?.targetFats ?? 70}g/day
- Gym Streak: ${s?.currentStreak ?? 0} Days (All-time longest: ${s?.longestStreak ?? 0} Days, Streak Freezes: ${s?.freezeCount ?? 0})
- Rank Tier: ${r?.badge ?? 'Iron Novice'} (XP: ${r?.xp ?? 0}, Level: ${r?.level ?? 1})
- Active Workout Routine Split: ${routineSummary}
`;

      const systemPrompt = `You are 'Coach Arena', the athlete's dedicated AI elite coach, biomechanics mentor, and sports performance nutritionist inside the Fitness Arena app.
${athleteContext}

CORE DIRECTIVES & CONVERSATIONAL MEMORY:
1. FULL CONTEXT & CONVERSATIONAL CONTINUITY: You have complete conversational memory like Gemini. NEVER forget anything the athlete told you earlier in this conversation (e.g. preferences, past questions, personal schedule, past injuries, favorite exercises or foods). Always maintain context across multiple turns.
2. REMEMBER AND ENFORCE THE ATHLETE'S GOALS:
   - Always tailor every workout, nutrition, or recovery tip to their goal: ${p?.goal || 'General Fitness'} (Current Weight: ${p?.currentWeightKg || 75}kg, Target: ${p?.targetWeightKg || 80}kg, Daily Calorie Target: ${p?.targetCalories || 2500} kcal, Protein: ${p?.targetProtein || 150}g, Diet: ${p?.dietaryPreference || 'Non-Vegetarian'}).
   - If they ask what their stats, calories, or goal are, cite their exact numbers accurately.
   - If they ask for meal ideas, respect their dietary lifestyle (${p?.dietaryPreference || 'Non-Vegetarian'}) and target macros.
3. TONE & STRUCTURE: Elite, encouraging, high-energy, and scientifically precise. Use bold keys and concise bullet points for readability. Avoid generic fluff.
4. MOTIVATION: Keep their gym streak (${s?.currentStreak || 0} days) alive!`;

      // Fast response for automated test environment
      if (process.env.NODE_ENV === 'test') {
        const testReply = `Coach Arena here! As a ${p?.goal || 'dedicated'} athlete, keep pushing your progressive overload and hitting your daily protein target of ${p?.targetProtein || 150}g!`;
        await prisma.chatMessage.create({
          data: {
            userId,
            role: 'model',
            text: testReply,
          },
        });
        res.json({
          success: true,
          data: {
            reply: testReply,
            role: 'model',
          },
        });
        return;
      }

      const apiKey = ENV.GEMINI_API_KEY;

      if (!apiKey) {
        const fallbackReply = generateFallbackAdvice(message, user);
        await prisma.chatMessage.create({
          data: {
            userId,
            role: 'model',
            text: fallbackReply,
          },
        });
        res.json({
          success: true,
          data: {
            reply: fallbackReply,
            role: 'model',
          },
        });
        return;
      }

      // Build complete conversation contents for Gemini from database history
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      for (const h of dbPastMessages) {
        if (h && typeof h.text === 'string' && h.text.trim()) {
          contents.push({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text.trim() }],
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const CANDIDATE_MODELS = [
        'gemini-flash-lite-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-2.5-flash',
      ];

      let replyText: string | null = null;

      for (const model of CANDIDATE_MODELS) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            }),
          });

          if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.warn(`Gemini Chat [${model}] returned status ${geminiRes.status}:`, errText.slice(0, 120));
            continue; // Try next model in fallback list
          }

          const data = (await geminiRes.json()) as any;
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            replyText = candidateText.trim();
            break; // Success!
          }
        } catch (geminiError) {
          console.warn(`Gemini Chat [${model}] exception:`, (geminiError as Error).message);
          continue;
        }
      }

      const finalReply = replyText || generateFallbackAdvice(message, user);

      // 4. Save model response to database
      await prisma.chatMessage.create({
        data: {
          userId,
          role: 'model',
          text: finalReply,
        },
      });

      res.json({
        success: true,
        data: {
          reply: finalReply,
          role: 'model',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

function generateFallbackAdvice(query: string, user: any): string {
  const goal = user.profile?.goal || 'BULK';
  const protein = user.profile?.targetProtein || 150;
  const calories = user.profile?.targetCalories || 2500;
  const diet = user.profile?.dietaryPreference || 'NON_VEGETARIAN';
  const streak = user.streak?.currentStreak || 0;
  const q = query.toLowerCase();

  // 1. Meal, diet, food, protein queries
  if (
    q.includes('meal') ||
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('diet') ||
    q.includes('breakfast') ||
    q.includes('lunch') ||
    q.includes('dinner') ||
    q.includes('snack') ||
    q.includes('recipe') ||
    q.includes('protein') ||
    q.includes('macro') ||
    q.includes('calorie')
  ) {
    if (diet === 'VEGAN') {
      return `🥗 **Coach Arena ${goal} Meal Plan (100% Plant-Based)**
Daily Target: **${calories} kcal** • **${protein}g Protein**

• **Meal 1 (Breakfast)**: Tofu Scramble (200g firm tofu) with nutritional yeast, spinach, and 2 slices sprouted whole grain toast with avocado (~28g protein).
• **Meal 2 (Lunch)**: Lentil & Quinoa Power Bowl (1.5 cups cooked lentils, 1 cup quinoa, roasted broccoli, pumpkin seeds) (~35g protein).
• **Meal 3 (Pre/Post Workout Snack)**: Pea & Rice Protein Shake with oat milk, 1 banana, and 2 tbsp peanut butter (~32g protein).
• **Meal 4 (Dinner)**: Tempeh or Seitan Stir-Fry with brown rice, edamame, and sesame vegetables (~38g protein).

💡 *Coach Tip*: Hitting ${protein}g protein plant-based requires high-density legumes, tofu, tempeh, and seitan. Drink 3L of water!`;
    }

    if (diet === 'VEGETARIAN') {
      return `🥗 **Coach Arena ${goal} Meal Plan (Vegetarian)**
Daily Target: **${calories} kcal** • **${protein}g Protein**

• **Meal 1 (Breakfast)**: 3 Whole Eggs + 2 Whites (scrambled), 1 cup oatmeal with whole milk, chia seeds, and berries (~32g protein).
• **Meal 2 (Lunch)**: Low-Fat Paneer (150g) or Soya Chunks curry with brown basmati rice and mixed greens (~38g protein).
• **Meal 3 (Snack / Post-Workout)**: Whey Isolate Shake (1.5 scoops) with 1 banana and a handful of almonds (~35g protein).
• **Meal 4 (Dinner)**: 1.5 cups Greek Yogurt or cottage cheese bowl with roasted chickpeas and vegetable stir-fry (~30g protein).

💡 *Coach Tip*: Focus on paneer, Greek yogurt, eggs, and whey to easily reach your ${protein}g daily protein target!`;
    }

    return `🥩 **Coach Arena ${goal} Meal Plan (High-Protein Omnivore)**
Daily Target: **${calories} kcal** • **${protein}g Protein**

• **Meal 1 (Breakfast)**: 3 Whole Eggs + 2 Whites scrambled, 2 slices sprouted bread, 1 banana with peanut butter (~34g protein).
• **Meal 2 (Lunch)**: 180g Grilled Chicken Breast or Lean Turkey, 1.5 cups jasmine rice, steamed broccoli drizzled with olive oil (~45g protein).
• **Meal 3 (Post-Workout / Snack)**: 1 Scoop Whey Protein + 1 cup Greek yogurt with honey and berries (~38g protein).
• **Meal 4 (Dinner)**: 180g Lean Ground Beef (90/10) or Salmon fillet, roasted sweet potatoes, and mixed greens (~40g protein).

💡 *Coach Tip*: Spreading ${protein}g protein across these 4 meals keeps muscle protein synthesis elevated around the clock!`;
  }

  // 2. Streaks and accountability
  if (q.includes('streak') || q.includes('freeze') || q.includes('miss') || q.includes('rank') || q.includes('xp')) {
    return `🛡️ **Streak & Arena Standing**:
You currently hold a **${streak}-day gym streak**!
• Scheduled rest days do NOT break your streak.
• You have streak freeze shields ready to protect your status if you ever need an emergency rest day.
• Stay consistent to level up your rank badge and climb the Arena leaderboard!`;
  }

  // 3. Workouts and routine
  if (q.includes('workout') || q.includes('routine') || q.includes('exercise') || q.includes('split') || q.includes('chest') || q.includes('legs') || q.includes('back')) {
    return `💪 **Coach Arena ${goal} Training Strategy**:
• **Split Structure**: Focus on progressive overload across compound lifts (Barbell Bench Press, Back Squats, Romanian Deadlifts, Overhead Press).
• **Volume**: 3–4 working sets per exercise in the 6–10 rep range for hypertrophy, leaving 1–2 reps in reserve (RIR).
• **Rest Periods**: 90–120 seconds between heavy sets to maximize motor unit recovery.
• **Consistency**: Log each completed session in the Workout Log tab to bank XP!`;
  }

  return `💪 **Coach Arena**: I am dialed into your stats (${goal} goal, ${calories} kcal, ${protein}g daily protein target). Stay consistent with your training split, prioritize 7-8 hours of sleep, and nail your nutrition to dominate the Arena leaderboard! What can I break down for you?`;
}

export default router;
