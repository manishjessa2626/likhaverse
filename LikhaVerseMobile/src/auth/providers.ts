import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  linkWithCredential,
  User,
} from "firebase/auth"
import { auth } from "../firebase/config"

export async function signInWithGoogle(idToken: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken)
  const result = await signInWithCredential(auth, credential)
  return result.user
}

export async function signInWithFacebook(accessToken: string): Promise<User> {
  const credential = FacebookAuthProvider.credential(accessToken)
  const result = await signInWithCredential(auth, credential)
  return result.user
}

export async function linkGoogleAccount(user: User, idToken: string): Promise<void> {
  const credential = GoogleAuthProvider.credential(idToken)
  await linkWithCredential(user, credential)
}

export async function linkFacebookAccount(user: User, accessToken: string): Promise<void> {
  const credential = FacebookAuthProvider.credential(accessToken)
  await linkWithCredential(user, credential)
}
