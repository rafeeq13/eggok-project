import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Transaction } from './transaction.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction]), SettingsModule],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
