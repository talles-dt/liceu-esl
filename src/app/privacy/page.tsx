export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: April 6, 2026
          </p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Who We Are</h2>
            <p>
              Lexio Underground is a product of Liceu Underground. We are
              committed to protecting your privacy and handling your personal
              data in compliance with the Brazilian General Data Protection Law
              (LGPD — Lei Geral de Proteção de Dados, Law No. 13.709/2018).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Data We Collect</h2>
            <p>
              We collect the following types of personal data:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Account data:</strong> email address, name (optional)</li>
              <li><strong>Profile data:</strong> CEFR level, professional context (optional)</li>
              <li><strong>Usage data:</strong> exercise completions, XP earned, streak information, chat messages with AI tutor, leaderboard rankings</li>
              <li><strong>Payment data:</strong> processed securely by Stripe — we do not store credit card information</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information (via Sentry error monitoring)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Data</h2>
            <p>
              We use your data to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide and improve the Platform</li>
              <li>Generate personalized exercises and tutor responses</li>
              <li>Track your learning progress and streaks</li>
              <li>Process subscription payments via Stripe</li>
              <li>Send transactional emails (login links, streak reminders, badge notifications)</li>
              <li>Display leaderboard rankings</li>
              <li>Monitor and fix technical issues</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Legal Basis (LGPD)</h2>
            <p>
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Contractual performance:</strong> to provide the services you subscribe to</li>
              <li><strong>Legitimate interest:</strong> to improve the Platform and prevent fraud</li>
              <li><strong>Consent:</strong> for optional features like the AI tutor and live class booking</li>
              <li><strong>Legal obligation:</strong> to comply with applicable Brazilian laws</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
            <p>
              We share your data only with the following service providers:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Supabase:</strong> database hosting and authentication</li>
              <li><strong>Stripe:</strong> payment processing</li>
              <li><strong>Anthropic (Claude):</strong> AI exercise generation and tutor responses</li>
              <li><strong>OpenAI:</strong> text-to-speech audio generation</li>
              <li><strong>Resend:</strong> transactional email delivery</li>
              <li><strong>Sentry:</strong> error monitoring and debugging</li>
              <li><strong>Cal.com:</strong> live class scheduling</li>
            </ul>
            <p>
              All service providers are bound by data processing agreements and
              are required to handle your data in compliance with applicable
              privacy laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active
              or as needed to provide services. Upon account deletion, we will
              delete your personal data within 30 days, unless we are required to
              retain it by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights (LGPD)</h2>
            <p>
              Under the LGPD, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct incomplete, inaccurate, or outdated data</li>
              <li>Request anonymization, blocking, or deletion of your data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
              <li>Object to processing of your data</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:talles@oliceu.com"
                className="text-primary hover:underline"
              >
                talles@oliceu.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              data, including encryption in transit (HTTPS/TLS), Row Level
              Security (RLS) on our database, security headers (HSTS, CSP), and
              regular security audits.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Children's Privacy</h2>
            <p>
              The Platform is intended for users aged 18 and over. We do not
              knowingly collect personal data from children under 18. If you
              believe a child has provided us with personal data, please contact
              us immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be communicated via email or platform notification.
              The "Last updated" date at the top of this page will be revised.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
            <p>
              For privacy-related questions or to exercise your rights under the
              LGPD, contact us at{" "}
              <a
                href="mailto:talles@oliceu.com"
                className="text-primary hover:underline"
              >
                talles@oliceu.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
