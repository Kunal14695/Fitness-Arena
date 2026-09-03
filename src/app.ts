import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import streakRoutes from './routes/streak.routes.js';
import nutritionRoutes from './routes/nutrition.routes.js';
import rankRoutes from './routes/rank.routes.js';

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Documentation via Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Fitness Arena API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Health Check Endpoint (useful for cloud pinging & monitoring on Render/Railway)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Fitness Arena Backend API',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; text-align: center; line-height: 1.6;">
      <h1 style="color: #ff4500;">🏋️‍♂️ Fitness Arena API</h1>
      <p>The backend is live and operational!</p>
      <p>Explore all available endpoints, test streaks, workouts, and nutrition calculators directly via the interactive Swagger docs:</p>
      <a href="/api/docs" style="display: inline-block; background: #ff4500; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
        Open Interactive API Docs (/api/docs)
      </a>
    </div>
  `);
});

// Register Domain Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/rank', rankRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
