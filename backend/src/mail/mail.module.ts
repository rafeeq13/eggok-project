import { Global, Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Global()
@Module({
    imports: [SettingsModule],
    controllers: [MailController],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
