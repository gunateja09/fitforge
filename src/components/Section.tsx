import { useState, type ReactNode } from 'react'

interface Props {
  id: string
  title: string
  icon?: ReactNode
  /** optional summary text shown on the header when collapsed */
  hint?: string
  defaultOpen?: boolean
  children: ReactNode
}

const KEY = (id: string) => `fitforge-section-${id}`

/** Collapsible dashboard group; remembers open/closed state in localStorage. */
export default function Section({ id, title, icon, hint, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(KEY(id))
    return saved === null ? defaultOpen : saved === '1'
  })

  function toggle() {
    setOpen((o) => {
      localStorage.setItem(KEY(id), o ? '0' : '1')
      return !o
    })
  }

  return (
    <section style={{ marginBottom: 14 }}>
      <button
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 4px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text)',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(90deg)' : 'none',
            color: 'var(--text-dim)',
            fontSize: 13,
          }}
        >
          ▶
        </span>
        {icon && (
          <span style={{ display: 'inline-flex', color: 'var(--accent)' }}>{icon}</span>
        )}
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{title}</span>
        {!open && hint && (
          <span className="faint" style={{ fontSize: 12, marginLeft: 'auto' }}>
            {hint}
          </span>
        )}
      </button>
      {open && <div style={{ marginTop: 4 }}>{children}</div>}
    </section>
  )
}
