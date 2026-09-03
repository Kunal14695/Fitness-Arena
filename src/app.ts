import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

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

// UI Web Pages
app.get('/register', (req, res) => {
  res.sendFile(path.join(publicDir, 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(publicDir, 'dashboard.html'));
});

// Root: Redirect to register page
app.get('/', (req, res) => {
  res.redirect('/register');
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
