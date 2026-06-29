import { useMemo, useState } from 'react'
import Modal from './Modal'
import { useStore } from '../store/useStore'
import { macrosFor, roundMacros } from '../lib/calc'
import type { DateStr, MealType } from '../types'

interface Props {
  date: DateStr
  meal: MealType
  onClose: () => void
}

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function LogFoodModal({ date, meal, onClose }: Props) {
  const foods = useStore((s) => s.foods)
  const addFoodEntry = useStore((s) => s.addFoodEntry)

  const [query, setQuery] = useState('')
  const [mechosen, setMeal] = useState<MealType>(meal)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [qty, setQty] = useState('100')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? foods.filter((f) => f.name.toLowerCase().includes(q))
      : foods
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [foods, query])

  const selected = foods.find((f) => f.id === selectedId) || null
  const preview =
    selected && Number(qty) > 0
      ? roundMacros(macrosFor(selected, Number(qty)))
      : null

  function submit() {
    if (!selected || !(Number(qty) > 0)) return
    addFoodEntry({ date, foodId: selected.id, meal: mechosen, qty: Number(qty) })
    onClose()
  }

  return (
    <Modal title="Add food" onClose={onClose}>
      {foods.length === 0 ? (
        <div className="empty">
          Your food library is empty. Add foods on the <b>Foods</b> tab first
          (or load the starter pack there).
        </div>
      ) : (
        <div className="form-grid">
          <div className="field">
            <label>Meal</label>
            <div className="row wrap" style={{ gap: 6 }}>
              {MEALS.map((mt) => (
                <span
                  key={mt}
                  className={`chip ${mechosen === mt ? 'active' : ''}`}
                  onClick={() => setMeal(mt)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {mt}
                </span>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Search food</label>
            <input
              type="text"
              autoFocus
              placeholder="Type to filter…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="list-scroll card" style={{ padding: 6 }}>
            {filtered.length === 0 ? (
              <div className="empty">No matches.</div>
            ) : (
              filtered.map((f) => (
                <div
                  key={f.id}
                  className="entry"
                  style={{
                    cursor: 'pointer',
                    padding: '8px 8px',
                    borderRadius: 8,
                    background:
                      selectedId === f.id ? 'var(--accent-soft)' : 'transparent',
                  }}
                  onClick={() => {
                    setSelectedId(f.id)
                    setQty(String(f.defaultQty ?? 100))
                  }}
                >
                  <div className="grow">
                    <div className="title">{f.name}</div>
                    <div className="sub">
                      {f.per100.kcal} kcal · P{f.per100.protein} C{f.per100.carbs}{' '}
                      F{f.per100.fat} / 100{f.unit}
                    </div>
                  </div>
                  {selectedId === f.id && <span className="pill">selected</span>}
                </div>
              ))
            )}
          </div>

          {selected && (
            <div className="field">
              <label>Quantity ({selected.unit})</label>
              <input
                type="number"
                min="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
          )}

          {preview && (
            <div className="card" style={{ background: 'var(--bg)' }}>
              <div className="row between">
                <b>{preview.kcal} kcal</b>
                <span className="muted">
                  P {preview.protein}g · C {preview.carbs}g · F {preview.fat}g
                </span>
              </div>
            </div>
          )}

          <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn primary"
              disabled={!selected || !(Number(qty) > 0)}
              onClick={submit}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
