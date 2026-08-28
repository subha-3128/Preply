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
  getDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore'
import type { Subject, User, GeneratedPlan } from '../types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB2B6T64KVxIkvZM4WV3qIiFQ3EHV79_1g',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'preply-caaa7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'preply-caaa7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'preply-caaa7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '543364012967',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:543364012967:web:38e66d372a44972f747482',
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId
  )
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
} catch (error) {
  console.warn('Failed to initialize Firebase:', error)
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
 * Fetch cloud data once on user login
 */
export async function fetchCloudData(userId: string): Promise<{ user?: User; subjects?: Subject[]; plan?: GeneratedPlan | null; exists: boolean } | null> {
  if (!db) return null
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const subjectsDoc = await getDoc(doc(db, 'users', userId, 'data', 'subjects'))
    const planDoc = await getDoc(doc(db, 'users', userId, 'data', 'plan'))

    const result: { user?: User; subjects?: Subject[]; plan?: GeneratedPlan | null; exists: boolean } = {
      exists: subjectsDoc.exists() || userDoc.exists()
    }

    if (userDoc.exists()) {
      result.user = userDoc.data() as User
    }
    if (subjectsDoc.exists()) {
      result.subjects = (subjectsDoc.data()?.subjects || []) as Subject[]
    }
    if (planDoc.exists()) {
      result.plan = planDoc.data().plan as GeneratedPlan | null
    }

    return result
  } catch (err: any) {
    console.error('Error fetching cloud data:', err)
    throw err
  }
}

/**
 * Firestore Sync Helpers
 */
export async function syncUserToFirestore(userId: string, user: User, onError?: (err: string) => void) {
  if (!db) return
  try {
    await setDoc(doc(db, 'users', userId), { ...user }, { merge: true })
  } catch (err: any) {
    console.error('Error syncing user to Firestore:', err)
    if (onError) onError(err?.message || 'Firestore write permission error')
  }
}

export async function syncSubjectsToFirestore(userId: string, subjects: Subject[], onError?: (err: string) => void) {
  if (!db) return
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'subjects'), { subjects: JSON.parse(JSON.stringify(subjects)) })
  } catch (err: any) {
    console.error('Error syncing subjects to Firestore:', err)
    if (onError) onError(err?.message || 'Firestore write permission error')
  }
}

export async function syncPlanToFirestore(userId: string, plan: GeneratedPlan | null, onError?: (err: string) => void) {
  if (!db) return
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'plan'), { plan: plan ? JSON.parse(JSON.stringify(plan)) : null })
  } catch (err: any) {
    console.error('Error syncing plan to Firestore:', err)
    if (onError) onError(err?.message || 'Firestore write permission error')
  }
}

/**
 * Real-time listener for user data
 */
export function subscribeToFirebaseData(
  userId: string,
  onData: (data: { user?: User; subjects?: Subject[]; plan?: GeneratedPlan | null }) => void,
  onError?: (err: string) => void
) {
  if (!db) return () => {}

  const userDocRef = doc(db, 'users', userId)
  const subjectsDocRef = doc(db, 'users', userId, 'data', 'subjects')
  const planDocRef = doc(db, 'users', userId, 'data', 'plan')

  const handleErr = (err: any) => {
    console.error('Firestore snapshot error:', err)
    if (onError) {
      if (err?.code === 'permission-denied') {
        onError('Firestore Permission Error: Enable read/write in Firebase Console > Firestore Rules.')
      } else {
        onError(err?.message || 'Firestore subscription error')
      }
    }
  }

  const unSubUser = onSnapshot(userDocRef, (snapshot) => {
    if (snapshot.exists()) {
      onData({ user: snapshot.data() as User })
    }
  }, handleErr)

  const unSubSubjects = onSnapshot(subjectsDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const cloudSubjects = snapshot.data()?.subjects as Subject[]
      if (cloudSubjects) {
        onData({ subjects: cloudSubjects })
      }
    }
  }, handleErr)

  const unSubPlan = onSnapshot(planDocRef, (snapshot) => {
    if (snapshot.exists()) {
      onData({ plan: snapshot.data().plan as GeneratedPlan | null })
    }
  }, handleErr)

  return () => {
    unSubUser()
    unSubSubjects()
    unSubPlan()
  }
}
