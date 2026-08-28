import { useState } from 'react'
import {
  Lightning, CheckCircle, ArrowClockwise, SkipForward,
  CalendarBlank, Clock,
} from '@phosphor-icons/react'
import { useStore } from '../../store/useStore'
import { formatTime, isDateToday, isDatePast, cn } from '../../lib/utils'
import type { StudySession, DayPlan } from '../../types'
import { format, parseISO } from 'date-fns'

function SessionCard({ session, dayIsToday }: { session: StudySession; dayIsToday: boolean }) {
  const { getTopicById, getSubjectById, completeSession, skipSession, rescheduleSession } = useStore()

  const topic = getTopicById(session.topicId)
  const subject = getSubjectById(session.subjectId)

  if (!topic || !subject) return null

  const statusStyles = {
    completed: 'border-l-accent opacity-80',
    skipped:   'border-l-muted-foreground opacity-60',
    missed:    'border-l-destructive',
    planned:   'border-l-primary-400',
  }

  return (
    <div className={cn(
      'bg-white border-2 border-border rounded-clay-sm p-4 border-l-4 transition-all duration-200 hover:shadow-clay-sm',
      statusStyles[session.status]
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {session.status === 'completed' && <CheckCircle size={20} weight="fill" className="text-accent" />}
          {session.status === 'planned' && (
            <div className="w-5 h-5 rounded-full border-2 border-primary-300" />
          )}
          {session.status === 'skipped' && (
            <SkipForward size={20} className="text-muted-foreground" />
          )}
          {session.status === 'missed' && (
            <div className="w-5 h-5 rounded-full border-2 border-destructive" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
            <p className={cn('font-heading font-semibold text-sm', session.status === 'completed' && 'line-through text-muted-foreground')}>
              {topic.name}
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            {subject.name}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
              <Clock size={11} /> {formatTime(session.startTime)} – {formatTime(session.endTime)}
            </span>
            <span className="text-xs text-muted-foreground font-body">{session.plannedMinutes} min</span>
          </div>
        </div>

        {dayIsToday && session.status === 'planned' && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => completeSession(session.id)}
              className="clay-btn-accent text-xs px-2.5 py-1.5 flex items-center gap-1"
              aria-label="Mark complete"
            >
              <CheckCircle size={12} /> Done
            </button>
            <button
              onClick={() => skipSession(session.id)}
              className="clay-btn-secondary text-xs px-2 py-1.5"
              aria-label="Skip"
            >
              Skip
            </button>
          </div>
        )}
        {session.status === 'missed' && (
          <button
            onClick={() => rescheduleSession(session.id)}
            className="flex items-center gap-1 text-xs font-heading text-primary-600 hover:text-primary-800 px-2 py-1.5 rounded-clay-sm hover:bg-primary-50 transition-colors flex-shrink-0"
            aria-label="Reschedule"
          >
            <ArrowClockwise size={13} /> Reschedule
          </button>
        )}
      </div>
    </div>
  )
}

function DaySection({ day }: { day: DayPlan }) {
  const today = isDateToday(day.date)
  const past = isDatePast(day.date) && !today
  const completed = day.sessions.filter(s => s.status === 'completed').length
  const missed = day.sessions.filter(s => s.status === 'missed').length

  const dateLabel = today
    ? 'Today'
    : (() => {
        try { return format(parseISO(day.date), 'EEEE, dd MMM') } catch { return day.date }
      })()

  return (
    <div className={cn('space-y-2', past && 'opacity-75')}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-clay-sm font-heading text-sm font-bold border-2',
          today
            ? 'bg-primary-500 text-white border-primary-600'
            : 'bg-muted text-foreground border-border'
        )}>
          <CalendarBlank size={14} />
          {dateLabel}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
          <span>{day.sessions.length} topics</span>
          <span>·</span>
          <span>{Math.round(day.totalPlannedMinutes / 60 * 10) / 10}h</span>
          {completed > 0 && <span className="clay-badge clay-badge-green">{completed} done</span>}
          {missed > 0 && <span className="clay-badge clay-badge-red">{missed} missed</span>}
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="pl-2 space-y-2">
        {day.sessions.map(session => (
          <SessionCard key={session.id} session={session} dayIsToday={today} />
        ))}
      </div>
    </div>
  )
}

export default function PlannerPage() {
  const { plan, subjects, generatePlan } = useStore()
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all')

  const filteredDays = plan?.days.filter(day => {
    if (filter === 'today') return isDateToday(day.date)
    if (filter === 'upcoming') return !isDatePast(day.date) || isDateToday(day.date)
    return true
  }) ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Study Planner</h1>
          {plan && (
            <p className="text-muted-foreground font-body text-sm mt-0.5">
              Generated {new Date(plan.generatedAt).toLocaleDateString()} ·{' '}
              {plan.days.length} study days ·{' '}
              {plan.days.flatMap(d => d.sessions).length} total sessions
            </p>
          )}
        </div>
        <button
          onClick={generatePlan}
          disabled={subjects.length === 0}
          className={cn('clay-btn-primary flex items-center gap-2', subjects.length === 0 && 'opacity-50 cursor-not-allowed')}
          id="generate-plan-planner-btn"
        >
          <Lightning size={16} weight="fill" />
          {plan ? 'Regenerate Plan' : 'Generate Plan'}
        </button>
      </div>

      {!plan ? (
        <div className="clay-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-clay bg-primary-50 flex items-center justify-center mx-auto">
            <Lightning size={32} className="text-primary-500" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">No Plan Yet</h2>
            <p className="text-muted-foreground font-body text-sm mt-1 max-w-sm mx-auto">
              {subjects.length === 0
                ? 'Add subjects with exam dates first, then generate your study plan.'
                : 'Click "Generate Plan" to create your personalized study schedule.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'today', 'upcoming'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-1.5 rounded-clay-sm text-sm font-heading font-semibold transition-all duration-150',
                  filter === f
                    ? 'bg-primary-500 text-white border-2 border-primary-600'
                    : 'bg-muted text-muted-foreground border-2 border-border hover:bg-primary-50 hover:text-primary-700'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {filteredDays.length === 0 ? (
            <div className="clay-card p-8 text-center text-muted-foreground font-body text-sm">
              No sessions for the selected filter.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDays.map(day => (
                <DaySection key={day.date} day={day} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
