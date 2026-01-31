
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - MeetSolis',
  description: 'How MeetSolis collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container px-4 md:px-6 pt-32 md:pt-40 pb-12 max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-heading">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              Transparency is key. We want you to understand exactly how we collect, store, and use your data to help you organize your memory.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-semibold text-slate-900 mb-2">Last Updated</div>
                <div className="text-slate-500 options">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>

              <div className="hidden lg:block">
                <div className="text-sm font-semibold text-slate-900 mb-4 px-2">On this page</div>
                <nav className="space-y-2 text-sm text-slate-500">
                  {['Collection', 'Data Usage', 'Retention', 'Sharing', 'AI Processing'].map((item) => (
                    <div key={item} className="px-2 py-1 hover:text-slate-900 cursor-pointer transition-colors">
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

              <p>
                At MeetSolis, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share information when you use our AI meeting assistant service.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>1. Information We Collect</h3>
              <p>
                <strong>Account Information:</strong> We collect your name, email address, and authentication information when you sign up.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 not-prose rounded-r-lg">
                <p className="text-sm text-blue-900 m-0">
                  <strong>Why?</strong> This is needed to secure your personal dashboard and ensure only you have access to your meetings.
                </p>
              </div>
              <p>
                <strong>Meeting Data:</strong> To provide our core service, we process audio recordings, transcripts, and calendar details ("Meeting Data") that you authorize us to access.
              </p>
              <p>
                <strong>Usage Data:</strong> We collect anonymous data about how you interact with our website and application to improve performance and user experience.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>2. How We Use Your Data</h3>
              <p>
                We use your information solely for the following purposes:
              </p>
              <ul className="marker:text-slate-400">
                <li><strong>Service Delivery:</strong> To transcribe meetings, generate summaries, and extract action items as requested by you.</li>
                <li><strong>Communication:</strong> To send you service updates, security alerts, and support messages.</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our AI models (only with anonymized data or explicit consent).</li>
              </ul>

              <hr className="my-8 border-slate-100" />

              <h3>3. Data Retention and Security</h3>
              <p>
                We implement robust industry-standard security measures to protect your data, including encryption in transit and at rest.
              </p>
              <p>
                You retain full control over your Meeting Data. You can delete your recordings and transcripts at any time through your account dashboard, and we will permanently remove them from our systems.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>4. Sharing of Information</h3>
              <p>
                We do not sell your personal data. We only share information with third-party service providers (e.g., cloud hosting, AI processing APIs) strictly necessary to operate our Service, and who are bound by confidentiality agreements.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>5. AI Processing</h3>
              <p>
                Our Service utilizes Artificial Intelligence technologies to process Meeting Data. While we strive for accuracy, AI-generated content may occasionally contain errors. We recommend verifying critical information.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>6. Cookies</h3>
              <p>
                We use cookies to maintain your session and preferences. You can control cookie settings through your browser.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>7. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or a prominent notice on our service.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>8. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:appmeetsolis@gmail.com">appmeetsolis@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
