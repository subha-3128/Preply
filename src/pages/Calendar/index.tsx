import { useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  parseISO,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { useStore } from '../../store/useStore'
import { cn, formatTime } from '../../lib/utils'
import type { StudySession } from '../../types'

function CalendarDay({
  date,
  sessions,
  isExamDay,
  isCurrentMonth,
  isSelected,
  onClick,
}: {
  date: Date
  sessions: StudySession[]
  isExamDay: boolean
  isCurrentMonth: boolean
  isSelected: boolean
  onClick: () => void
}) {
  const today = isToday(date)
  const completed = sessions.filter(s => s.status === 'completed').length
  const missed = sessions.filter(s => s.status === 'missed').length
  const planned = sessions.filter(s => s.status === 'planned').length
  const hasAny = sessions.length > 0

  const dayNum = format(date, 'd')

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative min-h-[52px] sm:min-h-[68px] p-1.5 sm:p-2 rounded-lg border text-left transition-colors cursor-pointer',
        'hover:border-zinc-300 dark:hover:border-zinc-700',
        isSelected ? 'ring-2 ring-primary border-primary bg-primary-50/30 dark:bg-primary-950/20' :
        today ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100/70 dark:bg-zinc-800/40' :
        'border-border bg-card',
        !isCurrentMonth && 'opacity-30',
        isExamDay && !today && 'border-red-200 dark:border-red-900/50 bg-red-50/20'
      )}
      aria-label={`${format(date, 'MMM d')}: ${sessions.length} sessions${isExamDay ? ', Exam day' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs font-heading font-medium',
          today ? 'font-bold text-foreground' : isExamDay ? 'text-destructive font-semibold' : 'text-foreground'
        )}>
          {dayNum}
        </span>
        {today && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </div>

      {isExamDay && (
        <div className="mt-0.5">
          <span className="clay-badge clay-badge-red text-[8px] sm:text-[9px] px-1 py-0 leading-tight">
            EXAM
          </span>
        </div>
      )}

      {hasAny && (
        <div className="flex gap-1 flex-wrap mt-1">
          {completed > 0 && (
            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 rounded px-1 py-0 font-heading">
              {completed} ✓
            </span>
          )}
          {planned > 0 && (
            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 rounded px-1 py-0 font-heading">
              {planned}
            </span>
          )}
          {missed > 0 && (
            <span className="text-[9px] bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 rounded px-1 py-0 font-heading">
              {missed} !
            </span>
          )}
        </div>
      )}
    </button>
  )
}

export default function CalendarPage() {
  const { subjects, plan } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  const sessionsByDate: Map<string, StudySession[]> = new Map()
  if (plan) {
    for (const day of plan.days) {
      sessionsByDate.set(day.date, day.sessions)
    }
  }

  const examDates = new Map<string, string[]>()
  for (const subject of subjects) {
    if (subject.examDate) {
      const existing = examDates.get(subject.examDate) ?? []
      examDates.set(subject.examDate, [...existing, subject.name])
    }
  }

  const selectedSessions = selectedDate ? (sessionsByDate.get(selectedDate) ?? []) : []
  const selectedExams = selectedDate ? (examDates.get(selectedDate) ?? []) : []

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-title">Calendar</h1>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <CaretLeft size={16} />
          </button>
          <span className="font-heading font-medium text-xs sm:text-sm px-2 min-w-[120px] text-center text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs font-body text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" /> Planned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive" /> Exam / Missed
        </span>
      </div>

      {/* Month Calendar Grid */}
      <div className="clay-card p-3 sm:p-4 overflow-hidden bg-card">
        <div className="grid grid-cols-7 mb-1.5">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-heading font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd')
            return (
              <CalendarDay
                key={dateStr}
                date={date}
                sessions={sessionsByDate.get(dateStr) ?? []}
                isExamDay={examDates.has(dateStr)}
                isCurrentMonth={isSameMonth(date, currentMonth)}
                isSelected={selectedDate === dateStr}
                onClick={() => setSelectedDate(prev => prev === dateStr ? null : dateStr)}
              />
            )
          })}
        </div>
      </div>

      {/* Selected Date Detail Drawer */}
      {selectedDate && (selectedSessions.length > 0 || selectedExams.length > 0) && (
        <div className="clay-card p-5 space-y-3 animate-slide-in-up bg-card">
          <h2 className="section-title">
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </h2>

          {selectedExams.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2 text-xs font-heading font-medium text-red-700 dark:text-red-300">
              Exam: {selectedExams.join(', ')}
            </div>
          )}

          {selectedSessions.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {selectedSessions.map(session => {
                const { getTopicById, getSubjectById } = useStore.getState()
                const topic = getTopicById(session.topicId)
                const subject = getSubjectById(session.subjectId)
                if (!topic || !subject) return null
                return (
                  <div key={session.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color || '#6366F1' }} />
                      <div className="min-w-0">
                        <p className="font-heading font-medium text-foreground truncate">{topic.name}</p>
                        <p className="text-muted-foreground font-body text-[11px] truncate">{subject.name}</p>
                      </div>
                    </div>
                    <div className="text-right text-muted-foreground font-body flex-shrink-0">
                      <span>{formatTime(session.startTime)} – {formatTime(session.endTime)}</span>
                      <span className={cn(
                        'clay-badge text-[10px] ml-2 py-0',
                        session.status === 'completed' ? 'clay-badge-green' :
                        session.status === 'missed' ? 'clay-badge-red' :
                        session.status === 'skipped' ? 'clay-badge-gray' : 'clay-badge-purple'
                      )}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-body">No study sessions allocated for this date.</p>
          )}
        </div>
      )}
    </div>
  )
}
