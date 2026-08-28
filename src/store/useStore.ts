import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject, Topic, TopicStatus, User, GeneratedPlan, StudySession } from '../types'
import { generateId, getSubjectColor } from '../lib/utils'
import { generateStudyPlan, rescheduleMissedSession } from '../lib/planner'
import {
  isFirebaseConfigured,
  initAuth,
  syncUserToFirestore,
  syncSubjectsToFirestore,
  syncPlanToFirestore,
  subscribeToFirebaseData,
} from '../lib/firebase'
import type { User as FirebaseUser } from 'firebase/auth'

interface PreplyState {
  // ── Data ──
  user: User
  subjects: Subject[]
  plan: GeneratedPlan | null

  // ── Firebase status ──
  firebaseUser: FirebaseUser | null
  firebaseStatus: 'configured' | 'unconfigured' | 'connecting' | 'connected'
  firebaseError: string | null
  initFirebase: () => void

  // ── User ──
  updateUser: (user: Partial<User>) => void

  // ── Subjects ──
  addSubject: (data: Omit<Subject, 'id' | 'topics' | 'color'>) => void
  updateSubject: (id: string, data: Partial<Omit<Subject, 'id' | 'topics'>>) => void
  deleteSubject: (id: string) => void
  toggleTodayWork: (subjectId: string) => void

  // ── Topics ──
  addTopic: (subjectId: string, data: Omit<Topic, 'id' | 'subjectId'>) => void
  updateTopic: (subjectId: string, topicId: string, data: Partial<Omit<Topic, 'id' | 'subjectId'>>) => void
  deleteTopic: (subjectId: string, topicId: string) => void
  cycleTopicStatus: (subjectId: string, topicId: string) => void

  // ── Plan ──
  generatePlan: () => void
  completeSession: (sessionId: string) => void
  skipSession: (sessionId: string) => void
  rescheduleSession: (sessionId: string) => void

  // ── Data management ──
  resetData: () => void

  // ── Computed helpers ──
  getTodaySessions: () => StudySession[]
  getTopicById: (topicId: string) => Topic | undefined
  getSubjectById: (subjectId: string) => Subject | undefined
}

// Active subscription cleaner
let activeUnsubscribe: (() => void) | null = null

// Helper to trigger cloud sync if authenticated
function triggerFirebaseSync(get: () => PreplyState) {
  const { firebaseUser, user, subjects, plan } = get()
  if (firebaseUser) {
    syncUserToFirestore(firebaseUser.uid, user)
    syncSubjectsToFirestore(firebaseUser.uid, subjects)
    syncPlanToFirestore(firebaseUser.uid, plan)
  }
}

