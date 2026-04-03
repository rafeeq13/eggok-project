import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { join } from 'path';
import { SettingsService } from '../settings/settings.service';

type MailSettings = {
    enabled: boolean;
    provider: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromEmail: string;
    ownerEmail: string;
};

type PublicMailSettings = Omit<MailSettings, 'password'> & {
    configured: boolean;
    hasPassword: boolean;
};

const MAIL_SETTINGS_KEY = 'mail_settings';

@Injectable()
export class MailService {
    constructor(
        private readonly configService: ConfigService,
        private readonly settingsService: SettingsService,
    ) { }

    async getMailSettings(): Promise<PublicMailSettings> {
        const settings = await this.getResolvedMailSettings();
        return this.toPublicSettings(settings);
    }

    async updateMailSettings(payload: Partial<MailSettings>): Promise<PublicMailSettings> {
        const current = await this.getResolvedMailSettings();
        const next = this.normalizeMailSettings(payload, current);

        if (!payload.password && current.password) {
            next.password = current.password;
        }

        await this.settingsService.setSetting(MAIL_SETTINGS_KEY, next);
        return this.toPublicSettings(next);
    }

    async sendTestEmail(to?: string) {
        const settings = await this.assertMailReady();
        const targetEmail = (to || settings.ownerEmail || settings.fromEmail).trim();

        await this.sendMail({
            to: targetEmail,
            subject: 'Eggs Ok email integration test',
            html: this.wrapEmail({
                eyebrow: 'Email Test',
                title: 'Your mail setup is working',
                intro: `This test email confirms that ${settings.fromName} can send messages from the application.`,
                sections: [
                    {
                        title: 'SMTP connection',
                        lines: [
                            `Host: ${settings.host}:${settings.port}`,
                            `Security: ${settings.secure ? 'SSL/TLS' : 'STARTTLS or plain SMTP'}`,
                            `From: ${settings.fromName} <${settings.fromEmail}>`,
                        ],
                    },
                ],
                footer: 'If you received this email, the application-wide mail flow is connected.',
            }),
            text: `Eggs Ok email integration test\n\nHost: ${settings.host}:${settings.port}\nFrom: ${settings.fromName} <${settings.fromEmail}>`,
        });
    }

    async sendOrderConfirmation(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) {
            return false;
        }

