import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  /**
   * Write an audit entry. The acting admin is read off the request (set by
   * AdminGuard); IP is derived from request headers. Body only carries the
   * domain payload (action / target / detail) — the client cannot impersonate
   * another user.
   */
  @Post()
  @UseGuards(AdminGuard)
  write(
    @Req() req: any,
    @Body() body: { action: string; target: string; detail?: string },
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      undefined;
    return this.service.write({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      userRole: req.adminUser?.role,
      action: body.action,
      target: body.target,
      detail: body.detail,
      ipAddress: ip,
    });
  }

  @Get()
  @UseGuards(AdminGuard)
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('target') target?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.list({
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
      action,
      target,
      userId,
      from,
      to,
    });
  }
}
