import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/customer.entity';
import { CustomerToken } from './customer-token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenGuard } from './token.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, CustomerToken]),
    ],
    controllers: [AuthController],
    providers: [AuthService, TokenGuard],
    exports: [AuthService, TokenGuard],
})
export class AuthModule { }
