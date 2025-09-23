# External APIs

### OpenAI GPT-4 API

- **Purpose:** AI-powered meeting summaries, action item extraction, agenda generation, and content analysis
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL(s):** https://api.openai.com/v1
- **Authentication:** Bearer token (API key)
- **Rate Limits:** 3,500 RPM, 90,000 TPM (free tier), $0.03/1K tokens input, $0.06/1K tokens output

**Key Endpoints Used:**
- `POST /chat/completions` - Meeting summary generation and action item extraction
- `POST /audio/transcriptions` - Whisper API for live captions and transcription

**Integration Notes:** All meeting content will be anonymized before sending to OpenAI. Implement token counting to stay within rate limits. Use streaming responses for real-time features. Store processed summaries in Supabase, not raw transcripts.

### DeepL Translation API

- **Purpose:** High-quality real-time translation for 10+ languages, live captions translation, and message translation
- **Documentation:** https://www.deepl.com/docs-api
- **Base URL(s):** https://api-free.deepl.com/v2 (free tier)
- **Authentication:** DeepL-Auth-Key header
- **Rate Limits:** 500,000 characters/month (free tier), then $5.49/month per 1M characters

**Key Endpoints Used:**
- `POST /translate` - Real-time message and caption translation
- `GET /languages` - Available language pairs

**Integration Notes:** Implement character counting to monitor usage. Cache common translations to reduce API calls. Support target languages: EN, ES, FR, DE, IT, PT, RU, JA, ZH, KO as specified in PRD.

### Twilio SMS API

- **Purpose:** SMS notifications for waiting room approvals, meeting reminders, and late participant alerts
- **Documentation:** https://www.twilio.com/docs/messaging/api
- **Base URL(s):** https://api.twilio.com/2010-04-01
- **Authentication:** Basic Auth (Account SID + Auth Token)
- **Rate Limits:** 1 message/second (trial), $0.0075 per SMS

**Key Endpoints Used:**
- `POST /Accounts/{AccountSid}/Messages.json` - Send SMS notifications

**Integration Notes:** Implement phone number validation. Use templates for consistent messaging. Add opt-out mechanism for compliance. Store delivery status for debugging.

### Google Calendar API

- **Purpose:** Meeting scheduling, calendar synchronization, automatic agenda import from Gmail, and calendar invites
- **Documentation:** https://developers.google.com/calendar/api/v3/reference
- **Base URL(s):** https://www.googleapis.com/calendar/v3
- **Authentication:** OAuth 2.0 with refresh tokens
- **Rate Limits:** 1,000,000 requests/day, 100 requests/100 seconds/user

**Key Endpoints Used:**
- `POST /calendars/primary/events` - Create calendar events for meetings
- `GET /calendars/primary/events` - Check scheduling conflicts
- `PATCH /calendars/primary/events/{eventId}` - Update meeting details

**Integration Notes:** Handle OAuth refresh token rotation. Implement conflict detection. Support timezone handling. Store minimal calendar data to respect privacy.

### Payment Processing (Paddle + Razorpay Combo)

- **Purpose:** Global payment processing with geo-detection routing - Paddle for global markets, Razorpay for India
- **Documentation:** https://developer.paddle.com/api-reference, https://razorpay.com/docs/api/
- **Base URL(s):** https://vendors.paddle.com/api/2.0, https://api.razorpay.com/v1
- **Authentication:** Paddle: Vendor Auth Code, Razorpay: Key ID + Secret
- **Rate Limits:** Paddle: 180 requests/minute, Razorpay: 5000 requests/hour

**Key Endpoints Used:**
- `POST /product/generate_pay_link` (Paddle) - International checkout
- `POST /orders` (Razorpay) - India-specific orders
- `POST /payments/{id}/capture` (Razorpay) - Payment capture

**Integration Notes:** Implement IP-based geo-detection to route Indian users to Razorpay, all others to Paddle. Use webhook validation for both providers. Store minimal payment data for compliance.
