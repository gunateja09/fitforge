# ⚡ FitForge

An all-in-one **workout logger**, **meal planner**, and **macro tracker** in a single responsive web app. Built with React + TypeScript + Vite. Local-first — all data lives in your browser (no account, no server), with a clean store seam for adding cloud sync later.

## Features

- **Dashboard** — today's calories & macros, energy balance (eaten vs cardio burn vs maintenance), today's training, and a bodyweight trend chart.
- **Macro tracker** — log food per meal (breakfast/lunch/dinner/snacks), calorie ring + protein/carb/fat bars against your daily targets, navigate any day.
- **Meal planner** — weekly grid showing planned calories per day; build out future days, copy the previous day's plan.
- **Workouts** — log **strength** (exercise → sets of reps × kg, volume tracking) and **cardio** (run/walk/cycle/row/swim/HIIT… with duration, distance, and auto calorie estimate).
- **Food library** — your own manual list of foods (macros per 100 g/ml). Optional one-click starter pack of common foods.
- **Goals & profile** — Mifflin-St Jeor BMR/TDEE, goal-adjusted targets (cut/maintain/bulk), or set macros manually.

All measurements are **metric** (g, kg, ml, km, kcal).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Tech

- React 18 + TypeScript + Vite
- Zustand (`persist` middleware → `localStorage`, key `fitforge-v1`)
- React Router (hash router, so it works from any static host)
- Recharts (bodyweight trend)
- date-fns

## Project layout

```
src/
  types.ts            # domain model (foods, entries, profile, targets)
  lib/calc.ts         # BMR/TDEE, macro targets, macro math, cardio kcal
  lib/dates.ts        # date helpers (day strings, week grid)
  store/useStore.ts   # zustand store + localStorage persistence
  components/         # Layout, Modal, MacroBar, CalorieRing, DayNav, LogFoodModal
  pages/              # Dashboard, Macros, Planner, Workouts, Foods, Settings
```

## Adding cloud sync later

The store is the single seam. Swap zustand's `persist` storage for an async
backend (or hydrate from an API on load and push mutations), keeping the same
state shape. Nothing in the UI reads storage directly.
