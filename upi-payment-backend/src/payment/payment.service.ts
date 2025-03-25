import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './payment.schema';

@Injectable()
export class PaymentService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<Payment>) {}

  async createPayment(upiId: string, amount: number) {
    const transactionId = new Date().getTime().toString(); 
    const MERCHANT_UPI_ID = "jaiwinska17@oksbi"; 
    const upiLink = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=Your Business Name&mc=0000&tid=${transactionId}&tr=${transactionId}&tn=Payment&am=${amount}&cu=INR`;

    // Create and save the payment document in the database
    const newPayment = new this.paymentModel({
      transactionId,
      upiId,
      amount,
      status: "pending",
      createdAt: new Date(),
    });
    
    await newPayment.save();

    return {
      success: true,
      transactionId,
      upiLink, 
      status: "pending",
    };
  }

  async updatePaymentStatus(transactionId: string, status: string) {
    return this.paymentModel.findOneAndUpdate(
      { transactionId }, // Use transactionId field, not _id
      { status, paymentDate: new Date() },
      { new: true },
    );
  }

  async getPayment(transactionId: string): Promise<Payment> {
    return this.paymentModel.findOne({ transactionId }).exec();
  }
  
  // Fixed to use transactionId field, not _id
  async updateTransaction(transactionId: string, status: string) {
    return await this.paymentModel.findOneAndUpdate(
        { transactionId }, // Changed from _id to transactionId
        { status, updatedAt: new Date() },
        { new: true }
    );
  }
}