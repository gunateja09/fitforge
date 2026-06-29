import { useMemo, useState } from 'react'
import { useStore, useFoodMap } from '../store/useStore'
import { effectiveTargets, roundMacros, totalMacros } from '../lib/calc'
import { dayNum, isToday, prettyDay, shiftDay, shortDay, todayStr, weekDays } from '../lib/dates'
import type { MealType } from '../types'
import LogFoodModal from '../components/LogFoodModal'

export default function Planner() {
  const [anchor, setAnchor] = useState(todayStr())
  const [selected, setSelected] = useState(todayStr())
  const [modalMeal, setModalMeal] = useState<MealType | null>(null)

  const foodLog = useStore((s) => s.foodLog)
  const removeFoodEntry = useStore((s) => s.removeFoodEntry)
  const copyDay = useStore((s) => s.copyDay)
  const profile = useStore((s) => s.profile)
  const targets = useStore((s) => s.targets)
  const foods = useFoodMap()

  const days = useMemo(() => weekDays(anchor), [anchor])
  const target = effectiveTargets(targets, profile)

  const kcalByDay = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of days) {
      const entries = foodLog.filter((e) => e.date === d)
      map[d] = Math.round(totalMacros(entries, foods).kcal)
    }
    return map
  }, [days, foodLog, foods])

  const selEntries = foodLog.filter((e) => e.date === selected)
  const selTotals = roundMacros(totalMacros(selEntries, foods))

  return (
    <div>
      <div className="page-head">
        <h1>Meal planner</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="icon-btn" onClick={() => setAnchor(shiftDay(anchor, -7))} aria-label="Previous week">
            ‹
          </button>
          <span className="faint" style={{ fontSize: 13 }}>Week</span>
          <button className="icon-btn" onClick={() => setAnchor(shiftDay(anchor, 7))} aria-label="Next week">
            ›
          </button>
        </div>
      </div>

      <div className="week">
        {days.map((d) => {
          const kc = kcalByDay[d]
          const pct = target.kcal > 0 ? Math.min(100, (kc / target.kcal) * 100) : 0
          return (
            <div
              key={d}
              className={`day ${isToday(d) ? 'today' : ''}`}
              style={{
                outline: selected === d ? '2px solid var(--accent)' : 'none',
              }}
              onClick={() => setSelected(d)}
            >
              <div className="dn">
                {shortDay(d)} {dayNum(d)}
              </div>
              <div className="kc">{kc || 0}</div>
              <div className="faint" style={{ fontSize: 11 }}>kcal</div>
              <div className="track" style={{ height: 5, marginTop: 8, background: 'var(--bg-elev-2)', borderRadius: 999 }}>
                <div
                  className="fill"
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: kc > target.kcal ? 'var(--amber)' : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row between">
          <div>
            <div className="section-title" style={{ margin: 0 }}>
              {isToday(selected) ? 'Today' : prettyDay(selected)}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              {selTotals.kcal} / {target.kcal} kcal · P{selTotals.protein} C{selTotals.carbs} F{selTotals.fat}
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button
              className="btn sm"
              title="Copy yesterday's plan to this day"
              onClick={() => copyDay(shiftDay(selected, -1), selected)}
            >
              📋 copy prev
            </button>
            <button className="btn sm primary" onClick={() => setModalMeal('breakfast')}>
              + Add food
            </button>
          </div>
        </div>

        <div className="divider" />

        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => {
          const entries = selEntries.filter((e) => e.meal === meal)
          if (entries.length === 0) return null
          return (
            <div key={meal} style={{ marginBottom: 10 }}>
              <div className="faint" style={{ textTransform: 'capitalize', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                {meal}
              </div>
              {entries.map((e) => {
                const food = foods[e.foodId]
                if (!food) return null
                return (
                  <div className="entry" key={e.id}>
                    <div className="grow">
                      <div className="title">{food.name}</div>
                      <div className="sub">{e.qty} {food.unit}</div>
                    </div>
                    <button className="icon-btn" onClick={() => removeFoodEntry(e.id)} aria-label="Remove">
                      🗑️
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })}

        {selEntries.length === 0 && (
          <div className="empty">Nothing planned for this day yet.</div>
        )}
      </div>

      {modalMeal && (
        <LogFoodModal
          date={selected}
          meal={modalMeal}
          onClose={() => setModalMeal(null)}
        />
      )}
    </div>
  )
}
