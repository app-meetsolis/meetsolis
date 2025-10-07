import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - MeetSolis',
  description:
    'Learn about MeetSolis and our mission to make video conferencing better for freelancers and agencies.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About MeetSolis
        </h1>

        <div className="prose prose-lg prose-gray max-w-none">
          <h2>Our Mission</h2>
          <p>
            MeetSolis was built to solve a simple problem: professional video
            conferencing shouldn&apos;t break the bank. We saw freelancers and
            small agencies struggling with expensive enterprise tools that were
            overkill for their needs.
          </p>

          <h2>Why MeetSolis?</h2>
          <p>
            Unlike Zoom and other platforms designed for large corporations,
            MeetSolis is built specifically for solopreneurs, consultants,
            coaches, and small creative agencies. We focus on the features that
            matter most to you:
          </p>
          <ul>
            <li>Unlimited meetings with no time limits</li>
            <li>AI-powered meeting summaries to save you time</li>
            <li>Collaborative whiteboard for creative sessions</li>
            <li>Simple, transparent pricing starting at just $15/month</li>
          </ul>

          <h2>Our Values</h2>
          <ul>
            <li>
              <strong>Simplicity</strong> - No complex enterprise features you
              don&apos;t need
            </li>
            <li>
              <strong>Transparency</strong> - Clear pricing, no hidden fees
            </li>
            <li>
              <strong>Privacy</strong> - Your data is yours, we never sell it
            </li>
            <li>
              <strong>Reliability</strong> - Professional-grade infrastructure
              you can trust
            </li>
          </ul>

          <h2>Get in Touch</h2>
          <p>
            We&apos;d love to hear from you. Whether you have questions,
            feedback, or just want to say hello, reach out at{' '}
            <a
              href="mailto:hello@meetsolis.com"
              className="text-primary hover:underline"
            >
              hello@meetsolis.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
