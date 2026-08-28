import { useState, useRef } from 'react'
import {
  FloppyDisk, User, Clock, Cloud, CheckCircle, Warning, Database,
  SignIn, SignOut, Lightning, ArrowDown, ArrowUp, Trash, ArrowClockwise
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import AuthModal from '../../components/AuthModal'
import { logoutUser } from '../../lib/firebase'
import { formatTime } from '../../lib/utils'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, updateUser, subjects, plan, generatePlan, resetData, firebaseStatus, firebaseUser, firebaseError, manualSyncCloud } = useStore()
  const [form, setForm] = useState({ ...user })
  const [saved, setSaved] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAnonymous = firebaseUser?.isAnonymous ?? true
  const isSignedIn = firebaseUser && !isAnonymous

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    updateUser(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleManualSync = async () => {
    setSyncing(true)
    await manualSyncCloud()
    setTimeout(() => setSyncing(false), 800)
  }

  // Export JSON backup
  const handleExportData = () => {
    const backup = {
      user,
      subjects,
      plan,
      exportedAt: new Date().toISOString(),
      app: 'Preply Study Planner',
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `preply-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.subjects && Array.isArray(data.subjects)) {
          useStore.setState({
            subjects: data.subjects,
            user: { ...user, ...(data.user || {}) },
            plan: data.plan || null,
          })
          alert('Study data imported successfully!')
        } else {
          alert('Invalid backup file format.')
        }
      } catch {
        alert('Failed to parse backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-muted-foreground font-body text-xs sm:text-sm mt-0.5">
            Configure your schedule, preferences, and data options
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          className="clay-btn-primary flex items-center gap-1.5"
          id="top-save-settings-btn"
        >
          <FloppyDisk size={14} />
          <span>{saved ? 'Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Save Success Banner */}
      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-scale-in text-xs font-heading">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle size={16} className="text-accent" />
            <span>Preferences saved successfully.</span>
          </div>
          {subjects.length > 0 && (
            <button
              onClick={() => { generatePlan(); navigate('/planner'); }}
              className="clay-btn-accent text-xs px-2.5 py-1 flex items-center gap-1"
            >
              <Lightning size={12} weight="fill" /> Re-generate Plan
            </button>
          )}
        </div>
      )}

      {/* Profile & Account Card */}
      <div className="clay-card p-5 space-y-4 bg-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Profile & Account</h2>
          </div>
          <span className={`clay-badge ${isSignedIn ? 'clay-badge-green' : 'clay-badge-amber'} text-[10px]`}>
            {isSignedIn ? 'Registered' : 'Guest Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">Display Name</label>
            <input
              className="clay-input text-xs"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Alex Johnson"
            />
          </div>
          <div>
            <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">Account Email</label>
            <div className="clay-input bg-muted/40 text-xs text-muted-foreground flex items-center truncate cursor-not-allowed">
              {isSignedIn ? firebaseUser.email : 'Not signed in (Guest)'}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => isSignedIn ? logoutUser() : setAuthModalOpen(true)}
            className="clay-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
          >
            {isSignedIn ? <SignOut size={14} /> : <SignIn size={14} />}
            <span>{isSignedIn ? 'Sign Out' : 'Sign In / Register'}</span>
          </button>
        </div>
      </div>

      {/* Study Preferences Card */}
      <div className="clay-card p-5 space-y-4 bg-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Study Preferences</h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-body">Algorithm Config</span>
        </div>

        {/* Daily Hours & Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-heading font-medium text-muted-foreground">
              Daily Target Hours
            </label>
            <span className="font-heading font-bold text-foreground text-sm">
              {form.dailyStudyHours} hrs / day
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            className="w-full accent-indigo-600 h-1.5 bg-muted rounded-lg cursor-pointer"
            value={form.dailyStudyHours}
            onChange={e => setForm(f => ({ ...f, dailyStudyHours: Number(e.target.value) }))}
          />

          {/* Quick Preset Pills */}
          <div className="flex gap-1.5 pt-1 flex-wrap">
            {[2, 4, 6, 8].map(hrs => (
              <button
                key={hrs}
                type="button"
                onClick={() => setForm(f => ({ ...f, dailyStudyHours: hrs }))}
                className={`px-2.5 py-1 text-xs font-heading font-medium rounded-md border transition-colors cursor-pointer ${
                  form.dailyStudyHours === hrs
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-subtle'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                }`}
              >
                {hrs} Hours
              </button>
            ))}
          </div>
        </div>

        {/* Start Time & Target Study Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
              Preferred Daily Start Time
            </label>
            <input
              type="time"
              className="clay-input text-xs"
              value={form.preferredStartTime}
              onChange={e => setForm(f => ({ ...f, preferredStartTime: e.target.value }))}
            />
            <p className="text-[11px] text-muted-foreground font-body mt-1">
              Sessions will start around <span className="font-medium text-foreground">{formatTime(form.preferredStartTime)}</span>
            </p>
          </div>

          <div>
            <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
              Study Days Per Week
            </label>
            <select
              className="clay-select text-xs"
              value={form.studyDaysPerWeek || 7}
              onChange={e => setForm(f => ({ ...f, studyDaysPerWeek: Number(e.target.value) }))}
            >
              <option value={7}>7 Days (Everyday)</option>
              <option value={6}>6 Days (1 Rest Day)</option>
              <option value={5}>5 Days (Weekdays Only)</option>
            </select>
            <p className="text-[11px] text-muted-foreground font-body mt-1">
              Leaves room for rest in your study schedule
            </p>
          </div>
        </div>
      </div>

      {/* Database & Cloud Sync Card */}
      <div className="clay-card p-5 space-y-4 bg-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Data Storage & Backups</h2>
          </div>
          {isSignedIn && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncing}
              className="clay-btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
            >
              <ArrowClockwise size={12} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <Cloud size={18} className={firebaseStatus === 'connected' ? 'text-accent' : 'text-muted-foreground'} />
            <div>
              <p className="font-heading font-medium text-foreground">
                {firebaseStatus === 'connected' ? 'Firebase Firestore Cloud Sync' : 'Local Storage Mode'}
              </p>
              <p className="text-[11px] text-muted-foreground font-body">
                {firebaseStatus === 'connected'
                  ? `Real-time cloud backup active (UID: ${firebaseUser?.uid.slice(0, 8)}...)`
                  : 'Data is saved in your local web browser'}
              </p>
            </div>
          </div>
          <span className={`clay-badge text-[10px] ${
            firebaseStatus === 'connected' ? 'clay-badge-green' :
            firebaseStatus === 'connecting' ? 'clay-badge-amber' : 'clay-badge-gray'
          }`}>
            {firebaseStatus === 'connected' ? 'Connected' : firebaseStatus === 'connecting' ? 'Connecting...' : 'Local'}
          </span>
        </div>

        {firebaseError && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-2.5 text-xs font-body text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold flex items-center gap-1 font-heading">
              <Warning size={13} className="text-amber-600" /> Firebase Note:
            </p>
            <p>{firebaseError}</p>
          </div>
        )}

        {/* Data Backup & Restore */}
        <div className="pt-2 border-t border-border space-y-2">
          <p className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">
            Backup & Migration
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportData}
              className="clay-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <ArrowDown size={14} /> <span>Export JSON Backup</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="clay-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <ArrowUp size={14} /> <span>Import JSON Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportData}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-2 border-t border-red-100 dark:border-red-950/50 space-y-2">
          <p className="text-xs font-heading font-medium text-destructive uppercase tracking-wider">
            Danger Zone
          </p>
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-heading font-medium text-destructive hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-1.5"
            >
              <Trash size={13} /> <span>Clear All Study Data</span>
            </button>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3 space-y-2 animate-scale-in text-xs">
              <p className="text-red-800 dark:text-red-300 font-body font-medium">
                Are you sure? This will delete all tracked subjects, completed records, and schedules.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="clay-btn-secondary text-xs px-3 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { resetData(); setShowResetConfirm(false); alert('All study data cleared.'); }}
                  className="clay-btn-danger text-xs px-3 py-1 flex items-center gap-1"
                >
                  <Trash size={12} /> <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="flex justify-end pt-1">
        <button
          onClick={() => handleSave()}
          className="clay-btn-primary w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-1.5"
          id="bottom-save-settings-btn"
        >
          <FloppyDisk size={14} />
          <span>{saved ? 'Saved!' : 'Save All Preferences'}</span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
