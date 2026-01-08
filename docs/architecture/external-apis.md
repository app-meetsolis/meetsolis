# External APIs

**Version:** 2.0 (Updated for Client Memory Pivot)
**Last Updated:** January 6, 2026

## AI & Transcription Services

### Gladia Transcription API

- **Purpose:** Convert uploaded meeting recordings (audio/video) into accurate text transcripts
- **Documentation:** https://docs.gladia.io/
- **Base URL(s):** https://api.gladia.io/v2
- **Authentication:** API key (X-Gladia-Key header)
- **Rate Limits:** 10 hours free transcription, then $0.61/hour
- **Supported Formats:** MP3, MP4, M4A, WAV, FLAC, OGG (max 2GB per file)

**Key Endpoints Used:**
- `POST /upload` - Upload audio/video file for transcription
- `GET /result/{request_id}` - Poll for transcription completion (async)
- `POST /transcription` - Alternative synchronous transcription (max 10min files)

**Integration Notes:**
- Use async workflow: upload → poll status → retrieve transcript
- Gladia supports speaker diarization (who said what)
- Average processing time: 1/3 of audio duration (30min recording = 10min processing)
- Store transcript in database, don't re-transcribe
- Track usage in `ai_usage_tracking` table for cost monitoring

**Sample Response:**
```json
{
  "id": "req_abc123",
  "status": "done",
  "result": {
    "transcription": {
      "full_transcript": "Meeting transcript here...",
      "utterances": [
        {"start": 0.5, "end": 5.2, "text": "Hello everyone", "speaker": 0}
      ]
    }
  }
}
```

---

### OpenAI GPT-4 API

- **Purpose:** AI-powered meeting summaries, action item extraction, client research, and RAG-powered assistant
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL(s):** https://api.openai.com/v1
- **Authentication:** Bearer token (API key)
- **Rate Limits:** Tier 1: 500 RPM, 10,000 TPM | Pricing: GPT-4o-mini $0.15/1M input, $0.60/1M output

**Key Endpoints Used:**
- `POST /chat/completions` - Meeting summary generation, action item extraction, AI assistant chat
- `POST /embeddings` - Generate vector embeddings for RAG (text-embedding-3-small)

**Use Cases:**

1. **Meeting Summarization** (after Gladia transcription)
   - Input: Full transcript (up to 128k tokens)
   - Output: Structured summary (overview, key_points, decisions, next_steps)
   - Model: `gpt-4o-mini`

2. **Action Item Extraction**
   - Input: Meeting transcript or notes
   - Output: JSON array of tasks with descriptions, priorities, due dates
   - Model: `gpt-4o-mini`

3. **Client Research** (public website scraping)
   - Input: Scraped website text
   - Output: AI-generated client overview, company info, talking points
   - Model: `gpt-4o-mini`

4. **RAG-Powered AI Assistant**
   - Input: User question + retrieved context from pgvector
   - Output: Contextual answer grounded in user's meeting data
   - Model: `gpt-4o-mini`

5. **Vector Embeddings** (for RAG)
   - Input: Text chunks (meeting transcripts, notes, client overviews)
   - Output: 1536-dimensional vector embeddings
   - Model: `text-embedding-3-small` ($0.02/1M tokens)

**Integration Notes:**
- Always sanitize user input before sending to OpenAI
- Use streaming for better UX on long responses
- Implement retry logic with exponential backoff
- Track token usage for cost monitoring (target: <$100/month MVP)
- Set `max_tokens` limits to prevent runaway costs
- Store API responses in database, don't regenerate unnecessarily

**Sample Summary Prompt:**
```
You are a meeting assistant. Summarize this meeting transcript into:
1. Overview (2-3 sentences)
2. Key Points (3-5 bullet points)
3. Decisions Made (if any)
4. Next Steps (action items)

Transcript:
{transcript}

Return JSON format.
```

---

### OpenAI Embeddings API

- **Purpose:** Generate vector embeddings for RAG semantic search
- **Model:** `text-embedding-3-small` (1536 dimensions)
- **Pricing:** $0.02 per 1M tokens (~700k words)
- **Use Cases:**
  - Embed meeting transcripts (chunked into 500-word segments)
  - Embed manual notes
  - Embed client overviews
  - Query embeddings for semantic search

