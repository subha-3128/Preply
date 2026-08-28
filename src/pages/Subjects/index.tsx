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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="clay-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in bg-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Books size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">
              {isEditing ? 'Edit Subject Tracker' : 'New Subject Tracker'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
              Subject Name *
            </label>
            <input
              className="clay-input text-xs"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mathematics, Physics, History"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
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
              <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
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
              <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
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
              <label className="text-xs font-heading font-medium text-muted-foreground block mb-1">
                Priority *
              </label>
              <select
                className="clay-select text-xs"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-border">
            <button type="button" onClick={onClose} className="clay-btn-secondary text-xs px-3.5 py-1.5">
              Cancel
            </button>
            <button type="submit" className="clay-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5">
              <FloppyDisk size={14} />
              <span>{isEditing ? 'Save Changes' : 'Create Tracker'}</span>
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
    <div className="clay-card p-4 space-y-3.5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: subject.color || '#6366F1' }}
            />
            <h3 className="font-heading font-semibold text-sm text-foreground truncate">{subject.name}</h3>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={cn(
              'clay-badge text-[10px] py-0',
              subject.priority === 'high' ? 'clay-badge-red' :
              subject.priority === 'medium' ? 'clay-badge-amber' : 'clay-badge-gray'
            )}>
              {priorityLabel(subject.priority)}
            </span>
            <button
              onClick={onEdit}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              aria-label="Edit subject"
            >
              <PencilSimple size={14} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete tracker for "${subject.name}"?`)) {
                  deleteSubject(subject.id)
                }
              }}
              className="p-1 text-muted-foreground hover:text-destructive rounded-md transition-colors"
              aria-label="Delete subject"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>

        {/* Subject Details Grid */}
        <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5 mb-2.5 border border-border/50 text-xs font-body">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <CalendarBlank size={13} /> Exam Date:
            </span>
            <span className="font-heading font-medium text-foreground">
              {subject.examDate ? formatDateShort(subject.examDate) : 'Not set'}
              {daysLeft !== null && daysLeft >= 0 && (
                <span className={cn(
                  'ml-1 font-semibold',
                  daysLeft <= 3 ? 'text-destructive' : daysLeft <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
                )}>
                  ({daysLeft === 0 ? 'Today!' : `${daysLeft}d left`})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock size={13} /> Exam Time:
            </span>
            <span className="font-heading font-medium text-foreground">
              {subject.examTime ? formatTime(subject.examTime) : 'Not set'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <HourglassMedium size={13} /> Target:
            </span>
            <span className="font-heading font-medium text-foreground">
              {subject.dailyStudyHours}h / day
            </span>
          </div>
        </div>

        {/* Start Focus Timer Launcher */}
        <button
          type="button"
          onClick={() => onStartTimer(subject.id)}
          className="w-full py-1.5 px-3 rounded-lg bg-card hover:bg-muted text-foreground font-heading font-medium text-xs flex items-center justify-center gap-1.5 border border-border transition-colors cursor-pointer"
        >
          <Timer size={14} /> <span>Focus Timer (25m)</span>
        </button>
      </div>

      {/* Today's Work Tracker (Yes / No) */}
      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-heading text-muted-foreground">
          <span>Today's Completion</span>
          <span className="text-[11px] font-body text-muted-foreground">{totalDaysStudied} days total</span>
        </div>

        <button
          type="button"
          onClick={() => toggleTodayWork(subject.id)}
          className={cn(
            'w-full py-2 px-3 rounded-lg font-heading font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border',
            isDoneToday
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
              : 'bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted'
          )}
        >
          {isDoneToday ? (
            <>
              <CheckCircle size={16} weight="fill" className="text-accent" />
              <span>Today: Done (Yes)</span>
            </>
          ) : (
            <>
              <Circle size={16} className="text-muted-foreground" />
              <span>Today: Pending (Mark Done)</span>
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
          <p className="text-muted-foreground font-body text-xs sm:text-sm mt-0.5">
            Monitor daily study completion for all your syllabus subjects
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="clay-btn-primary flex items-center gap-1.5"
          id="add-subject-btn"
        >
          <Plus size={15} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Today's Tracker Progress Overview */}
      {subjects.length > 0 && (
        <div className="clay-card p-4 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">
                Daily Completion
              </span>
              <h2 className="font-heading font-semibold text-sm sm:text-base text-foreground mt-0.5">
                {completedTodayCount} of {subjects.length} Subject{subjects.length > 1 ? 's' : ''} Completed Today
              </h2>
            </div>
            <span className={cn(
              'clay-badge text-xs font-heading font-semibold px-2.5 py-0.5',
              completionPercentage === 100 ? 'clay-badge-green' :
              completionPercentage > 0 ? 'clay-badge-purple' : 'clay-badge-gray'
            )}>
              {completionPercentage}% Done
            </span>
          </div>

          <ProgressBar value={completionPercentage} size="md" />
        </div>
      )}

      {/* Subject List Grid */}
      {subjects.length === 0 ? (
        <div className="clay-card p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Books size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading font-semibold text-base text-foreground">No Subjects Added Yet</h2>
            <p className="text-muted-foreground text-xs sm:text-sm font-body max-w-sm mx-auto">
              Add your subjects with exam dates, times, and daily target study hours to start tracking.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="clay-btn-primary mx-auto flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add First Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
