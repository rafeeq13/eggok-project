import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('settings')
  getMailSettings() {
    return this.mailService.getMailSettings();
  }

  @Put('settings')
  updateMailSettings(@Body() payload: any) {
    return this.mailService.updateMailSettings(payload);
  }

  @Post('test')
  async sendTestEmail(@Body() payload: { to?: string }) {
    await this.mailService.sendTestEmail(payload?.to);
    return { success: true };
  }

  @Post('contact')
  async submitContactMessage(@Body() payload: any) {
    await this.mailService.sendContactMessage(payload);
    return { success: true };
  }

  @Post('catering')
  async submitCateringInquiry(@Body() payload: any) {
    await this.mailService.sendCateringInquiry(payload);
    return { success: true };
  }

  @Post('hiring')
  async submitHiringApplication(@Body() payload: any) {
    await this.mailService.sendHiringApplication(payload);
    return { success: true };
  }

  @Post('gift-card')
  async submitGiftCardRequest(@Body() payload: any) {
    await this.mailService.sendGiftCardRequest(payload);
    return { success: true };
  }
}
