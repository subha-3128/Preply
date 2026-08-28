import { addDays, format, parseISO, differenceInDays, isAfter } from 'date-fns'
import type { Subject, Topic, StudySession, GeneratedPlan, DayPlan } from '../types'
import { generateId, todayISO, addMinutesToTime } from './utils'

interface PrioritizedTopic {
  topic: Topic
  subject: Subject
  urgencyScore: number
}

const PRIORITY_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 }
const DIFFICULTY_WEIGHT: Record<string, number> = { hard: 1.5, medium: 1.2, easy: 1.0 }

export function generateStudyPlan(
  subjects: Subject[],
  userDailyStudyHours: number,
  preferredStartTime: string
): GeneratedPlan {
  const today = todayISO()
  const defaultDailyMinutes = userDailyStudyHours * 60
  const capacityMinutes = Math.floor(defaultDailyMinutes * 0.8)

  const prioritized: PrioritizedTopic[] = []

  for (const subject of subjects) {
    if (!subject.examDate) continue
    const daysLeft = differenceInDays(parseISO(subject.examDate), parseISO(today))
    if (daysLeft < 0) continue

    for (const topic of subject.topics) {
      if (topic.status === 'completed') continue

      const urgencyScore =
        (daysLeft > 0 ? 1 / daysLeft : 10) *
        PRIORITY_WEIGHT[topic.priority] *
        DIFFICULTY_WEIGHT[topic.difficulty] *
        PRIORITY_WEIGHT[subject.priority]

      prioritized.push({
        topic,
        subject,
        urgencyScore,
      })
    }
  }

  prioritized.sort((a, b) => b.urgencyScore - a.urgencyScore)

  const examDates = subjects
    .filter(s => s.examDate && differenceInDays(parseISO(s.examDate), parseISO(today)) >= 0)
    .map(s => s.examDate)
    .sort()

  if (examDates.length === 0 || prioritized.length === 0) {
    return { generatedAt: new Date().toISOString(), days: [] }
  }

  const lastExamDate = examDates[examDates.length - 1]
  const daysCount = differenceInDays(parseISO(lastExamDate), parseISO(today)) + 1

  const dayBuckets: Map<string, number> = new Map()
  for (let i = 0; i < daysCount; i++) {
    const d = format(addDays(parseISO(today), i), 'yyyy-MM-dd')
    dayBuckets.set(d, capacityMinutes)
  }

  const sessions: StudySession[] = []
  const dayTimeTrackers: Map<string, string> = new Map()

  for (const { topic, subject } of prioritized) {
    const neededMinutes = topic.estimatedMinutes || 60

    let assigned = false
    for (const [date, remaining] of dayBuckets) {
      if (subject.examDate && isAfter(parseISO(date), parseISO(subject.examDate))) continue

      if (remaining >= Math.min(neededMinutes, 60)) {
        const allocatedMinutes = Math.min(neededMinutes, remaining)
        dayBuckets.set(date, remaining - allocatedMinutes)

        const startTime = dayTimeTrackers.get(date) || preferredStartTime
        const endTime = addMinutesToTime(startTime, allocatedMinutes)
        const nextStartTime = addMinutesToTime(endTime, 15)
        dayTimeTrackers.set(date, nextStartTime)

        sessions.push({
          id: generateId(),
          topicId: topic.id,
          subjectId: subject.id,
          date,
          startTime,
          endTime,
          plannedMinutes: allocatedMinutes,
          actualMinutes: 0,
          status: 'planned',
        })

        assigned = true
        break
      }
    }

    if (!assigned) {
      let maxRemaining = 0
      let bestDate = ''
      for (const [date, remaining] of dayBuckets) {
        if (subject.examDate && isAfter(parseISO(date), parseISO(subject.examDate))) continue
        if (remaining > maxRemaining) {
          maxRemaining = remaining
          bestDate = date
        }
      }
      if (bestDate) {
        const allocatedMinutes = Math.min(topic.estimatedMinutes || 60, Math.max(maxRemaining, 30))
        const startTime = dayTimeTrackers.get(bestDate) || preferredStartTime
        const endTime = addMinutesToTime(startTime, allocatedMinutes)
        dayTimeTrackers.set(bestDate, addMinutesToTime(endTime, 15))

        sessions.push({
          id: generateId(),
          topicId: topic.id,
          subjectId: subject.id,
          date: bestDate,
          startTime,
          endTime,
          plannedMinutes: allocatedMinutes,
          actualMinutes: 0,
          status: 'planned',
        })
      }
    }
  }

  const dayMap: Map<string, StudySession[]> = new Map()
  for (const session of sessions) {
    if (!dayMap.has(session.date)) dayMap.set(session.date, [])
    dayMap.get(session.date)!.push(session)
  }

  const days: DayPlan[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySessions]) => ({
      date,
      sessions: daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      totalPlannedMinutes: daySessions.reduce((sum, s) => sum + s.plannedMinutes, 0),
    }))

  return {
    generatedAt: new Date().toISOString(),
    days,
  }
}

