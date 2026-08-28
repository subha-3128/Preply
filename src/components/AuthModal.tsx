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
      }, 1200)
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
      }, 1000)
    } catch (err: any) {
      setError(err?.message || 'Logout failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div
        className="clay-card p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <User size={22} className="text-primary-500" />
            <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground">
              {isSignedInUser ? 'Your Account' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-clay-sm transition-colors" aria-label="Close modal">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* If Signed In */}
        {isSignedInUser ? (
          <div className="space-y-4">
            <div className="bg-primary-50 border-2 border-primary-200 rounded-clay-sm p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-heading font-bold text-xl mx-auto overflow-hidden">
                {(firebaseUser?.displayName || profileUser.name || 'U')[0].toUpperCase()}
              </div>
              <p className="font-heading font-bold text-base text-foreground">
                {firebaseUser?.displayName || profileUser.name}
              </p>
              <p className="text-xs text-muted-foreground font-body">{firebaseUser?.email}</p>
              <span className="clay-badge clay-badge-green text-[10px]">Cloud Sync Active</span>
            </div>

            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-clay-sm p-3 text-xs font-body text-green-800 flex items-center gap-2">
                <CheckCircle size={16} className="text-accent flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={loading}
              className="clay-btn-danger w-full flex items-center justify-center gap-2"
            >
              <SignOut size={16} />
              {loading ? 'Logging out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex bg-muted rounded-clay-sm p-1 mb-4 border border-border">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`flex-1 py-2 text-xs font-heading font-semibold rounded-clay-sm transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  mode === 'signin' ? 'bg-white text-primary-600 shadow-clay-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <SignIn size={14} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2 text-xs font-heading font-semibold rounded-clay-sm transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  mode === 'signup' ? 'bg-white text-primary-600 shadow-clay-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus size={14} /> Register
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-clay-sm p-3 text-xs font-body text-red-700 flex items-center gap-2">
                <Warning size={16} className="text-destructive flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-clay-sm p-3 text-xs font-body text-green-800 flex items-center gap-2">
                <CheckCircle size={16} className="text-accent flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
                    <input
                      className="clay-input pl-9"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">Email Address *</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    className="clay-input pl-9"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    className="clay-input pl-9"
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
                className="clay-btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {mode === 'signin' ? <SignIn size={16} /> : <UserPlus size={16} />}
                {loading ? (mode === 'signin' ? 'Signing in...' : 'Registering...') : (mode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
