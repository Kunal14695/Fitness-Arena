# 🚀 Deploying Fitness Arena to Vercel

Fitness Arena is pre-configured for seamless serverless deployment on **Vercel** with full static page routing, Express API endpoints, and Google Gemini AI integration.

---

## ⚡ Quick 5-Step Deployment Guide

### Step 1: Create a Free Cloud Database (Neon or Supabase)
Since Vercel serverless functions do not support local SQLite file writing (`dev.db`), use a free cloud PostgreSQL database:

1. Go to **[Neon.tech](https://neon.tech)** (Recommended — 100% free, zero credit card, 1-click GitHub login).
2. Click **Create Project** $\rightarrow$ Name it `fitness-arena`.
3. Copy your connection string from the dashboard:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

*(Alternative: You can also use [Supabase](https://supabase.com) or [Railway](https://railway.app)).*

---

### Step 2: Switch Schema to PostgreSQL & Seed Exercises

In your local terminal:
```bash
# 1. Switch active schema to PostgreSQL
npm run db:postgres

# 2. Push schema to your new cloud database
# (Replace with your actual Neon/Supabase URL or put it in your local .env)
npx prisma db push

# 3. Seed the 15 starter exercises (Bench Press, Squats, Pull-ups, etc.)
npm run prisma:seed
```

*(Note: If you ever want to switch back to local SQLite, just run `npm run db:sqlite`).*

---

### Step 3: Push Code to GitHub

```bash
git add .
git commit -m "feat: configure fitness arena for vercel deployment"
git push origin main
```

---

### Step 4: Import Project on Vercel

1. Log into your **[Vercel Dashboard](https://vercel.com)**.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your GitHub repository (`Fitness-Arena`).
4. Keep the default settings:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run vercel-build` (auto-detected from `vercel.json`)
   - **Output Directory**: Leave empty

---

### Step 5: Add Environment Variables on Vercel

In the Vercel **Environment Variables** section before clicking Deploy, add:

| Name | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` | Your Neon / Supabase connection string |
| `JWT_SECRET` | `fitness-arena-super-secret-jwt-key-2026` | Any random 32+ character string |
| `GEMINI_API_KEY` | `AQ.Ab8RN6I-v-0k...` | Your Google Gemini API Key |
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `5000` | Port default |

Click **Deploy**! 🚀

---

## 📁 What Was Configured For Vercel:

1. **`vercel.json`**:
   - Routes all frontend pages (`/dashboard`, `/login`, `/register`, `/profile`) and `/api/*` endpoints to the serverless function.
   - Built-in build pipeline runs `npm run vercel-build` to generate the Prisma Client and compile TypeScript.
2. **`api/index.ts`**:
   - Vercel Serverless Function entrypoint exporting the Express application.
3. **`src/app.ts` & `src/index.ts`**:
   - Detects `process.env.VERCEL` to use cloud-compatible `process.cwd()` paths for static HTML templates.
   - Bypasses local `app.listen()` when invoked inside a serverless lambda.
4. **`prisma/schema.postgresql.prisma`**:
   - Production PostgreSQL schema mapped 1:1 with all models (`User`, `Profile`, `Streak`, `UserRank`, `WorkoutRoutine`, `ChatMessage`, etc.).
5. **Database Switch Helpers**:
   - `npm run db:postgres` switches to cloud PostgreSQL.
   - `npm run db:sqlite` switches back to local SQLite.
