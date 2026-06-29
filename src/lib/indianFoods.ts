import type { Food, Macros } from '../types'

// Foods the user actually eats (PG/hostel food in Hyderabad). The user gave
// per-portion figures; we convert to the app's per-100 model and remember the
// natural serving so logging is one tap.
//
// `serving` = grams/ml in one typical portion; macros below are per 100 unit.

interface SeedFood {
  name: string
  unit: 'g' | 'ml'
  /** typical serving size in the unit (for quick-add) */
  serving: number
  /** macros for ONE serving (as the user provided) */
  perServing: Macros
}

const m = (
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber = 0,
): Macros => ({ kcal, protein, carbs, fat, fiber })

// Carbs/fat/fiber estimated where the user only gave cal+protein, kept realistic.
// Fiber is per serving — high-fiber staples (dal, chana, sabzi, guava, isabgol).
const SEED: SeedFood[] = [
  { name: 'Idli (1 piece)', unit: 'g', serving: 40, perServing: m(39, 2, 8, 0.2, 0.6) },
  { name: 'Plain Dosa (1)', unit: 'g', serving: 80, perServing: m(120, 3, 18, 4, 1) },
  { name: 'White Rice (1 katori)', unit: 'g', serving: 150, perServing: m(180, 3, 40, 0.4, 0.6) },
  { name: 'Sambar (1 bowl)', unit: 'ml', serving: 200, perServing: m(90, 4, 12, 2, 4) },
  { name: 'Dal (1 bowl)', unit: 'ml', serving: 200, perServing: m(110, 7, 15, 2, 5) },
  { name: 'Boiled Egg (1)', unit: 'g', serving: 50, perServing: m(70, 6, 0.6, 5, 0) },
  { name: 'Soya Chunks (1 cup cooked)', unit: 'g', serving: 100, perServing: m(120, 16, 8, 0.5, 5) },
  { name: 'Roasted Chana (50g)', unit: 'g', serving: 50, perServing: m(180, 10, 28, 3, 8) },
  { name: 'Banana (1)', unit: 'g', serving: 100, perServing: m(90, 1, 23, 0.3, 2.6) },
  { name: 'Whey Protein (1 scoop)', unit: 'g', serving: 30, perServing: m(120, 24, 3, 1.5, 0) },
  { name: 'Protein Buttermilk (1 bottle)', unit: 'ml', serving: 200, perServing: m(100, 10, 6, 3, 0) },
  { name: 'Chapati / Roti (1)', unit: 'g', serving: 40, perServing: m(104, 3, 18, 2.5, 2.5) },
  { name: 'Curd / Plain Yogurt (1 bowl)', unit: 'g', serving: 150, perServing: m(90, 5, 7, 4.5, 0) },
  { name: 'Paneer (50g)', unit: 'g', serving: 50, perServing: m(132, 9, 1.5, 10, 0) },
  { name: 'Mixed Veg Curry / Sabzi (1 bowl)', unit: 'g', serving: 150, perServing: m(120, 3, 12, 7, 4) },
  { name: 'Upma (1 plate)', unit: 'g', serving: 200, perServing: m(250, 6, 38, 8, 3) },
  { name: 'Poha (1 plate)', unit: 'g', serving: 200, perServing: m(230, 4, 40, 6, 2) },
  { name: 'Peanuts (handful 30g)', unit: 'g', serving: 30, perServing: m(170, 7, 5, 14, 2.5) },
  { name: 'Guava (1 medium)', unit: 'g', serving: 120, perServing: m(68, 2.6, 14, 1, 6.5) },
  { name: 'Isabgol / Psyllium (1 tbsp)', unit: 'g', serving: 7, perServing: m(25, 0.1, 5, 0.1, 5) },
  { name: 'Rajma (1 bowl cooked)', unit: 'g', serving: 150, perServing: m(180, 11, 30, 1, 9) },
  { name: 'Sprouts / Moong (1 bowl)', unit: 'g', serving: 100, perServing: m(120, 9, 18, 1, 6) },
]

/** Build Food objects (macros normalised to per-100) ready to insert. */
export function indianFoods(nextId: () => string, now: number): Food[] {
  return SEED.map((s) => {
    const factor = 100 / s.serving
    return {
      id: nextId(),
      name: s.name,
      unit: s.unit,
      per100: {
        kcal: round1(s.perServing.kcal * factor),
        protein: round1(s.perServing.protein * factor),
        carbs: round1(s.perServing.carbs * factor),
        fat: round1(s.perServing.fat * factor),
        fiber: round1((s.perServing.fiber ?? 0) * factor),
      },
      defaultQty: s.serving,
      createdAt: now,
    }
  })
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
