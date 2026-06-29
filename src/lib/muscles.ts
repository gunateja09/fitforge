export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Other'

const RULES: { group: MuscleGroup; keywords: string[] }[] = [
  { group: 'Chest', keywords: ['press', 'bench', 'fly', 'flye', 'crossover', 'dip', 'pec', 'chest'] },
  { group: 'Back', keywords: ['row', 'pulldown', 'pull-up', 'pull up', 'pullup', 'chin', 'deadlift', 'face pull', 'lat'] },
  { group: 'Shoulders', keywords: ['overhead', 'lateral', 'shoulder', 'ohp', 'raise', 'shrug'] },
  { group: 'Arms', keywords: ['curl', 'tricep', 'extension', 'pushdown', 'bicep'] },
  { group: 'Legs', keywords: ['squat', 'lunge', 'leg', 'calf', 'rdl', 'romanian', 'glute', 'hamstring', 'quad'] },
]

/**
 * Best-effort muscle group from an exercise name. "Overhead Press" → Shoulders,
 * "Bench Press" → Chest. Press defaults to Chest unless "overhead/shoulder".
 */
export function muscleGroup(exercise: string): MuscleGroup {
  const n = exercise.toLowerCase()
  // shoulder-pressing beats chest-pressing
  if (/(overhead|shoulder|ohp)/.test(n) && n.includes('press')) return 'Shoulders'
  for (const r of RULES) {
    if (r.keywords.some((k) => n.includes(k))) return r.group
  }
  return 'Other'
}
