import { Button } from '@/components/ui/button';

export function SessionTimelineStub() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-[#1A1A1A]">Sessions</h2>
      </div>
      <div className="flex flex-col items-center px-8 py-10 text-center">
        <p className="text-sm text-[#6B7280]">No sessions yet.</p>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Upload your first session transcript to get started.
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="mt-4"
          title="Coming in Story 3.2"
        >
          Upload Session Transcript
        </Button>
      </div>
    </section>
  );
}
