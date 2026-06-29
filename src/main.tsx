import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Macros from './pages/Macros'
import Planner from './pages/Planner'
import Foods from './pages/Foods'
import Workouts from './pages/Workouts'
import Settings from './pages/Settings'

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'macros', element: <Macros /> },
      { path: 'planner', element: <Planner /> },
      { path: 'foods', element: <Foods /> },
      { path: 'workouts', element: <Workouts /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
