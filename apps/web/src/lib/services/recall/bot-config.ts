/**
 * Shared Recall.ai bot recording_config builder (Story 6.2 / 6.2b).
 *
 * Used by both cron dispatch (dispatch-pending) and on-demand dispatch
 * (dispatch-now) so streaming-transcription config stays identical across
 * both paths — a drift here would silently disable streaming for one path.
 */

import { config } from '@/lib/config/env';
import type { RecallCreateBotRequest } from '@meetsolis/shared';

export function buildBotRecordingConfig(): RecallCreateBotRequest['recording_config'] {
  return {
    video_mixed_layout: 'speaker_view',
    video_mixed_mp4: {}, // archive MP4 — Phase 3 audio playback needs it
    transcript: {
      provider: { deepgram_streaming: { model: 'nova-2', language: 'en' } },
    },
    realtime_endpoints: [
      {
        type: 'webhook',
        url: `${config.app.url}/api/recall/realtime-webhook`,
        events: ['transcript.data'],
      },
    ],
  };
}
