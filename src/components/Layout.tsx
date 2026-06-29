import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Apple,
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  Target,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Fab from './Fab'

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/macros', label: 'Macros', Icon: UtensilsCrossed },
  { to: '/planner', label: 'Planner', Icon: CalendarDays },
  { to: '/workouts', label: 'Workouts', Icon: Dumbbell },
  { to: '/foods', label: 'Foods', Icon: Apple },
  { to: '/settings', label: 'Goals', Icon: Target },
]

export default function Layout() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const color = theme === 'light' ? '#f4f6fa' : theme === 'amoled' ? '#000000' : '#0f1115'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', color)
  }, [theme])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">
            <Zap size={16} strokeWidth={2.5} fill="#fff" />
          </span>
          FitForge
        </div>
        <span className="faint" style={{ fontSize: 12 }}>
          Train · Eat · Track
        </span>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <nav className="nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            <span className="ico">
              <n.Icon size={21} strokeWidth={2} />
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <Fab />
    </div>
  )
}
