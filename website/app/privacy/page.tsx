import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Privacy Policy Eggs Ok',
  description: 'How Eggs Ok collects, uses, and protects your personal information.',
};

const FONT_BODY = "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_HEAD = "'Playfair Display', Georgia, 'Times New Roman', serif";

export default function PrivacyPage() {
  return (
    <div className="legal-page-root" style={{ background: '#FFFFFF', minHeight: '100vh', color: '#4D4D4D', fontFamily: FONT_BODY, fontWeight: 500 }}>
      <style>{`
        .legal-container { max-width: 820px; margin: 0 auto; padding: 100px 28px 64px; }
        .legal-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #888888; margin-bottom: 12px; display: block; }
        .legal-title { font-family: ${FONT_HEAD}; font-size: 40px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.15; color: #0D0D0D; margin-bottom: 10px; }
        .legal-updated { font-size: 14px; color: #777777; margin-bottom: 36px; }
        .legal-section { margin-bottom: 28px; }
        .legal-section h2 { font-family: ${FONT_HEAD}; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: #0D0D0D; margin-bottom: 10px; }
        .legal-section p, .legal-section li { font-size: 15.5px; color: #4D4D4D; line-height: 1.75; }
        .legal-section ul { padding-left: 22px; margin-top: 6px; }
        .legal-section li { margin-bottom: 6px; }
        .legal-section a { color: #1A1A1A; font-weight: 600; text-decoration: underline; }
        .legal-footer-nav { margin-top: 48px; padding-top: 24px; border-top: 1px solid #E5E5E5; display: flex; gap: 16px; flex-wrap: wrap; font-size: 14px; }
        .legal-footer-nav a { color: #4D4D4D; text-decoration: none; font-weight: 600; }
        .legal-footer-nav a:hover { text-decoration: underline; }

        @media (max-width: 767px) {
          .legal-container { padding: 80px 16px 40px; }
          .legal-title { font-size: 28px; }
          .legal-section h2 { font-size: 18px; }
          .legal-section p, .legal-section li { font-size: 15px; }
        }
      `}</style>

      <Header />

      <div className="legal-container">
        <span className="legal-eyebrow">Legal</span>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <div className="legal-section">
          <p>
            Eggs Ok (“we”, “us”, “our”) respects your privacy. This Privacy Policy explains what information we
            collect when you use our website or place an order, how we use it, and the choices you have.
          </p>
        </div>

        <div className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information in three ways:</p>
          <ul>
            <li><strong>Information you give us</strong> your name, email, phone number, delivery address,
              special instructions, order history, and any messages you send through the contact form or during
              catering inquiries.</li>
            <li><strong>Payment information</strong> card details are collected and processed directly by our
              payment provider, Stripe. We receive only the card brand, last four digits, and a transaction
              identifier. We never see or store your full card number.</li>
            <li><strong>Automatic data</strong> IP address, device type, browser, and basic usage data (e.g.
              pages visited, items viewed) collected via cookies and standard web logs.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Process and deliver your orders, including handing off to third-party delivery services.</li>
            <li>Send order confirmations, status updates, and receipts by email.</li>
            <li>Respond to catering inquiries, contact messages, and support questions.</li>
            <li>Maintain your account, loyalty balance, and saved addresses.</li>
            <li>Detect fraud, debug issues, and improve the service.</li>
            <li>Send occasional marketing messages only if you opt in; you can unsubscribe at any time.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Who We Share Information With</h2>
          <p>We share the minimum information needed with trusted service providers:</p>
          <ul>
            <li><strong>Stripe</strong> for payment processing.</li>
            <li><strong>Delivery providers</strong> (e.g. Uber Direct) for dispatching delivery orders; they
              receive only your first name, delivery address, phone, and order details.</li>
            <li><strong>Email service providers</strong> to deliver transactional and receipt emails.</li>
            <li><strong>Google Maps / Places</strong> when you use address autocomplete.</li>
          </ul>
          <p>We do not sell your personal information to anyone.</p>
        </div>

        <div className="legal-section">
          <h2>4. Cookies</h2>
          <p>
            We use cookies and similar technologies to keep you signed in, remember your cart, and understand
            how the site is used. You can block or delete cookies in your browser settings; some features may not
            work correctly without them.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Data Retention</h2>
          <p>
            We keep account and order records for as long as your account is active or as needed to comply with
            tax, accounting, or legal obligations. You can request deletion of your account and associated data
            at any time by contacting us (see below).
          </p>
        </div>

        <div className="legal-section">
          <h2>6. Security</h2>
          <p>
            Passwords are stored hashed. Payment processing uses TLS and industry-standard tokenization via
            Stripe. Despite our efforts, no system is perfectly secure please use a strong password and let us
            know if you suspect any unauthorized activity on your account.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Your Rights</h2>
          <ul>
            <li>Access, correct, or download the information we hold about you.</li>
            <li>Delete your account and personal data (except records we are legally required to keep, such as
              tax invoices).</li>
            <li>Opt out of marketing email at any time by clicking “unsubscribe” or contacting us.</li>
          </ul>
          <p>
            California residents have additional rights under CCPA/CPRA (e.g. right to know, delete, and
            non-discrimination). EU/UK residents have rights under GDPR. To exercise any of these rights, contact
            us using the details below.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. Children</h2>
          <p>
            The service is not directed to children under 13, and we do not knowingly collect personal
            information from children. If you believe a child has provided us information, contact us and we will
            delete it.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be posted on this page with a new
            “Last updated” date. Continued use of the service after changes take effect constitutes acceptance
            of the revised policy.
          </p>
        </div>

        <div className="legal-section">
          <h2>10. Contact Us</h2>
          <p>
            Questions about privacy? Email{' '}
            <a href="mailto:eggsok3517@gmail.com">eggsok3517@gmail.com</a>, call{' '}
            <a href="tel:+12159489902">(215) 948-9902</a>, or write to: Eggs Ok, 3517 Lancaster Ave,
            Philadelphia, PA 19104.
          </p>
        </div>

        <div className="legal-footer-nav">
          <Link href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
