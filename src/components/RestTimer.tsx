import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'

const PRESETS = [45, 60, 90, 120]

function beep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
    osc.onended = () => ctx.close()
  } catch {
    /* audio not available */
  }
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

interface Props {
  /** preferred seconds when the user taps "start" without choosing a preset */
  defaultSeconds?: number
  /** bump `nonce` to start the timer externally (e.g. after logging a set) */
  startSignal?: { seconds: number; nonce: number }
}

/** Sticky rest countdown bar; beeps + vibrates when it hits zero. */
export default function RestTimer({ defaultSeconds = 90, startSignal }: Props) {
  const [total, setTotal] = useState(defaultSeconds)
  const [left, setLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const tick = useRef<number | null>(null)
  const lastNonce = useRef(0)

  useEffect(() => {
    if (startSignal && startSignal.nonce !== lastNonce.current) {
      lastNonce.current = startSignal.nonce
      setTotal(startSignal.seconds)
      setLeft(startSignal.seconds)
      setRunning(true)
    }
  }, [startSignal])

  useEffect(() => {
    if (!running) return
    tick.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.clearInterval(tick.current!)
          setRunning(false)
          beep()
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          return 0
        }
        return l - 1
      })
    }, 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [running])

  function start(seconds: number) {
    setTotal(seconds)
    setLeft(seconds)
    setRunning(true)
  }

  const pct = total > 0 ? ((total - left) / total) * 100 : 0
  const active = running || left > 0

  return (
    <div className="card" style={{ position: 'sticky', top: 64, zIndex: 10 }}>
      <div className="row between" style={{ marginBottom: active ? 8 : 0 }}>
        <div className="row" style={{ gap: 8 }}>
          <Timer size={18} color="var(--accent)" />
          <b>Rest timer</b>
          {active && (
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 750,
                fontSize: 18,
                color: left === 0 ? 'var(--green)' : 'var(--accent)',
              }}
            >
              {left === 0 ? 'Done!' : fmt(left)}
            </span>
          )}
        </div>
        <div className="row" style={{ gap: 6 }}>
          {active ? (
            <>
              <button className="btn sm" onClick={() => setRunning((r) => !r)}>
                {running ? 'Pause' : 'Resume'}
              </button>
              <button
                className="btn sm ghost"
                onClick={() => {
                  setRunning(false)
                  setLeft(0)
                }}
              >
                Stop
              </button>
            </>
          ) : (
            PRESETS.map((p) => (
              <button key={p} className="btn sm" onClick={() => start(p)}>
                {p}s
              </button>
            ))
          )}
        </div>
      </div>
      {active && (
        <div className="track">
          <div
            className="fill"
            style={{
              width: `${pct}%`,
              background: left === 0 ? 'var(--green)' : 'var(--accent)',
            }}
          />
        </div>
      )}
    </div>
  )
}
