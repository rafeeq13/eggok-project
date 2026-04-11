import { Controller, Get, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('submissions')
@UseGuards(AdminGuard)
export class SubmissionsController {
  constructor(private readonly service: SubmissionsService) {}

  @Get()
  findAll(@Query('type') type?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll(type, page ? +page : 1, limit ? +limit : 50);
  }

  @Get('counts')
  getCounts() {
    return this.service.getCounts();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { status?: string; adminNotes?: string }) {
    return this.service.updateStatus(id, body.status || 'reviewed', body.adminNotes);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
