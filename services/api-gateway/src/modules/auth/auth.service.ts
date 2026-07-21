import { Injectable, HttpException, HttpStatus } from "@nestjs/common"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3002"

@Injectable()
export class AuthService {
  private async post(path: string, body: any) {
    try {
      const res = await fetch(`${AUTH_SERVICE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new HttpException(data.error || "Auth service error", res.status)
      return data
    } catch (err: any) {
      if (err instanceof HttpException) throw err
      throw new HttpException(err.message || "Auth service unavailable", HttpStatus.SERVICE_UNAVAILABLE)
    }
  }

  login(email: string, password: string) { return this.post("/auth/login", { email, password }) }
  register(name: string, email: string, password: string) { return this.post("/auth/register", { name, email, password }) }
  sendOtp(email: string) { return this.post("/auth/otp/send", { email }) }
  verifyOtp(email: string, code: string, name?: string) { return this.post("/auth/otp/verify", { email, code, name }) }
  firebaseAuth(idToken: string, provider: string) { return this.post("/auth/firebase", { idToken, provider }) }
  refreshToken(refreshToken: string) { return this.post("/auth/refresh", { refreshToken }) }
}
