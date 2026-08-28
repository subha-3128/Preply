import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Lightning,
  CalendarBlank,
  Target,
  BookOpen,
  ArrowClockwise,
  Plus,
  Fire,
} from '@phosphor-icons/react'
import { useStore } from '../../store/useStore'
import {
  greetingText,
  calcOverallProgress,
  getNearestExam,
  formatTime,
  daysUntil,
  formatDateShort,
  calcStudyStreak,
} from '../../lib/utils'
import ProgressBar from '../../components/ProgressBar'
import ExamCountdown from '../../components/ExamCountdown'
import type { StudySession } from '../../types'

function SessionItem({
  session,
  onComplete,
  onSkip,
  onReschedule,
}: {
  session: StudySession
  onComplete: () => void
  onSkip: () => void
  onReschedule: () => void
}) {
  const { getTopicById, getSubjectById } = useStore()
  const topic = getTopicById(session.topicId)
  const subject = getSubjectById(session.subjectId)

  if (!topic || !subject) return null

  const isCompleted = session.status === 'completed'
  const isSkipped = session.status === 'skipped'
  const isMissed = session.status === 'missed'
  const isActive = session.status === 'planned'

  return (
    <div className={`clay-card p-3.5 flex items-center justify-between gap-3 ${isCompleted ? 'opacity-65' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={isActive ? onComplete : undefined}
          disabled={!isActive}
          className={`flex-shrink-0 transition-colors ${isActive ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
          aria-label={isActive ? `Mark ${topic.name} as complete` : undefined}
        >
          {isCompleted ? (
            <CheckCircle size={20} weight="fill" className="text-accent" />
          ) : isSkipped || isMissed ? (
            <Circle size={20} className="text-muted-foreground/50" />
          ) : (
            <Circle size={20} className="text-muted-foreground hover:text-foreground" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: subject.color || '#6366F1' }}
            />
            <p className={`font-heading font-medium text-xs sm:text-sm truncate ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {topic.name}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-body">
            <span className="truncate">{subject.name}</span>
            <span>·</span>
            <span>{formatTime(session.startTime)} – {formatTime(session.endTime)}</span>
            <span>({session.plannedMinutes}m)</span>
            {(isSkipped || isMissed) && (
              <span className={`clay-badge text-[10px] py-0 ${isMissed ? 'clay-badge-red' : 'clay-badge-gray'}`}>
                {isMissed ? 'Missed' : 'Skipped'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {isActive && (
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors font-body"
            aria-label="Skip session"
          >
            Skip
          </button>
        )}
        {isMissed && (
          <button
            onClick={onReschedule}
            className="flex items-center gap-1 text-xs font-heading font-medium text-primary hover:underline px-2 py-1"
            aria-label="Reschedule session"
          >
            <ArrowClockwise size={12} />
            Reschedule
          </button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { subjects, plan, getTodaySessions, completeSession, skipSession, rescheduleSession, generatePlan } = useStore()

  const overallProgress = calcOverallProgress(subjects)
  const nearestExam = getNearestExam(subjects)
  const todaySessions = getTodaySessions()
  const streak = calcStudyStreak(plan)
  const greeting = greetingText()

  const completedToday = todaySessions.filter(s => s.status === 'completed').length
  const totalToday = todaySessions.filter(s => s.status !== 'skipped').length
  const plannedMinutesToday = todaySessions.reduce((sum, s) => sum + s.plannedMinutes, 0)

  const upcomingExams = subjects
    .filter(s => s.examDate && daysUntil(s.examDate) >= 0 && daysUntil(s.examDate) <= 30)
    .sort((a, b) => daysUntil(a.examDate) - daysUntil(b.examDate))
    .slice(0, 4)

  const allTopicsCount = subjects.flatMap(s => s.topics).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">
            {greeting}
          </h1>
          <p className="text-muted-foreground font-body text-xs sm:text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {streak > 0 && (
          <div className="clay-card px-3 py-1.5 flex items-center gap-2 bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40">
            <Fire size={18} weight="fill" className="text-amber-500" />
            <div>
              <p className="text-[10px] font-heading font-medium text-amber-800 dark:text-amber-300">Streak</p>
              <p className="font-heading font-bold text-xs text-amber-700 dark:text-amber-400">{streak} Days</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <div className="clay-card p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <BookOpen size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading font-semibold text-base text-foreground">Welcome to Preply</h2>
            <p className="text-muted-foreground text-xs sm:text-sm font-body max-w-sm mx-auto">
              Add your subjects, exam schedules, and daily study targets to start tracking.
            </p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="clay-btn-primary mx-auto flex items-center gap-1.5"
            id="get-started-btn"
          >
            <Plus size={15} />
            Add First Subject
          </button>
        </div>
      )}

      {/* Key Metric Overview Cards */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Overall Progress Card */}
          <div className="clay-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">Overall Progress</span>
              <span className="font-heading font-bold text-foreground text-base">{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} size="sm" />
            <p className="text-[11px] text-muted-foreground font-body mt-2">
              {allTopicsCount > 0
                ? `${subjects.flatMap(s => s.topics).filter(t => t.status === 'completed').length} of ${allTopicsCount} topics done`
                : `${subjects.length} subject${subjects.length > 1 ? 's' : ''} tracked`}
            </p>
          </div>

          {/* Today's Target Card */}
          <div className="clay-card p-4">
            <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
              <Target size={14} />
              <span className="text-xs font-heading font-medium uppercase tracking-wider">Today's Target</span>
            </div>
            <p className="font-heading font-bold text-foreground text-xl">
              {totalToday > 0 ? `${completedToday}/${totalToday}` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-0.5">
              {totalToday > 0 ? `sessions · ${Math.round(plannedMinutesToday / 60 * 10) / 10}h planned` : 'No sessions today'}
            </p>
          </div>

          {/* Nearest Exam Card */}
          <div className="clay-card p-4">
            <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
              <CalendarBlank size={14} />
              <span className="text-xs font-heading font-medium uppercase tracking-wider">Nearest Exam</span>
            </div>
            {nearestExam ? (
              <>
                <p className="font-heading font-semibold text-foreground text-base truncate">{nearestExam.name}</p>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                  {daysUntil(nearestExam.examDate) === 0
                    ? 'Exam is Today!'
                    : `${daysUntil(nearestExam.examDate)} days left · ${formatDateShort(nearestExam.examDate)}`}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground font-body mt-1">No upcoming exam dates</p>
            )}
          </div>
        </div>
      )}

      {/* Today's Study Plan Section */}
      {subjects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Today's Sessions</h2>
            {plan && (
              <button
                onClick={() => navigate('/planner')}
                className="flex items-center gap-1 text-xs text-primary font-heading font-medium hover:underline"
              >
                Full Planner <ArrowRight size={13} />
              </button>
            )}
          </div>

          {!plan ? (
            <div className="clay-card p-6 text-center space-y-3">
              <p className="text-xs sm:text-sm font-body text-muted-foreground">
                Generate your study schedule to see today's allocated sessions.
              </p>
              <button
                onClick={generatePlan}
                className="clay-btn-primary mx-auto flex items-center gap-1.5"
                id="generate-plan-btn"
              >
                <Lightning size={14} weight="fill" />
                Generate Study Plan
              </button>
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="clay-card p-5 text-center">
              <p className="text-muted-foreground font-body text-xs sm:text-sm">
                No sessions scheduled for today. Rest and recharge! ✨
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(session => (
                <SessionItem
                  key={session.id}
                  session={session}
                  onComplete={() => completeSession(session.id)}
                  onSkip={() => skipSession(session.id)}
                  onReschedule={() => rescheduleSession(session.id)}
                />
              ))}
              {completedToday > 0 && completedToday === totalToday && (
                <div className="p-3 rounded-lg text-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                  <p className="font-heading font-medium text-xs text-emerald-800 dark:text-emerald-300">
                    All study sessions completed for today!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Exams Section */}
      {upcomingExams.length > 0 && (
        <div className="space-y-3">
          <h2 className="section-title">Upcoming Exams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingExams.map(subject => (
              <ExamCountdown key={subject.id} subject={subject} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
