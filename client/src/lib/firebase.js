import { initializeApp } from 'firebase/app'
import { getAuth, inMemoryPersistence, setPersistence, signInWithCustomToken } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import api from '../api/axios'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const hasFirebaseWebConfig = Object.values(firebaseConfig).every(Boolean)

let appInstance = null
let authInstance = null
let firestoreInstance = null
let authPromise = null

if (hasFirebaseWebConfig) {
  appInstance = initializeApp(firebaseConfig)
  authInstance = getAuth(appInstance)
  firestoreInstance = getFirestore(appInstance)
}

export const firebaseApp = appInstance
export const firebaseAuth = authInstance
export const firebaseDb = firestoreInstance

export async function ensureFirebaseChatAuth() {
  if (!hasFirebaseWebConfig || !firebaseAuth) {
    throw new Error('Firebase web config is missing. Add VITE_FIREBASE_* values to the client environment.')
  }

  if (firebaseAuth.currentUser) return firebaseAuth.currentUser
  if (authPromise) return authPromise

  authPromise = (async () => {
    await setPersistence(firebaseAuth, inMemoryPersistence)
    const response = await api.get('/chat/token')
    const credential = await signInWithCustomToken(firebaseAuth, response.data.token)
    authPromise = null
    return credential.user
  })().catch((error) => {
    authPromise = null
    throw error
  })

  return authPromise
}
