import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common"
import { PaymentService } from "./payment.service"

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("subscribe")
  async subscribe(@Body() body: { userId: string; plan: "monthly" | "yearly"; method: string }) {
    return this.paymentService.subscribe(body.userId, body.plan, body.method)
  }

  @Post("topup")
  async topup(@Body() body: { userId: string; amount: number; method: string }) {
    return this.paymentService.topup(body.userId, body.amount, body.method)
  }

  @Post("wallet-purchase")
  async walletPurchase(@Body() body: { userId: string }) {
    return this.paymentService.walletPurchase(body.userId)
  }

  @Get("history/:userId")
  async getHistory(
    @Param("userId") userId: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.paymentService.getHistory(userId, parseInt(page, 10), parseInt(limit, 10))
  }

  @Get("status/:userId")
  async getStatus(@Param("userId") userId: string) {
    return this.paymentService.getStatus(userId)
  }
}
