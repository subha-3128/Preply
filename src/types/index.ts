// All TypeScript types/interfaces for Preply

export type TopicStatus = 'not_started' | 'in_progress' | 'completed'
export type Priority = 'high' | 'medium' | 'low'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type SessionStatus = 'planned' | 'completed' | 'skipped' | 'missed'

export interface User {
  name: string
  dailyStudyHours: number
  preferredStartTime: string // HH:MM
  studyDaysPerWeek?: number // 5, 6, 7
  sessionDurationMinutes?: number // 30, 45, 60, 90
  accentColor?: string
  themeMode?: 'light' | 'dark'
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  status: TopicStatus
  priority: Priority
  difficulty: Difficulty
  estimatedMinutes: number
  notes: string
  completedAt?: string // ISO date string
}

export interface Subject {
  id: string
  name: string
  examDate: string // YYYY-MM-DD
  examTime: string // HH:MM
  dailyStudyHours: number // hours per day allocated for this subject
  priority: Priority
  color: string // color hex/class
  topics: Topic[]
  completedDates?: string[] // array of YYYY-MM-DD date strings when work was completed
}

export interface StudySession {
  id: string
  topicId: string
  subjectId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  plannedMinutes: number
  actualMinutes: number
  status: SessionStatus
}

export interface DayPlan {
  date: string // YYYY-MM-DD
  sessions: StudySession[]
  totalPlannedMinutes: number
}

export interface GeneratedPlan {
  generatedAt: string
  days: DayPlan[]
}
