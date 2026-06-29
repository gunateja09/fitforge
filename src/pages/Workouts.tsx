import { useMemo, useState } from 'react'
import { ClipboardList, Dumbbell, HeartPulse, Timer, Trash2 } from 'lucide-react'
import { lastSessionFor, setsVolume, useStore } from '../store/useStore'
import { estimateCardioKcal } from '../lib/calc'
import { prettyDay, todayStr } from '../lib/dates'
import { PPL_TEMPLATES, suggestedRest, templateById } from '../lib/templates'
import DayNav from '../components/DayNav'
import Modal from '../components/Modal'
import RestTimer from '../components/RestTimer'
import type { CardioActivity, StrengthEntry, StrengthSet } from '../types'

type Tab = 'strength' | 'cardio'

const CARDIO_OPTS: { value: CardioActivity; label: string }[] = [
  { value: 'run', label: '🏃 Run' },
  { value: 'walk', label: '🚶 Walk' },
  { value: 'cycle', label: '🚴 Cycle' },
  { value: 'row', label: '🚣 Row' },
  { value: 'swim', label: '🏊 Swim' },
  { value: 'elliptical', label: '🌀 Elliptical' },
  { value: 'hiit', label: '🔥 HIIT' },
  { value: 'other', label: '⏱️ Other' },
]

function firstRep(repRange: string): number {
  const m = repRange.match(/\d+/)
  return m ? Number(m[0]) : 10
}

