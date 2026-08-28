import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { List, User, Sun, Moon, Timer } from '@phosphor-icons/react'
import Sidebar from './Sidebar'
import AuthModal from './AuthModal'
import PomodoroTimer from './PomodoroTimer'
import { useStore } from '../store/useStore'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [timerModalOpen, setTimerModalOpen] = useState(false)
  const { firebaseUser, user, updateUser } = useStore()

  const isAnonymous = firebaseUser?.isAnonymous ?? true
  const isSignedIn = firebaseUser && !isAnonymous
  const isDark = user.themeMode === 'dark'

  const toggleTheme = () => {
    updateUser({ themeMode: isDark ? 'light' : 'dark' })
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b-2 border-border sticky top-0 z-20"
                style={{ boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-clay-sm hover:bg-muted transition-colors"
              aria-label="Open navigation menu"
              id="mobile-menu-btn"
            >
              <List size={20} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold font-heading">P</span>
              </div>
              <span className="font-heading font-bold text-base text-foreground">Preply</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerModalOpen(true)}
              className="p-2 rounded-clay-sm bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 transition-colors"
              aria-label="Open Focus Timer"
            >
              <Timer size={18} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-clay-sm bg-muted text-foreground hover:bg-primary-50 transition-colors border border-border"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-primary-600" />}
            </button>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-heading font-semibold border border-primary-200"
              aria-label="User Account"
            >
              <User size={14} />
              <span className="truncate max-w-[90px]">{isSignedIn ? user.name : 'Sign In'}</span>
            </button>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex items-center justify-end gap-3 px-8 py-4 border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setTimerModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-clay-sm bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-heading font-semibold border border-primary-200 transition-colors shadow-clay-sm cursor-pointer"
            aria-label="Focus Timer"
          >
            <Timer size={16} />
            <span>Focus Timer</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-clay-sm bg-muted hover:bg-primary-50 text-foreground text-xs font-heading font-semibold border border-border transition-colors shadow-clay-sm cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <>
                <Sun size={16} className="text-yellow-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-primary-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-clay-sm bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-heading font-semibold border border-primary-200 transition-colors shadow-clay-sm"
          >
            <User size={16} />
            <span>{isSignedIn ? `Account (${user.name})` : 'Sign In / Register'}</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <PomodoroTimer isOpen={timerModalOpen} onClose={() => setTimerModalOpen(false)} />
    </div>
  )
}
