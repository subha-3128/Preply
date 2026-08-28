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
      } catch (err) {
        alert('Failed to parse backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-muted-foreground font-body text-sm mt-0.5">
            Manage your study schedule, account, and data options
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          className="clay-btn-primary flex items-center gap-2"
          id="top-save-settings-btn"
        >
          <FloppyDisk size={16} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Save Success Banner */}
      {saved && (
        <div className="bg-accent-light border-2 border-green-300 rounded-clay-sm p-4 text-green-900 flex items-center justify-between gap-3 animate-scale-in">
          <div className="flex items-center gap-2 text-sm font-heading font-semibold">
            <CheckCircle size={20} className="text-accent" />
            <span>Settings saved successfully!</span>
          </div>
          {subjects.length > 0 && (
            <button
              onClick={() => { generatePlan(); navigate('/planner'); }}
              className="clay-btn-accent text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <Lightning size={14} weight="fill" /> Re-generate Plan
            </button>
          )}
        </div>
      )}

      {/* User Account & Profile Header Card */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <User size={20} className="text-primary-500" />
            <h2 className="font-heading font-bold text-base text-foreground">User Profile & Account</h2>
          </div>
          <span className={`clay-badge ${isSignedIn ? 'clay-badge-green' : 'clay-badge-amber'}`}>
            {isSignedIn ? 'Registered' : 'Guest Mode'}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center font-heading font-bold text-2xl flex-shrink-0 shadow-clay-sm">
            {(user.name || 'S')[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">Your Name</label>
                <input
                  className="clay-input text-sm"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">Account Email</label>
                <div className="clay-input bg-muted/60 text-xs text-muted-foreground flex items-center truncate cursor-not-allowed">
                  {isSignedIn ? firebaseUser.email : 'Not signed in (Guest)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => isSignedIn ? logoutUser() : setAuthModalOpen(true)}
            className="clay-btn-secondary text-xs px-4 py-2 flex items-center gap-2"
          >
            {isSignedIn ? <SignOut size={14} /> : <SignIn size={14} />}
            <span>{isSignedIn ? 'Sign Out of Account' : 'Sign In / Register Account'}</span>
          </button>
        </div>
      </div>

      {/* Study Preferences Card */}
      <div className="clay-card p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-primary-500" />
            <h2 className="font-heading font-bold text-base text-foreground">Study Preferences & Schedule</h2>
          </div>
          <span className="text-xs text-muted-foreground font-body">Algorithm Config</span>
        </div>

        {/* Daily Hours & Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground font-heading block">
              Daily Target Study Hours
            </label>
            <span className="font-heading font-bold text-primary-600 text-lg">
              {form.dailyStudyHours} hrs / day
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              className="flex-1 accent-primary-500 h-2 bg-muted rounded-lg cursor-pointer"
              value={form.dailyStudyHours}
              onChange={e => setForm(f => ({ ...f, dailyStudyHours: Number(e.target.value) }))}
            />
          </div>

          {/* Quick Preset Pills */}
          <div className="flex gap-2 pt-1 flex-wrap">
            {[2, 4, 6, 8].map(hrs => (
              <button
                key={hrs}
                type="button"
                onClick={() => setForm(f => ({ ...f, dailyStudyHours: hrs }))}
                className={`px-3 py-1 text-xs font-heading font-semibold rounded-clay-sm border transition-all duration-150 ${
                  form.dailyStudyHours === hrs
                    ? 'bg-primary-500 text-white border-primary-600 shadow-clay-sm'
                    : 'bg-white text-muted-foreground border-border hover:bg-primary-50'
                }`}
              >
                {hrs} Hours
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Start Time & Days Per Week */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1.5">
              Preferred Daily Start Time
            </label>
            <input
              type="time"
              className="clay-input"
              value={form.preferredStartTime}
              onChange={e => setForm(f => ({ ...f, preferredStartTime: e.target.value }))}
            />
            <p className="text-[11px] text-muted-foreground font-body mt-1">
              Sessions will start around <span className="font-semibold">{formatTime(form.preferredStartTime)}</span>
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1.5">
              Target Study Days / Week
            </label>
            <select
              className="clay-select"
              value={form.studyDaysPerWeek || 7}
              onChange={e => setForm(f => ({ ...f, studyDaysPerWeek: Number(e.target.value) }))}
            >
              <option value={7}>7 Days (Everyday)</option>
              <option value={6}>6 Days (1 Rest Day)</option>
              <option value={5}>5 Days (Weekdays Only)</option>
            </select>
            <p className="text-[11px] text-muted-foreground font-body mt-1">
              Allocates rest days in your study schedule
            </p>
          </div>
        </div>
      </div>

      {/* Database & Cloud Sync Options Card */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-primary-500" />
            <h2 className="font-heading font-bold text-base text-foreground">Database Storage & Backup</h2>
          </div>
          {isSignedIn && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncing}
              className="clay-btn-secondary text-xs px-3 py-1 flex items-center gap-1.5 min-h-[36px]"
            >
              <ArrowClockwise size={14} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Cloud Data Now'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-clay-sm bg-muted border border-border flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Cloud size={22} className={firebaseStatus === 'connected' ? 'text-accent' : 'text-muted-foreground'} />
            <div>
              <p className="text-sm font-heading font-semibold text-foreground">
                {firebaseStatus === 'connected' ? 'Firebase Firestore Cloud Sync' : 'Local Storage Mode'}
              </p>
              <p className="text-xs text-muted-foreground font-body">
                {firebaseStatus === 'connected'
                  ? `Synced in real-time to cloud database (UID: ${firebaseUser?.uid.slice(0, 8)}...)`
                  : 'Saved locally in your web browser'}
              </p>
            </div>
          </div>
          <span className={`clay-badge ${
            firebaseStatus === 'connected' ? 'clay-badge-green' :
            firebaseStatus === 'connecting' ? 'clay-badge-amber' : 'clay-badge-gray'
          }`}>
            {firebaseStatus === 'connected' ? (
              <span className="flex items-center gap-1"><CheckCircle size={12} /> Connected</span>
            ) : firebaseStatus === 'connecting' ? (
              'Connecting...'
            ) : (
              'Local Storage'
            )}
          </span>
        </div>

        {firebaseError && (
          <div className="bg-warning-light/60 border border-yellow-300 rounded-clay-sm p-3 text-xs font-body text-yellow-900 space-y-1">
            <p className="font-semibold flex items-center gap-1 font-heading">
              <Warning size={14} className="text-yellow-700" /> Action Required in Firebase Console:
            </p>
            <p>{firebaseError}</p>
          </div>
        )}

        {/* Data Backup & Restore Actions */}
        <div className="pt-2 border-t border-border space-y-3">
          <p className="text-xs font-semibold text-muted-foreground font-heading uppercase tracking-wide">
            Data Backup & Migration
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleExportData}
              className="clay-btn-secondary text-xs px-4 py-2 flex items-center gap-2"
            >
              <ArrowDown size={15} /> Export Backup (JSON)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="clay-btn-secondary text-xs px-4 py-2 flex items-center gap-2"
            >
              <ArrowUp size={15} /> Import Backup (JSON)
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

        {/* Danger Zone: Reset Data */}
        <div className="pt-3 border-t border-red-100 space-y-2">
          <p className="text-xs font-semibold text-destructive font-heading uppercase tracking-wide">
            Danger Zone
          </p>
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-heading font-semibold text-destructive hover:bg-red-50 px-3 py-2 rounded-clay-sm border border-red-200 transition-colors flex items-center gap-1.5"
            >
              <Trash size={14} /> Clear All Study Data
            </button>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-clay-sm p-3 space-y-2 animate-scale-in">
              <p className="text-xs text-red-800 font-body font-semibold">
                Are you sure? This will permanently delete all tracked subjects, topics, and study plans.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="clay-btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { resetData(); setShowResetConfirm(false); alert('All study data cleared.'); }}
                  className="clay-btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Trash size={13} /> Yes, Delete Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => handleSave()}
          className="clay-btn-primary w-full sm:w-auto px-8 flex items-center justify-center gap-2"
          id="bottom-save-settings-btn"
        >
          <FloppyDisk size={16} />
          {saved ? 'Saved!' : 'Save All Preferences'}
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
