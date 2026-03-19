export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unavailable';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
}

export interface ServiceInfo {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
}

export interface ExternalService {
  isAvailable(): Promise<boolean>;
  fallbackMode(): boolean;
  healthCheck(): Promise<ServiceStatus>;
  getServiceInfo(): ServiceInfo;
  getCircuitBreakerState(): string;
}

export interface AuthService extends ExternalService {
  authenticate(credentials: any): Promise<any>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<any>;
}

export interface DatabaseService extends ExternalService {
  query(sql: string, params?: any[]): Promise<any>;
  insert(table: string, data: any): Promise<any>;
  update(table: string, id: string, data: any): Promise<any>;
  delete(table: string, id: string): Promise<any>;
}

export interface ClientContext {
  name: string;
  goal?: string | null;
  coaching_since?: string | null;
}

export interface SessionSummaryItem {
  description: string;
  assigned_to: 'coach' | 'client';
}

export interface SessionSummary {
  title: string;
  summary: string;
  key_topics: string[];
  action_items: SessionSummaryItem[];
}

export interface AIService extends ExternalService {
  generateSummary(text: string): Promise<string>;
  analyzeText(text: string): Promise<any>;
  summarizeSession(transcript: string, ctx: ClientContext): Promise<SessionSummary>;
  generateEmbedding(text: string): Promise<number[]>;
}

export interface TranscriptionResult {
  text: string;
  duration_seconds?: number;
  confidence?: number;
}

export interface TranscriptionService extends ExternalService {
  transcribe(audioUrl: string): Promise<TranscriptionResult>;
}

export interface TranslationService extends ExternalService {
  translate(text: string, targetLanguage: string): Promise<string>;
  detectLanguage(text: string): Promise<string>;
}

export interface SMSService extends ExternalService {
  sendSMS(to: string, message: string): Promise<boolean>;
}

export interface AnalyticsService extends ExternalService {
  track(event: string, properties?: any): Promise<void>;
  identify(userId: string, traits?: any): Promise<void>;
}

export interface ErrorTrackingService extends ExternalService {
  captureException(error: Error): Promise<void>;
  captureMessage(message: string, level?: string): Promise<void>;
}

export interface CalendarService extends ExternalService {
  createEvent(event: any): Promise<any>;
  updateEvent(eventId: string, event: any): Promise<any>;
  deleteEvent(eventId: string): Promise<void>;
  getEvents(start: Date, end: Date): Promise<any[]>;
}