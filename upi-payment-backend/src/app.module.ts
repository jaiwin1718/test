import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from './payment/payment.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://JAIWIN:jaiwin1718@paymentcluster.uozcx.mongodb.net/?retryWrites=true&w=majority&appName=paymentcluster',
    ),
    PaymentModule,
  ],
})
export class AppModule {}
