import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import type { Food } from '../types'

interface FormState {
  name: string
  unit: 'g' | 'ml'
  kcal: string
  protein: string
  carbs: string
  fat: string
}

const EMPTY_FORM: FormState = {
  name: '',
  unit: 'g',
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
}

export default function Foods() {
  const foods = useStore((s) => s.foods)
  const addFood = useStore((s) => s.addFood)
  const updateFood = useStore((s) => s.updateFood)
  const removeFood = useStore((s) => s.removeFood)
  const seedStarterFoods = useStore((s) => s.seedStarterFoods)
  const seedIndianFoods = useStore((s) => s.seedIndianFoods)

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Food | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? foods.filter((f) => f.name.toLowerCase().includes(q)) : foods
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [foods, query])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(f: Food) {
    setEditing(f)
    setForm({
      name: f.name,
      unit: f.unit,
      kcal: String(f.per100.kcal),
      protein: String(f.per100.protein),
      carbs: String(f.per100.carbs),
      fat: String(f.per100.fat),
    })
    setShowForm(true)
  }

  function save() {
    const per100 = {
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    }
    if (!form.name.trim()) return
    if (editing) {
      updateFood(editing.id, { name: form.name.trim(), unit: form.unit, per100 })
    } else {
      addFood({ name: form.name.trim(), unit: form.unit, per100 })
    }
    setShowForm(false)
  }

  return (
    <div>
      <div className="page-head">
        <h1>Food library</h1>
        <button className="btn primary" onClick={openNew}>
          + New food
        </button>
      </div>

      <div className="row" style={{ marginBottom: 14, gap: 10 }}>
        <input
          type="text"
          placeholder="Search foods…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="row between">
          <div>
            <b>Quick-fill your library</b>
            <div className="faint" style={{ fontSize: 12 }}>
              Pre-loaded with PG/hostel foods you actually eat — tap to log, no manual macros.
            </div>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
          <button className="btn primary" onClick={seedIndianFoods}>
            🍛 Load Indian food pack
          </button>
          <button className="btn" onClick={seedStarterFoods}>
            ⚡ Load common foods
          </button>
        </div>
      </div>

      {foods.length === 0 && (
        <div className="empty">
          No foods yet — load a pack above or add your own with “New food”.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card">
          {filtered.map((f) => (
            <div className="entry" key={f.id}>
              <div className="grow">
                <div className="title">
                  {f.name}{' '}
                  <span className="faint" style={{ fontWeight: 500 }}>
                    / 100{f.unit}
                  </span>
                </div>
                <div className="sub">
                  {f.per100.kcal} kcal · P{f.per100.protein} · C{f.per100.carbs} · F{f.per100.fat}
                </div>
              </div>
              <button className="icon-btn" onClick={() => openEdit(f)} aria-label="Edit">
                ✏️
              </button>
              <button className="icon-btn" onClick={() => removeFood(f.id)} aria-label="Delete">
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {foods.length > 0 && filtered.length === 0 && (
        <div className="empty">No foods match “{query}”.</div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit food' : 'New food'} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Chicken breast, cooked"
              />
            </div>
            <div className="field">
              <label>Measured per 100…</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as 'g' | 'ml' })}
              >
                <option value="g">grams (g) — solids</option>
                <option value="ml">milliliters (ml) — liquids</option>
              </select>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: -4 }}>
              Enter macros per 100 {form.unit}.
            </div>
            <div className="form-grid cols-2">
              <div className="field">
                <label>Calories (kcal)</label>
                <input type="number" min="0" value={form.kcal} onChange={(e) => setForm({ ...form, kcal: e.target.value })} />
              </div>
              <div className="field">
                <label>Protein (g)</label>
                <input type="number" min="0" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              </div>
              <div className="field">
                <label>Carbs (g)</label>
                <input type="number" min="0" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
              </div>
              <div className="field">
                <label>Fat (g)</label>
                <input type="number" min="0" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="btn primary" disabled={!form.name.trim()} onClick={save}>
                {editing ? 'Save' : 'Add food'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
