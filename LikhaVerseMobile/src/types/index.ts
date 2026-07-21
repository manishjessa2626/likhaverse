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

export interface LUser {
  id: string
  email: string
  username: string
  displayName: string
  photoURL?: string
  bio?: string
  role: UserRole
  followersCount: number
  createdAt: number
}

export interface Story {
  id: string
  title: string
  coverURL: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  description: string
  tags: string[]
  likesCount: number
  chaptersCount: number
  status: "ongoing" | "completed"
  createdAt: number
}

export interface Chapter {
  id: string
  storyId: string
  title: string
  content: string
  number: number
  createdAt: number
}

export interface Comment {
  id: string
  storyId: string
  userId: string
  userName: string
  userPhotoURL?: string
  text: string
  createdAt: number
}

export interface SearchSuggestion {
  type: "story" | "author" | "tag"
  text: string
  id?: string
}
