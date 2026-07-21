export interface LoginDto {
  email?: string
  password?: string
  phone?: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface SendOtpDto {
  email?: string
  phone?: string
}

export interface VerifyOtpDto {
  email?: string
  phone?: string
  code: string
  verificationId?: string
  name?: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface FirebaseLoginDto {
  idToken: string
  provider: string
}

export interface CreateStoryDto {
  title: string
  description?: string
  category?: string
  tags?: string
  mature?: boolean
}

export interface UpdateStoryDto {
  title?: string
  description?: string
  cover?: string
  category?: string
  tags?: string
  status?: string
  mature?: boolean
}

export interface CreateEpisodeDto {
  title: string
  content?: string
  description?: string
  seasonNumber?: number
  episodeNumber?: number
  isFree?: boolean
}

export interface UpdateEpisodeDto {
  title?: string
  content?: string
  description?: string
  cover?: string
  audioUrl?: string
  status?: string
  isFree?: boolean
}

export interface UpdateProgressDto {
  progress: number
  completed?: boolean
}

export interface PaymentIntentDto {
  amount: number
  method: string
  type: string
}

export interface SubscriptionDto {
  plan: "monthly" | "yearly"
  method: string
}

export interface TopupDto {
  amount: number
  method: string
}

export interface SendNotificationDto {
  recipientId: string
  type: string
  title?: string
  message?: string
  link?: string
}

export interface ChapterAccessDto {
  userId: string
  episodeId: string
}