**Integration Flow:**
1. User uploads meeting transcript → Gladia transcribes → OpenAI generates summary
2. Summary text chunked into segments → Each chunk embedded → Stored in `embeddings` table with pgvector
3. User asks AI question → Question embedded → pgvector similarity search → Top 5 relevant chunks retrieved → Sent to GPT-4 with question
4. GPT-4 generates answer grounded in retrieved context → Returned to user

**Sample Embedding Request:**
```json
{
  "model": "text-embedding-3-small",
  "input": "Meeting transcript chunk here...",
  "encoding_format": "float"
}
```

---

## Payment & Billing (MVP)

### Stripe API

- **Purpose:** Subscription billing for Pro tier ($29/mo, $249/yr)
- **Documentation:** https://stripe.com/docs/api
- **Base URL(s):** https://api.stripe.com/v1
- **Authentication:** Bearer token (Secret key)
- **Rate Limits:** 100 requests/second

**Key Endpoints Used:**
- `POST /customers` - Create Stripe customer for new user
- `POST /checkout/sessions` - Create checkout session for Pro upgrade
- `POST /billing_portal/sessions` - Manage subscription (cancel, update payment)
- Webhooks: `customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_succeeded`

**Integration Notes:**
- Store `stripe_customer_id` and `stripe_subscription_id` in `user_preferences` table
- Use webhooks to sync subscription status
- Implement webhook signature verification for security
- Support both monthly ($29) and annual ($249) plans
- Handle failed payments gracefully (allow 3-day grace period)

**Pricing Configuration:**
- Free Tier: $0 (3 clients, 3 AI meetings/month, 100 AI queries)
- Pro Tier: $29/month (50 clients, 20 AI meetings/month, 1000 AI queries)
- Annual Pro: $249/year (same limits, save $99)

---

## Optional Integrations (Post-MVP)

### Google Calendar API

- **Purpose:** Meeting scheduling and calendar synchronization (post-MVP feature)
- **Documentation:** https://developers.google.com/calendar/api/v3/reference
- **Base URL(s):** https://www.googleapis.com/calendar/v3
- **Authentication:** OAuth 2.0 with refresh tokens
- **Rate Limits:** 1,000,000 requests/day, 100 requests/100 seconds/user

**Deferred to Post-MVP:** Calendar integration not required for MVP launch. Focus on manual meeting logging first.

---

### Puppeteer (Web Scraping)

- **Purpose:** Scrape public client websites for AI research (MVP feature)
- **Type:** Self-hosted headless browser (not external API)
- **Documentation:** https://pptr.dev/
- **Use Case:** User enters client website URL → Puppeteer scrapes text → OpenAI summarizes → Stored in `clients.research_data`

**Implementation Notes:**
- Run in Vercel serverless function (or separate scraping service if needed)
- Respect robots.txt
- Cache scraped data (don't re-scrape frequently)
- Limit to public pages only (no authentication scraping)
- Fallback: If scraping fails, allow manual client overview entry

---

## API Security & Best Practices

### Security Measures
1. **API Key Management:** Store all API keys in Vercel environment variables (never commit to git)
2. **Proxy Pattern:** All external API calls go through Vercel Edge Functions (never expose keys to frontend)
3. **Rate Limiting:** Implement application-level rate limits before hitting external APIs
4. **Input Validation:** Use Zod schemas to validate all inputs before sending to external APIs
5. **Error Handling:** Graceful degradation if external API fails (e.g., if Gladia down, allow manual transcript upload)

### Cost Monitoring
- Track all API usage in `ai_usage_tracking` table
- Set up alerts when usage exceeds budget thresholds
- MVP Budget Target: <$100/month total AI costs (Gladia + OpenAI)
- Free tier limits enforced in `user_preferences` table (max 3 AI meetings/month for free users)

### Reliability
- Implement retry logic with exponential backoff
- Cache API responses where appropriate (summaries, embeddings)
- Queue background jobs for expensive operations (transcription, embedding generation)
- Monitor API uptime with Sentry error tracking
