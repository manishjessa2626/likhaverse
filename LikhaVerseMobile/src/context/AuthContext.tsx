import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  fetchSignInMethodsForEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  UserCredential,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { auth, db } from "../firebase/config"
import { sendEmailOtp, verifyEmailOtp } from "../auth/email-otp"
import { signInWithGoogle, signInWithFacebook } from "../auth/providers"

export type UserRole = "free" | "premium" | "vip" | "creator" | "admin" | "AUTHOR" | "VIP_GOLD" | "PREMIUM_CREATOR" | "SUPER_ADMIN" | "ADMIN"

export interface AuthProfile {
  uid: string
  email: string
  phone?: string
  displayName: string
  username?: string
  bio?: string
  photoURL?: string
  providers: string[]
  role: UserRole
  isPremium: boolean
  isVIP: boolean
  followersCount?: number
  createdAt: number
}

interface AuthContextValue {
  user: User | null
  profile: AuthProfile | null
  loading: boolean
  signInWithEmailLink: (email: string) => Promise<void>
  signInWithEmailOtp: (email: string, code: string) => Promise<void>
  sendEmailOtpCode: (email: string) => Promise<void>
  signInWithGoogleToken: (idToken: string) => Promise<void>
  signInWithFacebookToken: (accessToken: string) => Promise<void>
  createAccountWithEmail: (email: string, password: string, displayName: string, username: string) => Promise<void>
  linkProvider: (provider: "google" | "facebook", token: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function defaultProfile(uid: string, email: string, displayName: string): AuthProfile {
  return {
    uid,
    email,
    displayName,
    providers: ["email"],
    role: "free",
    isPremium: false,
    isVIP: false,
    createdAt: Date.now(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const ref = doc(db, "users", firebaseUser.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data() as AuthProfile
        setProfile({ ...data, uid: firebaseUser.uid })
      } else {
        const p = defaultProfile(
          firebaseUser.uid,
          firebaseUser.email ?? "",
          firebaseUser.displayName ?? "User",
        )
        await setDoc(ref, p)
        setProfile(p)
      }
    } catch {
      setProfile(defaultProfile(firebaseUser.uid, firebaseUser.email ?? "", firebaseUser.displayName ?? "User"))
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchProfile(firebaseUser)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const syncProfileProviders = async (uid: string) => {
    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const existing = snap.data()
      const currentProviders = auth.currentUser?.providerData.map((p) => p.providerId) ?? ["email"]
      await updateDoc(ref, {
        providers: currentProviders,
        email: auth.currentUser?.email ?? existing.email,
        displayName: auth.currentUser?.displayName ?? existing.displayName,
        photoURL: auth.currentUser?.photoURL ?? existing.photoURL,
      })
    }
  }

  // --- Email OTP ---
  const sendEmailOtpCode = async (email: string) => {
    await sendEmailOtp(email)
  }

  const signInWithEmailOtp = async (email: string, code: string) => {
    const valid = await verifyEmailOtp(email, code)
    if (!valid) throw new Error("Invalid or expired verification code")

    const methods = await fetchSignInMethodsForEmail(auth, email)
    if (methods.length > 0) {
      // User exists — sign in with temporary password approach
      const tempPassword = Math.random().toString(36).slice(-12)
      try {
        await signInWithEmailAndPassword(auth, email, tempPassword)
      } catch {
        // Password wrong, so we need to create a new session
        // Store a temp token and re-auth
        // For simplicity: sign in with email link
        await sendSignInLinkToEmail(auth, email, {
          url: "likhaverse://auth",
          handleCodeInApp: true,
        })
        window.localStorage?.setItem("emailForSignIn", email)
      }
    } else {
      const tempPassword = Math.random().toString(36).slice(-12)
      const cred = await createUserWithEmailAndPassword(auth, email, tempPassword)
      await updateProfile(cred.user, { displayName: email.split("@")[0] })
      const p = defaultProfile(cred.user.uid, email, email.split("@")[0])
      await setDoc(doc(db, "users", cred.user.uid), p)
    }
  }

  // --- Email Link ---
  const signInWithEmailLinkMethod = async (email: string) => {
    await sendSignInLinkToEmail(auth, email, {
      url: "likhaverse://auth",
      handleCodeInApp: true,
    })
  }

  // --- Google ---
  const signInWithGoogleToken = async (idToken: string) => {
    const fbUser = await signInWithGoogle(idToken)
    await syncProfileProviders(fbUser.uid)
  }

  // --- Facebook ---
  const signInWithFacebookToken = async (accessToken: string) => {
    const fbUser = await signInWithFacebook(accessToken)
    await syncProfileProviders(fbUser.uid)
  }

  // --- Email/Password registration ---
  const createAccountWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    username: string,
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    const p: AuthProfile = {
      uid: cred.user.uid,
      email,
      displayName,
      providers: ["email"],
      role: "free",
      isPremium: false,
      isVIP: false,
      createdAt: Date.now(),
    }
    await setDoc(doc(db, "users", cred.user.uid), p)
    setProfile(p)
  }

  // --- Account linking ---
  const linkProvider = async (provider: "google" | "facebook", token: string) => {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error("No user logged in")

    const EmailAuthProvider_credential =
      provider === "google"
        ? (await import("../auth/providers")).signInWithGoogle as any
        : (await import("../auth/providers")).signInWithFacebook as any

    try {
      if (provider === "google") {
        const { default: gProvider } = await import("firebase/auth")
        const credential = gProvider.GoogleAuthProvider.credential(token)
        await linkWithCredential(currentUser, credential)
      } else {
        const { default: fProvider } = await import("firebase/auth")
        const credential = fProvider.FacebookAuthProvider.credential(token)
        await linkWithCredential(currentUser, credential)
      }
      await syncProfileProviders(currentUser.uid)
    } catch (err: any) {
      if (err.code === "auth/credential-already-in-use") {
        // Account already linked to another user — merge
        throw new Error("This account is already linked to another user")
      }
      throw err
    }
  }

  const logout = async () => {
    await signOut(auth)
    setProfile(null)
    setUser(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithEmailLink: signInWithEmailLinkMethod,
        signInWithEmailOtp,
        sendEmailOtpCode,
        signInWithGoogleToken,
        signInWithFacebookToken,
        createAccountWithEmail,
        linkProvider,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