export const useStore = create<PreplyState>()(
  persist(
    (set, get) => ({
      user: {
        name: 'Student',
        dailyStudyHours: 4,
        preferredStartTime: '09:00',
        studyDaysPerWeek: 7,
        sessionDurationMinutes: 60,
      },

      subjects: [],
      plan: null,

      firebaseUser: null,
      firebaseStatus: isFirebaseConfigured() ? 'connecting' : 'unconfigured',
      firebaseError: null,

      initFirebase: () => {
        if (!isFirebaseConfigured()) {
          set({ firebaseStatus: 'unconfigured', firebaseError: null })
          return
        }

        initAuth((fbUser, errorMsg) => {
          // Unsubscribe from previous listener if user changed
          if (activeUnsubscribe) {
            activeUnsubscribe()
            activeUnsubscribe = null
          }

          if (fbUser) {
            set({ firebaseUser: fbUser, firebaseStatus: 'connected', firebaseError: null })

            // Subscribe to Firestore cloud data
            activeUnsubscribe = subscribeToFirebaseData(
              fbUser.uid,
              (cloudData) => {
                const current = get()
                set({
                  user: cloudData.user ? { ...current.user, ...cloudData.user } : current.user,
                  subjects: cloudData.subjects !== undefined ? cloudData.subjects : current.subjects,
                  plan: cloudData.plan !== undefined ? cloudData.plan : current.plan,
                })
              },
              () => {
                // If cloud document is completely empty, push local state to Firestore once
                const { subjects } = get()
                if (subjects.length > 0) {
                  triggerFirebaseSync(get)
                }
              }
            )
          } else {
            set({ firebaseUser: null, firebaseStatus: 'configured', firebaseError: errorMsg || null })
          }
        })
      },

      // ── User ──
      updateUser: (userData) => {
        set(state => ({ user: { ...state.user, ...userData } }))
        triggerFirebaseSync(get)
      },

      // ── Subjects ──
      addSubject: (data) => {
        set(state => ({
          subjects: [
            ...state.subjects,
            {
              ...data,
              id: generateId(),
              topics: [],
              color: getSubjectColor(state.subjects.length),
            },
          ],
        }))
        triggerFirebaseSync(get)
      },

      updateSubject: (id, data) => {
        set(state => ({
          subjects: state.subjects.map(s => s.id === id ? { ...s, ...data } : s),
        }))
        triggerFirebaseSync(get)
      },

      deleteSubject: (id) => {
        set(state => ({
          subjects: state.subjects.filter(s => s.id !== id),
          plan: null,
        }))
        triggerFirebaseSync(get)
      },

      toggleTodayWork: (subjectId) => {
        const today = new Date().toISOString().split('T')[0]
        set(state => ({
          subjects: state.subjects.map(s => {
            if (s.id !== subjectId) return s
            const dates = s.completedDates || []
            const exists = dates.includes(today)
            const updated = exists
              ? dates.filter(d => d !== today)
              : [...dates, today]
            return { ...s, completedDates: updated }
          })
        }))
        triggerFirebaseSync(get)
      },

      // ── Topics ──
      addTopic: (subjectId, data) => {
        set(state => ({
          subjects: state.subjects.map(s =>
            s.id !== subjectId ? s : {
              ...s,
              topics: [
                ...s.topics,
                { ...data, id: generateId(), subjectId },
              ],
            }
          ),
        }))
        triggerFirebaseSync(get)
      },

      updateTopic: (subjectId, topicId, data) => {
        set(state => ({
          subjects: state.subjects.map(s =>
            s.id !== subjectId ? s : {
              ...s,
              topics: s.topics.map(t => t.id === topicId ? { ...t, ...data } : t),
            }
          ),
        }))
        triggerFirebaseSync(get)
      },

      deleteTopic: (subjectId, topicId) => {
        set(state => ({
          subjects: state.subjects.map(s =>
            s.id !== subjectId ? s : {
              ...s,
              topics: s.topics.filter(t => t.id !== topicId),
            }
          ),
        }))
        triggerFirebaseSync(get)
      },

      cycleTopicStatus: (subjectId, topicId) => {
        set(state => {
          const next: Record<TopicStatus, TopicStatus> = {
            not_started: 'in_progress',
            in_progress: 'completed',
            completed: 'not_started',
          }
          return {
            subjects: state.subjects.map(s =>
              s.id !== subjectId ? s : {
                ...s,
                topics: s.topics.map(t => {
                  if (t.id !== topicId) return t
                  const newStatus = next[t.status]
                  return {
                    ...t,
                    status: newStatus,
                    completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
                  }
                }),
              }
            ),
          }
        })
        triggerFirebaseSync(get)
      },

      // ── Plan ──
      generatePlan: () => {
        const { subjects, user } = get()
        const newPlan = generateStudyPlan(subjects, user.dailyStudyHours, user.preferredStartTime)
        set({ plan: newPlan })
        triggerFirebaseSync(get)
      },

      completeSession: (sessionId) => {
        set(state => {
          if (!state.plan) return {}
          const updatedDays = state.plan.days.map(day => ({
            ...day,
            sessions: day.sessions.map(s =>
              s.id === sessionId ? { ...s, status: 'completed' as const, actualMinutes: s.plannedMinutes } : s
            ),
          }))
          return { plan: { ...state.plan, days: updatedDays } }
        })
        triggerFirebaseSync(get)
      },

      skipSession: (sessionId) => {
        set(state => {
          if (!state.plan) return {}
          const updatedDays = state.plan.days.map(day => ({
            ...day,
            sessions: day.sessions.map(s =>
              s.id === sessionId ? { ...s, status: 'skipped' as const } : s
            ),
          }))
          return { plan: { ...state.plan, days: updatedDays } }
        })
        triggerFirebaseSync(get)
      },

      rescheduleSession: (sessionId) => {
        set(state => {
          if (!state.plan) return {}
          const newPlan = rescheduleMissedSession(
            state.plan,
            sessionId,
            state.user.dailyStudyHours,
            state.user.preferredStartTime
          )
          return { plan: newPlan }
        })
        triggerFirebaseSync(get)
      },

      // ── Reset ──
      resetData: () => {
        set({
          subjects: [],
          plan: null,
          user: {
            name: 'Student',
            dailyStudyHours: 4,
            preferredStartTime: '09:00',
            studyDaysPerWeek: 7,
            sessionDurationMinutes: 60,
          },
        })
        triggerFirebaseSync(get)
      },

      // ── Computed ──
      getTodaySessions: () => {
        const { plan } = get()
        if (!plan) return []
        const todayStr = new Date().toISOString().split('T')[0]
        const todayPlan = plan.days.find(d => d.date === todayStr)
        return todayPlan ? todayPlan.sessions : []
      },

      getTopicById: (topicId) => {
        const { subjects } = get()
        for (const s of subjects) {
          const t = s.topics.find(t => t.id === topicId)
          if (t) return t
        }
        return undefined
      },

      getSubjectById: (subjectId) => {
        const { subjects } = get()
        return subjects.find(s => s.id === subjectId)
      },
    }),
    {
      name: 'preply-storage',
      partialize: (state) => ({
        user: state.user,
        subjects: state.subjects,
        plan: state.plan,
      }),
    }
  )
)
