import { Controller, Get, Post, Put, Patch, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<User | null> {
        return this.usersService.findOne(id);
    }

    @Post()
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

    @Put(':id')
    update(@Param('id') id: string, @Body() user: Partial<User>): Promise<User | null> {
        return this.usersService.update(id, user);
    }

    @Patch(':id')
    patch(@Param('id') id: string, @Body() user: Partial<User>): Promise<User | null> {
        return this.usersService.update(id, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.usersService.remove(id);
    }
}
