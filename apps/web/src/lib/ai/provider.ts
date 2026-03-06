export interface ClientContext {
  name: string;
  company?: string | null;
  role?: string | null;
  goal?: string | null;
  coachingSince?: string | null;
}

export interface SessionContext {
  id: string;
  session_date: string;
  title?: string | null;
  summary?: string | null;
  transcript_text?: string | null;
}

export interface SessionSummary {
  title: string;
  summary: string;
  action_items: string[];
  key_topics: string[];
}

export interface SolisResponse {
  answer: string;
  sources: Array<{
    session_id: string;
    session_date: string;
    title?: string | null;
  }>;
}

export interface AIProvider {
  summarizeSession(
    transcript: string,
    client: ClientContext
  ): Promise<SessionSummary>;
  queryIntelligence(
    query: string,
    sessions: SessionContext[],
    client: ClientContext
  ): Promise<SolisResponse>;
  generateEmbedding(text: string): Promise<number[]>;
}
