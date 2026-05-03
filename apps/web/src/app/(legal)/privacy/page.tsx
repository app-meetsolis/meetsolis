import { Metadata } from 'next';
import NoveraNavbar from '@/components/novera-dark/NoveraNavbar';
import NoveraFooter from '@/components/novera-dark/NoveraFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy — MeetSolis',
  description: 'How MeetSolis collects, uses, and protects your data.',
};

const sections = [
  'Information We Collect',
  'How We Use Your Data',
  'Data Retention & Security',
  'Sharing of Information',
  'AI Processing',
  'Your Rights',
  'Cookies',
  'Changes to This Policy',
  'Contact Us',
];

export default function PrivacyPage() {
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
              PRIVACY POLICY
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
            Your data.
            <br />
            Your control.
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
            We built MeetSolis with privacy at the core. Here is exactly how we
            collect, store, and protect your data — and your clients&apos;.
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
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                color: 'rgba(195,205,200,0.7)',
                lineHeight: '1.8em',
                marginBottom: '40px',
              }}
            >
              At MeetSolis, we take your privacy seriously. This Privacy Policy
              describes how we collect, use, and protect your information when
              you use our post-meeting intelligence platform.
            </p>

            {[
              {
                num: '1.',
                title: 'Information We Collect',
                content: (
                  <>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>
                        Account Information:
                      </strong>{' '}
                      We collect your name, email address, and authentication
                      information when you sign up.
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
                        <strong style={{ color: '#d9f0e5' }}>Why?</strong> This
                        is needed to secure your personal dashboard and ensure
                        only you have access to your client data.
                      </p>
                    </div>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>
                        Session Data:
                      </strong>{' '}
                      To provide our core service, we process transcripts and
                      audio/video recordings that you upload. This may include
                      sensitive conversations between you and your clients.
                    </p>
                    <p>
                      <strong style={{ color: '#d9f0e5' }}>Usage Data:</strong>{' '}
                      We collect anonymized data about how you interact with the
                      platform to improve performance and user experience.
                    </p>
                  </>
                ),
              },
              {
                num: '2.',
                title: 'How We Use Your Data',
                content: (
                  <>
                    <p>
                      We use your information solely for the following purposes:
                    </p>
                    <ul>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>
                          Service Delivery:
                        </strong>{' '}
                        To transcribe sessions, generate AI summaries, extract
                        action items, and power intelligence queries.
                      </li>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>
                          Communication:
                        </strong>{' '}
                        To send you service updates, security alerts, and
                        support messages.
                      </li>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>
                          Product Improvement:
                        </strong>{' '}
                        To analyze anonymized usage patterns. We never use your
                        client session data for this purpose.
                      </li>
                    </ul>
                  </>
                ),
              },
              {
                num: '3.',
                title: 'Data Retention & Security',
                content: (
                  <>
                    <p>
                      We implement industry-standard security measures including
                      256-bit encryption in transit and at rest.
                    </p>
                    <p>
                      You retain full control over your Session Data. You can
                      delete any transcript, recording, or client card at any
                      time from your dashboard, and we will permanently remove
                      it from our systems within 30 days.
                    </p>
                  </>
                ),
              },
              {
                num: '4.',
                title: 'Sharing of Information',
                content: (
                  <p>
                    We do not sell your personal data. We only share information
                    with third-party service providers strictly necessary to
                    operate MeetSolis (cloud hosting, AI processing APIs,
                    transcription services), who are contractually bound by
                    confidentiality obligations.
                  </p>
                ),
              },
              {
                num: '5.',
                title: 'AI Processing',
                content: (
                  <>
                    <p>
                      MeetSolis uses AI to process your session transcripts in
                      order to generate summaries, action items, and
                      intelligence responses.
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
                        We never use your client session data to train AI
                        models. Your clients&apos; conversations are private and
                        remain exclusively within your account.
                      </p>
                    </div>
                    <p>
                      AI-generated content may occasionally contain errors. We
                      recommend reviewing all outputs before relying on them
                      professionally.
                    </p>
                  </>
                ),
              },
              {
                num: '6.',
                title: 'Your Rights',
                content: (
                  <>
                    <p>
                      Depending on your jurisdiction, you may have the following
                      rights regarding your personal data:
                    </p>
                    <ul>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>Access:</strong>{' '}
                        Request a copy of the personal data we hold about you.
                      </li>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>
                          Correction:
                        </strong>{' '}
                        Request correction of inaccurate or incomplete data.
                      </li>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>Deletion:</strong>{' '}
                        Request deletion of your personal data.
                      </li>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>
                          Portability:
                        </strong>{' '}
                        Request a machine-readable export of your data.
                      </li>
                      <li>
                        <strong style={{ color: '#d9f0e5' }}>Objection:</strong>{' '}
                        Object to processing of your data for direct marketing.
                      </li>
                    </ul>
                    <p>
                      To exercise any of these rights, email us at{' '}
                      <a
                        href="mailto:hari@meetsolis.com"
                        style={{ color: '#37ea9e', fontWeight: 500 }}
                      >
                        hari@meetsolis.com
                      </a>
                      . We will respond within 30 days.
                    </p>
                  </>
                ),
              },
              {
                num: '7.',
                title: 'Cookies',
                content: (
                  <p>
                    We use cookies to maintain your session and preferences. You
                    can control cookie settings through your browser at any
                    time.
                  </p>
                ),
              },
              {
                num: '8.',
                title: 'Changes to This Policy',
                content: (
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of any significant changes via email or a
                    prominent notice in the app before changes take effect.
                  </p>
                ),
              },
              {
                num: '9.',
                title: 'Contact Us',
                content: (
                  <p>
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us at{' '}
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
