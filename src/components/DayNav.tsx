import { isToday, prettyDay, shiftDay, todayStr } from '../lib/dates'
import type { DateStr } from '../types'

interface Props {
  date: DateStr
  onChange: (d: DateStr) => void
}

export default function DayNav({ date, onChange }: Props) {
  return (
    <div className="row" style={{ gap: 8 }}>
      <button className="icon-btn" onClick={() => onChange(shiftDay(date, -1))} aria-label="Previous day">
        ‹
      </button>
      <div style={{ minWidth: 130, textAlign: 'center', fontWeight: 650 }}>
        {isToday(date) ? 'Today' : prettyDay(date)}
      </div>
      <button className="icon-btn" onClick={() => onChange(shiftDay(date, 1))} aria-label="Next day">
        ›
      </button>
      {!isToday(date) && (
        <button className="btn sm ghost" onClick={() => onChange(todayStr())}>
          Today
        </button>
      )}
    </div>
  )
}
