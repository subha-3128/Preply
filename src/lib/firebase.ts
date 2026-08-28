import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore'
import type { Subject, User, GeneratedPlan } from '../types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  )
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error)
  }
}

export { app, auth, db }

/**
 * Initialize Auth listener
 */
export function initAuth(onUserReady: (user: FirebaseUser | null, error?: string) => void) {
  if (!auth) {
    onUserReady(null)
    return () => {}
  }

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    onUserReady(user)
  })

  return unsubscribe
}

/**
 * Register with Email & Password
 */
export async function registerWithEmail(email: string, password: string, name?: string) {
  if (!auth) throw new Error('Firebase Auth is not configured.')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (name && cred.user) {
    await updateProfile(cred.user, { displayName: name })
  }
  return cred.user
}

/**
 * Sign In with Email & Password
 */
export async function loginWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth is not configured.')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

/**
 * Sign Out
 */
export async function logoutUser() {
  if (!auth) return
  await signOut(auth)
}

/**
 * Firestore Sync Helpers
 */
export async function syncUserToFirestore(userId: string, user: User) {
  if (!db) return
  try {
    await setDoc(doc(db, 'users', userId), { ...user }, { merge: true })
  } catch (err) {
    console.error('Error syncing user to Firestore:', err)
  }
}

export async function syncSubjectsToFirestore(userId: string, subjects: Subject[]) {
  if (!db) return
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'subjects'), { subjects: JSON.parse(JSON.stringify(subjects)) })
  } catch (err) {
    console.error('Error syncing subjects to Firestore:', err)
  }
}

export async function syncPlanToFirestore(userId: string, plan: GeneratedPlan | null) {
  if (!db) return
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'plan'), { plan: plan ? JSON.parse(JSON.stringify(plan)) : null })
  } catch (err) {
    console.error('Error syncing plan to Firestore:', err)
  }
}

/**
 * Real-time listener for user data
 */
export function subscribeToFirebaseData(
  userId: string,
  onData: (data: { user?: User; subjects?: Subject[]; plan?: GeneratedPlan | null }) => void
) {
  if (!db) return () => {}

  const userDocRef = doc(db, 'users', userId)
  const subjectsDocRef = doc(db, 'users', userId, 'data', 'subjects')
  const planDocRef = doc(db, 'users', userId, 'data', 'plan')

  const unSubUser = onSnapshot(userDocRef, (snapshot) => {
    if (snapshot.exists()) {
      onData({ user: snapshot.data() as User })
    }
  })

  const unSubSubjects = onSnapshot(subjectsDocRef, (snapshot) => {
    if (snapshot.exists()) {
      onData({ subjects: snapshot.data().subjects as Subject[] })
    }
  })

  const unSubPlan = onSnapshot(planDocRef, (snapshot) => {
    if (snapshot.exists()) {
      onData({ plan: snapshot.data().plan as GeneratedPlan | null })
    }
  })

  return () => {
    unSubUser()
    unSubSubjects()
    unSubPlan()
  }
}
