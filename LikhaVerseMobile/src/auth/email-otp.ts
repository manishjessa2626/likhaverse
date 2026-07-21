import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore"
import { db } from "../firebase/config"

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function sendEmailOtp(email: string): Promise<{ code: string }> {
  const code = generateCode()
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000))

  await setDoc(doc(db, "otpCodes", email.replace(/[^a-zA-Z0-9]/g, "_")), {
    email,
    code,
    expiresAt,
    used: false,
    createdAt: Timestamp.now(),
  })

  console.log(`[EMAIL OTP] Code for ${email}: ${code}`)
  return { code }
}

export async function verifyEmailOtp(email: string, code: string): Promise<boolean> {
  const id = email.replace(/[^a-zA-Z0-9]/g, "_")
  const snap = await getDoc(doc(db, "otpCodes", id))
  if (!snap.exists()) return false

  const data = snap.data()
  if (data.used) return false
  if (data.code !== code) return false
  if (data.expiresAt.toMillis() < Date.now()) return false

  await setDoc(doc(db, "otpCodes", id), { ...data, used: true }, { merge: true })
  return true
}
