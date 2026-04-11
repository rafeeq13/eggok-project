import { Controller, Post, Get, Put, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenGuard } from './token.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
    }) {
        return this.authService.register(data);
    }

    @Post('login')
    login(@Body() data: { email: string; password: string }) {
        return this.authService.login(data.email, data.password);
    }

    @UseGuards(TokenGuard)
    @Post('logout')
    @HttpCode(200)
    logout(@Request() req: any) {
        const authHeader = req.headers['authorization'] || '';
        const rawToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        return this.authService.logout(rawToken);
    }

    @Post('forgot-password')
    @HttpCode(200)
    forgotPassword(@Body() data: { email: string }) {
        return this.authService.forgotPassword(data.email);
    }

    @Post('reset-password')
    @HttpCode(200)
    resetPassword(@Body() data: { token: string; password: string }) {
        return this.authService.resetPassword(data.token, data.password);
    }

    @UseGuards(TokenGuard)
    @Get('me')
    getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.id);
    }

    @UseGuards(TokenGuard)
    @Put('profile')
    updateProfile(@Request() req: any, @Body() data: {
        name?: string;
        email?: string;
        phone?: string;
        currentPassword?: string;
        newPassword?: string;
    }) {
        return this.authService.updateProfile(req.user.id, data);
    }

    // Saved Addresses
    @UseGuards(TokenGuard)
    @Get('addresses')
    getAddresses(@Request() req: any) {
        return this.authService.getAddresses(req.user.id);
    }

    @UseGuards(TokenGuard)
    @Put('addresses')
    updateAddresses(@Request() req: any, @Body() data: { addresses: any[] }) {
        return this.authService.updateAddresses(req.user.id, data.addresses);
    }

    // My Orders (customer-facing)
    @UseGuards(TokenGuard)
    @Get('my-orders')
    getMyOrders(@Request() req: any) {
        return this.authService.getMyOrders(req.user.id);
    }

    // Loyalty
    @UseGuards(TokenGuard)
    @Get('points-history')
    getPointsHistory(@Request() req: any) {
        return this.authService.getPointsHistory(req.user.id);
    }

    @UseGuards(TokenGuard)
    @Post('redeem')
    @HttpCode(200)
    redeemReward(@Request() req: any, @Body() data: { rewardId: number }) {
        return this.authService.redeemReward(req.user.id, data.rewardId);
    }
}
