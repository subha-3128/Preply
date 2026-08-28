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
import { cn } from '../../lib/utils'
import type { StudySession } from '../../types'

function CalendarDay({
  date,
  sessions,
  isExamDay,
  examSubjectNames: _examSubjectNames,
  isCurrentMonth,
  onClick,
}: {
  date: Date
  sessions: StudySession[]
  isExamDay: boolean
  examSubjectNames: string[]
  isCurrentMonth: boolean
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
        'relative min-h-[56px] sm:min-h-[72px] p-1 sm:p-2 rounded-clay-sm border-2 text-left transition-all duration-150',
        'hover:shadow-clay-sm hover:border-primary-300',
        today ? 'border-primary-500 bg-primary-50' : 'border-border bg-white',
        !isCurrentMonth && 'opacity-30',
        isExamDay && !today && 'border-destructive bg-red-50',
      )}
      aria-label={`${format(date, 'MMM d')}: ${sessions.length} sessions${isExamDay ? ', Exam day' : ''}`}
    >
      <span className={cn(
        'text-xs font-heading font-bold',
        today ? 'text-primary-700' : isExamDay ? 'text-destructive' : 'text-foreground'
      )}>
        {dayNum}
      </span>
      {today && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-500" />
      )}

      {isExamDay && (
        <div className="mt-0.5">
          <span className="clay-badge clay-badge-red text-[9px] px-1 py-0 leading-tight">EXAM</span>
        </div>
      )}

      {hasAny && (
        <div className="flex gap-0.5 flex-wrap mt-1">
          {completed > 0 && (
            <span className="text-[9px] bg-accent text-white rounded px-1 py-0 font-heading leading-tight">{completed} ✓</span>
          )}
          {planned > 0 && (
            <span className="text-[9px] bg-primary-500 text-white rounded px-1 py-0 font-heading leading-tight">{planned}</span>
          )}
          {missed > 0 && (
            <span className="text-[9px] bg-destructive text-white rounded px-1 py-0 font-heading leading-tight">{missed} !</span>
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
      <div className="flex items-center justify-between">
        <h1 className="page-title">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="clay-btn-secondary p-2"
            aria-label="Previous month"
          >
            <CaretLeft size={16} />
          </button>
          <span className="font-heading font-semibold text-base px-2 min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="clay-btn-secondary p-2"
            aria-label="Next month"
          >
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap text-xs font-body text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary-500" /> Planned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-accent" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-destructive" /> Missed / Exam
        </span>
      </div>

      <div className="clay-card p-4 overflow-hidden">
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-heading font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
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
                examSubjectNames={examDates.get(dateStr) ?? []}
                isCurrentMonth={isSameMonth(date, currentMonth)}
                onClick={() => setSelectedDate(prev => prev === dateStr ? null : dateStr)}
              />
            )
          })}
        </div>
      </div>

      {selectedDate && (selectedSessions.length > 0 || selectedExams.length > 0) && (
        <div className="clay-card p-5 animate-slide-in-up">
          <h2 className="section-title mb-3">
            {format(parseISO(selectedDate), 'EEEE, dd MMM yyyy')}
          </h2>

          {selectedExams.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-clay-sm px-3 py-2 mb-3">
              <p className="text-sm font-heading font-semibold text-destructive">
                📅 Exam{selectedExams.length > 1 ? 's' : ''}: {selectedExams.join(', ')}
              </p>
            </div>
          )}

          {selectedSessions.length > 0 ? (
            <div className="space-y-2">
              {selectedSessions.map(session => {
                const { getTopicById, getSubjectById } = useStore.getState()
                const topic = getTopicById(session.topicId)
                const subject = getSubjectById(session.subjectId)
                if (!topic || !subject) return null
                return (
                  <div key={session.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-semibold text-foreground">{topic.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{subject.name}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground font-body">
                      <p>{session.startTime} – {session.endTime}</p>
                      <span className={cn(
                        'clay-badge text-[10px]',
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
            <p className="text-sm text-muted-foreground font-body">No study sessions on this day.</p>
          )}
        </div>
      )}
    </div>
  )
}
