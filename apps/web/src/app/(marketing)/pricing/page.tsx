import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - MeetSolis',
  description: 'Simple, transparent pricing for freelancers and consultants.',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with AI client memory at no cost.',
    features: [
      'Up to 3 clients',
      '5 session transcripts (lifetime)',
      '75 Solis queries (lifetime)',
      'AI meeting summaries',
      'Action item extraction',
      'Email support',
    ],
    cta: 'Get Started Free',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$99',
    period: 'per month',
    annualPrice: '$948',
    annualNote: 'billed annually — save $240',
    description:
      'Unlimited everything. For freelancers who run on client context.',
    features: [
      'Unlimited clients',
      'Unlimited session transcripts',
      'Unlimited Solis queries',
      'AI summaries + action items',
      'Full client memory & context',
      'Google Calendar integration',
      'Priority support',
    ],
    cta: 'Start Pro — 30-Day Free Trial',
    href: '/sign-up?plan=pro',
    highlight: true,
  },
];

const faqs = [
  {
    q: 'Do you offer a free trial?',
    a: 'Yes. Pro includes a 30-day free trial — no credit card required to start.',
  },
  {
    q: 'What is your refund policy?',
    a: 'We offer a 30-day money-back guarantee on the first payment of any Pro subscription. Contact us within 30 days for a full refund.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your account settings at any time. You keep access until the end of your billing period.',
  },
  {
    q: 'What counts as a Solis query?',
    a: 'A Solis query is any question you ask the AI about a client — e.g. "What did we decide in last week\'s call?" Each question = one query.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards. Payments are processed securely through our payment provider.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container px-4 md:px-6 pt-32 md:pt-40 pb-12 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-heading">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Start free. Upgrade when your client list grows.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container px-4 md:px-6 py-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[32px] border p-8 shadow-sm ${
                plan.highlight
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2
                  className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}
                >
                  {plan.name}
                </h2>
                <p
                  className={`text-sm mb-4 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    /{plan.period}
                  </span>
                </div>
                {'annualNote' in plan && (
                  <p className="text-xs text-slate-400 mt-1">
                    or {plan.annualPrice}/yr — {plan.annualNote}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-slate-900'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={
                        plan.highlight ? 'text-slate-300' : 'text-slate-600'
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full text-center py-3 px-6 rounded-2xl text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-white text-slate-900 hover:bg-slate-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-500">
          <svg
            className="w-5 h-5 text-green-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>
            30-day money-back guarantee on Pro.{' '}
            <Link
              href="/refund"
              className="underline hover:text-slate-900 transition-colors"
            >
              See refund policy.
            </Link>
          </span>
        </div>
      </div>

      {/* FAQ */}
      <div className="container px-4 md:px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center font-heading">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map(faq => (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                {faq.q}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-10">
          More questions?{' '}
          <Link
            href="/contact"
            className="text-slate-900 font-medium underline hover:no-underline"
          >
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
