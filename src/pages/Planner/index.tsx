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

  const isCompleted = session.status === 'completed'
  const isMissed = session.status === 'missed'

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg p-3.5 flex items-center justify-between gap-3 transition-colors',
      isCompleted && 'opacity-65 bg-muted/30',
      isMissed && 'border-red-200 dark:border-red-900/50 bg-red-50/20'
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">
          {session.status === 'completed' && <CheckCircle size={18} weight="fill" className="text-accent" />}
          {session.status === 'planned' && <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-600" />}
          {session.status === 'skipped' && <SkipForward size={18} className="text-muted-foreground/50" />}
          {session.status === 'missed' && <div className="w-4 h-4 rounded-full border border-destructive" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color || '#6366F1' }} />
            <p className={cn('font-heading font-medium text-xs sm:text-sm truncate', isCompleted && 'line-through text-muted-foreground')}>
              {topic.name}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-body">
            <span className="truncate">{subject.name}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatTime(session.startTime)} – {formatTime(session.endTime)}
            </span>
            <span>({session.plannedMinutes}m)</span>
          </div>
        </div>
      </div>

      {dayIsToday && session.status === 'planned' && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => completeSession(session.id)}
            className="clay-btn-accent text-xs px-2.5 py-1 flex items-center gap-1"
            aria-label="Mark complete"
          >
            <CheckCircle size={13} /> <span>Done</span>
          </button>
          <button
            onClick={() => skipSession(session.id)}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted font-body transition-colors"
            aria-label="Skip"
          >
            Skip
          </button>
        </div>
      )}

      {session.status === 'missed' && (
        <button
          onClick={() => rescheduleSession(session.id)}
          className="flex items-center gap-1 text-xs font-heading font-medium text-primary hover:underline px-2 py-1 flex-shrink-0"
          aria-label="Reschedule"
        >
          <ArrowClockwise size={12} /> <span>Reschedule</span>
        </button>
      )}
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
    <div className={cn('space-y-2', past && 'opacity-70')}>
      <div className="flex items-center gap-2.5">
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md font-heading text-xs font-semibold border',
          today
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent'
            : 'bg-muted text-muted-foreground border-border'
        )}>
          <CalendarBlank size={13} />
          <span>{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
          <span>{day.sessions.length} topics</span>
          <span>·</span>
          <span>{Math.round(day.totalPlannedMinutes / 60 * 10) / 10}h</span>
          {completed > 0 && <span className="clay-badge clay-badge-green text-[10px] py-0">{completed} done</span>}
          {missed > 0 && <span className="clay-badge clay-badge-red text-[10px] py-0">{missed} missed</span>}
        </div>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      <div className="space-y-1.5 pl-1 sm:pl-2">
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Study Planner</h1>
          {plan && (
            <p className="text-muted-foreground font-body text-xs sm:text-sm mt-0.5">
              Generated {new Date(plan.generatedAt).toLocaleDateString()} ·{' '}
              {plan.days.length} study days ·{' '}
              {plan.days.flatMap(d => d.sessions).length} total sessions
            </p>
          )}
        </div>
        <button
          onClick={generatePlan}
          disabled={subjects.length === 0}
          className="clay-btn-primary flex items-center gap-1.5"
          id="generate-plan-planner-btn"
        >
          <Lightning size={14} weight="fill" />
          <span>{plan ? 'Regenerate Plan' : 'Generate Plan'}</span>
        </button>
      </div>

      {!plan ? (
        <div className="clay-card p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Lightning size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading font-semibold text-base text-foreground">No Schedule Generated Yet</h2>
            <p className="text-muted-foreground font-body text-xs sm:text-sm max-w-sm mx-auto">
              {subjects.length === 0
                ? 'Add your subjects and exam dates first to calculate study timelines.'
                : 'Click "Generate Plan" to distribute your syllabus leading up to your exam dates.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Segmented Filter Pills */}
          <div className="flex bg-muted rounded-lg p-1 w-fit border border-border/60">
            {(['all', 'today', 'upcoming'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-heading font-medium transition-colors cursor-pointer capitalize',
                  filter === f
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredDays.length === 0 ? (
            <div className="clay-card p-6 text-center text-muted-foreground font-body text-xs sm:text-sm">
              No study sessions found for this filter.
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
