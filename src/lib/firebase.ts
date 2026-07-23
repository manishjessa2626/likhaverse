import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

// Firebase config values are PUBLIC — they are sent to every client that loads the SDK.
// Security is enforced by Firebase Security Rules and App Check, NOT by hiding these values.
// Env vars override the defaults so you can point at a different project per environment.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCz7XixcIPTMfSB-phzyimax21gjLix1Og",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "likhaverse.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "likhaverse",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "likhaverse.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "225967693419",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:225967693419:web:ae4bf69a253752ddbc1b2e",
}

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("[firebase] config:", firebaseConfig.projectId)
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
export default app
