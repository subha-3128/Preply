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
  PlusCircle,
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
    <div className={`clay-card p-4 animate-slide-in-up ${isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={isActive ? onComplete : undefined}
          disabled={!isActive}
          className={`mt-0.5 flex-shrink-0 transition-transform duration-150 ${isActive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          aria-label={isActive ? `Mark ${topic.name} as complete` : undefined}
        >
          {isCompleted ? (
            <CheckCircle size={22} weight="fill" className="text-accent" />
          ) : isSkipped || isMissed ? (
            <Circle size={22} className="text-muted-foreground" />
          ) : (
            <Circle size={22} className="text-primary-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className="inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <div className="flex-1 min-w-0">
              <p className={`font-heading font-semibold text-sm ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {topic.name}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {subject.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-body">
              {formatTime(session.startTime)} – {formatTime(session.endTime)}
            </span>
            <span className="text-xs font-body text-muted-foreground">
              {session.plannedMinutes} min
            </span>
            {(isSkipped || isMissed) && (
              <span className={`clay-badge ${isMissed ? 'clay-badge-red' : 'clay-badge-gray'}`}>
                {isMissed ? 'Missed' : 'Skipped'}
              </span>
            )}
          </div>
        </div>

        {isActive && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground font-body px-2 py-1 rounded-clay-sm hover:bg-muted transition-colors"
              aria-label="Skip session"
            >
              Skip
            </button>
          </div>
        )}
        {isMissed && (
          <button
            onClick={onReschedule}
            className="flex items-center gap-1 text-xs font-heading text-primary-600 hover:text-primary-800 px-2 py-1 rounded-clay-sm hover:bg-primary-50 transition-colors flex-shrink-0"
            aria-label="Reschedule session"
          >
            <ArrowClockwise size={13} />
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
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">
            {greeting} 👋
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {streak > 0 && (
          <div className="clay-card px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <Fire size={22} weight="fill" className="text-amber-500 animate-bounce-soft" />
            <div>
              <p className="text-xs font-heading font-semibold text-amber-900">Study Streak</p>
              <p className="font-heading font-bold text-sm text-amber-700">{streak} Day{streak > 1 ? 's' : ''} 🔥</p>
            </div>
          </div>
        )}
      </div>

      {subjects.length === 0 && (
        <div className="clay-card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-clay bg-primary-50 flex items-center justify-center mx-auto">
            <BookOpen size={32} className="text-primary-500" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">Welcome to Preply!</h2>
            <p className="text-muted-foreground text-sm font-body mt-2 max-w-sm mx-auto">
              Start by adding your subjects, exam dates, exam times, and daily study hours.
            </p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="clay-btn-primary mx-auto flex items-center gap-2"
            id="get-started-btn"
          >
            <PlusCircle size={16} />
            Add Your First Subject
          </button>
        </div>
      )}

      {subjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Overall Progress */}
          <div className="clay-card p-4 col-span-1 sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground font-heading uppercase tracking-wide">Overall Progress</p>
              <span className="font-heading font-bold text-primary-600 text-lg">{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} size="lg" />
            <p className="text-xs text-muted-foreground font-body mt-2">
              {allTopicsCount > 0
                ? `${subjects.flatMap(s => s.topics).filter(t => t.status === 'completed').length} of ${allTopicsCount} topics completed`
                : `${subjects.length} subject${subjects.length > 1 ? 's' : ''} tracked`}
            </p>
          </div>

          <div className="clay-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-clay-sm bg-primary-100 flex items-center justify-center">
                <Target size={15} className="text-primary-600" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground font-heading uppercase tracking-wide">Today</p>
            </div>
            <p className="font-heading font-bold text-foreground text-xl">
              {totalToday > 0 ? `${completedToday}/${totalToday}` : '—'}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {totalToday > 0 ? `topics · ${Math.round(plannedMinutesToday / 60 * 10) / 10}h planned` : 'No sessions today'}
            </p>
          </div>

          <div className="clay-card p-4">
            {nearestExam ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-clay-sm bg-warning-light flex items-center justify-center">
                    <CalendarBlank size={15} className="text-yellow-700" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground font-heading uppercase tracking-wide">Nearest Exam</p>
                </div>
                <p className="font-heading font-bold text-foreground text-base truncate">{nearestExam.name}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {daysUntil(nearestExam.examDate) === 0
                    ? 'Today!'
                    : `${daysUntil(nearestExam.examDate)} days · ${formatDateShort(nearestExam.examDate)}`}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-muted-foreground font-heading uppercase tracking-wide mb-2">Nearest Exam</p>
                <p className="text-sm text-muted-foreground font-body">No exams set</p>
              </>
            )}
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Today's Study Plan</h2>
            {plan && (
              <button
                onClick={() => navigate('/planner')}
                className="flex items-center gap-1 text-sm text-primary-600 font-heading font-semibold hover:underline"
              >
                Full Planner <ArrowRight size={14} />
              </button>
            )}
          </div>

          {!plan ? (
            <div className="clay-card p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-clay bg-primary-50 flex items-center justify-center mx-auto">
                <Lightning size={24} className="text-primary-500" />
              </div>
              <p className="text-sm font-body text-muted-foreground">
                Generate your study plan to see today's sessions.
              </p>
              <button
                onClick={generatePlan}
                className="clay-btn-primary mx-auto flex items-center gap-2"
                id="generate-plan-btn"
              >
                <Lightning size={16} weight="fill" />
                Generate Study Plan
              </button>
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="clay-card p-6 text-center">
              <p className="text-muted-foreground font-body text-sm">
                No sessions scheduled for today. Enjoy a rest day! 🌟
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
                <div className="clay-card p-4 text-center bg-accent-light border-green-200">
                  <p className="font-heading font-semibold text-green-800">
                    🎉 All done for today! Great work!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {upcomingExams.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Upcoming Exams</h2>
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
