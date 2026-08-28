import { NavLink, useLocation } from 'react-router-dom'
import {
  House,
  Books,
  CalendarBlank,
  ChartBar,
  ListChecks,
  Gear,
  GraduationCap,
  X,
  User,
  SignIn,
} from '@phosphor-icons/react'
import { cn, calcOverallProgress } from '../lib/utils'
import { useStore } from '../store/useStore'
import ProgressBar from './ProgressBar'

const NAV_ITEMS = [
  { to: '/',          icon: House,         label: 'Dashboard' },
  { to: '/subjects',  icon: Books,         label: 'Subjects'  },
  { to: '/planner',   icon: ListChecks,    label: 'Planner'   },
  { to: '/calendar',  icon: CalendarBlank, label: 'Calendar'  },
  { to: '/progress',  icon: ChartBar,      label: 'Progress'  },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  onOpenAuth: () => void
}

export default function Sidebar({ mobileOpen, onClose, onOpenAuth }: SidebarProps) {
  const { subjects, user, firebaseUser } = useStore()
  const overallProgress = calcOverallProgress(subjects)
  const location = useLocation()

  const isAnonymous = firebaseUser?.isAnonymous ?? true
  const isSignedIn = firebaseUser && !isAnonymous

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-clay-sm bg-primary-500 flex items-center justify-center"
                 style={{ boxShadow: '0 3px 0 0 #5B21B6' }}>
              <GraduationCap size={18} weight="fill" color="white" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground tracking-tight">Preply</span>
          </div>
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
          <div className="bg-muted rounded-clay-sm px-3 py-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-body text-muted-foreground">Studying as</span>
              {isSignedIn ? (
                <span className="clay-badge clay-badge-green text-[9px] py-0">Signed In</span>
              ) : (
                <span className="clay-badge clay-badge-amber text-[9px] py-0">Guest</span>
              )}
            </div>
            <p className="font-heading font-semibold text-sm text-foreground truncate">{user.name}</p>
            {isSignedIn && (
              <p className="text-[11px] text-muted-foreground font-body truncate mt-0.5">{firebaseUser.email}</p>
            )}

            <div className="mt-2">
              <ProgressBar value={overallProgress} size="sm" />
              <p className="text-xs text-muted-foreground mt-1 font-body">{overallProgress}% syllabus complete</p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); onOpenAuth(); }}
            className="w-full flex items-center justify-center gap-2 text-xs font-heading font-semibold py-2 px-3 rounded-clay-sm bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 transition-colors"
          >
            {isSignedIn ? <User size={14} /> : <SignIn size={14} />}
            <span>{isSignedIn ? 'Account Settings' : 'Sign In / Register'}</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn('nav-link', isActive && 'active')
              }
            >
              <Icon size={19} weight={location.pathname === to || (to === '/' && location.pathname === '/') ? 'fill' : 'regular'} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings */}
        <div className="px-3 py-3 border-t border-border">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => cn('nav-link', isActive && 'active')}
          >
            <Gear size={19} />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* Tagline */}
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground font-body italic text-center">
            Plan. Study. Finish.
          </p>
        </div>
      </aside>
    </>
  )
}
