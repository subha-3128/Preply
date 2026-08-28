import { useState } from 'react'
import {
  Plus, Trash, PencilSimple, CheckCircle, Clock, Books, X,
  FloppyDisk, CalendarBlank, HourglassMedium, Circle, Timer
} from '@phosphor-icons/react'
import { useStore } from '../../store/useStore'
import { priorityLabel, cn, daysUntil, formatDateShort, formatTime, todayISO } from '../../lib/utils'
import ProgressBar from '../../components/ProgressBar'
import PomodoroTimer from '../../components/PomodoroTimer'
import type { Subject, Priority } from '../../types'

// ── Add/Edit Subject Modal ──
function SubjectModal({
  isOpen,
  onClose,
  subjectToEdit,
}: {
  isOpen: boolean
  onClose: () => void
  subjectToEdit?: Subject | null
}) {
  const { addSubject, updateSubject } = useStore()
  const isEditing = Boolean(subjectToEdit)

  const [name, setName] = useState(subjectToEdit?.name || '')
  const [examDate, setExamDate] = useState(subjectToEdit?.examDate || '')
  const [examTime, setExamTime] = useState(subjectToEdit?.examTime || '10:00')
  const [dailyStudyHours, setDailyStudyHours] = useState<number>(subjectToEdit?.dailyStudyHours || 2)
  const [priority, setPriority] = useState<Priority>(subjectToEdit?.priority || 'high')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (isEditing && subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        examDate,
        examTime,
        dailyStudyHours,
        priority,
      })
    } else {
      addSubject({
        name: name.trim(),
        examDate,
        examTime,
        dailyStudyHours,
        priority,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div
        className="clay-card p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-2">
            <Books size={22} className="text-primary-500" />
            <h2 className="font-heading font-bold text-lg text-foreground">
              {isEditing ? 'Edit Subject' : 'Add Subject Tracker'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-clay-sm transition-colors" aria-label="Close modal">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">
              Subject Name *
            </label>
            <input
              className="clay-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mathematics, Physics, History"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                className="clay-input text-xs"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">
                Exam Time *
              </label>
              <input
                type="time"
                className="clay-input text-xs"
                value={examTime}
                onChange={e => setExamTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">
                Daily Study Hours *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                className="clay-input text-xs"
                value={dailyStudyHours}
                onChange={e => setDailyStudyHours(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground font-heading block mb-1">
                Priority *
              </label>
              <select
                className="clay-select text-xs"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="high">🔥 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="clay-btn-secondary text-xs px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="clay-btn-primary text-xs px-5 py-2 flex items-center gap-1.5">
              <FloppyDisk size={15} />
              {isEditing ? 'Save Changes' : 'Create Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Subject Tracker Card ──
function SubjectCard({
  subject,
  onEdit,
  onStartTimer,
}: {
  subject: Subject
  onEdit: () => void
  onStartTimer: (subjectId: string) => void
}) {
  const { deleteSubject, toggleTodayWork } = useStore()
  const today = todayISO()
  const isDoneToday = (subject.completedDates || []).includes(today)
  const daysLeft = subject.examDate ? daysUntil(subject.examDate) : null
  const totalDaysStudied = (subject.completedDates || []).length

  return (
    <div className="clay-card p-5 space-y-4 animate-fade-in flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <h3 className="font-heading font-bold text-lg text-foreground truncate">{subject.name}</h3>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn(
              'clay-badge text-xs',
              subject.priority === 'high' ? 'clay-badge-red' :
              subject.priority === 'medium' ? 'clay-badge-amber' : 'clay-badge-gray'
            )}>
              {priorityLabel(subject.priority)}
            </span>
            <button
              onClick={onEdit}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-clay-sm transition-colors"
              aria-label="Edit subject"
            >
              <PencilSimple size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete tracker for "${subject.name}"?`)) {
                  deleteSubject(subject.id)
                }
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-clay-sm transition-colors"
              aria-label="Delete subject"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        {/* Subject Details Grid */}
        <div className="bg-muted rounded-clay-sm p-3.5 space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-muted-foreground flex items-center gap-1">
              <CalendarBlank size={14} className="text-primary-500" /> Exam Date:
            </span>
            <span className="font-heading font-semibold text-foreground">
              {subject.examDate ? formatDateShort(subject.examDate) : 'Not set'}
              {daysLeft !== null && daysLeft >= 0 && (
                <span className={cn(
                  'ml-1 font-bold',
                  daysLeft <= 3 ? 'text-destructive' : daysLeft <= 7 ? 'text-yellow-600' : 'text-primary-600 font-semibold'
                )}>
                  ({daysLeft === 0 ? 'Today!' : `${daysLeft}d left`})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock size={14} className="text-primary-500" /> Exam Time:
            </span>
            <span className="font-heading font-semibold text-foreground">
              {subject.examTime ? formatTime(subject.examTime) : 'Not set'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-muted-foreground flex items-center gap-1">
              <HourglassMedium size={14} className="text-primary-500" /> Daily Target:
            </span>
            <span className="font-heading font-bold text-primary-600">
              {subject.dailyStudyHours} hrs / day
            </span>
          </div>
        </div>

        {/* Start Focus Timer Launcher Button */}
        <button
          type="button"
          onClick={() => onStartTimer(subject.id)}
          className="w-full py-2 px-3 rounded-clay-sm bg-primary-50 hover:bg-primary-100 text-primary-700 font-heading font-semibold text-xs flex items-center justify-center gap-1.5 border border-primary-200 transition-colors"
        >
          <Timer size={15} /> Start 25m Focus Timer
        </button>
      </div>

      {/* Today's Work Tracker (Yes / No) */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-heading font-semibold text-muted-foreground">
          <span>Today's Work Tracker</span>
          <span className="text-[11px] font-body text-primary-600">{totalDaysStudied} days studied total</span>
        </div>

        <button
          type="button"
          onClick={() => toggleTodayWork(subject.id)}
          className={`w-full py-3 px-4 rounded-clay-sm font-heading font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer ${
            isDoneToday
              ? 'clay-btn-accent text-white shadow-clay-sm'
              : 'bg-primary-50 text-primary-700 border-2 border-primary-300 hover:bg-primary-100 shadow-clay-sm'
          }`}
        >
          {isDoneToday ? (
            <>
              <CheckCircle size={20} weight="fill" />
              <span>Today's Work: YES (Done ✅)</span>
            </>
          ) : (
            <>
              <Circle size={20} className="text-primary-500" />
              <span>Today's Work: NO (Pending ⏳)</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function SubjectsPage() {
  const { subjects } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [timerSubjectId, setTimerSubjectId] = useState<string | null>(null)
  const [timerModalOpen, setTimerModalOpen] = useState(false)

  const handleOpenAdd = () => {
    setEditingSubject(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setModalOpen(true)
  }

  const handleStartTimer = (subjectId: string) => {
    setTimerSubjectId(subjectId)
    setTimerModalOpen(true)
  }

  const today = todayISO()
  const completedTodayCount = subjects.filter(s => (s.completedDates || []).includes(today)).length
  const completionPercentage = subjects.length > 0 ? Math.round((completedTodayCount / subjects.length) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Subject Tracker</h1>
          <p className="text-muted-foreground font-body text-sm mt-0.5">
            Track daily study completion (Yes/No) for each of your exam subjects
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="clay-btn-primary flex items-center gap-2"
          id="add-subject-btn"
        >
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {/* Today's Tracker Progress Card */}
      {subjects.length > 0 && (
        <div className="clay-card p-5 space-y-3 border-2 border-primary-200 shadow-clay-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-heading font-bold text-primary-600 uppercase tracking-wide">
                Today's Subject Completion
              </p>
              <h2 className="font-heading font-bold text-lg text-foreground mt-0.5">
                {completedTodayCount} of {subjects.length} Subject{subjects.length > 1 ? 's' : ''} Completed Today
              </h2>
            </div>
            <span className={`clay-badge text-sm font-heading font-bold px-3 py-1 ${
              completionPercentage === 100 ? 'clay-badge-green' :
              completionPercentage > 0 ? 'clay-badge-purple' : 'clay-badge-gray'
            }`}>
              {completionPercentage}% Done
            </span>
          </div>

          <ProgressBar value={completionPercentage} size="lg" />
        </div>
      )}

      {/* Subject List Grid */}
      {subjects.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-clay bg-primary-50 flex items-center justify-center mx-auto">
            <Books size={32} className="text-primary-500" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">No Subjects Added Yet</h2>
            <p className="text-muted-foreground text-sm font-body mt-1 max-w-sm mx-auto">
              Add your subjects with exam dates, times, and daily target study hours to start tracking.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="clay-btn-primary mx-auto flex items-center gap-2"
          >
            <Plus size={16} />
            Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={() => handleOpenEdit(subject)}
              onStartTimer={handleStartTimer}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <SubjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        subjectToEdit={editingSubject}
      />

      {/* Pomodoro Timer Modal */}
      <PomodoroTimer
        isOpen={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
        initialSubjectId={timerSubjectId}
      />
    </div>
  )
}
