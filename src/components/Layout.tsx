import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { List, User, Sun, Moon, Timer, DownloadSimple } from '@phosphor-icons/react'
import Sidebar from './Sidebar'
import AuthModal from './AuthModal'
import PomodoroTimer from './PomodoroTimer'
import PWAPrompt from './PWAPrompt'
import Logo from './Logo'
import { useStore } from '../store/useStore'
import { usePWA } from '../hooks/usePWA'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [timerModalOpen, setTimerModalOpen] = useState(false)
  const { firebaseUser, user, updateUser } = useStore()
  const { canInstall, installPWA } = usePWA()

  const isAnonymous = firebaseUser?.isAnonymous ?? true
  const isSignedIn = firebaseUser && !isAnonymous
  const isDark = user.themeMode === 'dark'

  const toggleTheme = () => {
    updateUser({ themeMode: isDark ? 'light' : 'dark' })
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open navigation menu"
              id="mobile-menu-btn"
            >
              <List size={18} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-heading font-bold text-sm text-foreground tracking-tight">Preply</span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {canInstall && (
              <button
                onClick={installPWA}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Install App"
                title="Install App"
              >
                <DownloadSimple size={15} />
              </button>
            )}

            <button
              onClick={() => setTimerModalOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open Focus Timer"
            >
              <Timer size={16} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} className="text-zinc-300" /> : <Moon size={16} className="text-zinc-600" />}
            </button>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-heading font-medium bg-muted text-foreground hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              aria-label="User Account"
            >
              <User size={13} />
              <span className="truncate max-w-[80px]">{isSignedIn ? user.name : 'Account'}</span>
            </button>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex items-center justify-end gap-2 px-8 py-3.5 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-20">
          {canInstall && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
              aria-label="Install Desktop App"
            >
              <DownloadSimple size={14} />
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={() => setTimerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
            aria-label="Focus Timer"
          >
            <Timer size={14} />
            <span>Focus Timer</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={15} className="text-zinc-300" /> : <Moon size={15} className="text-zinc-600" />}
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-subtle cursor-pointer ml-1"
          >
            <User size={13} />
            <span>{isSignedIn ? user.name : 'Sign In'}</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-5xl w-full mx-auto" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* Modals & PWA Prompts */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <PomodoroTimer isOpen={timerModalOpen} onClose={() => setTimerModalOpen(false)} />
      <PWAPrompt />
    </div>
  )
}
