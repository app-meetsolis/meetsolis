/**
 * Canned Gladia diarized transcript used in mock mode (Story 6.3).
 *
 * When USE_MOCK_SERVICES is true or GLADIA_API_KEY is unset, submitGladiaJob
 * skips the real API and feeds this fixture through the same processing path
 * the webhook would — so dev/test exercises the full pipeline end-to-end.
 */

import type { DiarizedUtterance } from '@meetsolis/shared';

/** Two-speaker (coach + client) sample. Maps cleanly, no review needed. */
export const MOCK_DIARIZED_UTTERANCES: DiarizedUtterance[] = [
  {
    speaker: 0,
    text: 'Welcome back. How did the week go?',
    start: 0,
    end: 3.2,
  },
  {
    speaker: 1,
    text: 'Honestly, a lot better than I expected. I finally had that conversation with my manager.',
    start: 3.5,
    end: 9.8,
  },
  {
    speaker: 0,
    text: 'That is great to hear. What made it click this time?',
    start: 10.1,
    end: 13.4,
  },
  {
    speaker: 1,
    text: 'I prepared the way we discussed — I led with the outcome I wanted instead of the problem.',
    start: 13.7,
    end: 20.0,
  },
];
