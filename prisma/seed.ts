import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Fitness Arena database...');

  // 1. Seed Exercises
  const exercises = [
    // Chest
    {
      name: 'Barbell Bench Press',
      muscleGroup: 'CHEST',
      equipment: 'BARBELL',
      description: 'The king of chest pressing movements for building upper body mass and strength.',
      instructions: 'Lie back on a flat bench. Grip the barbell with hands slightly wider than shoulder-width. Lower bar to mid-chest, then press upwards explosively.',
    },
    {
      name: 'Incline Dumbbell Press',
      muscleGroup: 'CHEST',
      equipment: 'DUMBBELL',
      description: 'Targets the clavicular head (upper chest) and front deltoids.',
      instructions: 'Set bench to a 30-45 degree incline. Press dumbbells upwards until arms are extended, lower slowly with control.',
    },
    {
      name: 'Push-ups',
      muscleGroup: 'CHEST',
      equipment: 'BODYWEIGHT',
      description: 'Fundamental bodyweight movement for chest, triceps, and core stability.',
      instructions: 'Keep your body in a straight plank line. Lower chest to floor and push back up while engaging core.',
    },
    // Back
    {
      name: 'Barbell Deadlift',
      muscleGroup: 'BACK',
      equipment: 'BARBELL',
      description: 'Total body posterior chain builder targeting erectors, lats, glutes, and hamstrings.',
      instructions: 'Stand with feet hip-width. Hinge at hips, grip bar firmly, brace core, drive through heels to full standing lockout.',
    },
    {
      name: 'Pull-ups',
      muscleGroup: 'BACK',
      equipment: 'BODYWEIGHT',
      description: 'Gold standard vertical pull for lat width and grip strength.',
      instructions: 'Grip bar with hands wider than shoulder-width, palms facing away. Pull chest up towards bar, squeezing lats at the peak.',
    },
    {
      name: 'Barbell Bent-Over Row',
      muscleGroup: 'BACK',
      equipment: 'BARBELL',
      description: 'Horizontal pull developing upper/mid back thickness and rhomboids.',
      instructions: 'Hinge forward at 45 degrees with flat back. Pull bar towards lower ribcage, keeping elbows tucked close.',
    },
    // Legs
    {
      name: 'Barbell Back Squat',
      muscleGroup: 'LEGS',
      equipment: 'BARBELL',
      description: 'Primary lower body compound movement for quadriceps, hamstrings, and glutes.',
      instructions: 'Rest bar across traps. Descend until hips are below parallel, keep chest tall, drive up through mid-foot.',
    },
    {
      name: 'Romanian Deadlift (RDL)',
      muscleGroup: 'LEGS',
      equipment: 'BARBELL',
      description: 'Posterior chain builder focusing heavily on hamstring stretch and glute hypertrophy.',
      instructions: 'Hold bar at hips with slight knee bend. Push hips back as far as possible, feel deep stretch in hamstrings, return upright.',
    },
    {
      name: 'Bulgarian Split Squat',
      muscleGroup: 'LEGS',
      equipment: 'DUMBBELL',
      description: 'Unilateral leg exercise for quad development, glutes, and fixing strength imbalances.',
      instructions: 'Place rear foot elevated on bench. Lower front knee until thigh is parallel with floor, then drive back up.',
    },
    // Shoulders
    {
      name: 'Overhead Barbell Press (OHP)',
      muscleGroup: 'SHOULDERS',
      equipment: 'BARBELL',
      description: 'Compound vertical press targeting anterior/medial delts and triceps.',
      instructions: 'Stand tall with bar at clavicle. Press bar directly overhead until elbows lock out, bracing glutes and abs.',
    },
    {
      name: 'Dumbbell Lateral Raise',
      muscleGroup: 'SHOULDERS',
      equipment: 'DUMBBELL',
      description: 'Isolation exercise for wide lateral deltoids giving the "V-taper" physique.',
      instructions: 'With slight forward lean, raise dumbbells out to sides until parallel to ground. Lower with 2-second control.',
    },
    // Arms
    {
      name: 'Barbell Bicep Curl',
      muscleGroup: 'ARMS',
      equipment: 'BARBELL',
      description: 'Mass builder for biceps brachii.',
      instructions: 'Keep elbows pinned to ribs. Curl bar towards chest, squeeze peak contraction, lower slowly.',
    },
    {
      name: 'Tricep Rope Pushdown',
      muscleGroup: 'ARMS',
      equipment: 'CABLES',
      description: 'Isolates the lateral and medial heads of the triceps.',
      instructions: 'Stand facing cable pulley. Push rope down, flaring ends outwards at the bottom for maximum tricep squeeze.',
    },
    // Core
    {
      name: 'Hanging Leg Raise',
      muscleGroup: 'CORE',
      equipment: 'BODYWEIGHT',
      description: 'Exceptional movement for lower abdominal wall and hip flexors.',
      instructions: 'Hang from pull-up bar. Without swinging, lift straight legs or knees up to hip height, curling pelvis up.',
    },
    {
      name: 'Plank',
      muscleGroup: 'CORE',
      equipment: 'BODYWEIGHT',
      description: 'Isometric core strength and spinal endurance exercise.',
      instructions: 'Rest on forearms and toes. Keep spine neutral, squeeze glutes and brace abs tightly.',
    }
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }
  console.log(`✅ Seeded ${exercises.length} exercises.`);

  // 2. Seed Meals
  const meals = [
    // Bulking Meals (High calorie, high protein, high clean carbs)
    {
      name: 'Monster Bulk Oatmeal Bowl',
      category: 'BREAKFAST',
      goalType: 'BULK',
      calories: 780,
      proteinGrams: 48,
      carbsGrams: 92,
      fatsGrams: 22,
      ingredients: JSON.stringify(['100g Rolled Oats', '1.5 scoops Whey Protein', '2 tbsp Natural Peanut Butter', '1 Large Banana', '250ml Whole Milk']),
      recipe: 'Cook oats in milk. Stir in whey protein after cooking. Top with sliced banana and natural peanut butter.',
    },
    {
      name: 'Chipotle Chicken, Sweet Potato & Rice Bowl',
      category: 'LUNCH',
      goalType: 'BULK',
      calories: 850,
      proteinGrams: 58,
      carbsGrams: 105,
      fatsGrams: 18,
      ingredients: JSON.stringify(['220g Chicken Breast', '250g Cooked Jasmine Rice', '150g Roasted Sweet Potato', '50g Black Beans', '1 tbsp Olive Oil']),
      recipe: 'Grill seasoned chicken breast. Serve over jasmine rice and cubed sweet potatoes with black beans and olive oil drizzle.',
    },
    {
      name: 'Sirloin Steak & Loaded Mash Dinner',
      category: 'DINNER',
      goalType: 'BULK',
      calories: 920,
      proteinGrams: 64,
      carbsGrams: 75,
      fatsGrams: 36,
      ingredients: JSON.stringify(['250g Lean Sirloin Steak', '300g Red Potatoes', '1 tbsp Grass-fed Butter', '100g Steamed Asparagus']),
      recipe: 'Pan sear sirloin to medium rare in cast iron. Boil and mash red potatoes with butter. Serve with roasted asparagus.',
    },
    {
      name: 'Greek Yogurt, Honey & Mixed Nut Crunch',
      category: 'SNACK',
      goalType: 'BULK',
      calories: 450,
      proteinGrams: 30,
      carbsGrams: 42,
      fatsGrams: 16,
      ingredients: JSON.stringify(['250g Greek Yogurt 5%', '1 tbsp Honey', '30g Walnuts & Almonds', '50g Blueberries']),
      recipe: 'Mix Greek yogurt with raw honey, top with crushed almonds, walnuts, and fresh blueberries.',
    },

    // Cutting Meals (High protein, low calorie density, high satiety)
    {
      name: 'Anabolic Egg White & Spinach Scramble',
      category: 'BREAKFAST',
      goalType: 'CUT',
      calories: 360,
      proteinGrams: 42,
      carbsGrams: 24,
      fatsGrams: 8,
      ingredients: JSON.stringify(['2 Whole Eggs', '200ml Liquid Egg Whites', '100g Baby Spinach', '1 Slice Ezekiel Wholegrain Toast', 'Sriracha']),
      recipe: 'Scramble whole eggs and egg whites with fresh spinach in a non-stick pan. Serve with 1 slice toasted Ezekiel bread.',
    },
    {
      name: 'Lean Ground Turkey Zucchini Bolognese',
      category: 'LUNCH',
      goalType: 'CUT',
      calories: 430,
      proteinGrams: 48,
      carbsGrams: 22,
      fatsGrams: 12,
      ingredients: JSON.stringify(['200g 93/7 Lean Ground Turkey', '250g Spiralized Zucchini Noodles', '120g Marinara Sauce', '30g Grated Parmesan']),
      recipe: 'Brown ground turkey with Italian herbs. Simmer with marinara sauce. Toss with sauteed zucchini noodles and top with parmesan.',
    },
    {
      name: 'Crispy Lemon-Herb Atlantic Salmon & Greens',
      category: 'DINNER',
      goalType: 'CUT',
      calories: 480,
      proteinGrams: 44,
      carbsGrams: 14,
      fatsGrams: 22,
      ingredients: JSON.stringify(['200g Fresh Salmon Fillet', '200g Steamed Broccoli', '100g Roasted Asparagus', 'Fresh Lemon Juice', '1 tsp Olive Oil']),
      recipe: 'Pan-sear salmon skin-down until crisp, flip for 2 minutes. Serve alongside steamed broccoli and roasted asparagus with fresh lemon.',
    },
    {
      name: 'High-Volume Whey Casein Sludge & Strawberries',
      category: 'SNACK',
      goalType: 'CUT',
      calories: 210,
      proteinGrams: 32,
      carbsGrams: 16,
      fatsGrams: 2,
      ingredients: JSON.stringify(['1 scoop Whey/Casein Blend', '100g Frozen Strawberries', '150ml Cold Almond Milk Unsweetened']),
      recipe: 'Blend protein powder with small amount of cold almond milk to create thick pudding texture. Top with sliced strawberries.',
    },

    // Any Goal / Balanced Meals
    {
      name: 'Classic Grilled Chicken, Quinoa & Avocado',
      category: 'LUNCH',
      goalType: 'ANY',
      calories: 580,
      proteinGrams: 50,
      carbsGrams: 52,
      fatsGrams: 18,
      ingredients: JSON.stringify(['180g Chicken Breast', '150g Cooked Quinoa', '50g Avocado', 'Mixed Greens', 'Balsamic Glaze']),
      recipe: 'Combine grilled chicken slices with fluffy quinoa, avocado chunks, and tossed greens.',
    },
    {
      name: 'High Protein Overnight Oats',
      category: 'BREAKFAST',
      goalType: 'ANY',
      calories: 480,
      proteinGrams: 38,
      carbsGrams: 56,
      fatsGrams: 10,
      ingredients: JSON.stringify(['60g Oats', '1 scoop Vanilla Whey', '150ml Skim Milk', '1 tbsp Chia Seeds', '50g Berries']),
      recipe: 'Mix oats, whey, milk, and chia seeds in a jar. Refrigerate overnight. Top with berries in the morning.',
    }
  ];

  for (const m of meals) {
    const existing = await prisma.meal.findFirst({ where: { name: m.name } });
    if (!existing) {
      await prisma.meal.create({ data: m });
    }
  }
  console.log(`✅ Seeded ${meals.length} nutrition meals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
