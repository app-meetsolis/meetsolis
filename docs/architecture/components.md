# Components

### Frontend Components

#### VideoCallManager
**Responsibility:** Orchestrates WebRTC connections, manages peer-to-peer video streams, and coordinates real-time video features

**Key Interfaces:**
- `initializeCall(meetingId: string, participantId: string)` - Setup WebRTC connection
- `toggleMute()` - Audio control with UI feedback
- `toggleVideo()` - Video control with source selection
- `handlePeerConnection(peerId: string, offer: RTCSessionDescription)` - P2P signaling

**Dependencies:** simple-peer, webrtc-adapter, Supabase Realtime (signaling)

**Technology Stack:** React hooks, WebRTC APIs, TypeScript strict mode, Framer Motion (UI transitions)

#### CollaborationEngine
**Responsibility:** Manages real-time collaborative features including whiteboard, messaging, reactions, and polls

**Key Interfaces:**
- `sendMessage(content: string, type: MessageType)` - Chat functionality
- `broadcastReaction(emoji: string)` - Floating reaction system
- `syncWhiteboardState(state: ExcalidrawElement[])` - Whiteboard collaboration
- `createPoll(question: string, options: string[])` - Interactive polling

**Dependencies:** @excalidraw/excalidraw, Supabase Realtime, sanitize-html

**Technology Stack:** React Context, Supabase subscriptions, WebSocket connections, TypeScript interfaces

### Backend Components

#### MeetingOrchestrator
**Responsibility:** Core meeting lifecycle management, participant coordination, and real-time state synchronization

**Key Interfaces:**
- `createMeeting(hostId: string, settings: MeetingSettings)` - Meeting initialization
- `joinMeeting(meetingId: string, userId: string)` - Participant admission
- `updateMeetingState(meetingId: string, updates: Partial<Meeting>)` - State management
- `endMeeting(meetingId: string, hostId: string)` - Cleanup and archival

**Dependencies:** Supabase PostgreSQL, Supabase Realtime, Clerk webhooks

**Technology Stack:** Vercel Edge Functions, PostgreSQL RLS, WebSocket channels, TypeScript validation

#### AIIntegrationService
**Responsibility:** Coordinates AI-powered features including meeting summaries, translations, and content analysis

**Key Interfaces:**
- `generateSummary(transcript: string, meetingId: string)` - OpenAI GPT-4 processing
- `translateContent(text: string, targetLang: string)` - DeepL translation
- `extractActionItems(transcript: string)` - AI content analysis
- `anonymizeContent(content: string)` - Privacy protection

**Dependencies:** openai ^4.24.1, deepl-node ^1.12.0, sanitize-html

**Technology Stack:** OpenAI API, DeepL API, Vercel Edge Functions, rate limiting, error handling
