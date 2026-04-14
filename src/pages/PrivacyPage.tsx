export function PrivacyPage() {
  return (
    <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <div className="space-y-10">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-primary">Legal</p>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant text-sm">
            Last updated: April 4, 2026
          </p>
        </div>

        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <Section title="1. Information We Collect">
            We collect information you provide directly, such as your name and email address when
            you create an account. We also automatically collect usage data including pages visited,
            study sessions completed, quiz scores, and device/browser information to improve the
            learning experience.
          </Section>

          <Section title="2. How We Use Your Information">
            We use your information to provide and improve the Service, personalize your learning
            experience, send you important account-related communications, and analyze usage trends.
            We do not sell your personal information to third parties.
          </Section>

          <Section title="3. Data Storage & Security">
            Your data is stored on secure servers with industry-standard encryption. We implement
            technical and organizational measures to protect your personal information against
            unauthorized access, loss, or alteration. However, no method of transmission over the
            internet is 100% secure.
          </Section>

          <Section title="4. Cookies">
            We use cookies and similar tracking technologies to maintain your session, remember your
            preferences (such as dark mode), and analyze how you use the Service. You can control
            cookie settings through your browser, though disabling certain cookies may affect
            Service functionality.
          </Section>

          <Section title="5. Third-Party Services">
            We may use third-party services such as analytics providers and authentication providers
            (Google, Apple). These services have their own privacy policies governing use of your
            information. We encourage you to review their policies.
          </Section>

          <Section title="6. Your Rights">
            Depending on your location, you may have rights to access, correct, delete, or port your
            personal data. To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@foxsensei.jp" className="text-primary hover:underline">
              privacy@foxsensei.jp
            </a>
            . We will respond within 30 days.
          </Section>

          <Section title="7. Data Retention">
            We retain your personal data for as long as your account is active or as needed to
            provide the Service. You may request deletion of your account and associated data at
            any time through your account settings.
          </Section>

          <Section title="8. Children's Privacy">
            The Service is not intended for children under 13. We do not knowingly collect personal
            information from children under 13. If we learn we have done so, we will delete that
            information promptly.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes via email or an in-app notice. Continued use of the Service after changes
            constitutes acceptance of the updated policy.
          </Section>

          <Section title="10. Contact Us">
            For any privacy-related questions or concerns, please contact our Privacy Team at{' '}
            <a href="mailto:privacy@foxsensei.jp" className="text-primary hover:underline">
              privacy@foxsensei.jp
            </a>
            .
          </Section>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-headline font-bold text-on-surface">{title}</h2>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  )
}
