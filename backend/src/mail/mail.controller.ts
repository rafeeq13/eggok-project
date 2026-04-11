import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Get('settings')
  @UseGuards(AdminGuard)
  getMailSettings() {
    return this.mailService.getMailSettings();
  }

  @Put('settings')
  @UseGuards(AdminGuard)
  updateMailSettings(@Body() payload: any) {
    return this.mailService.updateMailSettings(payload);
  }

  @Post('test')
  @UseGuards(AdminGuard)
  async sendTestEmail(@Body() payload: { to?: string }) {
    await this.mailService.sendTestEmail(payload?.to);
    return { success: true };
  }

  @Post('contact')
  async submitContactMessage(@Body() payload: any) {
    await this.mailService.sendContactMessage(payload);
    this.submissionsService.create({
      type: 'contact',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      data: { subject: payload.subject, message: payload.message },
    }).catch(err => console.error('[SUBMISSIONS] Failed to save contact:', err.message));
    return { success: true };
  }

  @Post('catering')
  async submitCateringInquiry(@Body() payload: any) {
    await this.mailService.sendCateringInquiry(payload);
    this.submissionsService.create({
      type: 'catering',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      data: { eventDate: payload.eventDate, eventType: payload.eventType, guestCount: payload.guestCount, location: payload.location, message: payload.message },
    }).catch(err => console.error('[SUBMISSIONS] Failed to save catering:', err.message));
    return { success: true };
  }

  @Post('hiring')
  async submitHiringApplication(@Body() payload: any) {
    await this.mailService.sendHiringApplication(payload);
    this.submissionsService.create({
      type: 'hiring',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      data: { position: payload.position, experience: payload.experience, message: payload.message, hasResume: !!payload.resume },
    }).catch(err => console.error('[SUBMISSIONS] Failed to save hiring:', err.message));
    return { success: true };
  }

  @Post('gift-card')
  async submitGiftCardRequest(@Body() payload: any) {
    await this.mailService.sendGiftCardRequest(payload);
    return { success: true };
  }
}
