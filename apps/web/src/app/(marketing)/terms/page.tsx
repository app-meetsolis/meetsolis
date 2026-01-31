
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - MeetSolis',
  description: 'Terms and conditions for using MeetSolis.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container px-4 md:px-6 pt-32 md:pt-40 pb-12 max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-heading">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              Please read these terms carefully before using our service. They outline your rights and obligations when using MeetSolis.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation (Optional or just Sticky Info) */}
          <div className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-semibold text-slate-900 mb-2">Last Updated</div>
                <div className="text-slate-500 options">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>

              <div className="hidden lg:block">
                <div className="text-sm font-semibold text-slate-900 mb-4 px-2">On this page</div>
                <nav className="space-y-2 text-sm text-slate-500">
                  {['Acceptance', 'Service Description', 'User Accounts', 'Privacy', 'Intellectual Property', 'Acceptable Use'].map((item) => (
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

              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using MeetSolis ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>2. Description of Service</h3>
              <p>
                MeetSolis is an AI-powered meeting assistant that provides transcription, summarization, and organizational tools for freelancers and professionals. The Service integrates with third-party platforms such as Google Calendar and Zoom to function.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>3. User Accounts</h3>
              <p>
                You are responsible for maintaining the security of your account and password. MeetSolis cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are responsible for all Content posted and activity that occurs under your account.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>4. Privacy and Data Security</h3>
              <p>
                Your privacy is critical to us. Our use of your personal information and data is governed by our Privacy Policy. By using MeetSolis, you consent to the collection and use of information as detailed in our Privacy Policy.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>5. Intellectual Property</h3>
              <p>
                <strong>Your Content:</strong> You retain full ownership of all data, text, audio, and other content you upload or generate via the Service ("User Content"). We claim no intellectual property rights over the material you provide to the Service.
              </p>
              <div className="bg-slate-50 border-l-4 border-slate-900 p-4 my-4 not-prose rounded-r-lg">
                <p className="text-sm text-slate-700 m-0">
                  <strong>Note:</strong> While we don't own your content, we need a license to process it (e.g., to generate your summaries). This permission is limited strictly to providing the service.
                </p>
              </div>
              <p>
                <strong>Our IP:</strong> The MeetSolis platform, including its software, design, and branding, is the exclusive property of MeetSolis and its licensors.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>6. Acceptable Use</h3>
              <p>
                You agree not to use the Service to:
              </p>
              <ul className="marker:text-slate-400">
                <li>Record conversations without the consent of all parties, where required by law.</li>
                <li>Upload or transmit any content that is unlawful, harmful, threatening, or abusive.</li>
                <li>Attempt to reverse engineer, decompile, or hack the Service.</li>
              </ul>

              <hr className="my-8 border-slate-100" />

              <h3>7. Limitation of Liability</h3>
              <p>
                In no event shall MeetSolis be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>8. Modifications to Service</h3>
              <p>
                We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice at any time.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>9. Governing Law</h3>
              <p>
                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>

              <hr className="my-8 border-slate-100" />

              <h3>10. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:appmeetsolis@gmail.com" className="no-underline text-blue-600 hover:underline">appmeetsolis@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
