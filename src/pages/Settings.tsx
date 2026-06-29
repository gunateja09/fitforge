import { useRef, useState } from 'react'
import { Download, FileText, Moon, MoonStar, Trash2, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  bmr,
  computeTargets,
  effectiveTargets,
  tdee,
} from '../lib/calc'
import { prettyDay, todayStr } from '../lib/dates'
import { exportFullBackup, exportStrengthCSV, importFullBackup } from '../lib/backup'
import type { ActivityLevel, Goal, Sex } from '../types'

export default function Settings() {
  const profile = useStore((s) => s.profile)
  const targets = useStore((s) => s.targets)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const setProfile = useStore((s) => s.setProfile)
  const setTargets = useStore((s) => s.setTargets)
  const setWeight = useStore((s) => s.setWeight)
  const weightLog = useStore((s) => s.weightLog)
  const measurements = useStore((s) => s.measurements)
  const addMeasurement = useStore((s) => s.addMeasurement)
  const removeMeasurement = useStore((s) => s.removeMeasurement)
  const strengthLog = useStore((s) => s.strengthLog)

  const [mChest, setMChest] = useState('')
  const [mWaist, setMWaist] = useState('')
  const [mArm, setMArm] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function saveMeasurement() {
    const chest = Number(mChest) || undefined
    const waist = Number(mWaist) || undefined
    const arm = Number(mArm) || undefined
    if (!chest && !waist && !arm) return
    addMeasurement({ date: todayStr(), chestCm: chest, waistCm: waist, armCm: arm, weightKg: profile.weightKg })
    setMChest('')
    setMWaist('')
    setMArm('')
  }

  function onImportFile(file: File) {
    importFullBackup(file)
      .then(() => {
        alert('Backup restored (including photos). Reloading…')
        location.reload()
      })
      .catch((e) => alert(`Import failed: ${e?.message ?? e}`))
  }

  const auto = computeTargets(profile)
  const eff = effectiveTargets(targets, profile)

  function num(v: string) {
    return Number(v) || 0
  }

  function onWeightChange(v: number) {
    if (v <= 0) return
    setProfile({ weightKg: v })
    // also record a bodyweight data point for the dashboard trend
    setWeight(todayStr(), v)
  }

  return (
    <div>
      <div className="page-head">
        <h1>Goals & profile</h1>
      </div>

      <div className="card">
        <div className="section-title">About you</div>
        <div className="form-grid cols-2">
          <div className="field">
            <label>Sex</label>
            <select value={profile.sex} onChange={(e) => setProfile({ sex: e.target.value as Sex })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="field">
            <label>Age</label>
            <input type="number" min="0" value={profile.age} onChange={(e) => setProfile({ age: num(e.target.value) })} />
          </div>
          <div className="field">
            <label>Height (cm)</label>
            <input type="number" min="0" value={profile.heightCm} onChange={(e) => setProfile({ heightCm: num(e.target.value) })} />
          </div>
          <div className="field">
            <label>Weight (kg)</label>
            <input type="number" min="0" step="0.1" value={profile.weightKg} onChange={(e) => onWeightChange(num(e.target.value))} />
          </div>
        </div>
        <div className="form-grid" style={{ marginTop: 12 }}>
          <div className="field">
            <label>Activity level</label>
            <select value={profile.activity} onChange={(e) => setProfile({ activity: e.target.value as ActivityLevel })}>
              {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Goal</label>
            <div className="row wrap" style={{ gap: 6 }}>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <span
                  key={g}
                  className={`chip ${profile.goal === g ? 'active' : ''}`}
                  onClick={() => setProfile({ goal: g })}
                >
                  {GOAL_LABELS[g]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Energy estimate</div>
        <div className="grid cols-3">
          <div className="stat">
            <span className="num">{bmr(profile)}</span>
            <span className="lbl">BMR (kcal)</span>
          </div>
          <div className="stat">
            <span className="num">{tdee(profile)}</span>
            <span className="lbl">Maintenance / TDEE</span>
          </div>
          <div className="stat">
            <span className="num">{auto.kcal}</span>
            <span className="lbl">Target for {profile.goal}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 10 }}>
          <div className="section-title" style={{ margin: 0 }}>Daily macro targets</div>
          <label className="row" style={{ gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={targets.auto}
              onChange={(e) => {
                const on = e.target.checked
                // when turning manual off->on nothing else needed; when turning
                // off, seed manual fields from the current auto values.
                if (on) setTargets({ auto: true })
                else setTargets({ auto: false, ...auto })
              }}
              style={{ width: 'auto' }}
            />
            Auto-calculate
          </label>
        </div>

        {targets.auto ? (
          <div className="grid cols-3">
            <div className="stat"><span className="num">{eff.protein}g</span><span className="lbl">Protein</span></div>
            <div className="stat"><span className="num">{eff.carbs}g</span><span className="lbl">Carbs</span></div>
            <div className="stat"><span className="num">{eff.fat}g</span><span className="lbl">Fat</span></div>
          </div>
        ) : (
          <div className="form-grid cols-2">
            <div className="field">
              <label>Calories (kcal)</label>
              <input type="number" min="0" value={targets.kcal} onChange={(e) => setTargets({ kcal: num(e.target.value) })} />
            </div>
            <div className="field">
              <label>Protein (g)</label>
              <input type="number" min="0" value={targets.protein} onChange={(e) => setTargets({ protein: num(e.target.value) })} />
            </div>
            <div className="field">
              <label>Carbs (g)</label>
              <input type="number" min="0" value={targets.carbs} onChange={(e) => setTargets({ carbs: num(e.target.value) })} />
            </div>
            <div className="field">
              <label>Fat (g)</label>
              <input type="number" min="0" value={targets.fat} onChange={(e) => setTargets({ fat: num(e.target.value) })} />
            </div>
          </div>
        )}
        <div className="faint" style={{ fontSize: 12, marginTop: 10 }}>
          {targets.auto
            ? 'Targets follow your profile (Mifflin-St Jeor TDEE, goal-adjusted). Switch off to set your own.'
            : 'Manual targets. Turn on auto-calculate to follow your profile.'}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Body measurements</div>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
          Log monthly. During recomposition your weight can stay flat while your
          waist shrinks — that's progress the scale hides.
        </p>
        <div className="form-grid cols-2">
          <div className="field">
            <label>Chest (cm)</label>
            <input type="number" min="0" step="0.5" value={mChest} onChange={(e) => setMChest(e.target.value)} />
          </div>
          <div className="field">
            <label>Waist (cm)</label>
            <input type="number" min="0" step="0.5" value={mWaist} onChange={(e) => setMWaist(e.target.value)} />
          </div>
          <div className="field">
            <label>Arm flexed (cm)</label>
            <input type="number" min="0" step="0.5" value={mArm} onChange={(e) => setMArm(e.target.value)} />
          </div>
        </div>
        <button className="btn primary" style={{ marginTop: 10 }} disabled={!mChest && !mWaist} onClick={saveMeasurement}>
          Save today's measurement
        </button>

        {measurements.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {[...measurements]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 6)
              .map((mm) => (
                <div className="entry" key={mm.id}>
                  <div className="grow">
                    <div className="title">{prettyDay(mm.date)}</div>
                    <div className="sub">
                      {[
                        mm.chestCm ? `Chest ${mm.chestCm}cm` : '',
                        mm.waistCm ? `Waist ${mm.waistCm}cm` : '',
                        mm.armCm ? `Arm ${mm.armCm}cm` : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <button className="icon-btn" onClick={() => removeMeasurement(mm.id)} aria-label="Remove">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-title">Appearance</div>
        <div className="row wrap" style={{ gap: 6 }}>
          <span className={`chip ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
            <Moon size={14} /> Dark
          </span>
          <span className={`chip ${theme === 'amoled' ? 'active' : ''}`} onClick={() => setTheme('amoled')}>
            <MoonStar size={14} /> AMOLED black
          </span>
        </div>
        <div className="faint" style={{ fontSize: 12, marginTop: 8 }}>
          AMOLED uses pure black (#000) — saves battery on OLED phone screens at the gym.
        </div>
      </div>

      <div className="card">
        <div className="section-title">Backup & data</div>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
          Everything is stored locally in this browser ({weightLog.length} weight,{' '}
          {measurements.length} measurement entries). The JSON backup now bundles
          your progress photos too — export regularly, since clearing your browser
          cache wipes local data.
        </p>
        <div className="row wrap" style={{ gap: 8 }}>
          <button className="btn" onClick={() => exportFullBackup()}><Download size={15} /> Export backup (+ photos)</button>
          <button className="btn" onClick={() => exportStrengthCSV(strengthLog)}><FileText size={15} /> Training CSV</button>
          <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={15} /> Import backup</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
        <div className="divider" />
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('Erase ALL FitForge data on this device? This cannot be undone.')) {
              localStorage.removeItem('fitforge-v1')
              location.reload()
            }
          }}
        >
          Reset all data
        </button>
      </div>
    </div>
  )
}
