import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Fitness Arena database with comprehensive vegan, vegetarian, and non-veg meals & pre/post workouts...');

  // 1. Seed Exercises
  const exercises = [
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

  // Clear existing meals to reseed with dietType & pre/post categories
  await prisma.meal.deleteMany({});

  const meals = [
    // ==========================================
    // 🥩 NON-VEGETARIAN MEALS
    // ==========================================
    {
      name: 'Anabolic Egg White & Turkey Bacon Scramble',
      category: 'BREAKFAST',
      goalType: 'ANY',
      dietType: 'NON_VEGETARIAN',
      calories: 420,
      proteinGrams: 46,
      carbsGrams: 28,
      fatsGrams: 10,
      ingredients: JSON.stringify(['2 Whole Eggs', '180ml Liquid Egg Whites', '2 Strips Turkey Bacon', '1 slice Sourdough Toast', '50g Spinach']),
      recipe: 'Scramble eggs with spinach, grill turkey bacon until crisp, serve with toasted sourdough.',
    },
    {
      name: 'Grilled Chicken, Sweet Potato & Broccoli Bowl',
      category: 'LUNCH',
      goalType: 'ANY',
      dietType: 'NON_VEGETARIAN',
      calories: 650,
      proteinGrams: 58,
      carbsGrams: 68,
      fatsGrams: 14,
      ingredients: JSON.stringify(['220g Chicken Breast', '220g Roasted Sweet Potato', '120g Steamed Broccoli', '1 tbsp Olive Oil']),
      recipe: 'Season chicken breast with garlic & paprika. Grill alongside cubed sweet potatoes and steamed broccoli.',
    },
    {
      name: 'Atlantic Salmon, Jasmine Rice & Roasted Asparagus',
      category: 'DINNER',
      goalType: 'ANY',
      dietType: 'NON_VEGETARIAN',
      calories: 680,
      proteinGrams: 52,
      carbsGrams: 55,
      fatsGrams: 24,
      ingredients: JSON.stringify(['200g Fresh Salmon Fillet', '180g Cooked Jasmine Rice', '120g Asparagus', 'Fresh Lemon Juice']),
      recipe: 'Pan-sear salmon in cast iron until skin is crispy. Serve over warm jasmine rice with roasted lemon asparagus.',
    },
    {
      name: 'Fast-Digesting Rice Cakes, Honey & Sliced Turkey',
      category: 'PRE_WORKOUT',
      goalType: 'ANY',
      dietType: 'NON_VEGETARIAN',
      calories: 240,
      proteinGrams: 22,
      carbsGrams: 34,
      fatsGrams: 2,
      ingredients: JSON.stringify(['3 Whole Grain Rice Cakes', '80g Lean Roast Turkey Slices', '1 tsp Raw Honey']),
      recipe: 'Top rice cakes with lean turkey breast slices and a drizzle of raw honey for instant pre-workout glycogen.',
    },
    {
      name: 'Rapid Anabolic Chicken & White Rice Puree Plate',
      category: 'POST_WORKOUT',
      goalType: 'ANY',
      dietType: 'NON_VEGETARIAN',
      calories: 520,
      proteinGrams: 50,
      carbsGrams: 65,
      fatsGrams: 4,
      ingredients: JSON.stringify(['200g Shredded Chicken Breast', '220g Fluffy White Jasmine Rice', '50g Diced Pineapple (Bromelain for digestion)']),
      recipe: 'Mix tender warm shredded chicken with white jasmine rice and pineapple chunks for accelerated protein synthesis.',
    },

    // ==========================================
    // 🥗 VEGETARIAN MEALS (Dairy, Paneer, Whey, Greek Yogurt)
    // ==========================================
    {
      name: 'Spiced Paneer Bhurji & Multigrain Toast',
      category: 'BREAKFAST',
      goalType: 'ANY',
      dietType: 'VEGETARIAN',
      calories: 460,
      proteinGrams: 36,
      carbsGrams: 32,
      fatsGrams: 18,
      ingredients: JSON.stringify(['160g Low-Fat Paneer Crumbled', '1 slice Multigrain Toast', '1/2 Onion & Tomato', 'Green Chilies & Turmeric']),
      recipe: 'Sauté onions and tomatoes with spices. Fold in fresh crumbled paneer and cook for 3 minutes. Serve with toasted multigrain bread.',
    },
    {
      name: 'High-Protein Paneer Tikka Quinoa Power Bowl',
      category: 'LUNCH',
      goalType: 'ANY',
      dietType: 'VEGETARIAN',
      calories: 640,
      proteinGrams: 45,
      carbsGrams: 64,
      fatsGrams: 22,
      ingredients: JSON.stringify(['180g Low-Fat Paneer Cubes', '160g Cooked Quinoa', 'Bell Peppers & Onions', '2 tbsp Greek Yogurt Mint Dressing']),
      recipe: 'Marinate paneer in yogurt and tandoori masala. Pan-sear until golden. Assemble with quinoa, bell peppers, and fresh mint dressing.',
    },
    {
      name: 'Cottage Cheese, Black Bean & Roasted Veggie Medley',
      category: 'DINNER',
      goalType: 'ANY',
      dietType: 'VEGETARIAN',
      calories: 540,
      proteinGrams: 42,
      carbsGrams: 52,
      fatsGrams: 16,
      ingredients: JSON.stringify(['180g Low-Fat Cottage Cheese / Paneer', '120g Black Beans', '150g Roasted Zucchini & Carrots', 'Cilantro Lime Dressing']),
      recipe: 'Warm black beans with cumin. Layer with cottage cheese/paneer and roasted seasonal vegetables.',
    },
    {
      name: 'Pre-Workout Banana, Peanut Butter & Rice Cakes',
      category: 'PRE_WORKOUT',
      goalType: 'ANY',
      dietType: 'VEGETARIAN',
      calories: 270,
      proteinGrams: 10,
      carbsGrams: 46,
      fatsGrams: 6,
      ingredients: JSON.stringify(['3 Brown Rice Cakes', '1 Ripe Banana sliced', '1 tbsp Natural Peanut Butter', 'Drizzle of Raw Honey']),
      recipe: 'Spread peanut butter over crisp rice cakes. Top with sliced banana and honey 45 minutes before gym training.',
    },
    {
      name: 'Whey Protein Isolate & Cream of Rice Recovery Sludge',
      category: 'POST_WORKOUT',
      goalType: 'ANY',
      dietType: 'VEGETARIAN',
      calories: 390,
      proteinGrams: 40,
      carbsGrams: 52,
      fatsGrams: 2,
      ingredients: JSON.stringify(['1.5 scoops Whey Isolate Vanilla', '50g Cream of Rice', '100g Sliced Strawberries', 'Pinch of Pink Himalayan Salt']),
      recipe: 'Whisk cream of rice with boiling water until smooth. Stir in whey isolate and salt, top with fresh berries.',
    },

    // ==========================================
    // 🌱 VEGAN MEALS (Plant-Based, Zero Dairy, Zero Animal Products)
    // ==========================================
    {
      name: 'Turmeric Tofu Scramble with Avocado & Ezekiel Toast',
      category: 'BREAKFAST',
      goalType: 'ANY',
      dietType: 'VEGAN',
      calories: 420,
      proteinGrams: 32,
      carbsGrams: 34,
      fatsGrams: 16,
      ingredients: JSON.stringify(['220g Firm Tofu Crumbled', '1 tbsp Nutritional Yeast', '1/4 Avocado sliced', '1 slice Ezekiel Sprouted Toast', 'Baby Spinach']),
      recipe: 'Sauté crumbled firm tofu with nutritional yeast, turmeric, and black pepper. Serve with fresh avocado and toasted Ezekiel bread.',
    },
    {
      name: 'Mediterranean Chickpea, Edamame & Quinoa Mega Bowl',
      category: 'LUNCH',
      goalType: 'ANY',
      dietType: 'VEGAN',
      calories: 620,
      proteinGrams: 42,
      carbsGrams: 78,
      fatsGrams: 14,
      ingredients: JSON.stringify(['150g Steamed Edamame', '140g Cooked Chickpeas', '150g Cooked Quinoa', 'Cherry Tomatoes, Cucumber', '1 tbsp Tahini Dressing']),
      recipe: 'Toss warm quinoa with shelled edamame, chickpeas, crisp vegetables, and a creamy lemon-tahini dressing.',
    },
    {
      name: 'Rich Soya Chunk Masala with Sweet Potato & Green Beans',
      category: 'DINNER',
      goalType: 'ANY',
      dietType: 'VEGAN',
      calories: 580,
      proteinGrams: 52,
      carbsGrams: 64,
      fatsGrams: 10,
      ingredients: JSON.stringify(['80g Dry Soya Chunks (boiled & squeezed, 52% protein)', '200g Baked Sweet Potato', '120g Steamed Green Beans', 'Tomato Ginger Gravy']),
      recipe: 'Boil soya chunks, squeeze water out, and simmer in aromatic tomato-ginger sauce. Serve alongside baked sweet potato.',
    },
    {
      name: 'Vegan Pre-Workout Medjool Dates & Almond Butter Energy Fuel',
      category: 'PRE_WORKOUT',
      goalType: 'ANY',
      dietType: 'VEGAN',
      calories: 250,
      proteinGrams: 6,
      carbsGrams: 48,
      fatsGrams: 5,
      ingredients: JSON.stringify(['3 Large Medjool Dates', '1 tbsp Creamy Almond Butter', 'Pinch of Sea Salt']),
      recipe: 'Pit dates, stuff each with almond butter and a crystal of sea salt for sustained muscular pump and endurance.',
    },
    {
      name: 'Plant Protein Recovery Shake with Banana & Blueberries',
      category: 'POST_WORKOUT',
      goalType: 'ANY',
      dietType: 'VEGAN',
      calories: 360,
      proteinGrams: 38,
      carbsGrams: 46,
      fatsGrams: 3,
      ingredients: JSON.stringify(['1.5 scoops Pea/Rice Protein Blend', '1 Large Banana', '80g Frozen Blueberries', '300g Unsweetened Almond Milk']),
      recipe: 'Blend all ingredients in a blender for 45 seconds until velvety and chilled. Drink immediately post-workout.',
    },

    // ==========================================
    // 🥜 SNACKS (Flexible for all diets)
    // ==========================================
    {
      name: 'High Protein Greek Yogurt & Berry Crunch',
      category: 'SNACK',
      goalType: 'ANY',
      dietType: 'VEGETARIAN',
      calories: 280,
      proteinGrams: 28,
      carbsGrams: 26,
      fatsGrams: 6,
      ingredients: JSON.stringify(['220g 0% Plain Greek Yogurt', '1 tbsp Honey', '40g Blueberries', '15g Crushed Almonds']),
      recipe: 'Layer Greek yogurt with honey, fresh blueberries, and crushed raw almonds.',
    },
    {
      name: 'Roasted Edamame & Pumpkin Seeds Mix',
      category: 'SNACK',
      goalType: 'ANY',
      dietType: 'VEGAN',
      calories: 260,
      proteinGrams: 24,
      carbsGrams: 16,
      fatsGrams: 12,
      ingredients: JSON.stringify(['60g Dry Roasted Edamame', '20g Raw Pumpkin Seeds', 'Sea Salt & Smoked Paprika']),
      recipe: 'Toss dry roasted edamame with raw pumpkin seeds, salt, and smoked paprika for a crunchy portable protein snack.',
    }
  ];

  for (const m of meals) {
    await prisma.meal.create({ data: m });
  }
  console.log(`✅ Seeded ${meals.length} specialized meals covering Vegan, Vegetarian, Non-Veg, and Pre/Post workouts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
