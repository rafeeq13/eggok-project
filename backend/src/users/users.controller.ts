import { Controller, Get, Post, Put, Patch, Delete, Body, Param, HttpCode, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(AdminGuard)
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(AdminGuard)
    findOne(@Param('id') id: string): Promise<User | null> {
        return this.usersService.findOne(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    create(@Body() user: Partial<User>): Promise<User> {
        return this.usersService.create(user);
    }

    @Post('set-password')
    @HttpCode(200)
    setPassword(@Body() data: { token: string; password: string }) {
        return this.usersService.setPasswordByToken(data.token, data.password);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() data: { email: string; password: string }) {
        return this.usersService.login(data.email, data.password);
    }

    @Post('forgot-password')
    @HttpCode(200)
    forgotPassword(@Body() data: { email: string }) {
        return this.usersService.forgotPassword(data.email);
    }

    @Post('reset-password')
    @HttpCode(200)
    resetPassword(@Body() data: { token: string; password: string }) {
        return this.usersService.resetPasswordByToken(data.token, data.password);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    update(@Param('id') id: string, @Body() user: Partial<User>): Promise<User | null> {
        return this.usersService.update(id, user);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    patch(@Param('id') id: string, @Body() user: Partial<User>): Promise<User | null> {
        return this.usersService.update(id, user);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    remove(@Param('id') id: string): Promise<void> {
        return this.usersService.remove(id);
    }
}
