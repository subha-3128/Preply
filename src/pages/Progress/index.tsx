import { ChartBar, CheckCircle, Circle, CircleHalf, Trophy, Fire } from '@phosphor-icons/react'
import { useStore } from '../../store/useStore'
import {
  calcOverallProgress,
  calcSubjectProgress,
  getAllTopics,
  daysUntil,
  formatDateShort,
  calcStudyStreak,
  cn,
} from '../../lib/utils'
import ProgressBar from '../../components/ProgressBar'
import type { Subject } from '../../types'

function SubjectProgressCard({ subject }: { subject: Subject }) {
  const progress = calcSubjectProgress(subject)
  const topics = subject.topics
  const completed = topics.filter(t => t.status === 'completed').length
  const inProgress = topics.filter(t => t.status === 'in_progress').length
  const pending = topics.filter(t => t.status === 'not_started').length
  const daysLeft = subject.examDate ? daysUntil(subject.examDate) : null
  const hasTopics = topics.length > 0

  return (
    <div className="clay-card p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: subject.color || '#6366F1' }}
          />
          <div className="min-w-0">
            <h3 className="font-heading font-semibold text-sm text-foreground truncate">{subject.name}</h3>
            {subject.examDate && (
              <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                Exam: {formatDateShort(subject.examDate)}
                {daysLeft !== null && daysLeft >= 0 && (
                  <span className={cn(
                    'ml-1 font-semibold',
                    daysLeft <= 3 ? 'text-destructive' : daysLeft <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
                  )}>
                    · {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        {hasTopics && (
          <span className="font-heading font-bold text-base text-foreground flex-shrink-0">{progress}%</span>
        )}
      </div>

      {hasTopics ? (
        <>
          <ProgressBar value={progress} size="sm" />
          <div className="flex gap-3 text-xs font-body text-muted-foreground flex-wrap pt-0.5">
            <div className="flex items-center gap-1">
              <CheckCircle size={13} weight="fill" className="text-accent" />
              <span>{completed} done</span>
            </div>
            <div className="flex items-center gap-1">
              <CircleHalf size={13} weight="fill" className="text-indigo-400" />
              <span>{inProgress} in progress</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle size={13} className="text-border" />
              <span>{pending} pending</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground font-body italic">No topics added to this subject yet.</p>
      )}
    </div>
  )
}

export default function ProgressPage() {
  const { subjects, plan } = useStore()

  const allTopics = getAllTopics(subjects)
  const completedTopics = allTopics.filter(t => t.status === 'completed').length
  const overallProgress = calcOverallProgress(subjects)
  const streak = calcStudyStreak(plan)

  const allSessions = plan?.days.flatMap(d => d.sessions) ?? []
  const completedSessions = allSessions.filter(s => s.status === 'completed').length
  const totalMinutesStudied = allSessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.plannedMinutes, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Progress & Analytics</h1>
        <p className="text-muted-foreground font-body text-xs sm:text-sm mt-0.5">
          Overview of syllabus coverage, session completions, and consistency
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="clay-card p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <ChartBar size={24} />
          </div>
          <p className="text-muted-foreground font-body text-xs sm:text-sm">
            Add subjects and syllabus items to generate analytics.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Overall Progress Card */}
            <div className="clay-card p-4 col-span-1 sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">Overall Syllabus Progress</span>
                <span className="font-heading font-bold text-2xl text-foreground">{overallProgress}%</span>
              </div>
              <ProgressBar value={overallProgress} size="md" />
              <p className="text-[11px] text-muted-foreground font-body">
                {completedTopics} of {allTopics.length} topics finished across all subjects
              </p>
            </div>

            {/* Study Streak Card */}
            <div className="clay-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-heading font-medium uppercase tracking-wider">Daily Streak</span>
                <Fire size={16} className="text-amber-500" />
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{streak} Days</p>
              <p className="text-[11px] text-muted-foreground font-body">consecutive study days</p>
            </div>

            {/* Completed Sessions */}
            <div className="clay-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-heading font-medium uppercase tracking-wider">Total Study Time</span>
                <CheckCircle size={16} className="text-accent" />
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">
                {totalMinutesStudied >= 60
                  ? `${Math.round(totalMinutesStudied / 60 * 10) / 10}h`
                  : `${totalMinutesStudied}m`}
              </p>
              <p className="text-[11px] text-muted-foreground font-body">{completedSessions} sessions finished</p>
            </div>
          </div>

          {/* Subject Breakdown List */}
          <div className="space-y-3">
            <h2 className="section-title">Subject Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjects
                .slice()
                .sort((a, b) => calcSubjectProgress(b) - calcSubjectProgress(a))
                .map(subject => (
                  <SubjectProgressCard key={subject.id} subject={subject} />
                ))
              }
            </div>
          </div>

          {/* Completion Milestone Card */}
          {overallProgress === 100 && allTopics.length > 0 && (
            <div className="clay-card p-6 text-center bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 space-y-2">
              <Trophy size={32} className="text-amber-500 mx-auto" />
              <h2 className="font-heading font-semibold text-base text-emerald-900 dark:text-emerald-200">Syllabus Complete!</h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-body max-w-sm mx-auto">
                You've completed all topics across your subjects. Focus on revision and mock tests.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
