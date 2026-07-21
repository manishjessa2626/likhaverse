import { BadRequestException, Injectable } from "@nestjs/common"
import { PrismaService } from "../common/prisma.service"

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(userId: string, plan: "monthly" | "yearly", method: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new BadRequestException("User not found")

    const amount = plan === "yearly" ? 7999 : 999
    const expiry = new Date()
    if (plan === "yearly") {
      expiry.setFullYear(expiry.getFullYear() + 1)
    } else {
      expiry.setMonth(expiry.getMonth() + 1)
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        method,
        status: "completed",
        type: "subscription",
        metadata: { plan },
      },
    })

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "active",
        subscriptionExpiry: expiry,
        premium: true,
      },
    })

    return payment
  }

  async topup(userId: string, amount: number, method: string) {
    const validAmounts = [500, 1000, 2000, 5000]
    if (!validAmounts.includes(amount)) {
      throw new BadRequestException(`Invalid amount. Must be one of ${validAmounts.join(", ")}`)
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new BadRequestException("User not found")

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        method,
        status: "completed",
        type: "topup",
      },
    })

    await this.prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } },
    })

    return payment
  }

  async walletPurchase(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new BadRequestException("User not found")

    const price = 7999
    if (user.walletBalance < price) {
      throw new BadRequestException("Insufficient wallet balance")
    }

    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: price,
        method: "wallet",
        status: "completed",
        type: "subscription",
        metadata: { plan: "yearly", source: "wallet" },
      },
    })

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: price },
        premium: true,
        isVIP: true,
        subscriptionStatus: "active",
        subscriptionExpiry: expiry,
      },
    })

    return payment
  }

  async getHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { userId } }),
    ])

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new BadRequestException("User not found")

    return {
      premium: user.premium,
      isVIP: user.isVIP,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry,
      walletBalance: user.walletBalance,
    }
  }
}
