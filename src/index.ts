import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Fitness Arena Backend Server running!`);
    console.log(`📡 Local URL: http://localhost:${PORT}`);
    console.log(`📖 Interactive API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
