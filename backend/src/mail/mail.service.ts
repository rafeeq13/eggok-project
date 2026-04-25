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
        if (!payload.password && current.password) next.password = current.password;
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
                preheader: 'SMTP configuration verified — your application can now send emails.',
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
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const trackOrderUrl = `${websiteUrl}/order-tracking?id=${order.id}`;
        const items = order.items || [];
        const itemsHtml = this.renderOwnerOrderItems(items);
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        const html = await this.renderTemplate('confirmation', {
            customerName: this.safeText(order.customerName),
            customerPhone: this.safeText(order.customerPhone),
            orderNumber: this.safeText(order.orderNumber),
            itemsHtml,
            itemCount,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            orderType: this.safeText(order.orderType),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
            deliveryApt: this.safeText(order.deliveryApt || ''),
            trackOrderUrl,
        });

        await this.sendMail(
            { to: order.customerEmail, subject: `Order Confirmed - #${order.orderNumber}`, html, text: `Hi ${order.customerName}, your order ${order.orderNumber} has been confirmed.` },
            settings,
        );
        return true;
    }

    async sendOwnerNotification(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!settings.enabled) {
            console.error('[OWNER-EMAIL] Skipped: mail is disabled in Admin → Mail Settings.');
            return false;
        }
        if (!this.isConfigured(settings)) {
            const missing = ['host', 'port', 'user', 'password', 'fromEmail', 'ownerEmail']
                .filter(k => !settings[k as keyof typeof settings]);
            console.error(`[OWNER-EMAIL] Skipped: mail not fully configured. Missing: ${missing.join(', ')}`);
            return false;
        }
        const ownerTo = String(settings.ownerEmail || '').trim();
        if (!ownerTo) {
            console.error('[OWNER-EMAIL] Skipped: ownerEmail is empty in mail settings.');
            return false;
        }

        console.log(`[OWNER-EMAIL] Preparing order #${order.orderNumber} for owner: ${ownerTo}`);

        const items = order.items || [];
        let itemsHtml: string;
        try {
            itemsHtml = this.renderOwnerOrderItems(items);
        } catch (err: any) {
            console.error(`[OWNER-EMAIL] Failed to render items for order #${order.orderNumber}:`, err?.message || err);
            throw err;
        }
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        let html: string;
        try {
            html = await this.renderTemplate('owner_notification', {
                orderNumber: this.safeText(order.orderNumber),
                customerName: this.safeText(order.customerName),
                customerEmail: this.safeText(order.customerEmail),
                customerPhone: this.safeText(order.customerPhone),
                itemsHtml,
                itemCount,
                subtotal: Number(order.subtotal || 0).toFixed(2),
                tax: Number(order.tax || 0).toFixed(2),
                tip: Number(order.tip || 0).toFixed(2),
                deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
                total: Number(order.total || 0).toFixed(2),
                orderType: this.safeText(order.orderType),
                deliveryAddress: this.safeText(order.deliveryAddress || ''),
                deliveryApt: this.safeText(order.deliveryApt || ''),
                deliveryInstructions: this.safeText(order.deliveryInstructions || ''),
            }) as string;
        } catch (err: any) {
            console.error(`[OWNER-EMAIL] Template render failed for owner_notification.ejs:`, err?.message || err);
            throw err;
        }

        await this.sendMail(
            { to: ownerTo, subject: `New Order Received - #${order.orderNumber}`, html, text: `New order ${order.orderNumber} from ${order.customerName}.` },
            settings,
        );
        console.log(`[OWNER-EMAIL] Sent successfully to ${ownerTo} for order #${order.orderNumber}`);
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
                    preheader: 'You requested a password reset. This link expires in 1 hour.',
                    intro: `Hi ${this.safeText(name)}, we received a request to reset your Eggs Ok account password. Click the button below to choose a new password.`,
                    cta: { text: 'Reset Password', link: resetLink },
                    footer: 'This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.',
                }),
                text: `Hi ${name},\n\nReset your Eggs Ok password:\n${resetLink}\n\nThis link expires in 1 hour.`,
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
                        preheader: `${name} sent a message from the contact page.`,
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
                        preheader: 'Our team will get back to you soon.',
                        intro: `Hi ${name}, we received your message and our team will get back to you soon.`,
                        sections: [{ title: 'What you sent', lines: [`Topic: ${subject}`, `Message: ${message}`] }],
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
                        preheader: `${name} — ${guestCount} guests on ${eventDate}.`,
                        intro: `${name} submitted a catering request from the website.`,
                        sections: [
                            { title: 'Event details', lines: [`Date: ${eventDate}`, `Guests: ${guestCount}`, `Event type: ${eventType}`, `Location: ${location}`] },
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
                        preheader: `We'll follow up about your event on ${eventDate}.`,
                        intro: `Hi ${name}, thanks for contacting Eggs Ok about your event on ${eventDate}.`,
                        sections: [{ title: 'Request summary', lines: [`Guests: ${guestCount}`, `Event type: ${eventType}`, `Location: ${location}`] }],
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

        const attachments: Array<{ filename: string; content: string; encoding: string }> = [];
        if (payload?.resume) {
            const match = payload.resume.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                const ext = match[1].includes('pdf') ? 'pdf' : match[1].includes('word') ? 'docx' : 'pdf';
                attachments.push({ filename: `${name.replace(/\s+/g, '_')}_Resume.${ext}`, content: match[2], encoding: 'base64' });
            }
        }

        await Promise.all([
            this.sendMail(
                {
                    to: settings.ownerEmail,
                    subject: `Hiring application: ${position}`,
                    replyTo: email,
                    html: this.wrapEmail({
                        eyebrow: 'Hiring Application',
                        title: 'New job application received',
                        preheader: `${name} applied for ${position}.`,
                        intro: `${name} applied for ${position}.${attachments.length > 0 ? ' Resume attached.' : ''}`,
                        sections: [
                            { title: 'Applicant details', lines: [`Email: ${email}`, `Phone: ${phone}`, `Experience: ${experience}`] },
                            { title: 'Message', lines: [message] },
                        ],
                    }),
                    text: `Hiring application\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPosition: ${position}\nExperience: ${experience}\n\n${message}`,
                    attachments,
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
                        preheader: `We received your application for ${position}.`,
                        intro: `Hi ${name}, thanks for applying for the ${position} role at Eggs Ok.`,
                        sections: [{ title: 'Application summary', lines: [`Position: ${position}`, `Experience: ${experience}`] }],
                        footer: 'Our team will review your application and reach out if there is a fit.',
                    }),
                    text: `Hi ${name}, we received your application for ${position}.`,
                },
                settings,
            ),
        ]);
    }

    async sendDeliveryUpdateEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const trackingUrl = order.deliveryTrackingUrl || `${websiteUrl}/order-tracking?id=${order.id}`;
        const items = order.items || [];
        const itemsHtml = this.renderOwnerOrderItems(items);
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        const html = await this.renderTemplate('order_status', {
            activeStep: 4,
            heroIcon: 'https://eggsokpa.com/webicons/Contactonthewayblack.png',
            heroTitle: 'Your order is on the way!',
            heroSubtitle: 'Great news! Your order has been picked up and is heading your way.',
            greetingMessage: `Great news! Your order ${this.safeText(order.orderNumber)} has been picked up and is heading your way.`,
            customerName: this.safeText(order.customerName),
            customerPhone: this.safeText(order.customerPhone),
            orderNumber: this.safeText(order.orderNumber),
            orderType: this.safeText(order.orderType),
            itemsHtml,
            itemCount,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
            deliveryApt: this.safeText(order.deliveryApt || ''),
            ctaText: 'Track Your Order',
            ctaUrl: trackingUrl,
            isCancelled: false,
            showReviewStars: false,
            driverName: this.safeText(order.deliveryDriverName || ''),
            driverEta: this.safeText(order.deliveryEta || ''),
        });

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Your order #${order.orderNumber} is on the way!`,
                html,
                text: `Hi ${order.customerName}, your order #${order.orderNumber} is on the way! Track: ${trackingUrl}`,
            },
            settings,
        );
        return true;
    }

    async sendDriverAssignedEmail(order: any, driverName: string, eta?: string) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const trackingUrl = order.deliveryTrackingUrl || `${websiteUrl}/order-tracking?id=${order.id}`;
        const items = order.items || [];
        const itemsHtml = this.renderOwnerOrderItems(items);
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        const html = await this.renderTemplate('order_status', {
            activeStep: 3,
            heroIcon: 'https://eggsokpa.com/webicons/ContactReadyforpickupblack.png',
            heroTitle: 'Your order is Picked Up!',
            heroSubtitle: 'Great news! Your order has been picked up.',
            greetingMessage: `Great news! Your order ${this.safeText(order.orderNumber)} has been picked up and is heading your way.`,
            customerName: this.safeText(order.customerName),
            customerPhone: this.safeText(order.customerPhone),
            orderNumber: this.safeText(order.orderNumber),
            orderType: this.safeText(order.orderType),
            itemsHtml,
            itemCount,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
            deliveryApt: this.safeText(order.deliveryApt || ''),
            ctaText: 'Track Your Order',
            ctaUrl: trackingUrl,
            isCancelled: false,
            showReviewStars: false,
            driverName: this.safeText(driverName),
            driverEta: this.safeText(eta || ''),
        });

        await this.sendMail({
            to: order.customerEmail,
            subject: `Driver assigned for order #${order.orderNumber}`,
            html,
            text: `Hi ${order.customerName}, driver ${driverName} has been assigned to your order #${order.orderNumber}. Track: ${trackingUrl}`,
        }, settings);
        return true;
    }

    async sendDeliveryCompletedEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const reviewUrl = `${websiteUrl}/review?order=${order.orderNumber}`;
        const items = order.items || [];
        const itemsHtml = this.renderOwnerOrderItems(items);
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        const html = await this.renderTemplate('order_status', {
            activeStep: 5,
            heroIcon: 'https://eggsokpa.com/webicons/Contactorderdeliveredyellow.png',
            heroTitle: 'Your order has been Delivered!',
            heroSubtitle: `Great news! your order ${this.safeText(order.orderNumber)} has been delivered. Enjoy your meal!`,
            greetingMessage: `Great news! your order ${this.safeText(order.orderNumber)} has been delivered.\nEnjoy your meal!`,
            customerName: this.safeText(order.customerName),
            customerPhone: this.safeText(order.customerPhone),
            orderNumber: this.safeText(order.orderNumber),
            orderType: this.safeText(order.orderType),
            itemsHtml,
            itemCount,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
            deliveryApt: this.safeText(order.deliveryApt || ''),
            ctaText: 'Leave A Review',
            ctaUrl: reviewUrl,
            isCancelled: false,
            showReviewStars: true,
            driverName: this.safeText(order.deliveryDriverName || ''),
            driverEta: '',
        });

        await this.sendMail({
            to: order.customerEmail,
            subject: `Order #${order.orderNumber} has been delivered!`,
            html,
            text: `Hi ${order.customerName}, your order #${order.orderNumber} has been delivered. Enjoy!`,
        }, settings);
        return true;
    }

    async sendOrderStatusEmail(order: any, newStatus: string) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const trackUrl = `${websiteUrl}/order-tracking?id=${order.id}`;
        const items = order.items || [];
        const itemsHtml = this.renderOwnerOrderItems(items);
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        const statusConfig: Record<string, { activeStep: number; heroIcon: string; heroTitle: string; heroSubtitle: string; greetingMessage: string }> = {
            confirmed: {
                activeStep: 1,
                heroIcon: 'https://eggsokpa.com/webicons/ContactOrderconfirmationBlack.png',
                heroTitle: 'Your Order is Confirmed!',
                heroSubtitle: 'Thanks for your order. Will be Ready very soon.',
                greetingMessage: 'Your order has been received and we\'re already getting it ready for you. Get ready for something delicious!',
            },
            preparing: {
                activeStep: 2,
                heroIcon: 'https://eggsokpa.com/webicons/Contactorderpreparedblack.png',
                heroTitle: 'Your Order is Being Prepared!',
                heroSubtitle: 'Our kitchen is working on your delicious meal right now.',
                greetingMessage: `The kitchen is now preparing your order #${this.safeText(order.orderNumber)}. It won't be long — get ready for something delicious!`,
            },
            ready: {
                activeStep: 3,
                heroIcon: 'https://eggsokpa.com/webicons/ContactReadyforpickupblack.png',
                heroTitle: order.orderType === 'delivery' ? 'Ready for Delivery!' : 'Your Order is Ready!',
                heroSubtitle: order.orderType === 'delivery'
                    ? 'Your order is packed and waiting for the driver.'
                    : 'Your order is ready for pick up at 3517 Lancaster Ave.',
                greetingMessage: order.orderType === 'delivery'
                    ? `Your order #${this.safeText(order.orderNumber)} is ready and waiting for a driver. We'll notify you once it's on the way!`
                    : `Your order #${this.safeText(order.orderNumber)} is ready! Head to 3517 Lancaster Ave, Philadelphia to pick it up.`,
            },
        };

        const config = statusConfig[newStatus];
        if (!config) return false;

        const html = await this.renderTemplate('order_status', {
            ...config,
            customerName: this.safeText(order.customerName),
            customerPhone: this.safeText(order.customerPhone),
            orderNumber: this.safeText(order.orderNumber),
            orderType: this.safeText(order.orderType),
            itemsHtml,
            itemCount,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
            deliveryApt: this.safeText(order.deliveryApt || ''),
            ctaText: 'Track Your Order',
            ctaUrl: trackUrl,
            isCancelled: false,
            showReviewStars: false,
            driverName: '',
            driverEta: '',
        });

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Order #${order.orderNumber} — ${config.heroTitle}`,
                html,
                text: `Hi ${order.customerName}, ${config.greetingMessage} Track: ${trackUrl}`,
            },
            settings,
        );
        return true;
    }

    async sendOrderCancelledEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const items = order.items || [];
        const itemsHtml = this.renderOwnerOrderItems(items);
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        const html = await this.renderTemplate('order_status', {
            activeStep: 0,
            heroIcon: 'https://eggsokpa.com/webicons/ContactOrderconfirmationBlack.png',
            heroTitle: 'Your Order has been Cancelled',
            heroSubtitle: `Order #${this.safeText(order.orderNumber)} was cancelled. If you didn't request this, please contact us.`,
            greetingMessage: `Your order #${this.safeText(order.orderNumber)} has been cancelled. If you didn't request this, please contact us right away.`,
            customerName: this.safeText(order.customerName),
            customerPhone: this.safeText(order.customerPhone),
            orderNumber: this.safeText(order.orderNumber),
            orderType: this.safeText(order.orderType),
            itemsHtml,
            itemCount,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
            deliveryApt: this.safeText(order.deliveryApt || ''),
            ctaText: 'Order Again',
            ctaUrl: `${websiteUrl}/order`,
            isCancelled: true,
            showReviewStars: false,
            driverName: '',
            driverEta: '',
        });

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Order #${order.orderNumber} has been cancelled`,
                html,
                text: `Hi ${order.customerName}, your order #${order.orderNumber} has been cancelled.`,
            },
            settings,
        );
        return true;
    }

    async sendPickupCompleteEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const reviewUrl = `${websiteUrl}/review?order=${order.orderNumber}`;
        const items = order.items || [];
        const itemsHtml = this.renderOwnerOrderItems(items);
        const itemCount = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

        const html = await this.renderTemplate('order_status', {
            activeStep: 5,
            heroIcon: 'https://eggsokpa.com/webicons/Contactorderdeliveredyellow.png',
            heroTitle: 'Your order has been Delivered!',
            heroSubtitle: `Great news! your order ${this.safeText(order.orderNumber)} has been delivered. Enjoy your meal!`,
            greetingMessage: `Great news! your order ${this.safeText(order.orderNumber)} has been delivered.\nEnjoy your meal!`,
            customerName: this.safeText(order.customerName),
            customerPhone: this.safeText(order.customerPhone),
            orderNumber: this.safeText(order.orderNumber),
            orderType: this.safeText(order.orderType || 'pickup'),
            itemsHtml,
            itemCount,
            subtotal: Number(order.subtotal || 0).toFixed(2),
            tax: Number(order.tax || 0).toFixed(2),
            tip: Number(order.tip || 0).toFixed(2),
            deliveryFee: Number(order.deliveryFee || 0).toFixed(2),
            total: Number(order.total || 0).toFixed(2),
            deliveryAddress: this.safeText(order.deliveryAddress || ''),
            deliveryApt: this.safeText(order.deliveryApt || ''),
            ctaText: 'Leave A Review',
            ctaUrl: reviewUrl,
            isCancelled: false,
            showReviewStars: true,
            driverName: '',
            driverEta: '',
        });

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Order #${order.orderNumber} picked up — Enjoy!`,
                html,
                text: `Hi ${order.customerName}, your order #${order.orderNumber} has been picked up. Enjoy!`,
            },
            settings,
        );
        return true;
    }

    async sendWelcomeEmail(name: string, email: string) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        await this.sendMail(
            {
                to: email,
                subject: 'Welcome to Eggs Ok!',
                html: this.wrapEmail({
                    eyebrow: 'Welcome',
                    title: `Welcome to Eggs Ok, ${this.safeText(name)}!`,
                    preheader: 'Your account is ready — earn points, track orders, and get exclusive offers.',
                    intro: 'Thanks for creating your account. You now have access to order tracking, saved addresses, loyalty rewards, and exclusive offers.',
                    cta: { text: 'Start Ordering', link: `${websiteUrl}/order` },
                    sections: [
                        {
                            title: 'Your perks',
                            lines: ['Earn points on every order', 'Save delivery addresses', 'Track orders in real-time', 'Exclusive member rewards'],
                        },
                    ],
                    footer: 'Start earning loyalty points with your first order!',
                }),
                text: `Welcome to Eggs Ok, ${name}! Start ordering at ${websiteUrl}/order`,
            },
            settings,
        );
        return true;
    }

    async sendTeamInviteEmail(payload: { name: string; email: string; role: string; setupLink: string }) {
        const settings = await this.assertMailReady();
        const name = this.safeText(payload.name);
        const email = this.safeText(payload.email);
        const role = this.safeText(payload.role);

        await this.sendMail(
            {
                to: email,
                subject: "You're invited to join the Eggs Ok team",
                html: this.wrapEmail({
                    eyebrow: 'Team Invitation',
                    title: "You're invited to Eggs Ok",
                    preheader: `You've been added as ${role}. Set up your account to get started.`,
                    intro: `Hi ${name}, you've been invited to join the Eggs Ok team as a ${role}. Click the button below to set your password and activate your account.`,
                    cta: { text: 'Set Up Your Account', link: payload.setupLink },
                    sections: [{ title: 'Your account details', lines: [`Name: ${name}`, `Email: ${email}`, `Role: ${role}`] }],
                    footer: 'This invitation link expires in 7 days. If you did not expect this invitation, you can safely ignore this email.',
                }),
                text: `Hi ${name}, you've been invited to join the Eggs Ok team as a ${role}.\n\nSet up your account: ${payload.setupLink}\n\nThis link expires in 7 days.`,
            },
            settings,
        );
    }

    /**
     * Sent to the recipient after a gift card purchase clears Stripe. Includes the
     * redemption code, balance, and the sender's personal message. Best-effort —
     * called from GiftCardsService.issueFromPayment.
     */
    async sendGiftCardIssuedEmail(card: {
        code: string;
        initialBalance: number | string;
        recipientName?: string | null;
        recipientEmail?: string | null;
        senderName?: string | null;
        message?: string | null;
        expiresAt?: string | null;
    }) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) {
            console.error('[GIFT-CARD EMAIL] Skipped: mail not configured or disabled.');
            return false;
        }
        if (!card.recipientEmail) {
            console.error('[GIFT-CARD EMAIL] Skipped: no recipient email on card.');
            return false;
        }

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const amount = Number(card.initialBalance || 0).toFixed(2);
        const recipientName = this.safeText(card.recipientName || 'there');
        const senderName = this.safeText(card.senderName || 'A friend');
        const personalMessage = this.safeText(card.message || '');
        const expiryLine = card.expiresAt
            ? `Expires ${card.expiresAt}`
            : 'Never expires — use it whenever you like.';

        const sections: Array<{ title: string; lines: string[] }> = [
            {
                title: 'Your gift card code',
                lines: [card.code, `Balance: $${amount}`, expiryLine],
            },
        ];
        if (personalMessage) {
            sections.push({ title: `Message from ${senderName}`, lines: [personalMessage] });
        }
        sections.push({
            title: 'How to redeem',
            lines: [
                'Add items to your cart and head to checkout.',
                'Enter the code above in the "Add coupon or gift card" field.',
                'The balance applies to your order — any remainder can be used later.',
            ],
        });

        await this.sendMail(
            {
                to: card.recipientEmail,
                subject: `${senderName} sent you a $${amount} Eggs Ok gift card`,
                html: this.wrapEmail({
                    eyebrow: 'Gift Card',
                    title: `You received a $${amount} Eggs Ok gift card`,
                    preheader: `${senderName} sent you a $${amount} Eggs Ok gift card. Code inside.`,
                    intro: `Hi ${recipientName}, ${senderName} sent you an Eggs Ok gift card worth $${amount}. Use the code below at checkout — the balance carries over between orders.`,
                    cta: { text: 'Order Now', link: `${websiteUrl}/order` },
                    sections,
                    footer: 'Keep this code safe — anyone with it can redeem the balance.',
                }),
                text: `Hi ${recipientName}, ${senderName} sent you a $${amount} Eggs Ok gift card.\n\nCode: ${card.code}\nBalance: $${amount}\n${personalMessage ? `\nMessage: ${personalMessage}\n` : ''}\nRedeem at ${websiteUrl}/order.`,
            },
            settings,
        );
        console.log(`[GIFT-CARD EMAIL] Sent to ${card.recipientEmail} for code ${card.code}`);
        return true;
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
                        preheader: `$${amount} gift card from ${senderName} to ${recipientName}.`,
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
                        title: 'You received an Eggs Ok gift card',
                        preheader: `${senderName} sent you a $${amount} Eggs Ok gift card.`,
                        intro: `${senderName} sent you an Eggs Ok gift card for $${amount}.`,
                        sections: [{ title: 'Message from the sender', lines: [message] }],
                        footer: 'Gift card fulfillment still depends on payment activation in the application.',
                    }),
                    text: `${senderName} sent you an Eggs Ok gift card for $${amount}. Message: ${message}`,
                },
                settings,
            ),
        ]);
    }

    // ─── Private: Core Mailer ────────────────────────────────────────────────────

    private async sendMail(
        options: {
            to: string;
            subject: string;
            html: string;
            text?: string;
            replyTo?: string;
            attachments?: Array<{ filename: string; content: string; encoding: string }>;
        },
        settings?: MailSettings,
    ) {
        const s = settings || (await this.assertMailReady());
        const transporter = nodemailer.createTransport({
            host: s.host,
            port: s.port,
            secure: s.secure,
            auth: { user: s.user, pass: s.password },
            tls: { rejectUnauthorized: false },
            logger: true,
            debug: true,
        });

        console.log(`[SMTP] Sending via ${s.host}:${s.port} (user: ${s.user})`);

        try {
            await transporter.sendMail({
                from: `"${s.fromName}" <${s.fromEmail}>`,
                to: options.to,
                replyTo: options.replyTo || s.fromEmail,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments,
            });
            console.log(`Email [${options.subject}] sent to: ${options.to}`);
        } catch (error) {
            console.error(`ERROR: Failed to send email to ${options.to}:`, error);
            throw error;
        }
    }

    // ─── Private: Guards & Settings ─────────────────────────────────────────────

    private async assertMailReady() {
        const settings = await this.getResolvedMailSettings();

        if (!settings.enabled) {
            console.error('[MAIL] Mail is disabled. Enable it in Admin → Mail Settings.');
            throw new BadRequestException('Email sending is disabled in mail settings.');
        }

        if (!this.isConfigured(settings)) {
            const missing = ['host', 'port', 'user', 'password', 'fromEmail', 'ownerEmail']
                .filter(k => !settings[k as keyof typeof settings]);
            console.error(`[MAIL] Missing fields: ${missing.join(', ')}`);
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
            ownerEmail: this.safeText(this.configService.get<string>('OWNER_EMAIL') || fromEmail || 'mrafiq6876@gmail.com'),
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
        return Boolean(settings.host && settings.port && settings.user && settings.password && settings.fromEmail && settings.ownerEmail);
    }

    // ─── Private: Template Rendering ────────────────────────────────────────────

    private async renderTemplate(templateName: string, context: Record<string, unknown>) {
        const templatePath = join(process.cwd(), 'src', 'mail', 'templates', `${templateName}.ejs`);
        return ejs.renderFile(templatePath, context);
    }

    private renderOwnerOrderItems(items: any[]) {
        const FONT_BODY = `'Geist','Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
        return items
            .map((item, index) => {
                const quantity = Number(item?.quantity || 1);
                const price = Number(item?.price || 0);
                const name = this.escapeHtml(item?.name || 'Item');
                const modifierTotal = (item.modifiers || []).reduce((sum: number, m: any) => sum + (Number(m.price) || 0), 0);
                const itemTotal = (price + modifierTotal) * quantity;
                const isLast = index === items.length - 1;

                let html = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${!isLast ? 'border-bottom:1px solid #E5E5E5;margin-bottom:12px;' : ''}">
                    <tr>
                        <td style="padding-bottom:12px;">
                            <p style="margin:0;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:#1A1A1A;line-height:1.3;">${name}</p>
                            <p style="margin:2px 0 0;font-family:${FONT_BODY};font-size:12px;color:#4D4D4D;font-weight:600;letter-spacing:0.4px;">QTY: X${quantity}</p>
                        </td>
                        <td align="right" valign="top" style="padding-bottom:12px;padding-left:12px;white-space:nowrap;">
                            <p style="margin:0;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:#1A1A1A;">$${itemTotal.toFixed(2)}</p>
                        </td>
                    </tr>`;

                if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
                    item.modifiers.forEach((mod: any) => {
                        const modPrice = Number(mod.price) || 0;
                        html += `<tr><td colspan="2" style="padding:0 0 4px 10px;"><span style="font-family:${FONT_BODY};font-size:12px;color:#4D4D4D;font-weight:500;">+ ${this.escapeHtml(mod.name)}${modPrice > 0 ? ` <span style="color:#777777;">($${modPrice.toFixed(2)})</span>` : ''}</span></td></tr>`;
                    });
                }

                if (item.specialInstructions) {
                    html += `<tr><td colspan="2" style="padding:2px 0 6px 10px;"><span style="font-family:${FONT_BODY};font-size:12px;color:#E3BF22;font-weight:600;font-style:italic;">Note: ${this.escapeHtml(item.specialInstructions)}</span></td></tr>`;
                }

                html += '</table>';
                return html;
            })
            .join('');
    }

    private renderOrderItems(items: any[]) {
        return items
            .map((item) => {
                const quantity = Number(item?.quantity || 0);
                const price = Number(item?.price || 0);
                const name = this.escapeHtml(item?.name || 'Item');
                let html = `<li style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;line-height:1.8;">${quantity}x ${name} — $${(price * quantity).toFixed(2)}`;

                if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
                    html += '<ul style="margin:4px 0 8px;padding-left:20px;list-style-type:none;">';
                    item.modifiers.forEach((mod: any) => {
                        html += `<li style="font-size:13px;color:#bbbbbb;font-family:Arial,sans-serif;">+ ${this.escapeHtml(mod.name)} — $${(Number(mod.price) * quantity).toFixed(2)}</li>`;
                    });
                    html += '</ul>';
                }

                html += '</li>';
                return html;
            })
            .join('');
    }

    // ─── Private: Email Layout Builder ──────────────────────────────────────────

    private wrapEmail(payload: {
        eyebrow: string;
        title: string;
        intro: string;
        preheader?: string;
        cta?: { text: string; link: string };
        sections?: Array<{ title: string; lines: string[] }>;
        footer?: string;
    }) {
        const year = new Date().getFullYear();
        const esc = (s: string) => this.escapeHtml(s);
        const FONT_BODY = `'Geist','Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
        const FONT_HEAD = `'Playfair Display',Georgia,'Times New Roman',serif`;

        const sectionsHtml = (payload.sections || []).map(s => `
  <tr><td style="padding:16px 28px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F9FA;border:1px solid #E5E5E5;border-left:4px solid #E3BF22;border-radius:12px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 8px;font-family:${FONT_BODY};font-size:12px;font-weight:700;color:#777777;letter-spacing:1.2px;text-transform:uppercase;">${esc(s.title)}</p>
        ${s.lines.map(l => `<p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:15px;font-weight:500;color:#0D0D0D;line-height:1.6;">${esc(l)}</p>`).join('')}
      </td></tr>
    </table>
  </td></tr>`).join('');

        const ctaHtml = payload.cta ? `
  <tr><td style="padding:24px 40px 4px;text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr><td style="background:#E3BF22;border-radius:8px;padding:12px 28px;">
        <a href="${payload.cta.link}" style="font-family:${FONT_BODY};font-size:16px;font-weight:600;color:#0D0D0D;text-decoration:none;">${esc(payload.cta.text)} &rsaquo;</a>
      </td></tr>
    </table>
  </td></tr>` : '';

        const footerNote = payload.footer ? `
  <tr><td style="padding:18px 28px 0;">
    <p style="margin:0;font-family:${FONT_BODY};font-size:14px;color:#777777;line-height:1.6;font-weight:500;text-align:center;">${esc(payload.footer)}</p>
  </td></tr>` : '';

        const preheader = payload.preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${esc(payload.preheader)}</div>` : '';

        return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${esc(payload.title)} - Eggs Ok</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }

    @media only screen and (max-width: 600px) {
      .email-wrapper { padding:16px 8px 30px !important; }
      .email-container { width:100% !important; max-width:100% !important; border-radius:16px !important; }
      .header-cell { padding:24px 16px 16px !important; }
      .header-logo { width:120px !important; height:120px !important; }
      .eyebrow-banner { font-size:10px !important; padding:8px 12px !important; letter-spacing:1px !important; }
      .hero-outer { padding:20px 14px 4px !important; }
      .hero-inner { padding:24px 16px 20px !important; }
      .hero-eyebrow { font-size:11px !important; }
      .hero-title { font-size:24px !important; }
      .hero-intro { font-size:14px !important; }
      .concern-cell { padding:24px 16px 20px !important; }
      .concern-title { font-size:22px !important; }
      .concern-subtitle { font-size:14px !important; }
      .concern-buttons { width:100% !important; max-width:100% !important; }
      .concern-btn-left { padding-right:4px !important; }
      .concern-btn-right { padding-left:4px !important; }
      .concern-btn-label { font-size:13px !important; }
      .concern-btn-info { font-size:11px !important; }
      .concern-btn-icon { width:24px !important; height:24px !important; }
      .footer-cell { padding:18px 14px !important; }
      .footer-info { font-size:12px !important; line-height:18px !important; }
      .footer-hours { font-size:12px !important; }
      .footer-social-text { font-size:11px !important; padding-right:6px !important; }
      .footer-social-icon { width:22px !important; height:22px !important; }
      .footer-copyright { font-size:11px !important; }
    }
    @media only screen and (max-width: 400px) {
      .email-wrapper { padding:10px 4px 20px !important; }
      .hero-title { font-size:20px !important; }
      .hero-intro { font-size:13px !important; }
      .concern-title { font-size:20px !important; }
      .footer-info { font-size:11px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:30px 16px 50px;font-family:${FONT_BODY};background-color:#F8F9FA;color:#4D4D4D;">
${preheader}
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8F9FA;">
<tr><td align="center" class="email-wrapper" style="padding:30px 16px 50px;">

<table width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(13,13,13,0.06);">

  <!-- HEADER -->
  <tr><td class="header-cell" style="background:#FFFFFF;padding:32px 24px 20px;text-align:center;border-bottom:1px solid #E5E5E5;">
    <img src="https://eggsokpa.com/webicons/logo.png" class="header-logo" width="150" height="150" alt="Eggs Ok" style="display:block;margin:0 auto 14px;border:0;">
  </td></tr>

  <!-- EYEBROW STRIPE -->
  <tr><td style="background:#E3BF22;padding:0;">
    <p class="eyebrow-banner" style="margin:0;padding:10px 16px;font-family:${FONT_BODY};font-size:12px;font-weight:700;color:#0D0D0D;letter-spacing:1.4px;text-transform:uppercase;text-align:center;">
      Fresh Made To Order &middot; Philadelphia, PA
    </p>
  </td></tr>

  <!-- HERO -->
  <tr><td class="hero-outer" style="padding:24px 24px 4px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F9FA;border:1px solid #E5E5E5;border-radius:12px;">
      <tr><td class="hero-inner" style="padding:30px 24px 26px;text-align:center;">
        <p class="hero-eyebrow" style="margin:0 0 10px;font-family:${FONT_BODY};font-size:12px;font-weight:700;color:#777777;letter-spacing:1.2px;text-transform:uppercase;">${esc(payload.eyebrow)}</p>
        <h1 class="hero-title" style="margin:0 0 10px;font-family:${FONT_HEAD};font-size:28px;font-weight:700;color:#0D0D0D;line-height:1.2;">${esc(payload.title)}</h1>
        <p class="hero-intro" style="margin:0;font-family:${FONT_BODY};font-size:16px;font-weight:500;color:#4D4D4D;line-height:1.6;">${esc(payload.intro)}</p>
      </td></tr>
    </table>
  </td></tr>

  ${sectionsHtml}
  ${ctaHtml}
  ${footerNote}

  <!-- CONCERN -->
  <tr><td class="concern-cell" style="padding:28px 28px 24px;text-align:center;border-top:1px solid #E5E5E5;margin-top:20px;">
    <h2 class="concern-title" style="margin:0 0 6px;font-family:${FONT_HEAD};font-size:28px;font-weight:700;color:#0D0D0D;line-height:1.2;">Do you have any concern?</h2>
    <p class="concern-subtitle" style="margin:0 0 22px;font-family:${FONT_BODY};font-size:16px;font-weight:500;color:#4D4D4D;line-height:1.6;">Don't hesitate to contact us if you have any questions.</p>
    <table class="concern-buttons" width="380" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:380px;width:100%;">
      <tr>
        <td width="48%" class="concern-btn-left" style="padding-right:6px;">
          <a href="mailto:eggsok3517@gmail.com" style="text-decoration:none;display:block;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F9FA;border:1px solid #E5E5E5;border-radius:12px;">
              <tr><td style="padding:16px 12px;text-align:center;">
                <span style="display:block;margin-bottom:6px;"><img src="https://eggsokpa.com/webicons/Contactemail.png" class="concern-btn-icon" style="width:28px;height:28px;border-radius:50%;" alt="Email" /></span>
                <span class="concern-btn-label" style="font-family:${FONT_BODY};font-size:15px;font-weight:700;color:#0D0D0D;display:block;">Email Us</span>
                <span class="concern-btn-info" style="font-family:${FONT_BODY};font-size:12px;color:#777777;font-weight:500;display:block;margin-top:3px;">eggsok3517@gmail.com</span>
              </td></tr>
            </table>
          </a>
        </td>
        <td width="48%" class="concern-btn-right" style="padding-left:6px;">
          <a href="tel:+12159489902" style="text-decoration:none;display:block;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F9FA;border:1px solid #E5E5E5;border-radius:12px;">
              <tr><td style="padding:16px 12px;text-align:center;">
                <span style="display:block;margin-bottom:6px;"><img src="https://eggsokpa.com/webicons/ContactLayer.png" class="concern-btn-icon" style="width:28px;height:28px;border-radius:50%;" alt="Phone" /></span>
                <span class="concern-btn-label" style="font-family:${FONT_BODY};font-size:15px;font-weight:700;color:#0D0D0D;display:block;">Speak To Us</span>
                <span class="concern-btn-info" style="font-family:${FONT_BODY};font-size:12px;color:#777777;font-weight:500;display:block;margin-top:3px;">(215) 948-9902</span>
              </td></tr>
            </table>
          </a>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr>
    <td class="footer-cell" style="background:#F8F9FA;padding:22px 24px;border-top:1px solid #E5E5E5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
        <tr>
          <td align="center" class="footer-info" style="font-family:${FONT_BODY};font-size:13px;color:#4D4D4D;font-weight:500;line-height:20px;padding:6px 0;">
            <span style="white-space:nowrap;display:inline-block;margin:0 6px;">
              <a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" style="color:#4D4D4D;text-decoration:none;font-family:${FONT_BODY};">
                <img src="https://eggsokpa.com/webicons/ContactLocation.png" width="14" height="14" style="vertical-align:middle;" alt="Location">
                3517 Lancaster Ave, Philadelphia, PA 19104
              </a>
            </span>
            <span style="white-space:nowrap;display:inline-block;margin:0 6px;">
              <a href="https://www.eggsokpa.com" style="color:#4D4D4D;text-decoration:none;font-family:${FONT_BODY};">
                <img src="https://eggsokpa.com/webicons/ContactWebsite.png" width="14" height="14" style="vertical-align:middle;" alt="Website">
                www.eggsokpa.com
              </a>
            </span>
            <span style="white-space:nowrap;display:inline-block;margin:0 6px;">
              <a href="tel:+12159489902" style="color:#4D4D4D;text-decoration:none;font-family:${FONT_BODY};">
                <img src="https://eggsokpa.com/webicons/ContactLayer.png" width="14" height="14" style="vertical-align:middle;" alt="Phone">
                (215) 948-9902
              </a>
            </span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" style="background:#E5E5E5;line-height:1px;font-size:1px;">&nbsp;</td></tr></table>
      <p class="footer-hours" style="margin:10px 0;text-align:center;font-family:${FONT_BODY};font-size:13px;color:#0D0D0D;font-weight:600;letter-spacing:0.3px;">
        Mon-Fri: 7AM-4PM &middot; Sat-Sun: 8AM-3PM
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" style="background:#E5E5E5;line-height:1px;font-size:1px;">&nbsp;</td></tr></table>
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:12px auto;">
        <tr>
          <td class="footer-social-text" style="font-family:${FONT_BODY};font-size:12px;color:#777777;font-weight:500;padding-right:10px;">Connect with us on social networks</td>
          <td style="padding:0 4px;"><a href="https://www.facebook.com/eggsokphilly" target="_blank" rel="noopener"><img src="https://eggsokpa.com/webicons/ContactFB.png" class="footer-social-icon" width="24" height="24" alt="Facebook"></a></td>
          <td style="padding:0 4px;"><a href="https://www.instagram.com/eggsokphilly" target="_blank" rel="noopener"><img src="https://eggsokpa.com/webicons/ContactInsta.png" class="footer-social-icon" width="24" height="24" alt="Instagram"></a></td>
          <td style="padding:0 4px;"><a href="https://www.tiktok.com/@eggsokphilly" target="_blank" rel="noopener"><img src="https://eggsokpa.com/webicons/Contacttiktok.png" class="footer-social-icon" width="24" height="24" alt="TikTok"></a></td>
          <td style="padding:0 4px;"><a href="https://maps.google.com/?q=3517+Lancaster+Ave+Philadelphia+PA+19104" target="_blank" rel="noopener"><img src="https://eggsokpa.com/webicons/Contactgoogleplus.png" class="footer-social-icon" width="24" height="24" alt="Google"></a></td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" style="background:#E5E5E5;line-height:1px;font-size:1px;">&nbsp;</td></tr></table>
      <p class="footer-copyright" style="margin:10px 0 0;text-align:center;font-family:${FONT_BODY};font-size:12px;color:#777777;font-weight:500;">
        &copy; ${year} Eggs Ok. All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
    }


    // ─── Private: Utilities ──────────────────────────────────────────────────────

    private toBoolean(value: unknown) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value > 0;
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