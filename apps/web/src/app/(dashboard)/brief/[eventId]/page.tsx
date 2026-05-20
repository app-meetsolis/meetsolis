/**
 * /brief/[eventId] — Coach Brief screen (Story 6.4).
 * Server wrapper; the client screen handles fetch + state.
 */

import { BriefScreen } from '@/components/brief/BriefScreen';

export default function BriefPage({ params }: { params: { eventId: string } }) {
  return <BriefScreen eventId={params.eventId} />;
}
