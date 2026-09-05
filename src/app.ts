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
import chatRoutes from './routes/chat.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = process.env.VERCEL
  ? path.join(process.cwd(), 'public')
  : path.join(__dirname, '..', 'public');

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

// Restricted API Documentation (private and protected)
const requireDocsAuth = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const secretKey = req.query.key || req.headers['x-admin-key'];
  const allowedKey = process.env.DOCS_SECRET_KEY || 'arena_dev_admin_2026';

  // Allowed only with secret key in production/public, or local development with key
  if (process.env.NODE_ENV === 'development' || secretKey === allowedKey) {
    next();
    return;
  }
  res.status(403).json({
    success: false,
    error: 'Access Denied: API documentation is private and restricted.',
  });
};

app.use('/api/docs', requireDocsAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Fitness Arena API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Health Check Endpoint (clean monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Fitness Arena Backend API',
    version: '1.0.0',
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

app.get('/onboarding', (req, res) => {
  res.sendFile(path.join(publicDir, 'onboarding.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(publicDir, 'profile.html'));
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
app.use('/api/chat', chatRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
