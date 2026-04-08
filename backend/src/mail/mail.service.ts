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

        // Build attachments from resume if provided
        const attachments: Array<{ filename: string; content: string; encoding: string }> = [];
        if (payload?.resume) {
            // resume is a base64 data URL like "data:application/pdf;base64,JVBERi..."
            const match = payload.resume.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                const ext = match[1].includes('pdf') ? 'pdf' : match[1].includes('word') ? 'docx' : 'pdf';
                attachments.push({
                    filename: `${name.replace(/\s+/g, '_')}_Resume.${ext}`,
                    content: match[2],
                    encoding: 'base64',
                });
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

    async sendDeliveryUpdateEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) {
            return false;
        }

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const trackOrderUrl = `${websiteUrl}/order-tracking?id=${order.id}`;
        const trackingUrl = order.deliveryTrackingUrl || trackOrderUrl;

        const sections: Array<{ title: string; lines: string[] }> = [
            {
                title: 'Order details',
                lines: [
                    `Order: #${this.safeText(order.orderNumber)}`,
                    `Delivering to: ${this.safeText(order.deliveryAddress || '')}`,
                ],
            },
        ];

        if (order.deliveryDriverName) {
            sections.push({
                title: 'Your driver',
                lines: [
                    `Name: ${this.safeText(order.deliveryDriverName)}`,
                    ...(order.deliveryEta ? [`ETA: ${this.safeText(order.deliveryEta)}`] : []),
                ],
            });
        }

        await this.sendMail(
            {
                to: order.customerEmail,
                subject: `Your order #${order.orderNumber} is on the way!`,
                html: this.wrapEmail({
                    eyebrow: 'Delivery Update',
                    title: 'Your order is on the way!',
                    intro: `Hi ${this.safeText(order.customerName)}, great news! Your order #${this.safeText(order.orderNumber)} has been picked up and is heading your way.`,
                    cta: {
                        text: 'Track Your Delivery',
                        link: trackingUrl,
                    },
                    sections,
                    footer: 'You can track your delivery in real-time using the button above. If you have any questions, reply to this email or call the store.',
                }),
                text: `Hi ${order.customerName}, your order #${order.orderNumber} is on the way! Track it here: ${trackingUrl}`,
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
                title: `${this.safeText(driverName)} is heading to pick up your order!`,
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
        const statusMessages: Record<string, { title: string; intro: string }> = {
            confirmed: { title: 'Order Confirmed!', intro: `Great news! Your order #${this.safeText(order.orderNumber)} has been confirmed and the kitchen is getting ready.` },
            preparing: { title: 'Your Order is Being Prepared', intro: `The kitchen is now preparing your order #${this.safeText(order.orderNumber)}. It won't be long!` },
            ready: { title: order.orderType === 'delivery' ? 'Your Order is Ready for Pickup by Driver' : 'Your Order is Ready for Pickup!', intro: order.orderType === 'delivery' ? `Your order #${this.safeText(order.orderNumber)} is ready and waiting for a driver.` : `Your order #${this.safeText(order.orderNumber)} is ready! Head to 3517 Lancaster Ave to pick it up.` },
        };
        const msg = statusMessages[newStatus];
        if (!msg) return false;

        await this.sendMail({ to: order.customerEmail, subject: `Order #${order.orderNumber} - ${msg.title}`, html: this.wrapEmail({
            eyebrow: 'Order Update', title: msg.title, intro: `Hi ${this.safeText(order.customerName)}, ${msg.intro}`,
            cta: { text: 'Track Your Order', link: trackUrl },
            footer: 'You can track your order status in real-time using the button above.',
        }), text: `Hi ${order.customerName}, ${msg.intro} Track: ${trackUrl}` }, settings);
        return true;
    }

    async sendOrderCancelledEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        await this.sendMail({ to: order.customerEmail, subject: `Order #${order.orderNumber} has been cancelled`, html: this.wrapEmail({
            eyebrow: 'Order Cancelled', title: 'Your order has been cancelled',
            intro: `Hi ${this.safeText(order.customerName)}, your order #${this.safeText(order.orderNumber)} has been cancelled. If you didn't request this, please contact us.`,
            cta: { text: 'Order Again', link: `${websiteUrl}/order` },
            sections: [{ title: 'Order details', lines: [`Order: #${this.safeText(order.orderNumber)}`, `Total: $${Number(order.total).toFixed(2)}`] }],
            footer: 'If you have any questions, reply to this email or call us.',
        }), text: `Hi ${order.customerName}, your order #${order.orderNumber} has been cancelled.` }, settings);
        return true;
    }

    async sendPickupCompleteEmail(order: any) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        await this.sendMail({ to: order.customerEmail, subject: `Order #${order.orderNumber} picked up - Enjoy!`, html: this.wrapEmail({
            eyebrow: 'Picked Up', title: 'Enjoy your meal!',
            intro: `Hi ${this.safeText(order.customerName)}, your order #${this.safeText(order.orderNumber)} has been picked up. Thank you for choosing Eggs Ok!`,
            cta: { text: 'Leave a Review', link: `${websiteUrl}/review?order=${order.orderNumber}` },
            footer: 'We hope you love your food! Consider leaving us a review.',
        }), text: `Hi ${order.customerName}, your order #${order.orderNumber} has been picked up. Enjoy!` }, settings);
        return true;
    }

    async sendWelcomeEmail(name: string, email: string) {
        const settings = await this.getResolvedMailSettings();
        if (!this.isConfigured(settings) || !settings.enabled) return false;

        const websiteUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        await this.sendMail({ to: email, subject: 'Welcome to Eggs Ok!', html: this.wrapEmail({
            eyebrow: 'Welcome', title: `Welcome to Eggs Ok, ${this.safeText(name)}!`,
            intro: 'Thanks for creating your account. You now have access to order tracking, saved addresses, loyalty rewards, and exclusive offers.',
            cta: { text: 'Start Ordering', link: `${websiteUrl}/order` },
            sections: [{ title: 'Your perks', lines: ['Earn points on every order', 'Save delivery addresses', 'Track orders in real-time', 'Exclusive member rewards'] }],
            footer: 'Start earning loyalty points with your first order!',
        }), text: `Welcome to Eggs Ok, ${name}! Start ordering at ${websiteUrl}/order` }, settings);
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
                    intro: `Hi ${name}, you've been invited to join the Eggs Ok team as a ${role}. Click the button below to set your password and activate your account.`,
                    cta: {
                        text: 'Set Up Your Account',
                        link: payload.setupLink,
                    },
                    sections: [
                        {
                            title: 'Your account details',
                            lines: [
                                `Name: ${name}`,
                                `Email: ${email}`,
                                `Role: ${role}`,
                            ],
                        },
                    ],
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
            attachments?: Array<{ filename: string; content: string; encoding: string }>;
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
                attachments: options.attachments,
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
        const websiteUrl = this.configService?.get<string>('FRONTEND_URL') || 'https://eggsokphilly.com';

        const logoUrl = 'https://fooddeliveryaudit.com/logo.svg';

        const ctaHtml = payload.cta ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
            <tr><td align="center">
              <a href="${payload.cta.link}" style="display:inline-block;padding:16px 40px;background-color:#FED800;color:#000000;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.5px;font-family:Arial,sans-serif;">${this.escapeHtml(payload.cta.text)}</a>
            </td></tr>
          </table>` : '';

        const sectionsHtml = (payload.sections || [])
            .map((section) => `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
            <tr><td style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FED800;font-weight:600;padding-bottom:10px;font-family:Arial,sans-serif;">${this.escapeHtml(section.title)}</td></tr>
            <tr><td style="background:#0D0D0D;border:1px solid #1A1A1A;border-radius:12px;padding:18px 20px;">
              ${section.lines.map((line) =>
                `<div style="font-size:14px;line-height:1.8;color:#FFFFFF;margin-bottom:6px;font-family:Arial,sans-serif;font-weight:400;">${this.escapeHtml(line)}</div>`
              ).join('')}
            </td></tr>
          </table>`)
            .join('');

        const footerNote = payload.footer
            ? `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #1A1A1A;font-size:14px;line-height:1.7;color:#FFFFFF;font-family:Arial,sans-serif;font-weight:400;">${this.escapeHtml(payload.footer)}</div>`
            : '';

        // Social icon SVGs (inline for email compatibility)
        const igIcon = `<img src="https://cdn-icons-png.flaticon.com/16/174/174855.png" width="16" height="16" alt="Instagram" style="vertical-align:middle;margin-right:4px;">`;
        const fbIcon = `<img src="https://cdn-icons-png.flaticon.com/16/124/124010.png" width="16" height="16" alt="Facebook" style="vertical-align:middle;margin-right:4px;">`;
        const tkIcon = `<img src="https://cdn-icons-png.flaticon.com/16/3046/3046121.png" width="16" height="16" alt="TikTok" style="vertical-align:middle;margin-right:4px;">`;

        return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${this.escapeHtml(payload.title)}</title></head>
<body style="margin:0;padding:0;background-color:#050505;-webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050505;">
<tr><td align="center" style="padding:24px 16px 12px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#000000;border:1px solid #1A1A1A;border-radius:20px;overflow:hidden;">

  <!-- HEADER with Logo -->
  <tr><td style="background:#000000;padding:24px 36px;border-bottom:1px solid #1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td><img src="${logoUrl}" alt="Eggs Ok" width="120" height="50" style="display:block;border:0;outline:none;"></td>
        <td align="right" style="font-family:Arial,sans-serif;font-size:10px;color:#FED800;letter-spacing:2px;text-transform:uppercase;vertical-align:middle;">Philadelphia</td>
      </tr>
    </table>
  </td></tr>

  <!-- YELLOW BANNER -->
  <tr><td style="background:#FED800;padding:15px 36px;">
    <div style="font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#000000;margin-bottom:10px;font-family:Arial,sans-serif;">${this.escapeHtml(payload.eyebrow)}</div>
    <div style="font-size:16px;font-weight:600;line-height:1;color:#000000;font-family:Georgia,serif;">${this.escapeHtml(payload.title)}</div>
  </td></tr>

  <!-- BODY -->
  <tr><td style="padding:36px 36px 20px;">
    <div style="font-size:15px;line-height:1.85;color:#FFFFFF;font-family:Arial,sans-serif;font-weight:400;">${this.escapeHtml(payload.intro)}</div>
    ${ctaHtml}
    ${sectionsHtml}
    ${footerNote}
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 36px;"><div style="height:1px;background:#1A1A1A;"></div></td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:28px 36px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <!-- Logo + Store -->
      <tr><td align="center" style="padding-bottom:18px;">
        <img src="${logoUrl}" alt="Eggs Ok" width="90" height="38" style="display:block;margin:0 auto 8px;border:0;">
        <div style="font-family:Arial,sans-serif;font-size:11px;color:#FED800;letter-spacing:1.5px;">BREAKFAST &amp; LUNCH &middot; WEST PHILLY</div>
      </td></tr>
      <!-- Address & Contact -->
      <tr><td align="center" style="padding-bottom:18px;">
        <div style="font-family:Arial,sans-serif;font-size:13px;color:#FFFFFF;line-height:1.8;font-weight:400;">
          3517 Lancaster Ave, Philadelphia PA 19104<br>
          <a href="tel:2159489902" style="color:#FFFFFF;text-decoration:none;">215-948-9902</a> &middot;
          <a href="mailto:orders@eggsokphilly.com" style="color:#FFFFFF;text-decoration:none;">orders@eggsokphilly.com</a>
        </div>
      </td></tr>
      <!-- Social Icons -->
      <tr><td align="center" style="padding-bottom:18px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 10px;"><a href="https://instagram.com/eggsokphilly" style="text-decoration:none;">${igIcon}<span style="font-family:Arial,sans-serif;font-size:12px;color:#FED800;font-weight:400;">Instagram</span></a></td>
          <td style="padding:0 10px;"><a href="https://facebook.com/eggsokphilly" style="text-decoration:none;">${fbIcon}<span style="font-family:Arial,sans-serif;font-size:12px;color:#FED800;font-weight:400;">Facebook</span></a></td>
          <td style="padding:0 10px;"><a href="https://tiktok.com/@eggsokphilly" style="text-decoration:none;">${tkIcon}<span style="font-family:Arial,sans-serif;font-size:12px;color:#FED800;font-weight:400;">TikTok</span></a></td>
        </tr></table>
      </td></tr>
      <!-- Legal -->
      <tr><td align="center">
        <div style="font-family:Arial,sans-serif;font-size:11px;color:#FED800;line-height:1.6;">
          &copy; ${new Date().getFullYear()} Eggs Ok. All rights reserved.<br>
          <a href="${websiteUrl}" style="color:#FED800;text-decoration:none;">eggsokphilly.com</a>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- Bottom Accent -->
  <tr><td height="5" style="background:#FED800;font-size:0;line-height:0;">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
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
