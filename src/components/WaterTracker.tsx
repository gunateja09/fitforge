import { useMemo } from 'react'
import { Droplets } from 'lucide-react'
import { dailyLogFor, useStore } from '../store/useStore'
import { todayStr } from '../lib/dates'

const GLASS = 250 // ml per tap
const BASE_TARGET = 3500 // ml
const GYM_BONUS = 500 // extra on training days (Hyderabad heat)

export default function WaterTracker() {
  const today = todayStr()
  const dailyLogs = useStore((s) => s.dailyLogs)
  const addWater = useStore((s) => s.addWater)
  const strengthLog = useStore((s) => s.strengthLog)
  const cardioLog = useStore((s) => s.cardioLog)

  const trainedToday = useMemo(
    () =>
      strengthLog.some((e) => e.date === today) ||
      cardioLog.some((e) => e.date === today),
    [strengthLog, cardioLog, today],
  )
  const target = BASE_TARGET + (trainedToday ? GYM_BONUS : 0)

  const ml = dailyLogFor(dailyLogs, today).waterMl
  const glasses = Math.round(ml / GLASS)
  const pct = Math.min(100, (ml / target) * 100)
  const litres = (ml / 1000).toFixed(2)
  const targetL = (target / 1000).toFixed(1)

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 12 }}>
        <div className="row" style={{ gap: 8 }}>
          <Droplets size={18} color="var(--accent)" />
          <b>Water</b>
          {trainedToday && <span className="pill">gym day +0.5L</span>}
        </div>
        <span className="muted" style={{ fontSize: 13 }}>
          {litres}L <span className="faint">/ {targetL}L</span>
        </span>
      </div>

      <div className="row" style={{ gap: 16 }}>
        {/* vertical fill glass */}
        <div
          style={{
            position: 'relative',
            width: 54,
            height: 84,
            borderRadius: '8px 8px 12px 12px',
            border: '2px solid var(--border)',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--bg)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: `${pct}%`,
              background: 'linear-gradient(180deg, #4f8cff, #2f6ad6)',
              transition: 'height 0.4s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: pct > 45 ? '#fff' : 'var(--text-dim)',
            }}
          >
            {Math.round(pct)}%
          </div>
        </div>

        <div className="grow">
          <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>
            {glasses} glass{glasses === 1 ? '' : 'es'} · each tap = 250 ml.
            Whey & buttermilk count too.
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <button className="btn primary" onClick={() => addWater(today, GLASS)}>
              + Glass (250 ml)
            </button>
            <button className="btn sm" onClick={() => addWater(today, 500)}>
              + Bottle (500 ml)
            </button>
            <button
              className="btn sm ghost"
              onClick={() => addWater(today, -GLASS)}
              disabled={ml <= 0}
            >
              − Undo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
