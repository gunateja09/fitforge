import type {
  ActivityLevel,
  Food,
  FoodEntry,
  Goal,
  Macros,
  Profile,
  Targets,
} from '../types'

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little/no exercise)',
  light: 'Light (1–3 days/week)',
  moderate: 'Moderate (3–5 days/week)',
  active: 'Active (6–7 days/week)',
  very_active: 'Very active (hard daily / physical job)',
}

export const GOAL_LABELS: Record<Goal, string> = {
  cut: 'Cut (lose fat)',
  maintain: 'Maintain',
  bulk: 'Bulk (gain muscle)',
}

/** kcal adjustment applied to TDEE per goal. */
const GOAL_KCAL_DELTA: Record<Goal, number> = {
  cut: -0.2, // -20%
  maintain: 0,
  bulk: 0.12, // +12%
}

/** Mifflin-St Jeor Basal Metabolic Rate (kcal/day). */
export function bmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return Math.round(base + (p.sex === 'male' ? 5 : -161))
}

/** Total Daily Energy Expenditure (kcal/day). */
export function tdee(p: Profile): number {
  return Math.round(bmr(p) * ACTIVITY_FACTORS[p.activity])
}

/**
 * Derive macro targets from a profile.
 * Protein scaled to bodyweight, fat to a share of calories, carbs fill the rest.
 */
export function computeTargets(p: Profile): Macros {
  const goalKcal = Math.round(tdee(p) * (1 + GOAL_KCAL_DELTA[p.goal]))

  // protein g/kg by goal
  const proteinPerKg = p.goal === 'cut' ? 2.2 : p.goal === 'bulk' ? 1.8 : 2.0
  const protein = Math.round(p.weightKg * proteinPerKg)

  // fat ~25% of calories (9 kcal/g)
  const fat = Math.round((goalKcal * 0.25) / 9)

  // carbs fill remaining calories (4 kcal/g)
  const remaining = goalKcal - protein * 4 - fat * 9
  const carbs = Math.max(0, Math.round(remaining / 4))

  // fiber: ~14 g per 1000 kcal (dietary guideline)
  const fiber = Math.round((goalKcal / 1000) * 14)

  return { kcal: goalKcal, protein, carbs, fat, fiber }
}

export const EMPTY_MACROS: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }

/** Macros for a quantity of a food (qty in the food's unit). */
export function macrosFor(food: Food, qty: number): Macros {
  const f = qty / 100
  return {
    kcal: food.per100.kcal * f,
    protein: food.per100.protein * f,
    carbs: food.per100.carbs * f,
    fat: food.per100.fat * f,
    fiber: (food.per100.fiber ?? 0) * f,
  }
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    fiber: (a.fiber ?? 0) + (b.fiber ?? 0),
  }
}

/** Sum macros for a set of food entries against a food lookup. */
export function totalMacros(
  entries: FoodEntry[],
  foods: Record<string, Food>,
): Macros {
  return entries.reduce<Macros>((acc, e) => {
    const food = foods[e.foodId]
    if (!food) return acc
    return addMacros(acc, macrosFor(food, e.qty))
  }, { ...EMPTY_MACROS })
}

export function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    protein: Math.round(m.protein),
    carbs: Math.round(m.carbs),
    fat: Math.round(m.fat),
    fiber: Math.round(m.fiber ?? 0),
  }
}

/** kcal implied by macro grams — useful for sanity checks / ring fill. */
export function kcalFromMacros(m: Pick<Macros, 'protein' | 'carbs' | 'fat'>): number {
  return m.protein * 4 + m.carbs * 4 + m.fat * 9
}

/** Resolve effective targets: auto recomputes from profile, else stored values. */
export function effectiveTargets(targets: Targets, profile: Profile): Macros {
  if (targets.auto) return computeTargets(profile)
  return {
    kcal: targets.kcal,
    protein: targets.protein,
    carbs: targets.carbs,
    fat: targets.fat,
    fiber: targets.fiber ?? computeTargets(profile).fiber,
  }
}

/** Rough MET-based cardio calorie estimate when the user doesn't enter one. */
const MET: Record<string, number> = {
  run: 9.8,
  walk: 3.5,
  cycle: 7.5,
  row: 7.0,
  swim: 8.0,
  elliptical: 5.0,
  hiit: 8.0,
  other: 6.0,
}

export function estimateCardioKcal(
  activity: string,
  durationMin: number,
  weightKg: number,
): number {
  const met = MET[activity] ?? MET.other
  // kcal = MET * 3.5 * kg / 200 * minutes
  return Math.round((met * 3.5 * weightKg / 200) * durationMin)
}
