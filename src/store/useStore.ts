import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  BodyWeightEntry,
  CardioEntry,
  ChecklistKey,
  DailyChecklist,
  DailyLog,
  DateStr,
  Food,
  FoodEntry,
  ID,
  Macros,
  Measurement,
  ProgressPhoto,
  Profile,
  StrengthEntry,
  Targets,
  ThemeName,
} from '../types'
import { indianFoods } from '../lib/indianFoods'

interface State {
  profile: Profile
  targets: Targets
  theme: ThemeName
  foods: Food[]
  foodLog: FoodEntry[]
  strengthLog: StrengthEntry[]
  cardioLog: CardioEntry[]
  weightLog: BodyWeightEntry[]
  checklist: DailyChecklist[]
  measurements: Measurement[]
  dailyLogs: DailyLog[]
  progressPhotos: ProgressPhoto[]

  // profile / targets / theme
  setProfile: (p: Partial<Profile>) => void
  setTargets: (t: Partial<Targets>) => void
  setTheme: (t: ThemeName) => void

  // food library
  addFood: (food: Omit<Food, 'id' | 'createdAt'>) => Food
  updateFood: (id: ID, patch: Partial<Food>) => void
  removeFood: (id: ID) => void
  seedStarterFoods: () => void
  seedIndianFoods: () => void

  // checklist
  toggleChecklist: (date: DateStr, key: ChecklistKey) => void

  // measurements
  addMeasurement: (entry: Omit<Measurement, 'id'>) => void
  removeMeasurement: (id: ID) => void

  // daily metrics (water, steps, sleep, energy, mood, rest day)
  setDailyLog: (date: DateStr, patch: Partial<Omit<DailyLog, 'date'>>) => void
  addWater: (date: DateStr, ml: number) => void

  // progress photos
  addProgressPhoto: (entry: Omit<ProgressPhoto, 'id'>) => ID
  removeProgressPhoto: (id: ID) => void

  // food log (used by both macro tracker and meal planner)
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => void
  updateFoodEntry: (id: ID, patch: Partial<FoodEntry>) => void
  removeFoodEntry: (id: ID) => void
  copyDay: (from: DateStr, to: DateStr) => void

  // workouts
  addStrength: (entry: Omit<StrengthEntry, 'id'>) => void
  updateStrength: (id: ID, patch: Partial<StrengthEntry>) => void
  removeStrength: (id: ID) => void
  addCardio: (entry: Omit<CardioEntry, 'id'>) => void
  updateCardio: (id: ID, patch: Partial<CardioEntry>) => void
  removeCardio: (id: ID) => void

  // bodyweight
  setWeight: (date: DateStr, weightKg: number) => void
  removeWeight: (id: ID) => void
}

const DEFAULT_PROFILE: Profile = {
  sex: 'male',
  age: 30,
  heightCm: 178,
  weightKg: 80,
  activity: 'moderate',
  goal: 'maintain',
}

const DEFAULT_TARGETS: Targets = {
  auto: true,
  kcal: 2400,
  protein: 160,
  carbs: 270,
  fat: 67,
}

function emptyChecklist(date: DateStr): DailyChecklist {
  return { date, lifts: false, protein: false, steps: false, cardio: false, sleep: false }
}

const m = (
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber = 0,
): Macros => ({ kcal, protein, carbs, fat, fiber })

