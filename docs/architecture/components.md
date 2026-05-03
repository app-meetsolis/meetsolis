# Components

### Frontend Components

#### ClientCardManager
**Responsibility:** Renders client grid/list, handles client CRUD, manages client search and filtering

**Key Interfaces:**
- `createClient(data: ClientInput)` - Create new client with name, goal, company, role, start date
- `updateClient(id: string, data: Partial<ClientInput>)` - Edit client details
- `deleteClient(id: string)` - Soft delete with confirmation
- `searchClients(query: string)` - Filter by name

**Dependencies:** @tanstack/react-query, Supabase client
**Technology Stack:** React hooks, TypeScript strict mode, Tailwind CSS

#### SessionTimeline
**Responsibility:** Displays chronological coaching session history within a Client Card; handles expand/collapse of individual sessions

**Key Interfaces:**
- `renderSession(session: Session)` - Expandable session card with summary, action items, key topics
- `markActionItemComplete(itemId: string)` - Toggle action item status
- `viewTranscript(sessionId: string)` - Open full transcript view

**Dependencies:** @tanstack/react-query, Supabase client
**Technology Stack:** React, TypeScript, Tailwind CSS

#### TranscriptUploadModal
**Responsibility:** Two-tab upload modal — manual (.txt/.docx file upload or paste) and auto-transcribe (audio/video via Deepgram)

**Key Interfaces:**
- `uploadFile(file: File, clientId: string, sessionDate: string)` - File upload to Supabase Storage
- `pasteTranscript(text: string, clientId: string)` - Direct text storage
- `autoTranscribe(audioFile: File, clientId: string)` - Deepgram transcription pipeline

**Dependencies:** Supabase Storage, Deepgram API (via abstraction layer)
**Technology Stack:** React, File API, multipart form, TypeScript

### Backend Components

#### AIProcessingService
**Responsibility:** Runs AI summary pipeline after transcript upload — generates summary, action items, key topics, and session title using Claude Sonnet 4.5 (default) or GPT-4o-mini

**Key Interfaces:**
- `processTranscript(sessionId: string, transcript: string, clientContext: ClientContext)` - Full AI pipeline
- `generateSummary(transcript: string)` - Executive summary (2–3 paragraphs)
- `extractActionItems(transcript: string)` - Coach + client commitments
- `generateTitle(transcript: string)` - 3–6 word session title

**Dependencies:** Anthropic SDK or OpenAI SDK (abstracted via `AI_PROVIDER` env var), Supabase
**Technology Stack:** Vercel Edge Functions, TypeScript, pgvector embeddings

#### SolisIntelligenceService
**Responsibility:** Conversational AI that answers coach questions about any client's history using hybrid RAG (pgvector semantic search + 3 most recent sessions)

**Key Interfaces:**
- `query(question: string, clientId: string, userId: string)` - RAG-powered answer with citations
- `generateEmbedding(text: string)` - Session summary embedding for pgvector
- `retrieveContext(question: string, clientId: string)` - Hybrid retrieval (semantic + recency)

**Dependencies:** Anthropic/OpenAI SDK (abstracted), pgvector, Supabase
**Technology Stack:** Vercel Edge Functions, pgvector, TypeScript

#### TranscriptionService
**Responsibility:** Audio/video file transcription via Deepgram Nova-2 with speaker diarization (auto-labels coach vs. client speech)

**Key Interfaces:**
- `transcribe(audioUrl: string)` - Returns transcript text with speaker labels
- Provider abstracted via `TRANSCRIPTION_PROVIDER` env var (deepgram | openai-whisper | placeholder)

**Dependencies:** Deepgram SDK (default), OpenAI Whisper (alternative)
**Technology Stack:** Vercel Edge Functions, Supabase Storage, TypeScript
