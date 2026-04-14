export function TermsPage() {
  return (
    <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <div className="space-y-10">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-primary">Legal</p>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant text-sm">
            Last updated: April 4, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-on-surface-variant leading-relaxed">
          <Section title="1. Acceptance of Terms">
            By accessing or using FoxSensei ("the Service"), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use the Service. We reserve
            the right to modify these terms at any time, and will notify users of material changes
            via email or an in-app notice.
          </Section>

          <Section title="2. Use of the Service">
            FoxSensei is a Japanese language learning platform. You may use the Service only for
            lawful purposes and in accordance with these Terms. You agree not to use the Service to
            transmit any unsolicited or unauthorized advertising, engage in any conduct that restricts
            or inhibits anyone's use or enjoyment of the Service, or attempt to gain unauthorized
            access to any portion of the Service.
          </Section>

          <Section title="3. Account Registration">
            To access certain features, you must create an account. You are responsible for
            maintaining the confidentiality of your account credentials and for all activities that
            occur under your account. You must provide accurate and complete information when
            registering and keep your information updated. You must be at least 13 years of age to
            create an account.
          </Section>

          <Section title="4. Intellectual Property">
            All content on the Service, including but not limited to text, graphics, logos, and
            educational materials, is the property of FoxSensei or its content suppliers and is
            protected by intellectual property laws. You may not reproduce, distribute, or create
            derivative works from any content on the Service without express written permission.
          </Section>

          <Section title="5. User-Generated Content">
            If you submit any content to the Service, you grant FoxSensei a non-exclusive, royalty-
            free, perpetual, and worldwide license to use, reproduce, and display that content in
            connection with the Service. You are solely responsible for the content you submit and
            must ensure it does not infringe on any third-party rights.
          </Section>

          <Section title="6. Disclaimer of Warranties">
            The Service is provided on an "as is" and "as available" basis without any warranties
            of any kind, either express or implied. FoxSensei does not warrant that the Service will
            be uninterrupted, error-free, or free of viruses or other harmful components.
          </Section>

          <Section title="7. Limitation of Liability">
            To the fullest extent permitted by law, FoxSensei shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of or
            inability to use the Service.
          </Section>

          <Section title="8. Governing Law">
            These Terms shall be governed by and construed in accordance with applicable law, without
            regard to conflict of law provisions.
          </Section>

          <Section title="9. Contact Us">
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@foxsensei.jp" className="text-primary hover:underline">
              legal@foxsensei.jp
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
