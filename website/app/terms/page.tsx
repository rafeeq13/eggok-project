import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Terms of Service — Eggs Ok',
  description: 'Terms and conditions for ordering from Eggs Ok in Philadelphia.',
};

const FONT_BODY = "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_HEAD = "'Playfair Display', Georgia, 'Times New Roman', serif";

export default function TermsPage() {
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
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <div className="legal-section">
          <p>
            Welcome to Eggs Ok. By placing an order, creating an account, or using any of our services (the website
            at eggsokphilly.com, our online ordering system, or any related tools), you agree to these Terms of
            Service. Please read them carefully.
          </p>
        </div>

        <div className="legal-section">
          <h2>1. Who We Are</h2>
          <p>
            Eggs Ok (“we”, “us”, “our”) operates a breakfast and lunch eatery located at 3517 Lancaster Ave,
            Philadelphia, PA 19104. These terms apply to all pickup and delivery orders placed through our website,
            phone, or in person.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Orders, Pricing &amp; Payment</h2>
          <ul>
            <li>All prices are shown in U.S. dollars and include taxes where applicable.</li>
            <li>Payment is processed securely through Stripe. We do not store full card details on our servers.</li>
            <li>An order is confirmed once payment authorization is successful and you receive an order number.</li>
            <li>We reserve the right to cancel any order if an item is unavailable, if the address cannot be
              served, or if we detect fraudulent activity. In such cases, any charge will be fully refunded.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Pickup &amp; Delivery</h2>
          <ul>
            <li>Pickup orders are typically ready in about 15 minutes. Please bring your order number.</li>
            <li>Delivery is handled by third-party providers (e.g. Uber Direct). Estimated times are approximate
              and depend on distance, traffic, and demand.</li>
            <li>You are responsible for providing an accurate delivery address and for being available to receive
              your order. Orders returned because no one was available are non-refundable.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Cancellations &amp; Refunds</h2>
          <p>
            Orders can be cancelled free of charge before the kitchen begins preparation (typically within
            2–3 minutes of placing). Once preparation begins, orders cannot be cancelled. If something is wrong
            with your order, please contact us within 24 hours and we will make it right.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Allergies &amp; Food Safety</h2>
          <p>
            Our kitchen handles eggs, dairy, wheat, soy, nuts, and other common allergens. While we take care to
            avoid cross-contamination, we cannot guarantee any item is free of allergens. If you have a severe
            allergy, please contact us before ordering.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. Accounts &amp; Loyalty</h2>
          <ul>
            <li>You are responsible for keeping your account password secure and for all activity under your account.</li>
            <li>Loyalty points have no cash value and may be adjusted, revoked, or expired at our discretion, for
              example in cases of refunded orders or abuse.</li>
            <li>Reward codes are single-use unless stated otherwise and cannot be combined with other offers.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>7. Acceptable Use</h2>
          <p>
            Do not use the site to attempt unauthorized access, probe for vulnerabilities, submit fraudulent
            orders, or harass our staff. We may suspend or terminate access for any user who violates these terms.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. Intellectual Property</h2>
          <p>
            All content on this site — logos, photos, menu descriptions, branding — belongs to Eggs Ok or our
            licensors and is protected by U.S. copyright and trademark law.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. Disclaimers &amp; Liability</h2>
          <p>
            The site is provided “as is”. To the fullest extent permitted by law, Eggs Ok is not liable for
            indirect, incidental, or consequential damages arising from your use of the site or services. Our
            total liability for any claim is limited to the amount you paid for the order giving rise to the claim.
          </p>
        </div>

        <div className="legal-section">
          <h2>10. Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be communicated by posting the
            updated version on this page with a new “Last updated” date. Your continued use of the service after
            changes become effective constitutes acceptance of the revised terms.
          </p>
        </div>

        <div className="legal-section">
          <h2>11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the Commonwealth of Pennsylvania, United States, without
            regard to its conflict-of-law principles. Any dispute will be resolved in the state or federal courts
            located in Philadelphia County, PA.
          </p>
        </div>

        <div className="legal-section">
          <h2>12. Contact</h2>
          <p>
            Questions about these terms? Reach us at{' '}
            <a href="mailto:eggsok3517@gmail.com">eggsok3517@gmail.com</a> or{' '}
            <a href="tel:+12159489902">(215) 948-9902</a>, or stop by 3517 Lancaster Ave, Philadelphia, PA 19104.
          </p>
        </div>

        <div className="legal-footer-nav">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
