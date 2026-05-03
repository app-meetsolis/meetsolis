import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy - MeetSolis',
  description: '30-day money-back guarantee. No questions asked.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container px-4 md:px-6 pt-32 md:pt-40 pb-12 max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-heading">
              Refund Policy
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              We stand behind our product. If MeetSolis is not the right fit, we
              will make it right.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-semibold text-slate-900 mb-2">
                  Last Updated
                </div>
                <div className="text-slate-500">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="text-sm font-semibold text-slate-900 mb-4 px-2">
                  On this page
                </div>
                <nav className="space-y-2 text-sm text-slate-500">
                  {[
                    '30-Day Guarantee',
                    'Eligibility',
                    'How to Request',
                    'Subscriptions',
                    'Contact',
                  ].map(item => (
                    <div
                      key={item}
                      className="px-2 py-1 hover:text-slate-900 cursor-pointer transition-colors"
                    >
                      {item}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white p-8 md:p-12 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:scroll-mt-24 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-a:text-blue-600 hover:prose-a:text-blue-700">
              {/* Guarantee banner */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 my-0 not-prose rounded-r-lg mb-8">
                <p className="text-sm text-green-900 m-0 font-semibold">
                  30-Day Money-Back Guarantee — No questions asked.
                </p>
              </div>

              <h3>1. 30-Day Money-Back Guarantee</h3>
              <p>
                MeetSolis offers a <strong>30-day money-back guarantee</strong>{' '}
                on all paid subscription plans (Pro and Agency). If you are
                unsatisfied with the Service for any reason within 30 days of
                your first payment, you are entitled to a full refund.
              </p>
              <p>
                This guarantee applies to your{' '}
                <strong>first payment only</strong> on a new subscription. It
                does not apply to renewal payments after the initial 30-day
                window.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>2. Eligibility</h3>
              <p>You are eligible for a refund if:</p>
              <ul className="marker:text-slate-400">
                <li>
                  You are requesting a refund within 30 days of your{' '}
                  <strong>initial</strong> subscription payment.
                </li>
                <li>
                  Your account is in good standing and has not violated our{' '}
                  <Link href="/terms">Terms of Service</Link>.
                </li>
                <li>
                  You have not previously received a refund for the same plan.
                </li>
              </ul>
              <p>
                Refunds are <strong>not</strong> available for:
              </p>
              <ul className="marker:text-slate-400">
                <li>Renewal charges after the initial 30-day period.</li>
                <li>Free plan usage (the Free plan has no charges).</li>
                <li>Partial months — we do not prorate unused time.</li>
                <li>Accounts terminated for Terms of Service violations.</li>
              </ul>

              <hr className="my-8 border-slate-100" />

              <h3>3. How to Request a Refund</h3>
              <p>
                To request a refund, email us at{' '}
                <a href="mailto:hari@meetsolis.com">hari@meetsolis.com</a> with
                the subject line <strong>&quot;Refund Request&quot;</strong> and
                include:
              </p>
              <ul className="marker:text-slate-400">
                <li>Your account email address.</li>
                <li>The date of your payment.</li>
                <li>
                  The reason for your refund request (optional, but it helps us
                  improve).
                </li>
              </ul>
              <p>
                We will process your refund within{' '}
                <strong>5–10 business days</strong>. Refunds are returned to the
                original payment method.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>4. Subscriptions and Cancellations</h3>
              <p>
                You may cancel your subscription at any time from your account
                settings. Cancellation stops future billing. You retain access
                to paid features until the end of your current billing period.
              </p>
              <p>
                Cancelling a subscription does <strong>not</strong>{' '}
                automatically trigger a refund. To request a refund, follow the
                process in Section 3 above.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>5. Payment Processor</h3>
              <p>
                Payments for MeetSolis subscriptions are processed by our
                authorized payment partners. When you purchase a subscription,
                you are buying from MeetSolis directly. Your billing statement
                may show the name of our payment processor.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>6. Contact Us</h3>
              <p>
                If you have questions about this Refund Policy, please{' '}
                <Link href="/contact">contact us</Link> or email{' '}
                <a href="mailto:hari@meetsolis.com">hari@meetsolis.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
