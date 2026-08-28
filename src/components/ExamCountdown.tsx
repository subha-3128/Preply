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

  const urgencyColor =
    days <= 3  ? 'bg-red-50 border-red-200 text-red-700' :
    days <= 7  ? 'bg-warning-light border-yellow-300 text-yellow-800' :
    days <= 14 ? 'bg-primary-50 border-primary-200 text-primary-700' :
                 'bg-muted border-border text-muted-foreground'

  const dotColor =
    days <= 3  ? 'bg-red-500' :
    days <= 7  ? 'bg-yellow-500' :
    days <= 14 ? 'bg-primary-500' :
                 'bg-gray-400'

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs', className)}>
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
        <span className="font-semibold font-heading truncate">{subject.name}</span>
        <span className="text-muted-foreground ml-auto whitespace-nowrap">
          {days < 0 ? 'Exam passed' : days === 0 ? 'Today!' : `${days}d left`}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('clay-card p-4 border-2', urgencyColor, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {days <= 3 && <Warning size={14} weight="fill" className="flex-shrink-0" />}
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 font-heading">
              {days <= 3 ? 'Urgent' : 'Upcoming Exam'}
            </p>
          </div>
          <h3 className="font-heading font-semibold text-base truncate">{subject.name}</h3>
          <div className="flex items-center gap-1 mt-1 opacity-80">
            <CalendarBlank size={12} />
            <span className="text-xs font-body">{formatDateShort(subject.examDate)}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {days < 0 ? (
            <span className="text-xs font-heading font-bold">Done</span>
          ) : (
            <>
              <p className="font-heading font-bold text-2xl leading-none">{days}</p>
              <p className="text-xs font-body opacity-70 mt-0.5">{days === 1 ? 'day' : 'days'} left</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
