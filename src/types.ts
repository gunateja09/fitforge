// ---- Domain model -------------------------------------------------------
// All measurements are metric: grams (g), milliliters (ml), kilograms (kg),
// centimeters (cm), kilometers (km), kilocalories (kcal).

export type ID = string

/** ISO date string, day precision: "2026-06-29" */
export type DateStr = string

export type Sex = 'male' | 'female'

export type Goal = 'cut' | 'maintain' | 'bulk'

/** Activity multipliers for TDEE (Mifflin-St Jeor). */
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

/** Macro nutrients in grams + energy in kcal. Fiber is optional (a subset of carbs). */
export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

/**
 * A food in the user's manual library. Macros are stored per 100 units
 * (per 100 g for solids, per 100 ml for liquids) so any quantity can be scaled.
 */
export interface Food {
  id: ID
  name: string
  unit: 'g' | 'ml'
  /** macros per 100 g/ml */
  per100: Macros
  brand?: string
  /** typical serving size in the food's unit, used to prefill quick-add */
  defaultQty?: number
  createdAt: number
}

/** A logged/planned portion of a food on a given day. */
export interface FoodEntry {
  id: ID
  date: DateStr
  foodId: ID
  meal: MealType
  /** quantity in the food's unit (g or ml) */
  qty: number
}

export interface StrengthSet {
  reps: number
  /** weight in kg (0 for bodyweight) */
  weight: number
}

export interface StrengthEntry {
  id: ID
  date: DateStr
  exercise: string
  sets: StrengthSet[]
  notes?: string
}

export type CardioActivity =
  | 'run'
  | 'walk'
  | 'cycle'
  | 'row'
  | 'swim'
  | 'elliptical'
  | 'hiit'
  | 'other'

export interface CardioEntry {
  id: ID
  date: DateStr
  activity: CardioActivity
  durationMin: number
  distanceKm?: number
  /** estimated calories burned */
  kcal?: number
  notes?: string
}

export interface BodyWeightEntry {
  id: ID
  date: DateStr
  weightKg: number
}

export interface Profile {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: ActivityLevel
  goal: Goal
}

/** Daily macro targets. Either auto-computed from the profile or manual. */
export interface Targets extends Macros {
  /** when true, targets are recomputed from the profile automatically */
  auto: boolean
}

/** The five daily non-negotiables, tracked per day. */
export interface DailyChecklist {
  date: DateStr
  lifts: boolean
  protein: boolean
  steps: boolean
  cardio: boolean
  sleep: boolean
}

export const CHECKLIST_ITEMS = [
  { key: 'lifts', label: 'Logged all lifts', ico: '🏋️' },
  { key: 'protein', label: '120g+ protein', ico: '🥩' },
  { key: 'steps', label: '8,000+ steps', ico: '👟' },
  { key: 'cardio', label: 'Did cardio', ico: '🏃' },
  { key: 'sleep', label: 'Slept before 12', ico: '😴' },
] as const

export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]['key']

/** A body-measurement snapshot (recomposition tracking). */
export interface Measurement {
  id: ID
  date: DateStr
  chestCm?: number
  waistCm?: number
  armCm?: number
  weightKg?: number
}

export type Rating = 1 | 2 | 3 | 4 | 5

/**
 * Per-day scalar metrics that aren't derived from other logs:
 * water intake, steps, sleep, subjective energy/mood, and rest-day flag.
 */
export interface DailyLog {
  date: DateStr
  /** water consumed, in ml */
  waterMl: number
  steps?: number
  sleepHours?: number
  energy?: Rating
  mood?: Rating
  restDay?: boolean
}

/** Metadata for a progress photo; the image blob lives in IndexedDB by id. */
export interface ProgressPhoto {
  id: ID
  date: DateStr
  /** front-relaxed | front-flexed | side | other */
  pose: 'front' | 'flexed' | 'side' | 'other'
  note?: string
}

export type ThemeName = 'dark' | 'amoled' | 'light'

/** A workout template (e.g. "Push A") and its planned exercises. */
export interface TemplateExercise {
  exercise: string
  sets: number
  /** display target like "8-10" */
  repRange: string
  /** rest seconds suggested for the rest timer */
  rest: number
  notes?: string
}

export interface WorkoutTemplate {
  id: string
  name: string
  focus: string
  exercises: TemplateExercise[]
  /** cardio finisher description */
  finisher?: string
}
