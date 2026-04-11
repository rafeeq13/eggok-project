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
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const itemsHtml = this.renderOrderItems(order.items || []);
        const html = await this.renderTemplate('owner_notification', {
            orderNumber: this.safeText(order.orderNumber),
            customerName: this.safeText(order.customerName),
            customerEmail: this.safeText(order.customerEmail),
            customerPhone: this.safeText(order.customerPhone),
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
            { to: settings.ownerEmail, subject: `New Order Received - #${order.orderNumber}`, html, text: `New order ${order.orderNumber} from ${order.customerName}.` },
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

        const sections: Array<{ title: string; lines: string[] }> = [
            { title: 'Order details', lines: [`Order: #${this.safeText(order.orderNumber)}`, `Delivering to: ${this.safeText(order.deliveryAddress || '')}`] },
        ];
        if (order.deliveryDriverName) {
            sections.push({
                title: 'Your driver',
                lines: [`Name: ${this.safeText(order.deliveryDriverName)}`, ...(order.deliveryEta ? [`ETA: ${this.safeText(order.deliveryEta)}`] : [])],
            });
        }

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Your order #${order.orderNumber} is on the way!`,
                html: this.wrapEmail({
                    eyebrow: 'Delivery Update',
                    title: 'Your order is on the way!',
                    preheader: `Order #${order.orderNumber} has been picked up and is heading to you.`,
                    intro: `Hi ${this.safeText(order.customerName)}, great news! Your order #${this.safeText(order.orderNumber)} has been picked up and is heading your way.`,
                    cta: { text: 'Track Your Delivery', link: trackingUrl },
                    sections,
                    footer: 'You can track your delivery in real-time using the button above. If you have any questions, reply to this email or call the store.',
                }),
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

        await this.sendMail({
            to: order.customerEmail,
            subject: `Driver assigned for order #${order.orderNumber}`,
            html: this.wrapEmail({
                eyebrow: 'Driver Assigned',
                title: `${this.safeText(driverName)} is on the way!`,
                preheader: `Your driver has been assigned${eta ? ` — ETA ${eta}` : ''}.`,
                intro: `Hi ${this.safeText(order.customerName)}, a driver has been assigned to deliver your order #${this.safeText(order.orderNumber)}.${eta ? ` Estimated delivery: ${this.safeText(eta)}.` : ''}`,
                cta: { text: 'Track Your Delivery', link: trackingUrl },
                sections: [{ title: 'Driver details', lines: [`Name: ${this.safeText(driverName)}`] }],
                footer: 'You will receive another update when your order is delivered.',
            }),
            text: `Hi ${order.customerName}, driver ${driverName} has been assigned to your order #${order.orderNumber}. Track: ${trackingUrl}`,
        }, settings);
        return true;
    }

    async sendDeliveryCompletedEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const sections: Array<{ title: string; lines: string[] }> = [];
        if (order.deliveryDriverName) {
            sections.push({ title: 'Delivered by', lines: [`Driver: ${this.safeText(order.deliveryDriverName)}`] });
        }

        await this.sendMail({
            to: order.customerEmail,
            subject: `Order #${order.orderNumber} has been delivered!`,
            html: this.wrapEmail({
                eyebrow: 'Delivered',
                title: 'Your order has arrived!',
                preheader: 'Enjoy your food — and leave us a review if you loved it!',
                intro: `Hi ${this.safeText(order.customerName)}, your order #${this.safeText(order.orderNumber)} has been delivered. Enjoy your meal!`,
                cta: { text: 'Leave a Review', link: `${websiteUrl}/review?order=${order.orderNumber}` },
                sections,
                footer: 'Thank you for ordering from Eggs Ok! We would love to hear your feedback.',
            }),
            text: `Hi ${order.customerName}, your order #${order.orderNumber} has been delivered. Enjoy!`,
        }, settings);
        return true;
    }

    async sendOrderStatusEmail(order: any, newStatus: string) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const trackUrl = `${websiteUrl}/order-tracking?id=${order.id}`;

        const statusMessages: Record<string, { title: string; intro: string; preheader: string }> = {
            confirmed: {
                title: 'Order Confirmed!',
                preheader: `Order #${order.orderNumber} confirmed — the kitchen is getting ready.`,
                intro: `Great news! Your order #${this.safeText(order.orderNumber)} has been confirmed and the kitchen is getting ready.`,
            },
            preparing: {
                title: 'Your order is being prepared',
                preheader: `The kitchen is working on order #${order.orderNumber} right now.`,
                intro: `The kitchen is now preparing your order #${this.safeText(order.orderNumber)}. It won't be long!`,
            },
            ready: {
                title: order.orderType === 'delivery' ? 'Ready for driver pickup' : 'Your order is ready!',
                preheader: order.orderType === 'delivery'
                    ? `Order #${order.orderNumber} is ready and waiting for a driver.`
                    : `Come grab order #${order.orderNumber} at 3517 Lancaster Ave.`,
                intro: order.orderType === 'delivery'
                    ? `Your order #${this.safeText(order.orderNumber)} is ready and waiting for a driver.`
                    : `Your order #${this.safeText(order.orderNumber)} is ready! Head to 3517 Lancaster Ave to pick it up.`,
            },
        };

        const msg = statusMessages[newStatus];
        if (!msg) return false;

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Order #${order.orderNumber} — ${msg.title}`,
                html: this.wrapEmail({
                    eyebrow: 'Order Update',
                    title: msg.title,
                    preheader: msg.preheader,
                    intro: `Hi ${this.safeText(order.customerName)}, ${msg.intro}`,
                    cta: { text: 'Track Your Order', link: trackUrl },
                    footer: 'You can track your order status in real-time using the button above.',
                }),
                text: `Hi ${order.customerName}, ${msg.intro} Track: ${trackUrl}`,
            },
            settings,
        );
        return true;
    }

    async sendOrderCancelledEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Order #${order.orderNumber} has been cancelled`,
                html: this.wrapEmail({
                    eyebrow: 'Order Cancelled',
                    title: 'Your order has been cancelled',
                    preheader: `Order #${order.orderNumber} was cancelled. Questions? Reply to this email.`,
                    intro: `Hi ${this.safeText(order.customerName)}, your order #${this.safeText(order.orderNumber)} has been cancelled. If you didn't request this, please contact us.`,
                    cta: { text: 'Order Again', link: `${websiteUrl}/order` },
                    sections: [{ title: 'Order details', lines: [`Order: #${this.safeText(order.orderNumber)}`, `Total: $${Number(order.total).toFixed(2)}`] }],
                    footer: 'If you have any questions, reply to this email or call us.',
                }),
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
        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Order #${order.orderNumber} picked up — Enjoy!`,
                html: this.wrapEmail({
                    eyebrow: 'Picked Up',
                    title: 'Enjoy your meal!',
                    preheader: 'Thanks for choosing Eggs Ok — we hope you love it!',
                    intro: `Hi ${this.safeText(order.customerName)}, your order #${this.safeText(order.orderNumber)} has been picked up. Thank you for choosing Eggs Ok!`,
                    cta: { text: 'Leave a Review', link: `${websiteUrl}/review?order=${order.orderNumber}` },
                    footer: 'We hope you love your food! Consider leaving us a review.',
                }),
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

        const sectionsHtml = (payload.sections || []).map(s => `
      <tr><td style="padding:20px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;overflow:hidden;">
          <tr><td style="background:#FED800;padding:10px 20px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#000;letter-spacing:1.5px;text-transform:uppercase;">${esc(s.title)}</span>
          </td></tr>
          <tr><td style="padding:16px 20px;">
            ${s.lines.map(l => `<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#FEFEFE;">${esc(l)}</p>`).join('')}
          </td></tr>
        </table>
      </td></tr>`).join('');

        const ctaHtml = payload.cta ? `
      <tr><td style="padding:32px 40px 0;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr><td style="background-color:#FFFFFF;border-radius:10px;padding:16px 44px;">
          <a href="${payload.cta.link}" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:900;color:#000000;text-decoration:none;letter-spacing:0.5px;text-transform:uppercase;">${esc(payload.cta.text)}</a>
        </td></tr></table>
        <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#555555;">Or visit us at <a href="https://eggsokphilly.com" style="color:#FED800;text-decoration:none;">eggsokphilly.com</a></p>
      </td></tr>` : '';

        const footerNote = payload.footer ? `
      <tr><td style="padding:20px 40px 0;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#999999;line-height:1.7;">${esc(payload.footer)}</p>
      </td></tr>` : '';

        return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>${esc(payload.title)}</title></head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1a1a1a;">
<tr><td align="center" style="padding:30px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

  <!-- HEADER -->
  <tr><td style="background-color:#000000;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background-color:#FED800;padding:6px 0;text-align:center;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#000000;letter-spacing:2px;text-transform:uppercase;">Fresh Made To Order &middot; Philadelphia, PA</span>
      </td></tr>
      <tr><td style="background-color:#000000;padding:28px 40px;text-align:center;">
        <img src="https://fooddeliveryaudit.com/logo.svg" width="120" height="50" alt="Eggs Ok" style="display:block;margin:0 auto 8px;border:0;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;letter-spacing:3px;text-transform:uppercase;">Breakfast &amp; Lunch</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- HERO BANNER -->
  <tr><td style="background-color:#FED800;padding:40px;text-align:center;">
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#000000;letter-spacing:2px;text-transform:uppercase;">${esc(payload.eyebrow)}</p>
    <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:36px;font-weight:900;color:#000000;line-height:1.1;letter-spacing:-1px;">${esc(payload.title)}</h2>
  </td></tr>

  <!-- BODY CONTENT -->
  <tr><td style="padding:36px 40px 0;">
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#999999;line-height:1.7;">${esc(payload.intro)}</p>
  </td></tr>

  ${sectionsHtml}
  ${ctaHtml}
  ${footerNote}

  <!-- INFO BOXES -->
  <tr><td style="padding:32px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="48%" style="background-color:#0d0d0d;border-radius:12px;border:1px solid #2a2a2a;padding:18px 16px;text-align:center;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;"><img src="https://cdn.simpleicons.org/googlemaps/FED800" width="22" height="22" alt="Location" style="border:0;"></p>
        <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#FED800;letter-spacing:0.5px;text-transform:uppercase;">Location</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;line-height:1.5;">3517 Lancaster Ave<br>Philadelphia, PA 19104</p>
      </td>
      <td width="4%">&nbsp;</td>
      <td width="48%" style="background-color:#0d0d0d;border-radius:12px;border:1px solid #2a2a2a;padding:18px 16px;text-align:center;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;"><img src="https://cdn.simpleicons.org/clockify/FED800" width="22" height="22" alt="Hours" style="border:0;"></p>
        <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#FED800;letter-spacing:0.5px;text-transform:uppercase;">Hours</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;line-height:1.5;">Mon-Fri: 7AM-4PM<br>Sat-Sun: 8AM-3PM</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="padding:32px 40px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#2a2a2a;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>

  <!-- SOCIAL LINKS -->
  <tr><td style="padding:24px 40px 0;text-align:center;">
    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#666;letter-spacing:1px;text-transform:uppercase;">Follow Us</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
      <td style="padding:0 4px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1a1a1a;border:1px solid #FED800;border-radius:6px;padding:8px 14px;"><a href="https://facebook.com/eggsokphilly" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#FED800;text-decoration:none;">Facebook</a></td></tr></table></td>
      <td style="padding:0 4px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1a1a1a;border:1px solid #FED800;border-radius:6px;padding:8px 14px;"><a href="https://instagram.com/eggsokphilly" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#FED800;text-decoration:none;">Instagram</a></td></tr></table></td>
      <td style="padding:0 4px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1a1a1a;border:1px solid #FED800;border-radius:6px;padding:8px 14px;"><a href="https://tiktok.com/@eggsokphilly" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#FED800;text-decoration:none;">TikTok</a></td></tr></table></td>
      <td style="padding:0 4px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1a1a1a;border:1px solid #FED800;border-radius:6px;padding:8px 14px;"><a href="https://g.page/eggsokphilly" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#FED800;text-decoration:none;">Google</a></td></tr></table></td>
    </tr></table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:28px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:24px 28px 16px;text-align:center;border-bottom:1px solid #1a1a1a;">
        <img src="https://fooddeliveryaudit.com/logo.svg" width="100" height="42" alt="Eggs Ok" style="display:block;margin:0 auto 4px;border:0;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#555555;letter-spacing:2px;text-transform:uppercase;">Breakfast &amp; Lunch &middot; Philadelphia</p>
      </td></tr>
      <tr><td style="padding:16px 28px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="text-align:center;padding-bottom:8px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#888888;"><img src="https://cdn.simpleicons.org/googlemaps/888888" width="13" height="13" alt="loc" style="border:0;vertical-align:middle;margin-right:4px;">3517 Lancaster Ave, Philadelphia, PA 19104</span>
          </td></tr>
          <tr><td style="text-align:center;padding-bottom:8px;">
            <a href="tel:2159489902" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#FED800;text-decoration:none;"><img src="https://cdn.simpleicons.org/phonepe/FED800" width="13" height="13" alt="phone" style="border:0;vertical-align:middle;margin-right:4px;">(215) 948-9902</a>
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#555555;"> &middot; </span>
            <a href="https://eggsokphilly.com" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#FED800;text-decoration:none;">eggsokphilly.com</a>
          </td></tr>
          <tr><td style="text-align:center;padding-bottom:16px;border-bottom:1px solid #1a1a1a;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#555555;">Mon-Fri: 7AM-4PM &middot; Sat-Sun: 8AM-3PM</span>
          </td></tr>
          <tr><td style="text-align:center;padding-top:16px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#444444;">&copy; ${year} Eggs Ok. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="background-color:#FED800;padding:8px;text-align:center;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#000000;letter-spacing:1.5px;text-transform:uppercase;">Made with <img src="https://cdn.simpleicons.org/undertale/FC0301" width="11" height="11" alt="love" style="border:0;vertical-align:middle;"> in Philadelphia &middot; Eggs Ok</span>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:24px;">&nbsp;</td></tr>

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