import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - MeetSolis',
  description: 'MeetSolis privacy policy and data handling practices.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to MeetSolis. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our video
          conferencing platform.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul>
          <li>Account information (name, email, password)</li>
          <li>Meeting data (recordings, transcripts, participants)</li>
          <li>Usage information (features used, meeting duration)</li>
          <li>Device and connection information</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Process payments and send notifications</li>
          <li>Generate AI-powered meeting summaries</li>
          <li>Ensure platform security and prevent fraud</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement end-to-end encryption for all meetings and comply with
          GDPR and SOC 2 standards. Your data is never sold to third parties.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          For privacy inquiries, please contact us at:{' '}
          <a href="mailto:privacy@meetsolis.com">privacy@meetsolis.com</a>
        </p>
      </div>
    </div>
  );
}
