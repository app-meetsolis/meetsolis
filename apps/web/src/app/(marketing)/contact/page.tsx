import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact - MeetSolis',
  description: 'Get in touch with the MeetSolis support team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container px-4 md:px-6 pt-32 md:pt-40 pb-12 max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-heading">
              Contact Us
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              We are here to help. Reach out via email or phone and we will get
              back to you as soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Email Support
            </h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              For general questions, billing inquiries, and account support. We
              typically respond within 24 hours on business days.
            </p>
            <a
              href="mailto:appmeetsolis@gmail.com"
              className="text-sm font-semibold text-slate-900 underline hover:no-underline"
            >
              appmeetsolis@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Phone Support
            </h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Available Monday – Friday, 10 AM – 6 PM IST. For urgent billing or
              account issues.
            </p>
            <a
              href="tel:+918591359878"
              className="text-sm font-semibold text-slate-900 underline hover:no-underline"
            >
              +91 85913 59878
            </a>
            <p className="text-xs text-slate-400 mt-1">India (IST timezone)</p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-8 bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Company</p>
              <p>MeetSolis</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Support Hours</p>
              <p>Mon – Fri, 10 AM – 6 PM IST</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">
                Email Response Time
              </p>
              <p>Within 24 business hours</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">
                Billing Inquiries
              </p>
              <p>
                <a
                  href="mailto:appmeetsolis@gmail.com"
                  className="underline hover:no-underline"
                >
                  appmeetsolis@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          Looking for our{' '}
          <Link
            href="/refund"
            className="underline hover:text-slate-900 transition-colors"
          >
            refund policy
          </Link>{' '}
          or{' '}
          <Link
            href="/privacy"
            className="underline hover:text-slate-900 transition-colors"
          >
            privacy policy
          </Link>
          ?
        </div>
      </div>
    </div>
  );
}