export function rescheduleMissedSession(
  plan: GeneratedPlan,
  sessionId: string,
  dailyStudyHours: number,
  preferredStartTime: string
): GeneratedPlan {
  const today = todayISO()
  const capacityMinutes = Math.floor(dailyStudyHours * 60 * 0.8)

  const allSessions = plan.days.flatMap(d => d.sessions)
  const missedSession = allSessions.find(s => s.id === sessionId)
  if (!missedSession) return plan

  const dayUsage: Map<string, number> = new Map()
  for (const day of plan.days) {
    if (day.date <= today) continue
    const used = day.sessions.reduce((sum, s) => sum + s.plannedMinutes, 0)
    dayUsage.set(day.date, used)
  }

  const neededMinutes = missedSession.plannedMinutes
  let targetDate = ''
  let targetStartTime = preferredStartTime

  for (const [date, used] of Array.from(dayUsage.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (used + neededMinutes <= capacityMinutes) {
      targetDate = date
      const daySessions = plan.days.find(d => d.date === date)?.sessions || []
      if (daySessions.length > 0) {
        const last = daySessions.sort((a, b) => b.endTime.localeCompare(a.endTime))[0]
        targetStartTime = addMinutesToTime(last.endTime, 15)
      }
      break
    }
  }

  if (!targetDate) {
    const lastDay = plan.days[plan.days.length - 1]?.date || today
    targetDate = format(addDays(parseISO(lastDay), 1), 'yyyy-MM-dd')
    targetStartTime = preferredStartTime
  }

  const newSession: StudySession = {
    ...missedSession,
    id: generateId(),
    date: targetDate,
    startTime: targetStartTime,
    endTime: addMinutesToTime(targetStartTime, neededMinutes),
    status: 'planned',
    actualMinutes: 0,
  }

  const updatedDays = plan.days.map(day => ({
    ...day,
    sessions: day.sessions.map(s =>
      s.id === sessionId ? { ...s, status: 'missed' as const } : s
    ),
  }))

  const targetDayExists = updatedDays.find(d => d.date === targetDate)
  if (targetDayExists) {
    const finalDays = updatedDays.map(day => {
      if (day.date !== targetDate) return day
      const sessions = [...day.sessions, newSession].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      )
      return {
        ...day,
        sessions,
        totalPlannedMinutes: sessions.reduce((sum, s) => sum + s.plannedMinutes, 0),
      }
    })
    return { ...plan, days: finalDays }
  } else {
    const newDay: DayPlan = {
      date: targetDate,
      sessions: [newSession],
      totalPlannedMinutes: newSession.plannedMinutes,
    }
    return {
      ...plan,
      days: [...updatedDays, newDay].sort((a, b) => a.date.localeCompare(b.date)),
    }
  }
}
