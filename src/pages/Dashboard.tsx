import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore, useFoodMap } from '../store/useStore'
import {
  GOAL_LABELS,
  effectiveTargets,
  roundMacros,
  tdee,
  totalMacros,
} from '../lib/calc'
import { prettyDay, todayStr } from '../lib/dates'
import CalorieRing from '../components/CalorieRing'
import MacroBar from '../components/MacroBar'
import Checklist from '../components/Checklist'
import WeeklySummary from '../components/WeeklySummary'
import MeasurementsChart from '../components/MeasurementsChart'
import WaterTracker from '../components/WaterTracker'
import DailyMetrics from '../components/DailyMetrics'
import ProgressPhotos from '../components/ProgressPhotos'
import Section from '../components/Section'
import { Activity, CalendarCheck, Dumbbell, TrendingUp, UtensilsCrossed } from 'lucide-react'

export default function Dashboard() {
  const today = todayStr()
  const profile = useStore((s) => s.profile)
  const targets = useStore((s) => s.targets)
  const foodLog = useStore((s) => s.foodLog)
  const strengthLog = useStore((s) => s.strengthLog)
  const cardioLog = useStore((s) => s.cardioLog)
  const weightLog = useStore((s) => s.weightLog)
  const foods = useFoodMap()

  const target = effectiveTargets(targets, profile)
  const todayEntries = useMemo(
    () => foodLog.filter((e) => e.date === today),
    [foodLog, today],
  )
  const consumed = roundMacros(totalMacros(todayEntries, foods))

  const todayStrength = strengthLog.filter((e) => e.date === today)
  const todayCardio = cardioLog.filter((e) => e.date === today)
  const burned = todayCardio.reduce((s, e) => s + (e.kcal || 0), 0)

  const weightSeries = useMemo(
    () =>
      [...weightLog]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
        .map((w) => ({ date: w.date.slice(5), kg: w.weightKg })),
    [weightLog],
  )

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{greeting} 👋</h1>
          <span className="muted">{prettyDay(today)}</span>
        </div>
        <span className="pill">{GOAL_LABELS[profile.goal]}</span>
      </div>

      {/* ---- TODAY ---- */}
      <Section id="daily" title="Today" icon={<CalendarCheck size={17} />} defaultOpen>
        <Checklist />
        <WaterTracker />
        <DailyMetrics />
      </Section>

      {/* ---- NUTRITION ---- */}
      <Section
        id="nutrition"
        title="Nutrition"
        icon={<UtensilsCrossed size={17} />}
        defaultOpen
        hint={`${consumed.kcal}/${target.kcal} kcal · ${consumed.protein}g P`}
      >
        <div className="card">
          <div className="row between" style={{ marginBottom: 12 }}>
            <b>Today's nutrition</b>
            <Link to="/macros" className="btn sm">Open tracker →</Link>
          </div>
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

        <div className="grid cols-3">
          <div className="card stat">
            <span className="num">{consumed.kcal}</span>
            <span className="lbl">Eaten (kcal)</span>
          </div>
          <div className="card stat">
            <span className="num">{burned}</span>
            <span className="lbl">Cardio burn (kcal)</span>
          </div>
          <div className="card stat">
            <span className="num">{tdee(profile) + burned - consumed.kcal}</span>
            <span className="lbl">Net vs maintenance</span>
          </div>
        </div>
      </Section>

      {/* ---- TRAINING ---- */}
      <Section
        id="training"
        title="Training"
        icon={<Dumbbell size={17} />}
        defaultOpen
        hint={`${todayStrength.length + todayCardio.length} logged today`}
      >
        <div className="card">
          <div className="row between" style={{ marginBottom: 10 }}>
            <b>Today's training</b>
            <Link to="/workouts" className="btn sm">Open →</Link>
          </div>
          {todayStrength.length === 0 && todayCardio.length === 0 ? (
            <div className="empty" style={{ padding: 16 }}>
              Nothing logged yet. <Link to="/workouts" style={{ color: 'var(--accent)' }}>Log a workout →</Link>
            </div>
          ) : (
            <>
              {todayStrength.map((e) => (
                <div className="entry" key={e.id}>
                  <div className="grow">
                    <div className="title">🏋️ {e.exercise}</div>
                    <div className="sub">{e.sets.length} sets · {e.sets.reduce((s, x) => s + x.reps * x.weight, 0)} kg volume</div>
                  </div>
                </div>
              ))}
              {todayCardio.map((e) => (
                <div className="entry" key={e.id}>
                  <div className="grow">
                    <div className="title" style={{ textTransform: 'capitalize' }}>🏃 {e.activity}</div>
                    <div className="sub">{e.durationMin} min{e.distanceKm ? ` · ${e.distanceKm} km` : ''}{e.kcal ? ` · ~${e.kcal} kcal` : ''}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Section>

      {/* ---- BODY & PROGRESS ---- */}
      <Section id="body" title="Body & progress" icon={<TrendingUp size={17} />} defaultOpen={false}>
        <div className="card">
          <div className="row between" style={{ marginBottom: 10 }}>
            <b>Bodyweight trend</b>
            <Link to="/settings" className="btn sm">Update →</Link>
          </div>
          {weightSeries.length < 2 ? (
            <div className="empty" style={{ padding: 16 }}>
              Log your weight on the <Link to="/settings" style={{ color: 'var(--accent)' }}>Goals</Link> tab to see a trend.
            </div>
          ) : (
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={weightSeries} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-faint)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-faint)" fontSize={11} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elev-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text)',
                    }}
                    labelStyle={{ color: 'var(--text-dim)' }}
                  />
                  <Line type="monotone" dataKey="kg" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <MeasurementsChart />
        <ProgressPhotos />
      </Section>

      {/* ---- WEEKLY ---- */}
      <Section id="weekly" title="This week" icon={<Activity size={17} />} defaultOpen={false}>
        <WeeklySummary />
      </Section>
    </div>
  )
}
