# Story 3.3: Auto-Transcription — Implementation Plan

## Context

Story 3.3 adds audio/video upload with auto-transcription to MeetSolis. Coaches upload recordings (.mp3/.mp4/.m4a/.wav/.webm, up to 500MB), which get transcribed via Deepgram Nova-2 (or placeholder in dev), then auto-summarized via the existing AI chain. Stories 3.1/3.2/3.4/3.5/3.6 are done — substantial infrastructure exists to reuse.

---

## Architecture Decisions

1. **Direct-to-Storage upload** — Vercel has 4.5MB body limit; 500MB audio must upload directly to Supabase Storage via signed URL, not through API route
2. **Reuse `'processing'` status** — no new status enum; distinguish transcription vs summarization via `transcript_audio_url` exists + `transcript_text` is null
3. **Transcription chains into summarization** — `runTranscribe()` calls `runSummarize()` on success
4. **Speaker diarization** — use Deepgram `smart_format=true` which auto-prefixes `Speaker N:` in paragraphs

---

## Implementation Steps (dependency order)

### Step 1: TranscriptionService Interface
**Modify:** `packages/shared/src/types/services.ts` (+10 lines)

Add after `AIService` interface:
```typescript
export interface TranscriptionResult {
  text: string;
  duration_seconds?: number;
  confidence?: number;
}

export interface TranscriptionService extends ExternalService {
  transcribe(audioUrl: string): Promise<TranscriptionResult>;
}
```

Re-export already handled by `packages/shared/src/index.ts`.

---

### Step 2: Mock Transcription Service
**Create:** `apps/web/src/lib/services/mock/mock-transcription-service.ts` (~45 lines)

Mirror `MockAIService`. Extend `BaseService`, implement `TranscriptionService`. Return hardcoded coaching transcript after 100ms delay.

---

### Step 3: Deepgram Transcription Service
**Create:** `apps/web/src/lib/services/transcription/deepgram-transcription-service.ts` (~80 lines)

- Constructor takes `apiKey: string` from `config.transcription.deepgramApiKey`
- `transcribe(audioUrl)`:
  - POST `https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true&smart_format=true`
  - Headers: `Authorization: Token ${apiKey}`, `Content-Type: application/json`
  - Body: `{ url: audioUrl }`
  - Parse: `response.results.channels[0].alternatives[0]` — use `.paragraphs.transcript` (smart_format gives Speaker labels), fallback to `.transcript`
  - Return `{ text, duration_seconds, confidence }`

---

### Step 4: Wire ServiceFactory
**Modify:** `apps/web/src/lib/service-factory.ts` (+25 lines)

- Import `TranscriptionService` from `@meetsolis/shared`
- Import `MockTranscriptionService`, `DeepgramTranscriptionService`
- Add `createTranscriptionService()` method (singleton pattern, switch on `config.transcription.provider`)
- Add to `getAllServices()` return

---

### Step 5: Core Transcription Logic
**Create:** `apps/web/src/lib/sessions/transcribe-session.ts` (~65 lines)

Mirror `summarize-session.ts`:
```
runTranscribe(sessionId, userId):
  1. Fetch session, verify ownership
  2. Guard: transcript_audio_url must exist
  3. Set status = 'processing'
  4. Call ServiceFactory.createTranscriptionService().transcribe(audioUrl)
  5. Update transcript_text = result.text
  6. Chain: await runSummarize(sessionId, userId)
  7. Catch: set status = 'error'
```

---

### Step 6: Transcribe API Route
**Create:** `apps/web/src/app/api/sessions/[id]/transcribe/route.ts` (~70 lines)

Copy `summarize/route.ts` structure: UUID validation → Clerk auth → `getInternalUserId()` → ownership check → call `runTranscribe()`.

Add `export const maxDuration = 120` for Vercel timeout (audio transcription can take 30-60s).

---

### Step 7: Signed Upload URL Route
**Create:** `apps/web/src/app/api/sessions/upload-url/route.ts` (~50 lines)

POST — returns signed upload URL for direct client→Storage upload:
- Auth + getInternalUserId
- Body: `{ filename, contentType }`
- Generate path: `transcripts/{userId}/{uuid}/{filename}` (uuid = crypto.randomUUID for uniqueness)
- `supabase.storage.from('transcripts').createSignedUploadUrl(path)`
- Return `{ signedUrl, path, publicUrl }`

---

### Step 8: Modify Sessions POST Route
**Modify:** `apps/web/src/app/api/sessions/route.ts` (~15 lines changed)

Replace fire-and-forget block (lines 336-339):
```typescript
// Conditional: transcribe first if audio URL provided without transcript text
if (transcript_audio_url && !resolvedTranscriptText) {
  runTranscribe(newSession.id, userId).catch(err =>
    console.error('[Sessions API] Transcribe trigger failed:', err)
  );
} else if (resolvedTranscriptText) {
  runSummarize(newSession.id, userId).catch(err =>
    console.error('[Sessions API] Summarize trigger failed:', err)
  );
}
```

