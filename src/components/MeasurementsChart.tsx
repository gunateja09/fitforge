import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '../store/useStore'

export default function MeasurementsChart() {
  const measurements = useStore((s) => s.measurements)

  const data = useMemo(
    () =>
      [...measurements]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((m) => ({
          date: m.date.slice(5),
          waist: m.waistCm,
          chest: m.chestCm,
          arm: m.armCm,
        })),
    [measurements],
  )

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 10 }}>
        <b>Body measurements</b>
        <Link to="/settings" className="btn sm">Log →</Link>
      </div>
      {data.length < 2 ? (
        <div className="empty" style={{ padding: 16 }}>
          Log waist & chest monthly on the <Link to="/settings" style={{ color: 'var(--accent)' }}>Goals</Link> tab.
          During recomposition the scale lies — the tape measure tells the truth.
        </div>
      ) : (
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-faint)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-faint)" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elev-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                labelStyle={{ color: 'var(--text-dim)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="waist" name="Waist (cm)" stroke="var(--amber)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="chest" name="Chest (cm)" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="arm" name="Arm (cm)" stroke="var(--protein)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
