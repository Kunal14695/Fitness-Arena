# 🏋️‍♂️ Fitness Arena - Backend & Web App

> Production-ready full-stack fitness application and RESTful API for **Fitness Arena**, featuring an **AI Food & Nutrition Camera Scanner**, weekly workout routine building, Duolingo-style consistency streaks, biometric TDEE & macro calculations (bulking & cutting), tailored full-day meal planning, and gamification ranks (Novice to Titan).

---

## 🌟 Key Features

1. **📸 AI Food & Nutrition Scanning Camera (Google Gemini Vision)**
   - **Snap or Upload**: Use live device camera or photo upload to inspect meals on the plate.
   - **Visual Macronutrient Extraction**: Detects individual ingredients, estimates portion sizes in grams, and computes **Calories, Protein, Carbs, and Fats**.
   - **Interactive Calibration & 1-Click Logging**: Review or tweak detected values, choose meal category (Breakfast, Lunch, Dinner, Snack, Pre/Post-Workout), and log instantly to your daily database while earning **+20 XP**.

2. **User Authentication & Biometrics**
   - Secure JWT token auth & bcrypt password hashing.
   - Profile metrics: Age, Gender, Height (cm), Weight (kg), Target Weight, Goal (`BULK`, `CUT`, `MAINTAIN`), and Activity Level.

3. **Dynamic Nutrition & Calorie Engine**
   - **Mifflin-St Jeor BMR** and **TDEE** formulas.
   - **Bulking**: Clean $+400\text{ kcal}$ surplus with $2.0\text{ g/kg}$ protein.
   - **Cutting**: Moderate $-500\text{ kcal}$ deficit with $2.2\text{ g/kg}$ muscle-sparing protein.
   - Automatic calculation of daily target calories, protein, carbs, and fats.

4. **Weekly Workout Routine Split Builder**
   - Create 7-day personalized workout routines (e.g., Push/Pull/Legs, Bro Split, Upper/Lower, Full Body).
   - Pre-populated library of compound and isolation exercises (Chest, Back, Legs, Shoulders, Arms, Core).
   - Add custom exercises with target sets, reps, weight, and rest time.

5. **Gym Streaks & Consistency Engine**
   - Daily active workout tracking and check-ins.
   - Streak freeze shields (`freezeCount`) to protect your streak if you miss a day.
   - Scheduled Rest Day recognition (rest days don't break streaks).
   - Automatic longest streak tracking and milestone streak bonus XP.

6. **Personalized Full-Day Meal Plans (Gemini AI)**
   - Instant full-day culinary meal plans (Breakfast, Lunch, Pre-Workout, Post-Workout, Dinner, Snack) calibrated for the athlete's specific caloric and macro targets.
   - Meal logging and daily consumption tracking against daily targets.

7. **Gamified Ranks & Leaderboard**
   - Earn XP by completing workouts (+50 XP), hitting streaks, and logging meals (+20 XP).
   - 7 Rank Tiers:
     - 🥉 **Novice** (0 – 200 XP)
     - 🥈 **Beginner** (201 – 600 XP)
     - 🥇 **Consistent** (601 – 1,500 XP)
     - 💎 **Intermediate** (1,501 – 3,500 XP)
     - 🏆 **Advanced** (3,501 – 7,000 XP)
     - ⚡ **Elite** (7,001 – 12,000 XP)
     - 👑 **Titan** (12,001+ XP)
   - Real-time global leaderboard endpoint.

---

## 📖 Interactive API Documentation (Swagger UI)

Once running, access the interactive Swagger UI directly in your browser:
```
http://localhost:5000/api/docs
```
You can execute requests and test endpoints directly with the **"Try it out"** button.

---

## 📡 API Endpoints Summary

### Nutrition & Vision AI (`/api/nutrition`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/nutrition/scan` | **📸 AI Food Camera Scan**: Analyze meal image to detect food items, calories & protein | Bearer |
| `GET` | `/api/nutrition/daily-plan` | Generated full-day meal plan matching user's goal & calories (Gemini AI) | Bearer |
| `GET` | `/api/nutrition/meals` | List meal database catalog | Public |
| `POST` | `/api/nutrition/log` | Log meal consumed (**+20 XP**) | Bearer |
| `GET` | `/api/nutrition/today-summary` | View consumed vs target calories & macros | Bearer |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user, initializes streak and rank | Public |
| `POST` | `/api/auth/login` | Log in with email & password, returns JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile, streak & rank | Bearer |

### Biometrics & Profile (`/api/profile`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Get current biometrics, BMR, TDEE, and macro goals | Bearer |
| `PUT` | `/api/profile` | Update height, weight, goal (`BULK`/`CUT`), recalculating macros | Bearer |

### Workouts & Routines (`/api/workouts`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workouts/exercises` | List exercises library (filter by `muscleGroup`) | Public |
| `POST` | `/api/workouts/exercises` | Add custom exercise to library | Bearer |
| `GET` | `/api/workouts/routines` | Get all weekly routines created by user | Bearer |
| `POST` | `/api/workouts/routines` | Create a 7-day weekly split routine | Bearer |
| `GET` | `/api/workouts/routines/:id` | Get details of a specific routine | Bearer |
| `POST` | `/api/workouts/log` | Log completed workout -> **increments streak & awards +50 XP** | Bearer |
| `GET` | `/api/workouts/history` | Get past workout history | Bearer |

### Duolingo-style Streaks (`/api/streak`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/streak` | Get current streak count, longest streak & status | Bearer |
| `POST` | `/api/streak/check-in` | Daily check-in / rest day to preserve streak & gain XP | Bearer |

### Gamification & Ranks (`/api/rank`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rank` | Get current XP, tier progress %, and badge | Bearer |
| `GET` | `/api/rank/leaderboard` | View top Arena athletes ranked by XP | Public |

---

## 🚀 Quick Start Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run database setup & seed**:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Run test suite**:
   ```bash
   npm test
   ```

---

## ☁️ Deployment (Vercel / Neon / Render)

Fitness Arena is pre-configured for instant deployment on **Vercel** with **Neon Serverless PostgreSQL**:
1. Check [`DEPLOY_TO_VERCEL.md`](./DEPLOY_TO_VERCEL.md) for step-by-step instructions.
2. Required Environment Variables on Vercel:
   * `DATABASE_URL`: Your pooled Neon connection string (`...-pooler...`)
   * `JWT_SECRET`: Secret JWT signing key
   * `GEMINI_API_KEY`: Google Gemini API key for Vision AI & Coach Arena
