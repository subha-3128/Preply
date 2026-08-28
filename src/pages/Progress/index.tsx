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
    <div className="clay-card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: subject.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-base text-foreground truncate">{subject.name}</h3>
          {subject.examDate && (
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              📅 {formatDateShort(subject.examDate)}
              {daysLeft !== null && daysLeft >= 0 && (
                <span className={cn(
                  'ml-1 font-semibold',
                  daysLeft <= 3 ? 'text-destructive' : daysLeft <= 7 ? 'text-yellow-600' : 'text-primary-600'
                )}>
                  · {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                </span>
              )}
            </p>
          )}
        </div>
        {hasTopics && (
          <span className="font-heading font-bold text-xl text-primary-600 flex-shrink-0">{progress}%</span>
        )}
      </div>

      {hasTopics ? (
        <>
          <ProgressBar value={progress} size="md" />
          <div className="flex gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} weight="fill" className="text-accent" />
              <span className="text-xs font-body text-muted-foreground">{completed} done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CircleHalf size={14} weight="fill" className="text-primary-400" />
              <span className="text-xs font-body text-muted-foreground">{inProgress} in progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle size={14} className="text-border" />
              <span className="text-xs font-body text-muted-foreground">{pending} pending</span>
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
  const inProgressTopics = allTopics.filter(t => t.status === 'in_progress').length
  const pendingTopics = allTopics.filter(t => t.status === 'not_started').length
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
        <p className="text-muted-foreground font-body text-sm mt-0.5">
          Track your overall syllabus completion and study streaks
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-clay bg-primary-50 flex items-center justify-center mx-auto">
            <ChartBar size={32} className="text-primary-500" />
          </div>
          <p className="text-muted-foreground font-body text-sm">
            Add subjects and topics to track your progress.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Overall Progress */}
            <div className="clay-card p-4 col-span-1 sm:col-span-2">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-2">Overall Progress</p>
              <div className="flex items-end gap-3 mb-2">
                <span className="font-heading font-bold text-4xl text-primary-600">{overallProgress}%</span>
                <span className="text-sm text-muted-foreground font-body pb-1">syllabus complete</span>
              </div>
              <ProgressBar value={overallProgress} size="lg" />
              <p className="text-xs text-muted-foreground font-body mt-2">
                {completedTopics} of {allTopics.length} topics
              </p>
            </div>

            {/* Study Streak */}
            <div className="clay-card p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-clay-sm bg-amber-100 flex items-center justify-center">
                  <Fire size={20} weight="fill" className="text-amber-500" />
                </div>
                <p className="text-xs font-semibold text-amber-900 font-heading uppercase tracking-wide">Daily Streak</p>
              </div>
              <p className="font-heading font-bold text-3xl text-amber-700">{streak} Days 🔥</p>
              <p className="text-xs text-amber-800 font-body mt-1">consecutive study days</p>
            </div>

            <div className="clay-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-clay-sm bg-accent-light flex items-center justify-center">
                  <CheckCircle size={18} weight="fill" className="text-accent" />
                </div>
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{completedTopics}</p>
              <p className="text-xs text-muted-foreground font-body">Topics Completed</p>
            </div>

            <div className="clay-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-clay-sm bg-primary-100 flex items-center justify-center">
                  <CircleHalf size={18} weight="fill" className="text-primary-600" />
                </div>
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{inProgressTopics}</p>
              <p className="text-xs text-muted-foreground font-body">In Progress</p>
            </div>

            <div className="clay-card p-4">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-2">Study Sessions</p>
              <p className="font-heading font-bold text-2xl text-foreground">{completedSessions}</p>
              <p className="text-xs text-muted-foreground font-body">sessions completed</p>
            </div>

            <div className="clay-card p-4">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-2">Time Studied</p>
              <p className="font-heading font-bold text-2xl text-foreground">
                {totalMinutesStudied >= 60
                  ? `${Math.round(totalMinutesStudied / 60 * 10) / 10}h`
                  : `${totalMinutesStudied}m`}
              </p>
              <p className="text-xs text-muted-foreground font-body">total study time</p>
            </div>

            <div className="clay-card p-4">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pending</p>
              <p className="font-heading font-bold text-2xl text-foreground">{pendingTopics}</p>
              <p className="text-xs text-muted-foreground font-body">topics remaining</p>
            </div>
          </div>

          <div>
            <h2 className="section-title mb-3">Subject Breakdown</h2>
            <div className="space-y-4">
              {subjects
                .sort((a, b) => calcSubjectProgress(b) - calcSubjectProgress(a))
                .map(subject => (
                  <SubjectProgressCard key={subject.id} subject={subject} />
                ))
              }
            </div>
          </div>

          {overallProgress === 100 && allTopics.length > 0 && (
            <div className="clay-card p-6 text-center bg-accent-light border-green-200 animate-bounce-soft">
              <Trophy size={40} className="text-yellow-500 mx-auto mb-2" />
              <h2 className="font-heading font-bold text-xl text-green-800">Syllabus Complete! 🎉</h2>
              <p className="text-sm text-green-700 font-body mt-1">
                You've finished all topics. Now focus on revision and you'll ace the exam!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
