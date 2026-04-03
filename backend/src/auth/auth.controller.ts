import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

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

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
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
}
