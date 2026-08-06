import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const hasCredentials =
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)

function initAdminApp() {
  if (getApps().length) return

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount
      initializeApp({ credential: cert(serviceAccount) })
      return
    } catch (e) {
      console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY is invalid — falling back:", e)
    }
  }

  if (hasCredentials) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
        }),
      })
      return
    } catch (e) {
      console.error("[firebase-admin] Invalid Firebase Admin credentials — running in demo mode:", e)
    }
  }

  console.warn("[firebase-admin] No Firebase Admin credentials found — running in demo mode")
  initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo" })
}

export const adminApp = (() => { initAdminApp(); return getApps()[0] })()

export const adminAuth = (() => {
  try { return getAuth(adminApp) } catch { return null as unknown as ReturnType<typeof getAuth> }
})()

export const adminDb = (() => {
  try { return getFirestore(adminApp) } catch { return null as unknown as ReturnType<typeof getFirestore> }
})()
