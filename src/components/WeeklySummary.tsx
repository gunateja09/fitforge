import { useMemo } from 'react'
import { useStore, useFoodMap, setsVolume } from '../store/useStore'
import { totalMacros } from '../lib/calc'
import { weekDays, todayStr, shiftDay } from '../lib/dates'
import { muscleGroup, type MuscleGroup } from '../lib/muscles'

const GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs']

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export default function WeeklySummary() {
  const strengthLog = useStore((s) => s.strengthLog)
  const cardioLog = useStore((s) => s.cardioLog)
  const foodLog = useStore((s) => s.foodLog)
  const dailyLogs = useStore((s) => s.dailyLogs)
  const foods = useFoodMap()

  const stats = useMemo(() => {
    const week = weekDays(todayStr())
    const days = new Set(week)
    const weekStrength = strengthLog.filter((e) => days.has(e.date))
    const weekCardio = cardioLog.filter((e) => days.has(e.date))

    const setsByGroup: Record<string, number> = {}
    let totalVolume = 0
    for (const e of weekStrength) {
      const g = muscleGroup(e.exercise)
      setsByGroup[g] = (setsByGroup[g] || 0) + e.sets.length
      totalVolume += setsVolume(e.sets)
    }

    // gym sessions = distinct days with strength logged
    const sessions = new Set(weekStrength.map((e) => e.date)).size
    const trainedDays = new Set([
      ...weekStrength.map((e) => e.date),
      ...weekCardio.map((e) => e.date),
    ]).size
    const cardioMin = weekCardio.reduce((s, e) => s + e.durationMin, 0)

    // nutrition averages over days with food logged
    const foodDays = week.filter((d) => foodLog.some((e) => e.date === d))
    const kcals: number[] = []
    const proteins: number[] = []
    const fibers: number[] = []
    for (const d of foodDays) {
      const t = totalMacros(foodLog.filter((e) => e.date === d), foods)
      kcals.push(t.kcal)
      proteins.push(t.protein)
      fibers.push(t.fiber ?? 0)
    }

    // steps / sleep from daily logs
    const weekLogs = dailyLogs.filter((d) => days.has(d.date))
    const steps = weekLogs.filter((d) => d.steps != null).map((d) => d.steps as number)
    const sleeps = weekLogs.filter((d) => d.sleepHours != null).map((d) => d.sleepHours as number)

    // lift trend: this week's volume vs last week's
    const lastWeek = new Set(weekDays(shiftDay(todayStr(), -7)))
    const lastVolume = strengthLog
      .filter((e) => lastWeek.has(e.date))
      .reduce((s, e) => s + setsVolume(e.sets), 0)
    let trend: 'up' | 'down' | 'flat' | 'new' = 'new'
    if (lastVolume > 0) {
      const diff = (totalVolume - lastVolume) / lastVolume
      trend = diff > 0.02 ? 'up' : diff < -0.02 ? 'down' : 'flat'
    }

    return {
      setsByGroup,
      totalVolume,
      sessions,
      trainedDays,
      cardioMin,
      avgKcal: avg(kcals),
      avgProtein: avg(proteins),
      avgFiber: avg(fibers),
      avgSteps: avg(steps),
      avgSleep: sleeps.length ? Math.round((sleeps.reduce((a, b) => a + b, 0) / sleeps.length) * 10) / 10 : 0,
      trend,
    }
  }, [strengthLog, cardioLog, foodLog, dailyLogs, foods])

  const maxSets = Math.max(1, ...GROUPS.map((g) => stats.setsByGroup[g] || 0))

  const trendLabel = {
    up: { txt: '▲ Lifts up', color: 'var(--green)' },
    down: { txt: '▼ Lifts down', color: 'var(--red)' },
    flat: { txt: '= Lifts flat', color: 'var(--amber)' },
    new: { txt: 'First week', color: 'var(--text-dim)' },
  }[stats.trend]

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="section-title" style={{ margin: 0 }}>This week</div>
        <span className="pill" style={{ background: 'transparent', color: trendLabel.color }}>
          {trendLabel.txt}
        </span>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 14 }}>
        <div className="stat"><span className="num">{stats.sessions}</span><span className="lbl">Gym sessions</span></div>
        <div className="stat"><span className="num">{stats.trainedDays}</span><span className="lbl">Active days</span></div>
        <div className="stat"><span className="num">{stats.cardioMin}</span><span className="lbl">Cardio min</span></div>
        <div className="stat"><span className="num">{stats.avgProtein}g</span><span className="lbl">Avg protein</span></div>
        <div className="stat"><span className="num">{stats.avgFiber}g</span><span className="lbl">Avg fiber</span></div>
        <div className="stat"><span className="num">{stats.avgKcal}</span><span className="lbl">Avg kcal</span></div>
        <div className="stat"><span className="num">{stats.avgSteps || '—'}</span><span className="lbl">Avg steps</span></div>
        <div className="stat"><span className="num">{stats.avgSleep || '—'}</span><span className="lbl">Avg sleep (h)</span></div>
        <div className="stat"><span className="num">{Math.round(stats.totalVolume / 1000)}k</span><span className="lbl">Volume (kg)</span></div>
      </div>

      <div className="faint" style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
        SETS BY MUSCLE GROUP
      </div>
      <div className="grid" style={{ gap: 7 }}>
        {GROUPS.map((g) => {
          const n = stats.setsByGroup[g] || 0
          return (
            <div className="macro-bar" key={g}>
              <div className="head">
                <span className="name">{g}</span>
                <span className="muted">{n} sets</span>
              </div>
              <div className="track">
                <div className="fill" style={{ width: `${(n / maxSets) * 100}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
