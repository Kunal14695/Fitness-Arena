import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fitness Arena API',
      version: '1.0.0',
      description: `
## 🏋️‍♂️ Fitness Arena REST API Documentation
Welcome to the Fitness Arena backend! This API provides:
- **Biometrics & TDEE Calorie Engine**: Dynamic BMR, TDEE, surplus (Bulking) and deficit (Cutting) macro targets.
- **Weekly Workout Split Builder**: Personalized 7-day routine creation, exercises library, and logging.
- **Duolingo-style Streaks**: Daily consistency tracking, streak freezes, rest-day preservation, and longest streaks.
- **Personalized Daily Meal Plans**: Full day diet plans matching calculated calorie and macronutrient requirements.
- **Gamified Ranks & Leaderboard**: XP progression from Novice (Iron) to Titan with badges and global ranking.

### Authentication:
Use the **Authorize** button below and enter your JWT token as:
\`Bearer <your_token>\`
      `,
    },
    servers: [
      {
        url: '/',
        description: 'Current Environment Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', example: 'alex@fitnessarena.com' },
            password: { type: 'string', example: 'Secret123!' },
            name: { type: 'string', example: 'Alex Mercer' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'alex@fitnessarena.com' },
            password: { type: 'string', example: 'Secret123!' },
          },
        },
        ProfileInput: {
          type: 'object',
          required: ['age', 'gender', 'heightCm', 'currentWeightKg', 'goal', 'activityLevel'],
          properties: {
            age: { type: 'integer', example: 24 },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
            heightCm: { type: 'number', example: 180 },
            currentWeightKg: { type: 'number', example: 78.5 },
            targetWeightKg: { type: 'number', example: 84.0 },
            goal: { type: 'string', enum: ['BULK', 'CUT', 'MAINTAIN'], example: 'BULK' },
            activityLevel: {
              type: 'string',
              enum: ['SEDENTARY', 'LIGHT', 'MODERATE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE'],
              example: 'MODERATE',
            },
          },
        },
        WorkoutLogInput: {
          type: 'object',
          required: ['title', 'exercises'],
          properties: {
            title: { type: 'string', example: 'Monday Heavy Chest & Triceps' },
            durationMinutes: { type: 'integer', example: 55 },
            notes: { type: 'string', example: 'Hit new PR on bench press! Felt strong.' },
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                required: ['exerciseId', 'setsCompleted', 'repsCompleted'],
                properties: {
                  exerciseId: { type: 'string', example: 'insert_exercise_id_here' },
                  setsCompleted: { type: 'integer', example: 4 },
                  repsCompleted: { type: 'integer', example: 10 },
                  weightUsedKg: { type: 'number', example: 80 },
                },
              },
            },
          },
        },
        MealLogInput: {
          type: 'object',
          required: ['mealName', 'category', 'calories', 'proteinGrams', 'carbsGrams', 'fatsGrams'],
          properties: {
            mealName: { type: 'string', example: 'Monster Bulk Oatmeal Bowl' },
            category: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'], example: 'BREAKFAST' },
            calories: { type: 'integer', example: 780 },
            proteinGrams: { type: 'number', example: 48 },
            carbsGrams: { type: 'number', example: 92 },
            fatsGrams: { type: 'number', example: 22 },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
