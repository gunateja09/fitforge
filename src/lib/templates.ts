import type { WorkoutTemplate } from '../types'

// The user's PPL plan — Fat loss & chest focus. Rep ranges and rest match the
// plan; the rest seconds drive the rest-timer presets.
export const PPL_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'push-a',
    name: 'Push A',
    focus: 'Chest focus',
    finisher: '15 min incline treadmill walk (incline 10–12, 5.5 km/h)',
    exercises: [
      { exercise: 'Flat Dumbbell Press', sets: 4, repRange: '8-10', rest: 90, notes: 'Go heavy. Full stretch at bottom, squeeze at top.' },
      { exercise: 'Incline Dumbbell Press (30°)', sets: 3, repRange: '10-12', rest: 90, notes: 'Targets upper chest — key for chest shape.' },
      { exercise: 'Cable Flyes', sets: 3, repRange: '12-15', rest: 60, notes: 'Slow and controlled. Squeeze hard at center.' },
      { exercise: 'Overhead Press (Dumbbell)', sets: 3, repRange: '8-10', rest: 90, notes: 'Seated or standing. Strict form.' },
      { exercise: 'Lateral Raises', sets: 3, repRange: '15', rest: 45, notes: "Light weight, slow negatives. Don't ego lift." },
      { exercise: 'Tricep Rope Pushdowns', sets: 3, repRange: '12', rest: 60, notes: 'Spread the rope at the bottom, squeeze triceps.' },
      { exercise: 'Overhead Tricep Extension', sets: 2, repRange: '12', rest: 60, notes: 'Dumbbell or cable. Full stretch at the bottom.' },
    ],
  },
  {
    id: 'pull-a',
    name: 'Pull A',
    focus: 'Back width focus',
    finisher: '20 min evening walk after dinner',
    exercises: [
      { exercise: 'Lat Pulldown (Wide Grip)', sets: 4, repRange: '10-12', rest: 90, notes: 'Pull to upper chest. Lean back slightly.' },
      { exercise: 'Barbell Row', sets: 4, repRange: '8-10', rest: 90, notes: 'Heavy compound. Keep back flat.' },
      { exercise: 'Seated Cable Row (Close Grip)', sets: 3, repRange: '10-12', rest: 60, notes: 'Squeeze shoulder blades together.' },
      { exercise: 'Face Pulls', sets: 3, repRange: '15-20', rest: 45, notes: 'NEVER skip. Fixes posture, improves chest appearance.' },
      { exercise: 'Barbell Curls', sets: 3, repRange: '10-12', rest: 60, notes: 'Strict form. No swinging.' },
      { exercise: 'Hammer Curls', sets: 2, repRange: '12', rest: 60, notes: 'Builds forearm and brachialis.' },
    ],
  },
  {
    id: 'legs-a',
    name: 'Legs A',
    focus: 'Quad focus',
    finisher: '15 min incline treadmill walk',
    exercises: [
      { exercise: 'Barbell Squat', sets: 4, repRange: '8-10', rest: 120, notes: 'King of exercises. Go deep. Track weight closely.' },
      { exercise: 'Leg Press', sets: 3, repRange: '12', rest: 90, notes: 'Feet shoulder-width, press through heels.' },
      { exercise: 'Walking Lunges', sets: 3, repRange: '10 each', rest: 60, notes: 'Bodyweight or dumbbells.' },
      { exercise: 'Leg Extension', sets: 3, repRange: '12-15', rest: 60, notes: 'Squeeze at the top for 1 second.' },
      { exercise: 'Calf Raises (Standing)', sets: 4, repRange: '15-20', rest: 45, notes: 'Full stretch at bottom, pause at top.' },
    ],
  },
  {
    id: 'push-b',
    name: 'Push B',
    focus: 'Upper chest & shoulder focus',
    finisher: '15 min incline treadmill walk',
    exercises: [
      { exercise: 'Incline Barbell Bench Press', sets: 4, repRange: '8-10', rest: 90, notes: 'Primary lift today. Go heavy and track progress.' },
      { exercise: 'Flat Dumbbell Press', sets: 3, repRange: '10-12', rest: 90, notes: 'Lighter than Day 1. Focus on squeeze.' },
      { exercise: 'Dumbbell Overhead Press', sets: 3, repRange: '8-10', rest: 90, notes: 'Strict form. Push directly overhead.' },
      { exercise: 'Cable Crossover (Low to High)', sets: 3, repRange: '12-15', rest: 60, notes: 'Targets upper chest from a different angle.' },
      { exercise: 'Lateral Raises', sets: 4, repRange: '12-15', rest: 45, notes: 'Can do drop sets on last set.' },
      { exercise: 'Dips', sets: 3, repRange: '10-12', rest: 60, notes: 'Lean forward for chest, upright for triceps.' },
      { exercise: 'Tricep Overhead Extension', sets: 2, repRange: '12', rest: 60, notes: 'Cable or dumbbell.' },
    ],
  },
  {
    id: 'pull-b',
    name: 'Pull B',
    focus: 'Back thickness focus',
    finisher: '20 min evening walk after dinner',
    exercises: [
      { exercise: 'Deadlift (Conventional)', sets: 3, repRange: '5', rest: 180, notes: 'Heavy. Perfect form. Best full-body builder.' },
      { exercise: 'Pull-Ups', sets: 3, repRange: 'max', rest: 90, notes: 'Use assisted machine if needed.' },
      { exercise: 'Dumbbell Row (One Arm)', sets: 3, repRange: '10-12 each', rest: 60, notes: 'Full stretch at bottom, pull to hip.' },
      { exercise: 'Face Pulls', sets: 3, repRange: '15-20', rest: 45, notes: 'Yes, again. Twice a week minimum.' },
      { exercise: 'Incline Dumbbell Curls', sets: 3, repRange: '10-12', rest: 60, notes: "Great bicep stretch. Don't rush." },
      { exercise: 'Reverse Curls (EZ Bar)', sets: 2, repRange: '12-15', rest: 60, notes: 'Forearms and grip strength.' },
    ],
  },
  {
    id: 'legs-b',
    name: 'Legs B',
    focus: 'Hamstring & glute focus',
    finisher: '15 min incline treadmill walk',
    exercises: [
      { exercise: 'Romanian Deadlift', sets: 4, repRange: '10-12', rest: 90, notes: "Feel the hamstring stretch. Don't round your back." },
      { exercise: 'Bulgarian Split Squat', sets: 3, repRange: '10 each', rest: 60, notes: 'Hardest leg exercise. Builds real strength.' },
      { exercise: 'Leg Curl', sets: 3, repRange: '12-15', rest: 60, notes: 'Slow negatives for 3 seconds.' },
      { exercise: 'Leg Press (Feet High & Wide)', sets: 3, repRange: '12', rest: 90, notes: 'Targets glutes and hamstrings.' },
      { exercise: 'Calf Raises (Seated)', sets: 4, repRange: '15-20', rest: 45, notes: 'Different angle from standing.' },
    ],
  },
]

export function templateById(id: string): WorkoutTemplate | undefined {
  return PPL_TEMPLATES.find((t) => t.id === id)
}

/** Suggested rest seconds for an exercise name, falling back to 75s. */
export function suggestedRest(exercise: string): number {
  for (const t of PPL_TEMPLATES) {
    const ex = t.exercises.find((e) => e.exercise === exercise)
    if (ex) return ex.rest
  }
  const lower = exercise.toLowerCase()
  if (lower.includes('lateral')) return 45
  if (lower.includes('squat') || lower.includes('deadlift')) return 120
  return 75
}
