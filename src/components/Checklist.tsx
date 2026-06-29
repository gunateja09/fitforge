import { checklistFor, useStore } from '../store/useStore'
import { CHECKLIST_ITEMS, type ChecklistKey } from '../types'
import { shiftDay, todayStr } from '../lib/dates'

function isComplete(c: { lifts: boolean; protein: boolean; steps: boolean; cardio: boolean; sleep: boolean }): boolean {
  return c.lifts && c.protein && c.steps && c.cardio && c.sleep
}

/** Count consecutive fully-complete days ending today (or yesterday). */
function computeStreak(list: ReturnType<typeof useStore.getState>['checklist']): number {
  const byDate = new Map(list.map((c) => [c.date, c]))
  let streak = 0
  let cursor = todayStr()
  // allow today to be incomplete without breaking a streak that ran through yesterday
  const todayC = byDate.get(cursor)
  if (!todayC || !isComplete(todayC)) cursor = shiftDay(cursor, -1)
  while (true) {
    const c = byDate.get(cursor)
    if (c && isComplete(c)) {
      streak++
      cursor = shiftDay(cursor, -1)
    } else break
  }
  return streak
}

export default function Checklist() {
  const today = todayStr()
  const checklist = useStore((s) => s.checklist)
  const toggle = useStore((s) => s.toggleChecklist)

  const c = checklistFor(checklist, today)
  const done = CHECKLIST_ITEMS.filter((it) => c[it.key as ChecklistKey]).length
  const streak = computeStreak(checklist)

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 10 }}>
        <b>Daily non-negotiables</b>
        <div className="row" style={{ gap: 8 }}>
          <span className="muted" style={{ fontSize: 13 }}>{done}/5</span>
          {streak > 0 && <span className="pill">🔥 {streak}d streak</span>}
        </div>
      </div>
      <div className="grid" style={{ gap: 8 }}>
        {CHECKLIST_ITEMS.map((it) => {
          const checked = c[it.key as ChecklistKey]
          return (
            <button
              key={it.key}
              onClick={() => toggle(today, it.key as ChecklistKey)}
              className="row"
              style={{
                gap: 10,
                padding: '9px 11px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: checked ? 'rgba(54,201,138,.12)' : 'var(--bg)',
                color: 'var(--text)',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  display: 'grid',
                  placeItems: 'center',
                  background: checked ? 'var(--green)' : 'var(--bg-elev-2)',
                  border: `1px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
                  fontSize: 13,
                  color: '#062',
                  fontWeight: 800,
                }}
              >
                {checked ? '✓' : ''}
              </span>
              <span style={{ fontSize: 18 }}>{it.ico}</span>
              <span style={{ fontWeight: 600, textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.7 : 1 }}>
                {it.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
