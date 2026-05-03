import { Metadata } from 'next';
import NoveraNavbar from '@/components/novera-dark/NoveraNavbar';
import NoveraFooter from '@/components/novera-dark/NoveraFooter';

export const metadata: Metadata = {
  title: 'Terms of Service — MeetSolis',
  description: 'Terms and conditions for using MeetSolis.',
};

const sections = [
  'Acceptance of Terms',
  'Description of Service',
  'User Accounts',
  'Privacy & Data Security',
  'Intellectual Property',
  'Acceptable Use',
  'Limitation of Liability',
  'Payments & Refunds',
  'Modifications to Service',
  'Governing Law',
  'Contact Us',
];

export default function TermsPage() {
  return (
    <main style={{ backgroundColor: '#0b1612', minHeight: '100vh' }}>
      <NoveraNavbar />

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '140px 32px 100px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#1a6b42',
              }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: '#b8c5bf',
                letterSpacing: '0.04em',
              }}
            >
              TERMS OF SERVICE
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'Petrona, serif',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 500,
              color: '#d9f0e5',
              letterSpacing: '-0.04em',
              lineHeight: '1.1em',
              marginBottom: '20px',
            }}
          >
            Clear terms.
            <br />
            No surprises.
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '17px',
              color: 'rgba(195,205,200,0.7)',
              lineHeight: '1.65em',
              maxWidth: '520px',
            }}
          >
            Please read these terms carefully before using MeetSolis. They
            outline your rights and obligations as a user of our platform.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full md:w-[220px] md:flex-shrink-0 md:sticky md:top-[100px]">
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(217,240,229,0.08)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '12px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'rgba(195,205,200,0.4)',
                  letterSpacing: '0.1em',
                  marginBottom: '6px',
                }}
              >
                LAST UPDATED
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#d9f0e5',
                }}
              >
                April 12, 2026
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(217,240,229,0.08)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'rgba(195,205,200,0.4)',
                  letterSpacing: '0.1em',
                  marginBottom: '14px',
                }}
              >
                ON THIS PAGE
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {sections.map(s => (
                  <p
                    key={s}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      color: 'rgba(195,205,200,0.55)',
                      lineHeight: '1.4em',
                      margin: 0,
                    }}
                  >
                    {s}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Content card */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(217,240,229,0.08)',
              borderRadius: '16px',
              padding: '48px',
            }}
          >
            {[
              {
                num: '1.',
                title: 'Acceptance of Terms',
                content: (
                  <p>
                    By accessing and using MeetSolis (&quot;the Service&quot;),
                    you agree to be bound by these Terms of Service. If you do
                    not agree to these terms, please do not use the Service.
                  </p>
                ),
              },
              {
                num: '2.',
                title: 'Description of Service',
                content: (
                  <>
                    <p>
                      MeetSolis is a post-meeting intelligence platform built
                      for professionals who manage client relationships. It
                      provides AI-powered session transcription, summarization,
                      action item extraction, client memory management, and
                      conversational AI to help you retain and recall client
                      context across sessions.
                    </p>
                    <p>
                      MeetSolis does not provide video conferencing. It
                      processes session recordings or transcripts that you
                      upload after sessions are complete.
                    </p>
                  </>
                ),
              },
              {
                num: '3.',
                title: 'User Accounts',
                content: (
                  <>
                    <p>
                      You are responsible for maintaining the security of your
                      account and password. MeetSolis cannot and will not be
                      liable for any loss or damage from your failure to comply
                      with this security obligation.
                    </p>
                    <p>
                      You are responsible for all content uploaded and all
                      activity that occurs under your account.
                    </p>
                  </>
                ),
              },
              {
                num: '4.',
                title: 'Privacy & Data Security',
                content: (
                  <>
                    <p>
                      Your privacy is critical to us. Our use of your personal
                      information and data is governed by our{' '}
                      <a
                        href="/privacy"
                        style={{ color: '#37ea9e', fontWeight: 500 }}
                      >
                        Privacy Policy
                      </a>
                      . By using MeetSolis, you consent to the collection and
                      use of information as detailed therein.
                    </p>
                    <div
                      style={{
                        backgroundColor: 'rgba(26,107,66,0.12)',
                        borderLeft: '3px solid #1a6b42',
                        padding: '16px 20px',
                        borderRadius: '0 8px 8px 0',
                        margin: '20px 0',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#b8c5bf',
                          margin: 0,
                          lineHeight: '1.6em',
                        }}
                      >
                        <strong style={{ color: '#d9f0e5' }}>
                          Private by Design:
                        </strong>{' '}
                        MeetSolis never uses your client session data to train
                        AI models. Your clients&apos; conversations remain
                        private and are never shared.
                      </p>
                    </div>
                  </>
                ),
              },
              {
                num: '5.',
                title: 'Intellectual Property',
                content: (
                  <>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>
                        Your Content:
                      </strong>{' '}
                      You retain full ownership of all transcripts, recordings,
                      notes, and other content you upload or generate via the
                      Service. We claim no intellectual property rights over
                      your content.
                    </p>
                    <div
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderLeft: '3px solid rgba(217,240,229,0.2)',
                        padding: '16px 20px',
                        borderRadius: '0 8px 8px 0',
                        margin: '20px 0',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#b8c5bf',
                          margin: 0,
                          lineHeight: '1.6em',
                        }}
                      >
                        <strong style={{ color: '#d9f0e5' }}>Note:</strong> We
                        need a limited license to process your content in order
                        to provide the service. This license is strictly limited
                        to service delivery.
                      </p>
                    </div>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>Our IP:</strong> The
                      MeetSolis platform, including its software, design, and
                      branding, is the exclusive property of MeetSolis and its
                      licensors.
                    </p>
                  </>
                ),
              },
              {
                num: '6.',
                title: 'Acceptable Use',
                content: (
                  <>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                      <li>
                        Upload recordings of conversations without the informed
                        consent of all parties, where required by applicable
                        law.
                      </li>
                      <li>
                        Upload or transmit any content that is unlawful,
                        harmful, threatening, defamatory, or abusive.
                      </li>
                      <li>
                        Attempt to reverse engineer, decompile, or otherwise
                        compromise the Service.
                      </li>
                      <li>
                        Use the Service in a way that violates professional
                        ethics or applicable regulations.
                      </li>
                    </ul>
                  </>
                ),
              },
              {
                num: '7.',
                title: 'Limitation of Liability',
                content: (
                  <p>
                    In no event shall MeetSolis be liable for any indirect,
                    incidental, special, consequential, or punitive damages,
                    including without limitation loss of profits, data, use,
                    goodwill, or other intangible losses, resulting from your
                    access to or use of (or inability to access or use) the
                    Service.
                  </p>
                ),
              },
              {
                num: '8.',
                title: 'Payments & Refunds',
                content: (
                  <>
                    <p>
                      MeetSolis offers a free plan and paid subscription plans.
                      By subscribing to a paid plan, you authorize us to charge
                      your payment method on a recurring basis.
                    </p>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>Plans:</strong> Free
                      (3 clients, 5 lifetime transcripts, 75 queries) · Pro
                      ($99/month or $948/year — unlimited clients, 25
                      transcripts/month, 2,000 queries/month).
                    </p>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>Refunds:</strong> We
                      offer a 7-day free trial on Pro. Refund requests beyond
                      the trial period are considered on a case-by-case basis.
                      Contact{' '}
                      <a
                        href="mailto:hari@meetsolis.com"
                        style={{ color: '#37ea9e', fontWeight: 500 }}
                      >
                        hari@meetsolis.com
                      </a>
                      .
                    </p>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>
                        Cancellation:
                      </strong>{' '}
                      You may cancel your subscription at any time from your
                      account settings. Access continues until the end of the
                      current billing period.
                    </p>
                  </>
                ),
              },
              {
                num: '9.',
                title: 'Modifications to Service',
                content: (
                  <p>
                    We reserve the right to modify or discontinue, temporarily
                    or permanently, the Service with or without notice. We will
                    make reasonable efforts to notify users of significant
                    changes in advance.
                  </p>
                ),
              },
              {
                num: '10.',
                title: 'Governing Law',
                content: (
                  <p>
                    These Terms shall be governed and construed in accordance
                    with the laws of India, without regard to its conflict of
                    law provisions.
                  </p>
                ),
              },
              {
                num: '11.',
                title: 'Contact Us',
                content: (
                  <p>
                    If you have any questions about these Terms, please contact
                    us at{' '}
                    <a
                      href="mailto:hari@meetsolis.com"
                      style={{ color: '#37ea9e', fontWeight: 500 }}
                    >
                      hari@meetsolis.com
                    </a>
                    .
                  </p>
                ),
              },
            ].map((section, i) => (
              <div key={i}>
                {i > 0 && (
                  <hr
                    style={{
                      border: 'none',
                      borderTop: '1px solid rgba(217,240,229,0.08)',
                      margin: '40px 0',
                    }}
                  />
                )}
                <h3
                  style={{
                    fontFamily: 'Petrona, serif',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#d9f0e5',
                    marginBottom: '14px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {section.num} {section.title}
                </h3>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    color: 'rgba(195,205,200,0.7)',
                    lineHeight: '1.8em',
                  }}
                >
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NoveraFooter />
    </main>
  );
}