export default function Workouts() {
  const [date, setDate] = useState(todayStr())
  const [tab, setTab] = useState<Tab>('strength')

  return (
    <div>
      <div className="page-head">
        <h1>Workouts</h1>
        <DayNav date={date} onChange={setDate} />
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'strength' ? 'active' : ''}`} onClick={() => setTab('strength')}>
          <Dumbbell size={15} /> Strength
        </button>
        <button className={`tab ${tab === 'cardio' ? 'active' : ''}`} onClick={() => setTab('cardio')}>
          <HeartPulse size={15} /> Cardio
        </button>
      </div>

      {tab === 'strength' ? <Strength date={date} /> : <Cardio date={date} />}
    </div>
  )
}

// ---- Strength ----------------------------------------------------------
function Strength({ date }: { date: string }) {
  const strengthLog = useStore((s) => s.strengthLog)
  const addStrength = useStore((s) => s.addStrength)
  const updateStrength = useStore((s) => s.updateStrength)
  const removeStrength = useStore((s) => s.removeStrength)

  const [signal, setSignal] = useState({ seconds: 90, nonce: 0 })
  const [showTemplates, setShowTemplates] = useState(false)
  const [newExercise, setNewExercise] = useState('')

  const entries = useMemo(
    () => strengthLog.filter((e) => e.date === date),
    [strengthLog, date],
  )
  const knownExercises = useMemo(
    () => Array.from(new Set(strengthLog.map((e) => e.exercise))).sort(),
    [strengthLog],
  )

  const dayVolume = entries.reduce((sum, e) => sum + setsVolume(e.sets), 0)

  function startRest(seconds: number) {
    setSignal((s) => ({ seconds, nonce: s.nonce + 1 }))
  }

  function loadTemplate(templateId: string) {
    const tpl = templateById(templateId)
    if (!tpl) return
    for (const ex of tpl.exercises) {
      const last = lastSessionFor(strengthLog, ex.exercise, date)
      const sets: StrengthSet[] = last
        ? last.sets.map((s) => ({ ...s }))
        : Array.from({ length: ex.sets }, () => ({
            reps: firstRep(ex.repRange),
            weight: 0,
          }))
      addStrength({ date, exercise: ex.exercise, sets, notes: ex.notes })
    }
    setShowTemplates(false)
  }

  function addCustom() {
    const name = newExercise.trim()
    if (!name) return
    const last = lastSessionFor(strengthLog, name, date)
    const sets = last ? last.sets.map((s) => ({ ...s })) : [{ reps: 10, weight: 20 }]
    addStrength({ date, exercise: name, sets })
    setNewExercise('')
  }

  return (
    <div>
      <RestTimer startSignal={signal} />

      <div className="card">
        <div className="row between">
          <div>
            <b>Start a session</b>
            <div className="faint" style={{ fontSize: 12 }}>
              Loads your PPL exercises with last session's numbers prefilled.
            </div>
          </div>
          <button className="btn primary sm" onClick={() => setShowTemplates(true)}>
            <ClipboardList size={15} /> Templates
          </button>
        </div>
      </div>

      <div className="row between" style={{ margin: '12px 2px' }}>
        <span className="muted">
          {entries.length} exercise{entries.length === 1 ? '' : 's'}
          {dayVolume > 0 && ` · ${Math.round(dayVolume)} kg volume`}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="card empty">
          No strength work logged. Start from a template above, or add an exercise below.
        </div>
      ) : (
        entries.map((e) => (
          <ExerciseCard
            key={e.id}
            entry={e}
            last={lastSessionFor(strengthLog, e.exercise, date)}
            onChange={(patch) => updateStrength(e.id, patch)}
            onRemove={() => removeStrength(e.id)}
            onRest={() => startRest(suggestedRest(e.exercise))}
          />
        ))
      )}

      <div className="card">
        <div className="field">
          <label>Add an exercise</label>
          <div className="row" style={{ gap: 8 }}>
            <input
              type="text"
              list="known-exercises"
              placeholder="e.g. Flat Dumbbell Press"
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            />
            <button className="btn" disabled={!newExercise.trim()} onClick={addCustom}>
              + Add
            </button>
          </div>
          <datalist id="known-exercises">
            {knownExercises.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </div>
      </div>

      {showTemplates && (
        <Modal title="Start a workout" onClose={() => setShowTemplates(false)}>
          <div className="grid" style={{ gap: 10 }}>
            {PPL_TEMPLATES.map((t) => (
              <button
                key={t.id}
                className="card"
                style={{ textAlign: 'left', cursor: 'pointer' }}
                onClick={() => loadTemplate(t.id)}
              >
                <div className="row between">
                  <b>{t.name}</b>
                  <span className="pill">{t.exercises.length} lifts</span>
                </div>
                <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>
                  {t.focus} · {t.exercises.map((e) => e.exercise.split(' (')[0]).slice(0, 3).join(', ')}…
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---- One exercise card with inline sets + overload reference -----------
function ExerciseCard({
  entry,
  last,
  onChange,
  onRemove,
  onRest,
}: {
  entry: StrengthEntry
  last: StrengthEntry | null
  onChange: (patch: Partial<StrengthEntry>) => void
  onRemove: () => void
  onRest: () => void
}) {
  const todayVol = setsVolume(entry.sets)
  const lastVol = last ? setsVolume(last.sets) : 0
  const delta = lastVol > 0 ? todayVol - lastVol : 0
  const beat = lastVol > 0 && todayVol > lastVol
  const dropped = lastVol > 0 && todayVol < lastVol && todayVol > 0

  function setSet(i: number, patch: Partial<StrengthSet>) {
    onChange({ sets: entry.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
  }
  function addSet() {
    const lastSet = entry.sets[entry.sets.length - 1] ?? { reps: 10, weight: 0 }
    onChange({ sets: [...entry.sets, { ...lastSet }] })
  }
  function removeSet(i: number) {
    onChange({ sets: entry.sets.filter((_, j) => j !== i) })
  }

  return (
    <div className="card">
      <div className="row between">
        <b>{entry.exercise}</b>
        <div className="row" style={{ gap: 4 }}>
          {lastVol > 0 && (
            <span
              className="pill"
              style={{
                background: beat ? 'rgba(54,201,138,.15)' : dropped ? 'rgba(245,90,110,.15)' : 'var(--accent-soft)',
                color: beat ? 'var(--green)' : dropped ? 'var(--red)' : 'var(--accent)',
              }}
            >
              {beat ? `▲ +${Math.round(delta)} kg` : dropped ? `▼ ${Math.round(delta)} kg` : '= even'}
            </span>
          )}
          <button className="icon-btn" onClick={onRemove} aria-label="Remove exercise">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {last ? (
        <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>
          Last ({prettyDay(last.date)}):{' '}
          {last.sets.map((s) => `${s.weight || 'BW'}×${s.reps}`).join(', ')} ·
          beat {Math.round(lastVol)} kg volume 💪
        </div>
      ) : (
        <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>
          First time logging this — set your baseline.
        </div>
      )}

      <div className="divider" style={{ margin: '10px 0' }} />

      {entry.sets.map((s, i) => (
        <div className="row" key={i} style={{ gap: 8, marginBottom: 8 }}>
          <span className="faint" style={{ width: 42, fontSize: 12, fontWeight: 700 }}>
            Set {i + 1}
          </span>
          <input
            type="number"
            min="0"
            value={s.weight}
            step="0.5"
            onChange={(e) => setSet(i, { weight: Number(e.target.value) })}
            style={{ width: 80 }}
            aria-label="weight kg"
          />
          <span className="faint">kg ×</span>
          <input
            type="number"
            min="0"
            value={s.reps}
            onChange={(e) => setSet(i, { reps: Number(e.target.value) })}
            style={{ width: 70 }}
            aria-label="reps"
          />
          <span className="faint">reps</span>
          <div className="spacer" />
          <button className="btn sm ghost" title="Start rest timer" onClick={onRest}>
            <Timer size={15} />
          </button>
          {entry.sets.length > 1 && (
            <button className="icon-btn" onClick={() => removeSet(i)} aria-label="Remove set">
              ✕
            </button>
          )}
        </div>
      ))}

      <div className="row between" style={{ marginTop: 4 }}>
        <button className="btn sm ghost" onClick={addSet}>
          + Add set
        </button>
        <span className="faint" style={{ fontSize: 12 }}>
          Today: {Math.round(todayVol)} kg volume
        </span>
      </div>
    </div>
  )
}

// ---- Cardio ------------------------------------------------------------
function Cardio({ date }: { date: string }) {
  const cardioLog = useStore((s) => s.cardioLog)
  const addCardio = useStore((s) => s.addCardio)
  const removeCardio = useStore((s) => s.removeCardio)
  const profile = useStore((s) => s.profile)

  const [open, setOpen] = useState(false)
  const [activity, setActivity] = useState<CardioActivity>('run')
  const [duration, setDuration] = useState('30')
  const [distance, setDistance] = useState('')
  const [kcal, setKcal] = useState('')

  const entries = useMemo(
    () => cardioLog.filter((e) => e.date === date),
    [cardioLog, date],
  )

  const totalKcal = entries.reduce((s, e) => s + (e.kcal || 0), 0)
  const totalMin = entries.reduce((s, e) => s + e.durationMin, 0)

  const autoKcal =
    Number(duration) > 0
      ? estimateCardioKcal(activity, Number(duration), profile.weightKg)
      : 0

  function reset() {
    setActivity('run')
    setDuration('30')
    setDistance('')
    setKcal('')
  }

  function save() {
    const dur = Number(duration)
    if (!(dur > 0)) return
    addCardio({
      date,
      activity,
      durationMin: dur,
      distanceKm: Number(distance) > 0 ? Number(distance) : undefined,
      kcal: Number(kcal) > 0 ? Number(kcal) : autoKcal,
    })
    reset()
    setOpen(false)
  }

  const label = (a: CardioActivity) =>
    CARDIO_OPTS.find((o) => o.value === a)?.label ?? a

  return (
    <div>
      <div className="row between" style={{ marginBottom: 12 }}>
        <span className="muted">
          {totalMin > 0 ? `${totalMin} min · ~${totalKcal} kcal burned` : 'No cardio yet'}
        </span>
        <button className="btn primary sm" onClick={() => setOpen(true)}>
          + Log cardio
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="card empty">No cardio logged for this day.</div>
      ) : (
        entries.map((e) => (
          <div className="card" key={e.id}>
            <div className="row between">
              <div className="grow">
                <b>{label(e.activity)}</b>
                <div className="faint" style={{ fontSize: 13, marginTop: 2 }}>
                  {e.durationMin} min
                  {e.distanceKm ? ` · ${e.distanceKm} km` : ''}
                  {e.kcal ? ` · ~${e.kcal} kcal` : ''}
                </div>
              </div>
              <button className="icon-btn" onClick={() => removeCardio(e.id)} aria-label="Remove">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))
      )}

      {open && (
        <Modal title="Log cardio" onClose={() => setOpen(false)}>
          <div className="form-grid">
            <div className="field">
              <label>Activity</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value as CardioActivity)}>
                {CARDIO_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid cols-2">
              <div className="field">
                <label>Duration (min)</label>
                <input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="field">
                <label>Distance (km, optional)</label>
                <input type="number" min="0" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Calories burned</label>
              <input
                type="number"
                min="0"
                value={kcal}
                placeholder={`auto ≈ ${autoKcal} kcal`}
                onChange={(e) => setKcal(e.target.value)}
              />
              <span className="faint" style={{ fontSize: 12 }}>
                Leave blank to use the estimate (~{autoKcal} kcal based on your bodyweight).
              </span>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn primary" disabled={!(Number(duration) > 0)} onClick={save}>
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
