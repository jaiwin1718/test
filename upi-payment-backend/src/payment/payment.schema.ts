import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  upiId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['pending', 'success', 'failed'], default: 'pending' })
  status: string;

  @Prop()
  transactionId?: string;

  @Prop()
  paymentDate?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
