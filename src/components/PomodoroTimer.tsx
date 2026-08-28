import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Play, Pause, ArrowCounterClockwise, X, Coffee, Brain,
  CheckCircle, ArrowRight
} from '@phosphor-icons/react'
import { useStore } from '../store/useStore'

interface PomodoroTimerProps {
  isOpen: boolean
  onClose: () => void
  initialSubjectId?: string | null
}

type TimerMode = 'focus' | 'short_break' | 'long_break'

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
}

export default function PomodoroTimer({ isOpen, onClose, initialSubjectId }: PomodoroTimerProps) {
  const { subjects, toggleTodayWork } = useStore()

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => initialSubjectId || subjects[0]?.id || '')
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0)
  const [showFinishedAlert, setShowFinishedAlert] = useState(false)
  const selectedSubjectIdRef = useRef(selectedSubjectId)

  // Sync ref and state on change
  useEffect(() => {
    selectedSubjectIdRef.current = selectedSubjectId
  }, [selectedSubjectId])

  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } catch {
      // AudioContext fallback
    }
  }, [])

  const handleTimerComplete = useCallback(() => {
    playChime()
    if (mode === 'focus') {
      setCompletedSessionsCount(prev => prev + 1)
      setShowFinishedAlert(true)
      const currentSubId = selectedSubjectIdRef.current
      if (currentSubId) {
        toggleTodayWork(currentSubId)
      }
    }
  }, [mode, playChime, toggleTodayWork])

  // Timer countdown tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, handleTimerComplete])

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setTimeLeft(DEFAULT_DURATIONS[newMode])
    setShowFinishedAlert(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(DEFAULT_DURATIONS[mode])
    setShowFinishedAlert(false)
  }

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const totalDuration = DEFAULT_DURATIONS[mode]
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100)
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="clay-card p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-scale-in space-y-5 bg-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">
              Focus Study Timer
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors" aria-label="Close timer">
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Segmented Tabs */}
        <div className="flex bg-muted rounded-lg p-1 border border-border/60">
          <button
            type="button"
            onClick={() => changeMode('focus')}
            className={`flex-1 py-1.5 text-xs font-heading font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'focus' ? 'bg-card text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain size={14} /> 25m Focus
          </button>
          <button
            type="button"
            onClick={() => changeMode('short_break')}
            className={`flex-1 py-1.5 text-xs font-heading font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'short_break' ? 'bg-card text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coffee size={14} /> 5m Break
          </button>
          <button
            type="button"
            onClick={() => changeMode('long_break')}
            className={`flex-1 py-1.5 text-xs font-heading font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'long_break' ? 'bg-card text-foreground shadow-subtle' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coffee size={14} /> 15m Break
          </button>
        </div>

        {/* Subject Picker */}
        {mode === 'focus' && subjects.length > 0 && (
          <div>
            <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
              Subject
            </label>
            <select
              className="clay-select text-xs"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.dailyStudyHours}h target)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Session Finished Notification */}
        {showFinishedAlert && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3.5 space-y-2 animate-scale-in">
            <div className="flex items-center gap-1.5 font-heading font-semibold text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle size={16} className="text-accent" />
              <span>Session Completed!</span>
            </div>
            <p className="text-xs font-body text-emerald-700 dark:text-emerald-400">
              {selectedSubject ? `"${selectedSubject.name}" study target marked done for today.` : 'Great focus! Take a break.'}
            </p>
            <button
              onClick={() => changeMode('short_break')}
              className="clay-btn-accent text-xs px-3 py-1 flex items-center gap-1 mt-1"
            >
              Start 5m Break <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Circular Display & Timer Number */}
        <div className="text-center py-2 space-y-3">
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={mode === 'focus' ? 'stroke-indigo-500 dark:stroke-indigo-400' : 'stroke-emerald-500 dark:stroke-emerald-400'}
                strokeWidth="5"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-bold text-3xl text-foreground tracking-tight tabular-nums">
                {formattedTime}
              </span>
              <span className="text-[11px] text-muted-foreground font-body uppercase tracking-wider mt-0.5">
                {mode === 'focus' ? 'Focus' : 'Break'}
              </span>
            </div>
          </div>

          {mode === 'focus' && selectedSubject && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-xs font-heading font-medium text-muted-foreground border border-border">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
              <span>{selectedSubject.name}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          <button
            onClick={resetTimer}
            className="p-2.5 rounded-lg bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            aria-label="Reset Timer"
          >
            <ArrowCounterClockwise size={16} />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="clay-btn-primary px-6 py-2 flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {isRunning ? (
              <>
                <Pause size={16} weight="fill" /> Pause
              </>
            ) : (
              <>
                <Play size={16} weight="fill" /> Start
              </>
            )}
          </button>
        </div>

        {/* Footer Session Counter */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-body">
            Completed Today: <span className="font-heading font-semibold text-foreground">{completedSessionsCount} sessions</span>
          </p>
        </div>
      </div>
    </div>
  )
}
