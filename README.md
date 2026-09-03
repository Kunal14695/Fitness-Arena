# 🏋️‍♂️ Fitness Arena - Backend API

> Production-ready RESTful backend API for **Fitness Arena**, featuring weekly workout routine building, Duolingo-style consistency streaks, biometric TDEE & macro calculations (bulking & cutting), tailored full-day meal planning, and gamification ranks (Novice to Titan).

---

## 🌟 Key Features

1. **User Authentication & Biometrics**
   - Secure JWT token auth & bcrypt password hashing.
   - Profile metrics: Age, Gender, Height (cm), Weight (kg), Target Weight, Goal (`BULK`, `CUT`, `MAINTAIN`), and Activity Level.
2. **Dynamic Nutrition & Calorie Engine**
   - **Mifflin-St Jeor BMR** and **TDEE** formulas.
   - **Bulking**: Clean $+400\text{ kcal}$ surplus with $2.0\text{ g/kg}$ protein.
   - **Cutting**: Moderate $-500\text{ kcal}$ deficit with $2.2\text{ g/kg}$ muscle-sparing protein.
   - Automatic calculation of daily target calories, protein, carbs, and fats.
3. **Weekly Workout Routine Split Builder**
   - Create 7-day personalized workout routines (e.g., Push/Pull/Legs, Upper/Lower).
   - Pre-populated library of compound and isolation exercises (Chest, Back, Legs, Shoulders, Arms, Core).
   - Add custom exercises with target sets, reps, weight, and rest time.
4. **Gym Streaks & Consistency Engine**
   - Daily active workout tracking and check-ins.
   - Streak freeze shields (`freezeCount`) to protect your streak if you miss a day.
   - Scheduled Rest Day recognition (rest days don't break streaks).
   - Automatic longest streak tracking and milestone streak bonus XP.
5. **Personalized Full-Day Meal Plans**
   - Instant full-day meal plans (Breakfast, Lunch, Dinner, Snack) calibrated for the user's specific caloric and macro targets.
   - Meal logging and daily consumption tracking against daily targets.
6. **Gamified Ranks & Leaderboard**
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
| `POST` | `/api/workouts/log` | Log completed workout -> **increments streak & awards XP** | Bearer |
| `GET` | `/api/workouts/history` | Get past workout history | Bearer |

### Duolingo-style Streaks (`/api/streak`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/streak` | Get current streak count, longest streak & status | Bearer |
| `POST` | `/api/streak/check-in` | Daily check-in / rest day to preserve streak & gain XP | Bearer |

### Nutrition & Meal Plans (`/api/nutrition`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/nutrition/daily-plan` | Generated full-day meal plan matching user's goal & calories | Bearer |
| `GET` | `/api/nutrition/meals` | List meal database | Public |
| `POST` | `/api/nutrition/log` | Log meal consumed (+20 XP) | Bearer |
| `GET` | `/api/nutrition/today-summary` | View consumed vs target calories & macros | Bearer |

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

## 🌐 Deploy to Live URL (Render / Railway)

### Deploy to Render in 3 Steps:
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete fitness arena backend"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [Render Dashboard](https://dashboard.render.com), click **New + Web Service**, and connect your repository.
3. Render will auto-detect the `render.yaml` blueprint and deploy your live URL (e.g. `https://fitness-arena-api.onrender.com`).
   - Live Swagger docs will be at `https://fitness-arena-api.onrender.com/api/docs`.
>>>>>>> a5a20b4 (feat: complete Fitness Arena backend with streaks, workouts, nutrition, and gamification)
