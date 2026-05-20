/**
 * /brief/manual/[clientId] — Coach Brief for clients without a calendar
 * event (Story 6.4 no-calendar fallback). Server wrapper.
 */

import { BriefScreen } from '@/components/brief/BriefScreen';

export default function ManualBriefPage({
  params,
}: {
  params: { clientId: string };
}) {
  return <BriefScreen clientId={params.clientId} />;
}
