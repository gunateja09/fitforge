import { useMemo, useState } from 'react'
import { Apple, Coffee, Moon, Sandwich, Trash2, type LucideIcon } from 'lucide-react'
import { useStore, useFoodMap } from '../store/useStore'
import { effectiveTargets, macrosFor, roundMacros, totalMacros } from '../lib/calc'
import { todayStr } from '../lib/dates'
import type { MealType } from '../types'
import DayNav from '../components/DayNav'
import CalorieRing from '../components/CalorieRing'
import MacroBar from '../components/MacroBar'
import LogFoodModal from '../components/LogFoodModal'

const MEALS: { key: MealType; label: string; Icon: LucideIcon }[] = [
  { key: 'breakfast', label: 'Breakfast', Icon: Coffee },
  { key: 'lunch', label: 'Lunch', Icon: Sandwich },
  { key: 'dinner', label: 'Dinner', Icon: Moon },
  { key: 'snack', label: 'Snacks', Icon: Apple },
]

export default function Macros() {
  const [date, setDate] = useState(todayStr())
  const [modalMeal, setModalMeal] = useState<MealType | null>(null)

  const foodLog = useStore((s) => s.foodLog)
  const removeFoodEntry = useStore((s) => s.removeFoodEntry)
  const profile = useStore((s) => s.profile)
  const targets = useStore((s) => s.targets)
  const foods = useFoodMap()

  const dayEntries = useMemo(
    () => foodLog.filter((e) => e.date === date),
    [foodLog, date],
  )

  const target = effectiveTargets(targets, profile)
  const consumed = roundMacros(totalMacros(dayEntries, foods))

  return (
    <div>
      <div className="page-head">
        <h1>Macros</h1>
        <DayNav date={date} onChange={setDate} />
      </div>

      <div className="card">
        <div className="row wrap" style={{ gap: 22, justifyContent: 'center' }}>
          <CalorieRing value={consumed.kcal} target={target.kcal} />
          <div style={{ flex: 1, minWidth: 220, display: 'grid', gap: 14 }}>
            <MacroBar name="Protein" value={consumed.protein} target={target.protein} color="var(--protein)" />
            <MacroBar name="Carbs" value={consumed.carbs} target={target.carbs} color="var(--carbs)" />
            <MacroBar name="Fat" value={consumed.fat} target={target.fat} color="var(--fat)" />
            <MacroBar name="Fiber" value={consumed.fiber ?? 0} target={target.fiber ?? 28} color="var(--green)" />
          </div>
        </div>
      </div>

      {MEALS.map((meal) => {
        const entries = dayEntries.filter((e) => e.meal === meal.key)
        const mt = roundMacros(totalMacros(entries, foods))
        return (
          <div className="card" key={meal.key}>
            <div className="row between" style={{ marginBottom: entries.length ? 8 : 0 }}>
              <div className="row" style={{ gap: 8 }}>
                <meal.Icon size={18} color="var(--text-dim)" />
                <b>{meal.label}</b>
                {entries.length > 0 && (
                  <span className="faint">· {mt.kcal} kcal</span>
                )}
              </div>
              <button className="btn sm" onClick={() => setModalMeal(meal.key)}>
                + Add
              </button>
            </div>

            {entries.map((e) => {
              const food = foods[e.foodId]
              if (!food) return null
              const fm = roundMacros(macrosFor(food, e.qty))
              return (
                <div className="entry" key={e.id}>
                  <div className="grow">
                    <div className="title">{food.name}</div>
                    <div className="sub">
                      {e.qty} {food.unit} · {fm.kcal} kcal · P{fm.protein} C{fm.carbs} F{fm.fat}
                    </div>
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => removeFoodEntry(e.id)}
                    aria-label="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}

      {modalMeal && (
        <LogFoodModal
          date={date}
          meal={modalMeal}
          onClose={() => setModalMeal(null)}
        />
      )}
    </div>
  )
}
