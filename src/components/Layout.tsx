import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Fab from './Fab'

const NAV = [
  { to: '/', label: 'Dashboard', ico: '📊', end: true },
  { to: '/macros', label: 'Macros', ico: '🍽️' },
  { to: '/planner', label: 'Planner', ico: '🗓️' },
  { to: '/workouts', label: 'Workouts', ico: '🏋️' },
  { to: '/foods', label: 'Foods', ico: '🥫' },
  { to: '/settings', label: 'Goals', ico: '🎯' },
]

export default function Layout() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">⚡</span>
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
            <span className="ico">{n.ico}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <Fab />
    </div>
  )
}
