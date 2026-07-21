export interface JwtPayload {
  sub: string
  email: string
  role: string
  name: string
  iat?: number
  exp?: number
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
  }
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
