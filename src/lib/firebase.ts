import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID

if (!apiKey || !authDomain || !projectId || !appId) {
  if (typeof window !== "undefined") {
    console.error("[firebase] Missing NEXT_PUBLIC_FIREBASE_* env vars — Firebase Auth, Firestore, and Storage will not work")
  }
}

const firebaseConfig = {
  ...(apiKey && { apiKey }),
  ...(authDomain && { authDomain }),
  ...(projectId && { projectId }),
  ...(storageBucket && { storageBucket }),
  ...(messagingSenderId && { messagingSenderId }),
  ...(appId && { appId }),
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
export default app
