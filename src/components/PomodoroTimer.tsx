import { useState, useEffect } from 'react'
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
  focus: 25 * 60, // 25 minutes
  short_break: 5 * 60, // 5 minutes
  long_break: 15 * 60, // 15 minutes
}

export default function PomodoroTimer({ isOpen, onClose, initialSubjectId }: PomodoroTimerProps) {
  const { subjects, toggleTodayWork } = useStore()

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (subjects[0]?.id ?? '')
  )
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0)
  const [showFinishedAlert, setShowFinishedAlert] = useState(false)

  // Update initial subject if prop changes
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId)
    } else if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id)
    }
  }, [initialSubjectId, subjects])

  // Timer countdown tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  // Play beep sound on complete
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.8)
    } catch {
      // AudioContext fallback
    }
  }

  const handleTimerComplete = () => {
    playChime()
    if (mode === 'focus') {
      setCompletedSessionsCount(prev => prev + 1)
      setShowFinishedAlert(true)
      // Auto-mark subject work done today if a subject is chosen
      if (selectedSubjectId) {
        toggleTodayWork(selectedSubjectId)
      }
    }
  }

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div
        className="clay-card p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Brain size={22} className="text-primary-500" />
            <h2 className="font-heading font-bold text-lg text-foreground">
              Focus Study Timer
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-clay-sm transition-colors" aria-label="Close timer">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-muted rounded-clay-sm p-1 border border-border">
          <button
            type="button"
            onClick={() => changeMode('focus')}
            className={`flex-1 py-2 text-xs font-heading font-semibold rounded-clay-sm transition-all duration-150 flex items-center justify-center gap-1.5 ${
              mode === 'focus' ? 'bg-white text-primary-600 shadow-clay-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain size={15} /> 25m Focus
          </button>
          <button
            type="button"
            onClick={() => changeMode('short_break')}
            className={`flex-1 py-2 text-xs font-heading font-semibold rounded-clay-sm transition-all duration-150 flex items-center justify-center gap-1.5 ${
              mode === 'short_break' ? 'bg-white text-accent shadow-clay-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coffee size={15} /> 5m Break
          </button>
          <button
            type="button"
            onClick={() => changeMode('long_break')}
            className={`flex-1 py-2 text-xs font-heading font-semibold rounded-clay-sm transition-all duration-150 flex items-center justify-center gap-1.5 ${
              mode === 'long_break' ? 'bg-white text-primary-600 shadow-clay-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coffee size={15} /> 15m Break
          </button>
        </div>

        {/* Subject Picker */}
        {mode === 'focus' && subjects.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">
              Select Subject to Study
            </label>
            <select
              className="clay-select text-xs"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.dailyStudyHours} hrs/day target)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Finished Session Celebration Banner */}
        {showFinishedAlert && (
          <div className="bg-accent-light border-2 border-green-300 rounded-clay-sm p-4 text-green-900 space-y-2 animate-scale-in">
            <div className="flex items-center gap-2 font-heading font-bold text-sm">
              <CheckCircle size={20} className="text-accent" />
              <span>Session Completed! 🎉</span>
            </div>
            <p className="text-xs font-body text-green-800">
              Great focus! {selectedSubject ? `"${selectedSubject.name}" work has been marked done for today.` : 'Time for a quick break!'}
            </p>
            <button
              onClick={() => changeMode('short_break')}
              className="clay-btn-accent text-xs px-3 py-1.5 flex items-center gap-1 mt-1"
            >
              Take 5m Break <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Circular Display & Timer Number */}
        <div className="text-center py-4 space-y-4">
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-muted"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={mode === 'focus' ? 'stroke-primary-500' : 'stroke-accent'}
                strokeWidth="8"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              />
            </svg>

            {/* Center Time Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
                {formattedTime}
              </span>
              <span className="text-xs text-muted-foreground font-body uppercase tracking-wider mt-1">
                {mode === 'focus' ? 'Focus' : 'Break'}
              </span>
            </div>
          </div>

          {/* Active Subject Badge */}
          {mode === 'focus' && selectedSubject && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs font-heading font-semibold text-primary-700">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
              <span>Studying: {selectedSubject.name}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={resetTimer}
            className="p-3 rounded-clay-sm bg-muted hover:bg-primary-50 text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            aria-label="Reset Timer"
          >
            <ArrowCounterClockwise size={18} />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`clay-btn-primary px-8 py-3 flex items-center justify-center gap-2 text-base font-bold ${
              isRunning ? 'bg-amber-500 border-amber-600 shadow-none' : ''
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={20} weight="fill" /> Pause
              </>
            ) : (
              <>
                <Play size={20} weight="fill" /> Start Focus
              </>
            )}
          </button>
        </div>

        {/* Footer Session Counter */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-body">
            Completed Sessions Today: <span className="font-heading font-bold text-foreground">{completedSessionsCount}</span> 🍅
          </p>
        </div>
      </div>
    </div>
  )
}
