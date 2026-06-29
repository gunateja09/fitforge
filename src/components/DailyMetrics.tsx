import { useMemo } from 'react'
import { dailyLogFor, useStore } from '../store/useStore'
import { shiftDay, todayStr } from '../lib/dates'
import type { Rating } from '../types'

const ENERGY_FACES = ['😵', '😕', '😐', '🙂', '🤩']
const MOOD_FACES = ['😞', '😟', '😐', '😊', '😁']

/** Consecutive training days ending today with no rest taken. */
function daysSinceRest(
  strengthDates: Set<string>,
  cardioDates: Set<string>,
  restDates: Set<string>,
): number {
  let streak = 0
  let cursor = todayStr()
  for (let i = 0; i < 60; i++) {
    const trained = strengthDates.has(cursor) || cardioDates.has(cursor)
    const rested = restDates.has(cursor)
    if (rested) break
    if (trained) {
      streak++
      cursor = shiftDay(cursor, -1)
    } else {
      // a day with no training acts as natural rest
      break
    }
  }
  return streak
}

function Rater({
  faces,
  value,
  onPick,
}: {
  faces: string[]
  value?: Rating
  onPick: (r: Rating) => void
}) {
  return (
    <div className="row" style={{ gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onPick(n as Rating)}
          title={`${n}/5`}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            fontSize: 18,
            border: `1px solid ${value === n ? 'var(--accent)' : 'var(--border)'}`,
            background: value === n ? 'var(--accent-soft)' : 'var(--bg)',
            opacity: value && value !== n ? 0.5 : 1,
            cursor: 'pointer',
          }}
        >
          {faces[n - 1]}
        </button>
      ))}
    </div>
  )
}

export default function DailyMetrics() {
  const today = todayStr()
  const dailyLogs = useStore((s) => s.dailyLogs)
  const setDailyLog = useStore((s) => s.setDailyLog)
  const strengthLog = useStore((s) => s.strengthLog)
  const cardioLog = useStore((s) => s.cardioLog)

  const log = dailyLogFor(dailyLogs, today)

  const overtrainStreak = useMemo(() => {
    const sd = new Set(strengthLog.map((e) => e.date))
    const cd = new Set(cardioLog.map((e) => e.date))
    const rd = new Set(dailyLogs.filter((d) => d.restDay).map((d) => d.date))
    return daysSinceRest(sd, cd, rd)
  }, [strengthLog, cardioLog, dailyLogs])

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 12 }}>
        <b>Today's check-in</b>
        <label className="chip" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!log.restDay}
            onChange={(e) => setDailyLog(today, { restDay: e.target.checked })}
            style={{ width: 'auto', marginRight: 4 }}
          />
          😴 Rest day
        </label>
      </div>

      {overtrainStreak >= 12 && (
        <div
          className="card"
          style={{
            background: 'rgba(244,183,64,.12)',
            border: '1px solid var(--amber)',
            marginBottom: 12,
          }}
        >
          ⚠️ <b>{overtrainStreak} days straight without rest.</b> Overtraining
          risk is real when motivation is high — take a rest day to recover and grow.
        </div>
      )}

      <div className="grid cols-2" style={{ gap: 14 }}>
        <div className="field">
          <label>Energy</label>
          <Rater faces={ENERGY_FACES} value={log.energy} onPick={(r) => setDailyLog(today, { energy: r })} />
        </div>
        <div className="field">
          <label>Mood</label>
          <Rater faces={MOOD_FACES} value={log.mood} onPick={(r) => setDailyLog(today, { mood: r })} />
        </div>
        <div className="field">
          <label>Steps (from Mi Band)</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 8500"
            value={log.steps ?? ''}
            onChange={(e) => setDailyLog(today, { steps: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="field">
          <label>Sleep (hours)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 7.5"
            value={log.sleepHours ?? ''}
            onChange={(e) => setDailyLog(today, { sleepHours: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>
      <div className="faint" style={{ fontSize: 12, marginTop: 10 }}>
        Patterns emerge over time — good sleep + steps usually track with 4–5 energy days.
      </div>
    </div>
  )
}
