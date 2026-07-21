import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import AppleProvider from "next-auth/providers/apple"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { rateLimit } from "./rate-limit"

function isValidUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

function sanitizeEmail(s: string): string {
  return s.trim().toLowerCase().replace(/[<>"'()]/g, "")
}

function sanitizeName(s: string): string {
  return s.trim().replace(/[<>"'()]/g, "").slice(0, 100)
}

export const authOptions: NextAuthOptions = {
  logger: {
    error(code, ...message) {
      if (code === "JWT_SESSION_ERROR") return
      console.error(code, ...message)
    },
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = sanitizeEmail(credentials.email)

        const rl = await rateLimit(`login:${email}`, 5, 300_000)
        if (!rl.allowed) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || user.provider !== "email" || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name,
          role: user.role,
        }
      },
    }),
    CredentialsProvider({
      id: "phone",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.userId) return null
        if (!isValidUUID(credentials.userId)) return null

        const phone = credentials.phone.replace(/\s+/g, "")

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        })

        if (!user || user.phone !== phone) return null

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name,
          role: user.role,
        }
      },
    }),
    CredentialsProvider({
      id: "firebase",
      name: "Firebase Auth",
      credentials: {
        userId: { label: "User ID", type: "text" },
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId) return null
        if (!isValidUUID(credentials.userId)) return null

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        })

        if (!user) return null

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name,
          role: user.role,
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials" || account?.provider === "phone" || account?.provider === "firebase") return true

      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "apple") {
        const email = user.email
        if (!email) return false

        const emailVerified = (profile as Record<string, unknown>)?.email_verified
        const isEmailVerified = emailVerified === true || emailVerified === "true"
        if (!isEmailVerified) {
          console.warn(`[AUTH] ${account.provider} returned unverified email: ${email}`)
          return false
        }

        const providerId = account.providerAccountId
        if (!providerId || typeof providerId !== "string") return false

        const provider = account.provider
        const sanitizedEmail = sanitizeEmail(email)
        const sanitizedProviderId = providerId.replace(/[^a-zA-Z0-9_\-]/g, "")

        const existingLink = await prisma.userAccount.findUnique({
          where: { provider_providerId: { provider, providerId: sanitizedProviderId } },
        })

        if (existingLink) return true

        const existingUser = await prisma.user.findUnique({ where: { email: sanitizedEmail } })

        if (existingUser) {
          await prisma.userAccount.create({
            data: { userId: existingUser.id, provider, providerId: sanitizedProviderId },
          })
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { isVerified: true, emailVerified: true },
          })
          return true
        }

        await prisma.user.create({
          data: {
            name: sanitizeName(user.name ?? email.split("@")[0]),
            email: sanitizedEmail,
            provider,
            providerId: sanitizedProviderId,
            isVerified: true,
            emailVerified: true,
            role: "READER",
            accounts: {
              create: { provider, providerId: sanitizedProviderId },
            },
          },
        })

        return true
      }

      return false
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
