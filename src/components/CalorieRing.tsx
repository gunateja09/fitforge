interface Props {
  value: number
  target: number
  size?: number
}

/** Circular calorie progress ring. */
export default function CalorieRing({ value, target, size = 150 }: Props) {
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = target > 0 ? Math.min(1, value / target) : 0
  const over = target > 0 && value > target
  const remaining = Math.round(target - value)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-elev-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? 'var(--amber)' : 'var(--accent)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.02em' }}>
          {Math.round(value)}
        </div>
        <div className="faint" style={{ fontSize: 12 }}>
          / {Math.round(target)} kcal
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            marginTop: 2,
            color: over ? 'var(--amber)' : 'var(--green)',
          }}
        >
          {over ? `${Math.abs(remaining)} over` : `${remaining} left`}
        </div>
      </div>
    </div>
  )
}