// A small optional starter pack (per 100 g/ml). Only added on explicit request.
const STARTER_FOODS: Omit<Food, 'id' | 'createdAt'>[] = [
  { name: 'Chicken breast, cooked', unit: 'g', per100: m(165, 31, 0, 3.6, 0) },
  { name: 'White rice, cooked', unit: 'g', per100: m(130, 2.7, 28, 0.3, 0.4) },
  { name: 'Rolled oats, dry', unit: 'g', per100: m(389, 16.9, 66, 6.9, 10.6) },
  { name: 'Whole egg', unit: 'g', per100: m(155, 13, 1.1, 11, 0) },
  { name: 'Banana', unit: 'g', per100: m(89, 1.1, 23, 0.3, 2.6) },
  { name: 'Greek yogurt, 2%', unit: 'g', per100: m(73, 10, 4, 2, 0) },
  { name: 'Olive oil', unit: 'ml', per100: m(884, 0, 0, 100, 0) },
  { name: 'Whole milk', unit: 'ml', per100: m(61, 3.2, 4.8, 3.3, 0) },
  { name: 'Almonds', unit: 'g', per100: m(579, 21, 22, 50, 12.5) },
  { name: 'Broccoli, cooked', unit: 'g', per100: m(35, 2.4, 7, 0.4, 3.3) },
  { name: 'Salmon, cooked', unit: 'g', per100: m(206, 22, 0, 13, 0) },
  { name: 'Sweet potato, cooked', unit: 'g', per100: m(90, 2, 21, 0.2, 3.3) },
  { name: 'Whey protein powder', unit: 'g', per100: m(400, 80, 8, 6, 0) },
  { name: 'Peanut butter', unit: 'g', per100: m(588, 25, 20, 50, 6) },
]

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      targets: DEFAULT_TARGETS,
      theme: 'dark',
      foods: [],
      foodLog: [],
      strengthLog: [],
      cardioLog: [],
      weightLog: [],
      checklist: [],
      measurements: [],
      dailyLogs: [],
      progressPhotos: [],

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setTargets: (t) => set((s) => ({ targets: { ...s.targets, ...t } })),
      setTheme: (theme) => set({ theme }),

      addFood: (food) => {
        const created: Food = { ...food, id: nanoid(), createdAt: Date.now() }
        set((s) => ({ foods: [...s.foods, created] }))
        return created
      },
      updateFood: (id, patch) =>
        set((s) => ({
          foods: s.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      removeFood: (id) =>
        set((s) => ({
          foods: s.foods.filter((f) => f.id !== id),
          // also drop log entries that referenced it
          foodLog: s.foodLog.filter((e) => e.foodId !== id),
        })),
      seedStarterFoods: () => {
        const existing = new Set(get().foods.map((f) => f.name.toLowerCase()))
        const toAdd = STARTER_FOODS.filter(
          (f) => !existing.has(f.name.toLowerCase()),
        ).map((f) => ({ ...f, id: nanoid(), createdAt: Date.now() }))
        set((s) => ({ foods: [...s.foods, ...toAdd] }))
      },
      seedIndianFoods: () => {
        const existing = new Set(get().foods.map((f) => f.name.toLowerCase()))
        const candidates = indianFoods(() => nanoid(), Date.now())
        const toAdd = candidates.filter(
          (f) => !existing.has(f.name.toLowerCase()),
        )
        set((s) => ({ foods: [...s.foods, ...toAdd] }))
      },

      toggleChecklist: (date, key) =>
        set((s) => {
          const found = s.checklist.find((c) => c.date === date)
          if (found) {
            return {
              checklist: s.checklist.map((c) =>
                c.date === date ? { ...c, [key]: !c[key] } : c,
              ),
            }
          }
          return {
            checklist: [...s.checklist, { ...emptyChecklist(date), [key]: true }],
          }
        }),

      addMeasurement: (entry) =>
        set((s) => {
          // one snapshot per day — replace if the date already exists
          const others = s.measurements.filter((mm) => mm.date !== entry.date)
          return { measurements: [...others, { ...entry, id: nanoid() }] }
        }),
      removeMeasurement: (id) =>
        set((s) => ({ measurements: s.measurements.filter((mm) => mm.id !== id) })),

      setDailyLog: (date, patch) =>
        set((s) => {
          const found = s.dailyLogs.find((d) => d.date === date)
          if (found) {
            return {
              dailyLogs: s.dailyLogs.map((d) =>
                d.date === date ? { ...d, ...patch } : d,
              ),
            }
          }
          return {
            dailyLogs: [...s.dailyLogs, { date, waterMl: 0, ...patch }],
          }
        }),
      addWater: (date, ml) =>
        set((s) => {
          const found = s.dailyLogs.find((d) => d.date === date)
          if (found) {
            return {
              dailyLogs: s.dailyLogs.map((d) =>
                d.date === date
                  ? { ...d, waterMl: Math.max(0, d.waterMl + ml) }
                  : d,
              ),
            }
          }
          return {
            dailyLogs: [...s.dailyLogs, { date, waterMl: Math.max(0, ml) }],
          }
        }),

      addProgressPhoto: (entry) => {
        const id = nanoid()
        set((s) => ({ progressPhotos: [...s.progressPhotos, { ...entry, id }] }))
        return id
      },
      removeProgressPhoto: (id) =>
        set((s) => ({
          progressPhotos: s.progressPhotos.filter((p) => p.id !== id),
        })),

      addFoodEntry: (entry) =>
        set((s) => ({ foodLog: [...s.foodLog, { ...entry, id: nanoid() }] })),
      updateFoodEntry: (id, patch) =>
        set((s) => ({
          foodLog: s.foodLog.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeFoodEntry: (id) =>
        set((s) => ({ foodLog: s.foodLog.filter((e) => e.id !== id) })),
      copyDay: (from, to) =>
        set((s) => {
          const cloned = s.foodLog
            .filter((e) => e.date === from)
            .map((e) => ({ ...e, id: nanoid(), date: to }))
          // replace any existing entries on the target day
          const others = s.foodLog.filter((e) => e.date !== to)
          return { foodLog: [...others, ...cloned] }
        }),

      addStrength: (entry) =>
        set((s) => ({
          strengthLog: [...s.strengthLog, { ...entry, id: nanoid() }],
        })),
      updateStrength: (id, patch) =>
        set((s) => ({
          strengthLog: s.strengthLog.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),
      removeStrength: (id) =>
        set((s) => ({
          strengthLog: s.strengthLog.filter((e) => e.id !== id),
        })),

      addCardio: (entry) =>
        set((s) => ({ cardioLog: [...s.cardioLog, { ...entry, id: nanoid() }] })),
      updateCardio: (id, patch) =>
        set((s) => ({
          cardioLog: s.cardioLog.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),
      removeCardio: (id) =>
        set((s) => ({ cardioLog: s.cardioLog.filter((e) => e.id !== id) })),

      setWeight: (date, weightKg) =>
        set((s) => {
          const existing = s.weightLog.find((w) => w.date === date)
          if (existing) {
            return {
              weightLog: s.weightLog.map((w) =>
                w.date === date ? { ...w, weightKg } : w,
              ),
            }
          }
          return {
            weightLog: [
              ...s.weightLog,
              { id: nanoid(), date, weightKg },
            ],
          }
        }),
      removeWeight: (id) =>
        set((s) => ({ weightLog: s.weightLog.filter((w) => w.id !== id) })),
    }),
    {
      name: 'fitforge-v1',
      version: 1,
    },
  ),
)

/** Selector helper: foods keyed by id for fast lookup. */
export function useFoodMap(): Record<string, Food> {
  const foods = useStore((s) => s.foods)
  const map: Record<string, Food> = {}
  for (const f of foods) map[f.id] = f
  return map
}

/** Total volume (Σ reps × weight) for a set of strength sets. */
export function setsVolume(sets: { reps: number; weight: number }[]): number {
  return sets.reduce((sum, x) => sum + x.reps * x.weight, 0)
}

/**
 * The most recent logged session for an exercise strictly before `beforeDate`.
 * Powers the progressive-overload "last time" reference.
 */
export function lastSessionFor(
  log: StrengthEntry[],
  exercise: string,
  beforeDate: DateStr,
): StrengthEntry | null {
  const name = exercise.trim().toLowerCase()
  const matches = log
    .filter((e) => e.exercise.trim().toLowerCase() === name && e.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date))
  return matches[0] ?? null
}

/** Get today's checklist (or an all-false default) without mutating state. */
export function checklistFor(
  list: DailyChecklist[],
  date: DateStr,
): DailyChecklist {
  return (
    list.find((c) => c.date === date) ?? {
      date,
      lifts: false,
      protein: false,
      steps: false,
      cardio: false,
      sleep: false,
    }
  )
}

/** Get a day's metrics (or a zero-water default) without mutating state. */
export function dailyLogFor(list: DailyLog[], date: DateStr): DailyLog {
  return list.find((d) => d.date === date) ?? { date, waterMl: 0 }
}
