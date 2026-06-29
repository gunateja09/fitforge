interface Props {
  name: string
  value: number
  target: number
  unit?: string
  color: string
}

export default function MacroBar({ name, value, target, unit = 'g', color }: Props) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  const over = target > 0 && value > target
  return (
    <div className="macro-bar">
      <div className="head">
        <span className="name">{name}</span>
        <span className="muted">
          {Math.round(value)}
          <span className="faint"> / {Math.round(target)} {unit}</span>
        </span>
      </div>
      <div className="track">
        <div
          className="fill"
          style={{
            width: `${pct}%`,
            background: over ? 'var(--amber)' : color,
          }}
        />
      </div>
    </div>
  )
}
