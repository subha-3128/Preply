import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format,
  differenceInDays,
  parseISO,
  isToday,
  isTomorrow,
  isPast,
  addMinutes,
  subDays,
} from 'date-fns'
import type { Subject, Topic, Priority, Difficulty, TopicStatus, GeneratedPlan } from '../types'

// ─── Tailwind class merger ───
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date helpers ───
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM')
  } catch {
    return dateStr
  }
}

export function daysUntil(dateStr: string): number {
  try {
    const target = parseISO(dateStr)
    return differenceInDays(target, new Date())
  } catch {
    return 0
  }
}

export function isDateToday(dateStr: string): boolean {
  try { return isToday(parseISO(dateStr)) } catch { return false }
}

export function isDateTomorrow(dateStr: string): boolean {
  try { return isTomorrow(parseISO(dateStr)) } catch { return false }
}

export function isDatePast(dateStr: string): boolean {
  try { return isPast(parseISO(dateStr)) } catch { return false }
}

export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const date = new Date(2000, 0, 1, h, m)
  const result = addMinutes(date, minutes)
  return format(result, 'HH:mm')
}

export function formatTime(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(':').map(Number)
    const date = new Date(2000, 0, 1, h, m)
    return format(date, 'hh:mm a')
  } catch {
    return timeStr
  }
}

// ─── ID generator ───
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Progress & Analytics ───
export function getAllTopics(subjects: Subject[]): Topic[] {
  return (subjects || []).flatMap(s => (s && s.topics) ? s.topics : [])
}

export function calcSubjectProgress(subject: Subject): number {
  if (!subject || !subject.topics || subject.topics.length === 0) return 0
  const validTopics = subject.topics.filter(t => Boolean(t))
  if (validTopics.length === 0) return 0
  const done = validTopics.filter(t => t?.status === 'completed').length
  return Math.round((done / validTopics.length) * 100)
}

export function calcOverallProgress(subjects: Subject[]): number {
  const topics = getAllTopics(subjects).filter(t => Boolean(t))
  if (topics.length === 0) return 0
  const done = topics.filter(t => t?.status === 'completed').length
  return Math.round((done / topics.length) * 100)
}

export function getNearestExam(subjects: Subject[]): Subject | null {
  const future = subjects
    .filter(s => s.examDate && daysUntil(s.examDate) >= 0)
    .sort((a, b) => daysUntil(a.examDate) - daysUntil(b.examDate))
  return future[0] ?? null
}

/**
 * Calculates current consecutive study streak in days
 */
export function calcStudyStreak(plan: GeneratedPlan | null): number {
  if (!plan || !plan.days) return 0

  const completedDates = new Set(
    plan.days
      .filter(d => d.sessions.some(s => s.status === 'completed'))
      .map(d => d.date)
  )

  let streak = 0
  let checkDate = new Date()

  // If today has no completed session yet, check starting from yesterday
  const todayStr = format(checkDate, 'yyyy-MM-dd')
  if (!completedDates.has(todayStr)) {
    checkDate = subDays(checkDate, 1)
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd')
    if (completedDates.has(dateStr)) {
      streak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  return streak
}

// ─── Label helpers ───
export function priorityLabel(p: Priority): string {
  return { high: '🔥 High', medium: '🟡 Medium', low: '⚪ Low' }[p]
}

export function difficultyLabel(d: Difficulty): string {
  return { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[d]
}

export function statusLabel(s: TopicStatus): string {
  return { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' }[s]
}

export function greetingText(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ─── Subject colors ───
export const SUBJECT_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706',
  '#0891B2', '#9333EA', '#16A34A', '#CA8A04',
]

export function getSubjectColor(index: number): string {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length]
}