Import `runTranscribe` from `@/lib/sessions/transcribe-session`.

---

### Step 9: SessionUploadModal — Audio Tab
**Modify:** `apps/web/src/components/sessions/SessionUploadModal.tsx` (~80 lines added)

1. `InputMode = 'file' | 'paste' | 'audio'`
2. Add constants: `MAX_AUDIO_BYTES = 500 * 1024 * 1024`, `ACCEPTED_AUDIO = '.mp3,.mp4,.m4a,.wav,.webm'`
3. Add state: `audioFile`, `audioFileError`, `uploadProgress`
4. Third tab button with `Mic` icon from lucide-react
5. Audio file input section (shown when mode === 'audio')
6. Submit flow for audio:
   - POST to `/api/sessions/upload-url` → get `{ signedUrl, publicUrl }`
   - PUT file directly to signed URL
   - POST to `/api/sessions` with `transcript_audio_url` = publicUrl (as JSON, no file in body)
7. Toast: "Session uploaded — transcribing audio..."
8. Update `isFormValid()` and state reset

---

### Step 10: SessionCard — Contextual Message
**Modify:** `apps/web/src/components/sessions/SessionCard.tsx` (~3 lines)

In processing block (lines 44-61), change message:
```typescript
{session.transcript_audio_url && !session.transcript_text
  ? 'Transcribing audio...'
  : 'AI is processing your session...'}
```

---

### Step 11: SessionTimeline — Smart Retry
**Modify:** `apps/web/src/components/sessions/SessionTimeline.tsx` (~8 lines)

Update `onRetry` (lines 43-49): if session has `transcript_audio_url` but no `transcript_text`, POST to `/transcribe`; otherwise POST to `/summarize` (existing behavior).

---

## File Summary

| # | File | Action | Est Lines |
|---|------|--------|-----------|
| 1 | `packages/shared/src/types/services.ts` | Modify | +10 |
| 2 | `apps/web/src/lib/services/mock/mock-transcription-service.ts` | Create | ~45 |
| 3 | `apps/web/src/lib/services/transcription/deepgram-transcription-service.ts` | Create | ~80 |
| 4 | `apps/web/src/lib/service-factory.ts` | Modify | +25 |
| 5 | `apps/web/src/lib/sessions/transcribe-session.ts` | Create | ~65 |
| 6 | `apps/web/src/app/api/sessions/[id]/transcribe/route.ts` | Create | ~70 |
| 7 | `apps/web/src/app/api/sessions/upload-url/route.ts` | Create | ~50 |
| 8 | `apps/web/src/app/api/sessions/route.ts` | Modify | +15 |
| 9 | `apps/web/src/components/sessions/SessionUploadModal.tsx` | Modify | +80 |
| 10 | `apps/web/src/components/sessions/SessionCard.tsx` | Modify | +3 |
| 11 | `apps/web/src/components/sessions/SessionTimeline.tsx` | Modify | +8 |

---

## Reuse Map

| Existing | Reuse For |
|----------|-----------|
| `BaseService` (`lib/services/base-service.ts`) | Extend for transcription services |
| `ServiceFactory.createAIService()` pattern | Mirror for `createTranscriptionService()` |
| `runSummarize()` (`lib/sessions/summarize-session.ts`) | Chain after transcription; mirror for `runTranscribe()` |
| `summarize/route.ts` | Copy auth/ownership pattern for `transcribe/route.ts` |
| `uploadTranscriptFile()` (`api/sessions/route.ts`) | Reference for Storage path pattern |
| `config.transcription.*` (`lib/config/env.ts`) | Already wired — use directly |
| `checkTranscriptLimit()`/`incrementTranscriptCount()` | Call in `runTranscribe()` |
| SessionTimeline 5s polling | Already works for `status === 'processing'` — no changes needed |

---

## Verification

1. `npm run build` — no type errors
2. `npm run lint` — passes
3. Dev test with `TRANSCRIPTION_PROVIDER=placeholder`:
   - Upload audio file via modal Tab 3
   - Verify signed URL obtained, file uploaded to Storage
   - Session card shows "Transcribing audio..."
   - After ~100ms mock delay, transcript_text populated, summary generated
   - Session card shows complete state with summary
4. Retry test: set session to error state manually, click Retry, verify /transcribe called
5. Verify existing Tab 1 (manual upload) still works unchanged

---

## Unresolved Questions

1. Vercel plan? Free = 10s timeout, Pro = 300s. `maxDuration = 120` requires Pro.
2. Upload progress indicator in modal — show % or just spinner?
