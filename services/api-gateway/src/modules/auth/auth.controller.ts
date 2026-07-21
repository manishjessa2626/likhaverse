import { Controller, Post, Body } from "@nestjs/common"
import { AuthService } from "./auth.service"

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("login")
  login(@Body() body: { email: string; password: string }) { return this.auth.login(body.email, body.password) }

  @Post("register")
  register(@Body() body: { name: string; email: string; password: string }) { return this.auth.register(body.name, body.email, body.password) }

  @Post("otp/send")
  sendOtp(@Body() body: { email: string }) { return this.auth.sendOtp(body.email) }

  @Post("otp/verify")
  verifyOtp(@Body() body: { email: string; code: string; name?: string }) { return this.auth.verifyOtp(body.email, body.code, body.name) }

  @Post("firebase")
  firebaseAuth(@Body() body: { idToken: string; provider: string }) { return this.auth.firebaseAuth(body.idToken, body.provider) }

  @Post("refresh")
  refresh(@Body() body: { refreshToken: string }) { return this.auth.refreshToken(body.refreshToken) }
}
