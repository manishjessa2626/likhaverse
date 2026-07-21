import { Injectable, UnauthorizedException, ConflictException, HttpException, HttpStatus } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { PrismaService } from "../common/prisma.service"
import * as crypto from "crypto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user || !user.password) throw new UnauthorizedException("Invalid credentials")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException("Invalid credentials")

    return this.generateTokens(user)
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) throw new ConflictException("Email already registered")

    const hashed = await bcrypt.hash(password, 12)
    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        provider: "email",
        isVerified: true,
        role: "READER",
      },
    })

    return this.generateTokens(user)
  }

  async sendEmailOtp(email: string) {
    const sanitized = email.toLowerCase().trim()
    const recent = await this.prisma.verificationCode.findFirst({
      where: { target: sanitized, type: "EMAIL_OTP", createdAt: { gte: new Date(Date.now() - 30000) } },
    })
    if (recent) throw new HttpException("Please wait 30 seconds before requesting a new code", HttpStatus.TOO_MANY_REQUESTS)

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await this.prisma.verificationCode.create({
      data: { code, type: "EMAIL_OTP", target: sanitized, expiresAt: new Date(Date.now() + 600000) },
    })

    console.log(`[EMAIL OTP] Code for ${sanitized}: ${code}`)
    return { sent: true }
  }

  async verifyEmailOtp(email: string, code: string, name?: string) {
    const sanitized = email.toLowerCase().trim()
    const record = await this.prisma.verificationCode.findFirst({
      where: { target: sanitized, type: "EMAIL_OTP", code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    })
    if (!record) throw new UnauthorizedException("Invalid or expired code")

    await this.prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } })

    let user = await this.prisma.user.findUnique({ where: { email: sanitized } })
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: name?.trim() || sanitized.split("@")[0],
          email: sanitized,
          provider: "email",
          isVerified: true,
          emailVerified: true,
          role: "READER",
        },
      })
    }

    return this.generateTokens(user)
  }

  async firebaseAuth(idToken: string, provider: string) {
    const decoded = this.jwtService.decode(idToken) as any
    if (!decoded) throw new UnauthorizedException("Invalid Firebase token")

    const email = decoded.email || ""
    const firebaseUid = decoded.sub || decoded.user_id
    const name = decoded.name || email.split("@")[0] || "User"

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ email: email || undefined }, { providerId: firebaseUid }].filter(Boolean) },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name, email: email || undefined, provider, providerId: firebaseUid,
          isVerified: true, emailVerified: true, role: "READER",
        },
      })
    } else if (!user.providerId) {
      user = await this.prisma.user.update({
        where: { id: user.id }, data: { providerId: firebaseUid, isVerified: true, emailVerified: true },
      })
    }

    return this.generateTokens(user)
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token)
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) throw new UnauthorizedException("User not found")
      return this.generateTokens(user)
    } catch {
      throw new UnauthorizedException("Invalid refresh token")
    }
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name }

    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" })
    const refreshToken = crypto.randomBytes(32).toString("hex")

    await this.prisma.session.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 86400000) },
    })

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    }
  }
}
