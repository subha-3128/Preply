import React, { useState } from 'react'
import { X, User, EnvelopeSimple, Lock, SignIn, UserPlus, SignOut, Warning, CheckCircle } from '@phosphor-icons/react'
import { registerWithEmail, loginWithEmail, logoutUser } from '../lib/firebase'
import { useStore } from '../store/useStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { firebaseUser, user: profileUser, updateUser } = useStore()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const isSignedInUser = Boolean(firebaseUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!email.trim() || !password || !name.trim()) {
          setError('Please fill in all fields.')
          setLoading(false)
          return
        }
        await registerWithEmail(email.trim(), password, name.trim())
        updateUser({ name: name.trim() })
        setSuccessMsg('Account created successfully! You are now logged in.')
      } else {
        if (!email.trim() || !password) {
          setError('Please enter your email and password.')
          setLoading(false)
          return
        }
        const user = await loginWithEmail(email.trim(), password)
        if (user?.displayName) {
          updateUser({ name: user.displayName })
        }
        setSuccessMsg('Welcome back! Logged in successfully.')
      }
      setTimeout(() => {
        onClose()
        setError(null)
        setSuccessMsg(null)
      }, 1000)
    } catch (err: any) {
      console.error('Auth error:', err)
      const code = err?.code || ''
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.')
      } else if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError(err?.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logoutUser()
      setSuccessMsg('Logged out successfully.')
      setTimeout(() => {
        onClose()
        setSuccessMsg(null)
      }, 800)
    } catch (err: any) {
      setError(err?.message || 'Logout failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="clay-card p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-scale-in bg-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">
              {isSignedInUser ? 'Account Details' : mode === 'signin' ? 'Sign In to Preply' : 'Create an Account'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* If Signed In */}
        {isSignedInUser ? (
          <div className="space-y-4">
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-heading font-bold text-sm mx-auto">
                {(firebaseUser?.displayName || profileUser.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-heading font-semibold text-sm text-foreground">
                  {firebaseUser?.displayName || profileUser.name}
                </p>
                <p className="text-xs text-muted-foreground font-body">{firebaseUser?.email}</p>
              </div>
              <span className="clay-badge clay-badge-green text-[10px]">Cloud Sync Active</span>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-2.5 text-xs font-body text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle size={15} className="text-accent flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={loading}
              className="clay-btn-danger w-full flex items-center justify-center gap-1.5"
            >
              <SignOut size={15} />
              <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            {/* Mode Switcher Segmented Tabs */}
            <div className="flex bg-muted rounded-lg p-1 mb-4 border border-border/60">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-heading font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'signin' ? 'bg-card text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <SignIn size={14} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-heading font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'signup' ? 'bg-card text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus size={14} /> Register
              </button>
            </div>

            {error && (
              <div className="mb-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-2.5 text-xs font-body text-red-700 dark:text-red-300 flex items-center gap-2">
                <Warning size={15} className="text-destructive flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-2.5 text-xs font-body text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle size={15} className="text-accent flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      className="clay-input pl-9 text-xs"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Alex Johnson"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">Email Address</label>
                <div className="relative">
                  <EnvelopeSimple size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="email"
                    className="clay-input pl-9 text-xs"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="password"
                    className="clay-input pl-9 text-xs"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="clay-btn-primary w-full flex items-center justify-center gap-1.5 mt-4"
              >
                {mode === 'signin' ? <SignIn size={15} /> : <UserPlus size={15} />}
                <span>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
