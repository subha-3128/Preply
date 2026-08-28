import { NavLink, Link } from 'react-router-dom'
import {
  SquaresFour, Books, CalendarCheck, CalendarBlank, ChartBar, Gear, X,
  SignIn, SignOut, DownloadSimple
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import { logoutUser } from '../lib/firebase'
import { usePWA } from '../hooks/usePWA'
import Logo from './Logo'

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  onOpenAuth: () => void
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: SquaresFour },
  { name: 'Subject Tracker', path: '/subjects', icon: Books },
  { name: 'Study Planner', path: '/planner', icon: CalendarCheck },
  { name: 'Calendar', path: '/calendar', icon: CalendarBlank },
  { name: 'Progress & Analytics', path: '/progress', icon: ChartBar },
  { name: 'Settings', path: '/settings', icon: Gear },
]

export default function Sidebar({ mobileOpen, onClose, onOpenAuth }: SidebarProps) {
  const { firebaseUser, user } = useStore()
  const { canInstall, installPWA } = usePWA()
  const isAnonymous = firebaseUser?.isAnonymous ?? true
  const isSignedIn = firebaseUser && !isAnonymous

  const handleAuthClick = () => {
    if (isSignedIn) {
      logoutUser()
    } else {
      onOpenAuth()
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-60 bg-card border-r border-border z-40',
          'flex flex-col transition-transform duration-200 ease-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <Logo size={28} className="transition-transform group-hover:scale-105" />
            <span className="font-heading font-bold text-base text-foreground tracking-tight">Preply</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-heading font-medium transition-colors',
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  )
                }
              >
                <Icon size={16} weight="duotone" className="flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}

          {/* Minimalist Install App Button */}
          {canInstall && (
            <div className="pt-2">
              <button
                onClick={() => {
                  installPWA()
                  onClose()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-heading font-medium text-primary hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>Install Web App</span>
              </button>
            </div>
          )}
        </nav>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-border bg-card">
          <div className="p-2 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-heading font-semibold text-xs flex items-center justify-center flex-shrink-0">
                {(user.name || 'S')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-heading font-medium text-foreground truncate">
                  {user.name || 'Student'}
                </p>
                <p className="text-[10px] text-muted-foreground font-body truncate">
                  {isSignedIn ? 'Cloud Synced' : 'Guest'}
                </p>
              </div>
            </div>

            <button
              onClick={handleAuthClick}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors flex-shrink-0"
              title={isSignedIn ? 'Sign Out' : 'Sign In / Register'}
              aria-label={isSignedIn ? 'Sign Out' : 'Sign In / Register'}
            >
              {isSignedIn ? <SignOut size={15} /> : <SignIn size={15} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
