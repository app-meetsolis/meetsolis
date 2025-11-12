import { SignUp } from '@clerk/nextjs';

/**
 * Sign Up Page
 * Clerk-powered registration page with social login options
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-gray-300">
            Join MeetSolis to start hosting professional video meetings
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white shadow-2xl rounded-lg',
              headerTitle: 'text-navy-900',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
              formButtonPrimary: 'bg-teal-600 hover:bg-teal-700',
              footerActionLink: 'text-teal-600 hover:text-teal-700',
              formFieldInput:
                'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
              identityPreviewEditButton: 'text-teal-600 hover:text-teal-700',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/onboarding"
          signUpFallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
