import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - MeetSolis',
  description: 'MeetSolis terms of service and user agreement.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1>Terms of Service</h1>
        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using MeetSolis, you accept and agree to be bound by
          these Terms of Service and our Privacy Policy.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          MeetSolis provides video conferencing, AI meeting summaries,
          collaborative whiteboard, and related communication services.
        </p>

        <h2>3. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate registration information</li>
          <li>Maintain the security of your account</li>
          <li>Use the service in compliance with applicable laws</li>
          <li>Not use the service for illegal or unauthorized purposes</li>
        </ul>

        <h2>4. Payment Terms</h2>
        <p>
          Professional plan subscriptions are billed monthly at $15/month. You
          may cancel at any time. Refunds are provided within 30 days of
          purchase.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          All content, features, and functionality of MeetSolis are owned by us
          and protected by copyright, trademark, and other intellectual property
          laws.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          MeetSolis is provided &quot;as is&quot; without warranties. We are not
          liable for any indirect, incidental, or consequential damages arising
          from your use of the service.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          For questions about these Terms, contact:{' '}
          <a href="mailto:legal@meetsolis.com">legal@meetsolis.com</a>
        </p>
      </div>
    </div>
  );
}