        const itemsHtml = this.renderOrderItems(order.items || []);
        const html = await this.renderTemplate('confirmation', {
            customerName: this.safeText(order.customerName),
            orderNumber: this.safeText(order.orderNumber),
            itemsHtml,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            orderType: this.safeText(order.orderType),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
        });

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Order Confirmed - #${order.orderNumber}`,
                html,
                text: `Hi ${order.customerName}, your order ${order.orderNumber} has been confirmed.`,
            },
            settings,
        );

        return true;
    }

    async sendOwnerNotification(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) {
            return false;
        }

        const itemsHtml = this.renderOrderItems(order.items || []);
        const html = await this.renderTemplate('owner_notification', {
            orderNumber: this.safeText(order.orderNumber),
            customerName: this.safeText(order.customerName),
            customerEmail: this.safeText(order.customerEmail),
            customerPhone: this.safeText(order.customerPhone),
            itemsHtml,
            total: Number(order.total || 0).toFixed(2),
            orderType: this.safeText(order.orderType),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
        });

        await this.sendMail(
            {
                to: settings.ownerEmail,
                subject: `New Order Received - #${order.orderNumber}`,
                html,
                text: `New order ${order.orderNumber} from ${order.customerName}.`,
            },
            settings,
        );

        return true;
    }

    async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
        const settings = await this.assertMailReady();

        await this.sendMail(
            {
                to,
                subject: 'Reset your Eggs Ok password',
                html: this.wrapEmail({
                    eyebrow: 'Password Reset',
                    title: 'Reset your password',
                    intro: `Hi ${this.safeText(name)}, we received a request to reset your Eggs Ok account password. Click the button below to choose a new password.`,
                    cta: {
                        text: 'Reset Password',
                        link: resetLink,
                    },
                    footer: 'This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.',
                }),
                text: `Hi ${name},\n\nClick the link below to reset your Eggs Ok password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.`,
            },
            settings,
        );
    }

    async sendContactMessage(payload: any) {
        const settings = await this.assertMailReady();
        const name = this.safeText(payload?.name);
        const email = this.safeText(payload?.email);
        const phone = this.safeText(payload?.phone || 'Not provided');
        const subject = this.safeText(payload?.subject || 'General Inquiry');
        const message = this.safeText(payload?.message);

        await Promise.all([
            this.sendMail(
                {
                    to: settings.ownerEmail,
                    subject: `Contact form: ${subject}`,
                    replyTo: email,
                    html: this.wrapEmail({
                        eyebrow: 'Contact Form',
                        title: 'New website contact message',
                        intro: `${name} sent a new message from the contact page.`,
                        sections: [
                            { title: 'Contact details', lines: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`] },
                            { title: 'Topic', lines: [subject] },
                            { title: 'Message', lines: [message] },
                        ],
                    }),
                    text: `Contact form\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\n${message}`,
                },
                settings,
            ),
            this.sendMail(
                {
                    to: email,
                    subject: 'We received your message',
                    html: this.wrapEmail({
                        eyebrow: 'Contact Request',
                        title: 'Thanks for reaching out',
                        intro: `Hi ${name}, we received your message and our team will get back to you soon.`,
                        sections: [
                            { title: 'What you sent', lines: [`Topic: ${subject}`, `Message: ${message}`] },
                        ],
                        footer: 'If your question is urgent, you can also call the store directly.',
                    }),
                    text: `Hi ${name}, we received your message about "${subject}" and will get back to you soon.`,
                },
                settings,
            ),
        ]);
    }

    async sendCateringInquiry(payload: any) {
        const settings = await this.assertMailReady();
        const name = this.safeText(payload?.name);
        const email = this.safeText(payload?.email);
        const phone = this.safeText(payload?.phone);
        const eventDate = this.safeText(payload?.eventDate);
        const eventType = this.safeText(payload?.eventType || 'Not specified');
        const guestCount = this.safeText(payload?.guestCount);
        const location = this.safeText(payload?.location || 'Not provided');
        const message = this.safeText(payload?.message || 'No extra details provided.');

        await Promise.all([
            this.sendMail(
                {
                    to: settings.ownerEmail,
                    subject: `Catering inquiry from ${name}`,
                    replyTo: email,
                    html: this.wrapEmail({
                        eyebrow: 'Catering Inquiry',
                        title: 'New catering request received',
                        intro: `${name} submitted a catering request from the website.`,
                        sections: [
                            {
                                title: 'Event details',
                                lines: [
                                    `Date: ${eventDate}`,
                                    `Guests: ${guestCount}`,
                                    `Event type: ${eventType}`,
                                    `Location: ${location}`,
                                ],
                            },
                            { title: 'Contact details', lines: [`Email: ${email}`, `Phone: ${phone}`] },
                            { title: 'Additional notes', lines: [message] },
                        ],
                    }),
                    text: `Catering inquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${eventDate}\nGuests: ${guestCount}\nEvent type: ${eventType}\nLocation: ${location}\n\n${message}`,
                },
                settings,
            ),
            this.sendMail(
                {
                    to: email,
                    subject: 'We received your catering request',
                    html: this.wrapEmail({
                        eyebrow: 'Catering Request',
                        title: 'Your catering inquiry is in',
                        intro: `Hi ${name}, thanks for contacting Eggs Ok about your event on ${eventDate}.`,
                        sections: [
                            { title: 'Request summary', lines: [`Guests: ${guestCount}`, `Event type: ${eventType}`, `Location: ${location}`] },
                        ],
                        footer: 'Our team will review the details and follow up with you shortly.',
                    }),
                    text: `Hi ${name}, we received your catering request for ${eventDate} and will follow up shortly.`,
                },
                settings,
            ),
        ]);
    }

    async sendHiringApplication(payload: any) {
        const settings = await this.assertMailReady();
        const name = this.safeText(payload?.name);
        const email = this.safeText(payload?.email);
        const phone = this.safeText(payload?.phone);
        const position = this.safeText(payload?.position);
        const experience = this.safeText(payload?.experience || 'Not provided');
        const message = this.safeText(payload?.message || 'No additional notes provided.');

        await Promise.all([
            this.sendMail(
                {
                    to: settings.ownerEmail,
                    subject: `Hiring application: ${position}`,
                    replyTo: email,
                    html: this.wrapEmail({
                        eyebrow: 'Hiring Application',
                        title: 'New job application received',
                        intro: `${name} applied for ${position}.`,
                        sections: [
                            { title: 'Applicant details', lines: [`Email: ${email}`, `Phone: ${phone}`, `Experience: ${experience}`] },
                            { title: 'Message', lines: [message] },
                        ],
                    }),
                    text: `Hiring application\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPosition: ${position}\nExperience: ${experience}\n\n${message}`,
                },
                settings,
            ),
            this.sendMail(
                {
                    to: email,
                    subject: 'We received your application',
                    html: this.wrapEmail({
                        eyebrow: 'Application Received',
                        title: 'Thanks for applying',
                        intro: `Hi ${name}, thanks for applying for the ${position} role at Eggs Ok.`,
                        sections: [
                            { title: 'Application summary', lines: [`Position: ${position}`, `Experience: ${experience}`] },
                        ],
                        footer: 'Our team will review your application and reach out if there is a fit.',
                    }),
                    text: `Hi ${name}, we received your application for ${position}.`,
                },
                settings,
            ),
        ]);
    }

    async sendGiftCardRequest(payload: any) {
        const settings = await this.assertMailReady();
        const amount = Number(payload?.amount || 0).toFixed(2);
        const recipientName = this.safeText(payload?.recipientName);
        const recipientEmail = this.safeText(payload?.recipientEmail);
        const senderName = this.safeText(payload?.senderName);
        const message = this.safeText(payload?.message || 'Enjoy!');

        await Promise.all([
            this.sendMail(
                {
                    to: settings.ownerEmail,
                    subject: `Gift card request for ${recipientName}`,
                    replyTo: recipientEmail,
                    html: this.wrapEmail({
                        eyebrow: 'Gift Card Request',
                        title: 'New gift card submission received',
                        intro: `${senderName} submitted a gift card request for ${recipientName}.`,
                        sections: [
                            { title: 'Gift details', lines: [`Amount: $${amount}`, `Recipient: ${recipientName}`, `Recipient email: ${recipientEmail}`] },
                            { title: 'Personal message', lines: [message] },
                        ],
                        footer: 'This request came from the website gift card page.',
                    }),
                    text: `Gift card request\n\nAmount: $${amount}\nRecipient: ${recipientName}\nRecipient email: ${recipientEmail}\nSender: ${senderName}\n\n${message}`,
                },
                settings,
            ),
            this.sendMail(
                {
                    to: recipientEmail,
                    subject: `A gift card is waiting for you`,
                    html: this.wrapEmail({
                        eyebrow: 'Gift Card',
                        title: 'You received an Eggs Ok gift card request',
                        intro: `${senderName} sent you an Eggs Ok gift card request for $${amount}.`,
                        sections: [
                            { title: 'Message from the sender', lines: [message] },
                        ],
                        footer: 'Gift card fulfillment still depends on payment activation in the application.',
                    }),
                    text: `${senderName} sent you an Eggs Ok gift card request for $${amount}. Message: ${message}`,
                },
                settings,
            ),
        ]);
    }

    private async sendMail(
        options: {
            to: string;
            subject: string;
            html: string;
            text?: string;
            replyTo?: string;
        },
        settings?: MailSettings,
    ) {
        const resolvedSettings = settings || (await this.assertMailReady());
        const transporter = nodemailer.createTransport({
            host: resolvedSettings.host,
            port: resolvedSettings.port,
            secure: resolvedSettings.secure,
            auth: {
                user: resolvedSettings.user,
                pass: resolvedSettings.password,
            },
            tls: {
                rejectUnauthorized: false,
            },
            logger: true,
            debug: true,
        });

        console.log(`[SMTP] Sending via ${resolvedSettings.host}:${resolvedSettings.port} (user: ${resolvedSettings.user})`);

        try {
            await transporter.sendMail({
                from: `"${resolvedSettings.fromName}" <${resolvedSettings.fromEmail}>`,
                to: options.to,
                replyTo: options.replyTo || resolvedSettings.fromEmail,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            console.log(`Email [${options.subject}] sent successfully to: ${options.to}`);
        } catch (error) {
            console.error(`ERROR: Failed to send email to ${options.to}:`, error);
            throw error;
        }
    }

    private async assertMailReady() {
        const settings = await this.getResolvedMailSettings();

        if (!settings.enabled) {
            console.error('[MAIL] assertMailReady failed: mail is disabled. Enable it in Admin → Mail Settings.');
            throw new BadRequestException('Email sending is disabled in mail settings.');
        }

        if (!this.isConfigured(settings)) {
            const missing = ['host', 'port', 'user', 'password', 'fromEmail', 'ownerEmail']
                .filter(k => !settings[k as keyof typeof settings]);
            console.error(`[MAIL] assertMailReady failed: missing fields: ${missing.join(', ')}`);
            throw new BadRequestException('Email settings are incomplete. Please configure SMTP in the admin panel.');
        }

        return settings;
    }

    private async getResolvedMailSettings(): Promise<MailSettings> {
        const stored = await this.settingsService.getSetting(MAIL_SETTINGS_KEY);
        return this.normalizeMailSettings(stored, this.getEnvMailSettings());
    }

    private getEnvMailSettings(): MailSettings {
        const fromEmail = this.safeText(this.configService.get<string>('MAIL_FROM_ADDRESS') || '');
        const fromName = this.safeText(this.configService.get<string>('MAIL_FROM_NAME') || 'Eggs Ok');

        return {
            enabled: this.toBoolean(this.configService.get('MAIL_ENABLED') ?? true),
            provider: this.safeText(this.configService.get<string>('MAIL_MAILER') || 'smtp'),
            host: this.safeText(this.configService.get<string>('MAIL_HOST') || ''),
            port: Number(this.configService.get<number>('MAIL_PORT') || 587),
            secure: this.configService.get('MAIL_ENCRYPTION') === 'ssl',
            user: this.safeText(this.configService.get<string>('MAIL_USERNAME') || ''),
            password: this.safeText(this.configService.get<string>('MAIL_PASSWORD') || '').replace(/\s/g, ''),
            fromName,
            fromEmail,
            ownerEmail: this.safeText(
                this.configService.get<string>('OWNER_EMAIL') || fromEmail || 'mrafiq6876@gmail.com',
            ),
        };
    }

    private normalizeMailSettings(payload: Partial<MailSettings> | null | undefined, fallback: MailSettings): MailSettings {
        return {
            enabled: payload?.enabled === undefined ? fallback.enabled : this.toBoolean(payload.enabled),
            provider: this.safeText(payload?.provider || fallback.provider || 'smtp'),
            host: this.safeText(payload?.host || fallback.host),
            port: Number(payload?.port ?? fallback.port ?? 587),
            secure: payload?.secure === undefined ? fallback.secure : this.toBoolean(payload.secure),
            user: this.safeText(payload?.user || fallback.user),
            password: payload?.password !== undefined ? this.safeText(payload.password) : fallback.password,
            fromName: this.safeText(payload?.fromName || fallback.fromName || 'Eggs Ok'),
            fromEmail: this.safeText(payload?.fromEmail || fallback.fromEmail),
            ownerEmail: this.safeText(payload?.ownerEmail || fallback.ownerEmail),
        };
    }

    private toPublicSettings(settings: MailSettings): PublicMailSettings {
        return {
            enabled: settings.enabled,
            provider: settings.provider,
            host: settings.host,
            port: settings.port,
            secure: settings.secure,
            user: settings.user,
            fromName: settings.fromName,
            fromEmail: settings.fromEmail,
            ownerEmail: settings.ownerEmail,
            configured: this.isConfigured(settings),
            hasPassword: Boolean(settings.password),
        };
    }

    private isConfigured(settings: MailSettings) {
        return Boolean(
            settings.host &&
            settings.port &&
            settings.user &&
            settings.password &&
            settings.fromEmail &&
            settings.ownerEmail,
        );
    }

    private async renderTemplate(templateName: string, context: Record<string, unknown>) {
        const templatePath = join(process.cwd(), 'src', 'mail', 'templates', `${templateName}.ejs`);
        return ejs.renderFile(templatePath, context);
    }

    private renderOrderItems(items: any[]) {
        return items
            .map((item) => {
                const quantity = Number(item?.quantity || 0);
                const price = Number(item?.price || 0);
                const name = this.escapeHtml(item?.name || 'Item');
                let html = `<li>${quantity}x ${name} - $${(price * quantity).toFixed(2)}`;

                if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
                    html += '<ul style="margin: 4px 0 8px; padding-left: 20px; list-style-type: none;">';
                    item.modifiers.forEach((mod: any) => {
                        html += `<li style="font-size: 13px; color: #888;">+ ${this.escapeHtml(mod.name)} - $${(Number(mod.price) * quantity).toFixed(2)}</li>`;
                    });
                    html += '</ul>';
                }

                html += '</li>';
                return html;
            })
            .join('');
    }

    private wrapEmail(payload: {
        eyebrow: string;
        title: string;
        intro: string;
        cta?: { text: string; link: string };
        sections?: Array<{ title: string; lines: string[] }>;
        footer?: string;
    }) {
        const ctaHtml = payload.cta ? `
          <div style="margin-top: 28px; text-align: center;">
            <a href="${payload.cta.link}" style="display: inline-block; padding: 14px 28px; background-color: #FED800; color: #000000; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 15px; letter-spacing: 0.5px;">${this.escapeHtml(payload.cta.text)}</a>
          </div>` : '';

        const sectionsHtml = (payload.sections || [])
            .map(
                (section) => `
          <div style="margin-top: 24px;">
            <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #888888; margin-bottom: 8px;">${this.escapeHtml(section.title)}</div>
            <div style="background: #111111; border: 1px solid #222222; border-radius: 10px; padding: 16px;">
              ${section.lines
                        .map(
                            (line) =>
                                `<div style="font-size: 14px; line-height: 1.6; color: #f2f2f2; margin-bottom: 8px;">${this.escapeHtml(line)}</div>`,
                        )
                        .join('')}
            </div>
          </div>`,
            )
            .join('');

        return `
      <div style="margin: 0; padding: 24px; background: #050505; font-family: Arial, sans-serif; color: #ffffff;">
        <div style="max-width: 640px; margin: 0 auto; background: #000000; border: 1px solid #1f1f1f; border-radius: 16px; overflow: hidden;">
          <div style="background: #FED800; padding: 24px 28px;">
            <div style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #000000; margin-bottom: 8px;">${this.escapeHtml(payload.eyebrow)}</div>
            <div style="font-size: 28px; font-weight: 800; line-height: 1.1; color: #000000;">${this.escapeHtml(payload.title)}</div>
          </div>
          <div style="padding: 28px;">
            <div style="font-size: 15px; line-height: 1.7; color: #d7d7d7;">${this.escapeHtml(payload.intro)}</div>
            ${ctaHtml}
            ${sectionsHtml}
            ${payload.footer
                ? `<div style="margin-top: 28px; font-size: 13px; line-height: 1.6; color: #888888;">${this.escapeHtml(payload.footer)}</div>`
                : ''
            }
          </div>
        </div>
      </div>
    `;
    }

    private toBoolean(value: unknown) {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'number') {
            return value > 0;
        }

        return String(value).toLowerCase() === 'true';
    }

    private safeText(value: unknown) {
        return String(value ?? '').trim();
    }

    private escapeHtml(value: string) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
