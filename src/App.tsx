import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SubjectsPage from './pages/Subjects'
import PlannerPage from './pages/Planner'
import CalendarPage from './pages/Calendar'
import ProgressPage from './pages/Progress'
import SettingsPage from './pages/Settings'
import { useStore } from './store/useStore'

function PageTitleHandler() {
  const location = useLocation()

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Dashboard — Preply Study Planner',
      '/subjects': 'Subject Tracker — Preply',
      '/planner': 'Study Schedule & Planner — Preply',
      '/calendar': 'Monthly Calendar — Preply',
      '/progress': 'Progress & Analytics — Preply',
      '/settings': 'Settings & Backups — Preply',
    }
    document.title = titles[location.pathname] || 'Preply — Plan. Study. Finish.'
  }, [location])

  return null
}

export default function App() {
  const initFirebase = useStore(state => state.initFirebase)
  const themeMode = useStore(state => state.user.themeMode)

  useEffect(() => {
    initFirebase()
  }, [initFirebase])

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [themeMode])

  return (
    <BrowserRouter>
      <PageTitleHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
