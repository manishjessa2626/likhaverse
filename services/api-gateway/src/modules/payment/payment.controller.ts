import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common"
import { PaymentService } from "./payment.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"

@Controller("payments")
export class PaymentController {
  constructor(private payment: PaymentService) {}

  @Post("subscribe")
  @UseGuards(JwtAuthGuard)
  subscribe(@Body() body: { userId: string; plan: string; method: string }) {
    return this.payment.subscribe(body.userId, body.plan, body.method)
  }

  @Post("topup")
  @UseGuards(JwtAuthGuard)
  topup(@Body() body: { userId: string; amount: number; method: string }) {
    return this.payment.topup(body.userId, body.amount, body.method)
  }

  @Post("wallet-purchase")
  @UseGuards(JwtAuthGuard)
  walletPurchase(@Body() body: { userId: string }) {
    return this.payment.walletPurchase(body.userId)
  }

  @Get("history/:userId")
  @UseGuards(JwtAuthGuard)
  getHistory(@Param("userId") userId: string, @Query("page") page = "1", @Query("limit") limit = "20") {
    return this.payment.getHistory(userId, Number(page), Number(limit))
  }

  @Get("status/:userId")
  getStatus(@Param("userId") userId: string) { return this.payment.getStatus(userId) }
}
