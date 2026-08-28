import { NavLink, Link } from 'react-router-dom'
import {
  SquaresFour, Books, CalendarCheck, CalendarBlank, ChartBar, Gear, X,
  GraduationCap, SignIn, SignOut
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import { logoutUser } from '../lib/firebase'

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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r-2 border-border z-40',
          'flex flex-col transition-transform duration-300 ease-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ boxShadow: '4px 0 20px rgba(124,58,237,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b-2 border-border">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-clay-sm bg-primary-500 flex items-center justify-center"
                 style={{ boxShadow: '0 3px 0 0 #5B21B6' }}>
              <GraduationCap size={18} weight="fill" color="white" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground tracking-tight">Preply</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-clay-sm hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* User info & Auth button */}
        <div className="px-4 py-4 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-heading font-bold text-sm flex items-center justify-center flex-shrink-0">
                {(user.name || 'S')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-heading font-bold text-foreground truncate">
                  {user.name || 'Student'}
                </p>
                <p className="text-[11px] text-muted-foreground font-body truncate">
                  {isSignedIn ? firebaseUser.email : 'Guest Mode'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAuthClick}
            className={`w-full py-1.5 px-3 rounded-clay-sm font-heading font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
              isSignedIn
                ? 'bg-muted text-muted-foreground hover:bg-red-50 hover:text-destructive'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
            }`}
          >
            {isSignedIn ? (
              <>
                <SignOut size={14} /> Sign Out
              </>
            ) : (
              <>
                <SignIn size={14} /> Sign In / Register
              </>
            )}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
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
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-clay-sm text-sm font-heading font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-primary-500 text-white shadow-clay-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                <Icon size={18} weight="duotone" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Footer tagline */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="clay-card p-3 text-center space-y-1 bg-white/60">
            <p className="text-xs font-heading font-bold text-primary-600">Plan. Study. Finish.</p>
            <p className="text-[10px] text-muted-foreground font-body">Complete your syllabus before exam day</p>
          </div>
        </div>
      </aside>
    </>
  )
}
