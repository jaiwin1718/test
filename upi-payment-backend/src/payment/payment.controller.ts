import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async initiatePayment(@Body() body) {
    const { upiId, amount } = body;
    return this.paymentService.createPayment(upiId, amount);
  }

  @Post('update')
  async updatePayment(@Body() body) {
    const { transactionId, status } = body;
    return this.paymentService.updatePaymentStatus(transactionId, status);
  }

  @Get(':transactionId')
  async getPayment(@Param('transactionId') transactionId: string) {
    return this.paymentService.getPayment(transactionId);
  }
  
  // Add the missing endpoint that the frontend is polling
  @Get('status/:transactionId')
  async checkPaymentStatus(@Param('transactionId') transactionId: string) {
    const payment = await this.paymentService.getPayment(transactionId);
    if (!payment) {
      return { success: false, message: 'Transaction not found', status: 'not_found' };
    }
    return { success: true, status: payment.status };
  }
  
  @Post('complete')
  async completePayment(@Body() body) {
      console.log("Payment completion request received:", body);
  
      const { transactionId, status } = body;
  
      if (status === 'success') {
          // Use updatePaymentStatus instead of updateTransaction for consistency
          const payment = await this.paymentService.updatePaymentStatus(transactionId, 'completed');
          
          if (payment) {
              console.log("Payment stored successfully:", payment);
              return { success: true, message: 'Payment recorded successfully' };
          } else {
              console.error("Transaction not found in DB!");
              return { success: false, message: 'Transaction not found' };
          }
      } else {
          console.error("Payment failed or still pending.");
          return { success: false, message: 'Payment failed or pending' };
      }
  }
}