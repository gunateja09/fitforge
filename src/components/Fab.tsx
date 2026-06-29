import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Plus, UtensilsCrossed } from 'lucide-react'
import LogFoodModal from './LogFoodModal'
import { todayStr } from '../lib/dates'

/** Floating quick-add button: log food or jump to workouts from any screen. */
export default function Fab() {
  const [open, setOpen] = useState(false)
  const [showFood, setShowFood] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 29 }}
          onClick={() => setOpen(false)}
        />
      )}
      <div
        style={{
          position: 'fixed',
          right: 18,
          bottom: 'calc(76px + env(safe-area-inset-bottom))',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        {open && (
          <>
            <button
              className="btn"
              style={{ boxShadow: 'var(--shadow)' }}
              onClick={() => {
                setOpen(false)
                setShowFood(true)
              }}
            >
              <UtensilsCrossed size={16} /> Quick food
            </button>
            <button
              className="btn"
              style={{ boxShadow: 'var(--shadow)' }}
              onClick={() => {
                setOpen(false)
                navigate('/workouts')
              }}
            >
              <Dumbbell size={16} /> Log workout
            </button>
          </>
        )}
        <button
          aria-label="Quick add"
          onClick={() => setOpen((o) => !o)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent), #7c5cff)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 'var(--shadow)',
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {showFood && (
        <LogFoodModal date={todayStr()} meal="snack" onClose={() => setShowFood(false)} />
      )}
    </>
  )
}
