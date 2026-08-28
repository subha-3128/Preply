import { CalendarBlank, Warning } from '@phosphor-icons/react'
import { daysUntil, formatDateShort, cn } from '../lib/utils'
import type { Subject } from '../types'

interface ExamCountdownProps {
  subject: Subject
  compact?: boolean
  className?: string
}

export default function ExamCountdown({ subject, compact = false, className }: ExamCountdownProps) {
  const days = daysUntil(subject.examDate)

  const isUrgent = days <= 3 && days >= 0
  const isSoon = days <= 7 && days > 3

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs font-body', className)}>
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: subject.color || '#6366F1' }}
        />
        <span className="font-medium text-foreground truncate">{subject.name}</span>
        <span className="text-muted-foreground ml-auto whitespace-nowrap">
          {days < 0 ? 'Passed' : days === 0 ? 'Today' : `${days}d left`}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'clay-card p-4 flex items-center justify-between gap-3',
        isUrgent && 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: subject.color || '#6366F1' }}
          />
          <span className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">
            {isUrgent ? (
              <span className="text-destructive flex items-center gap-1">
                <Warning size={12} weight="fill" /> Exam Soon
              </span>
            ) : isSoon ? (
              'This Week'
            ) : (
              'Upcoming Exam'
            )}
          </span>
        </div>
        <h3 className="font-heading font-semibold text-sm text-foreground truncate">{subject.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-body">
          <CalendarBlank size={13} />
          <span>{formatDateShort(subject.examDate)}</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0 pl-2">
        {days < 0 ? (
          <span className="clay-badge clay-badge-gray">Completed</span>
        ) : (
          <div className="flex flex-col items-end">
            <span className={cn(
              'font-heading font-bold text-2xl tracking-tight leading-none',
              isUrgent ? 'text-destructive' : 'text-foreground'
            )}>
              {days}
            </span>
            <span className="text-[11px] text-muted-foreground font-body mt-0.5">
              {days === 1 ? 'day left' : 'days left'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
