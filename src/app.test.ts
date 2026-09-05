import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './app.js';
import { prisma } from './config/prisma.js';

describe('Fitness Arena API Integration Tests', () => {
  let authToken = '';
  let exerciseId = '';
  const testEmail = `warrior_${Date.now()}@arena.com`;

  beforeAll(async () => {
    // Clean up test user if existing
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('GET /api/health -> returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('Fitness Arena Backend API');
  });

  it('POST /api/auth/register -> creates new account with streak and rank initialized', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'StrongPassword123!',
      name: 'Alexander The Great',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  it('POST /api/auth/register -> supports simple registration with only email and password', async () => {
    const simpleEmail = `simple_${Date.now()}@arena.com`;
    const res = await request(app).post('/api/auth/register').send({
      email: simpleEmail,
      password: 'SimplePassword123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(simpleEmail.split('@')[0]);
    expect(res.body.data.token).toBeDefined();

    // Clean up
    await prisma.user.delete({ where: { email: simpleEmail } });
  });

  it('POST /api/auth/login -> verifies credentials and issues token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'StrongPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.streak).toBeDefined();
    expect(res.body.data.user.rank.tier).toBe('Novice');
  });

  it('PUT /api/profile -> sets biometrics and calculates Bulking macros and calories', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        age: 24,
        gender: 'MALE',
        heightCm: 180,
        currentWeightKg: 75,
        targetWeightKg: 82,
        goal: 'BULK',
        activityLevel: 'MODERATE',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { profile, metricsBreakdown } = res.body.data;
    expect(profile.goal).toBe('BULK');
    expect(profile.targetCalories).toBeGreaterThan(2500);
    expect(profile.targetProtein).toBe(150); // 75kg * 2.0g = 150g
    expect(metricsBreakdown.calorieAdjustment).toBe(400); // Surplus
  });

  it('GET /api/workouts/exercises -> retrieves exercise library', async () => {
    const res = await request(app).get('/api/workouts/exercises');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    exerciseId = res.body.data[0].id;
  });

  it('POST /api/workouts/routines -> builds custom weekly routine', async () => {
    const res = await request(app)
      .post('/api/workouts/routines')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Hypertrophy Upper/Lower Split',
        description: '4-day split for maximum muscle growth',
        isDefault: true,
        days: [
          {
            dayOfWeek: 'MONDAY',
            title: 'Upper Body Power',
            isRestDay: false,
            exercises: [
              {
                exerciseId,
                targetSets: 4,
                targetReps: 8,
                targetWeightKg: 80,
                restSeconds: 90,
              },
            ],
          },
          {
            dayOfWeek: 'TUESDAY',
            title: 'Lower Body Strength',
            isRestDay: false,
            exercises: [],
          },
          {
            dayOfWeek: 'WEDNESDAY',
            title: 'Rest & Recovery',
            isRestDay: true,
            exercises: [],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.days.length).toBe(3);
  });

  it('POST /api/workouts/log -> logs workout, starts Duolingo streak & awards XP', async () => {
    const res = await request(app)
      .post('/api/workouts/log')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Chest & Back Demolition',
        durationMinutes: 45,
        notes: 'Pushed past failure on last set!',
        exercises: [
          {
            exerciseId,
            setsCompleted: 4,
            repsCompleted: 8,
            weightUsedKg: 80,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.streak.currentStreak).toBe(1);
    expect(res.body.data.streak.streakIncreased).toBe(true);
    expect(res.body.data.gamification.totalXp).toBeGreaterThanOrEqual(60); // 50 base + 10 streak bonus
  });

  it('GET /api/nutrition/daily-plan -> assembles customized full-day meals for bulking', async () => {
    const res = await request(app)
      .get('/api/nutrition/daily-plan')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.goal).toBe('BULK');
    expect(res.body.data.meals.breakfast).toBeDefined();
    expect(res.body.data.meals.lunch).toBeDefined();
    expect(res.body.data.meals.dinner).toBeDefined();
  }, 15000);

  it('GET /api/rank -> returns tier progression and badges', async () => {
    const res = await request(app)
      .get('/api/rank')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentRank.level).toBeDefined();
    expect(res.body.data.allTiers.length).toBe(7);
  });

  it('GET /api/rank/leaderboard -> returns ranked athletes list', async () => {
    const res = await request(app).get('/api/rank/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].position).toBe(1);
  });

  it('POST /api/chat -> Coach Arena answers fitness question with personalized context', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: 'How should I hit my protein goal today?',
        history: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toBeDefined();
    expect(res.body.data.role).toBe('model');
    expect(res.body.data.reply.length).toBeGreaterThan(10);
  });
});
