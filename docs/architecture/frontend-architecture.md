# Frontend Architecture

### Component Architecture

#### Component Organization

```
src/
├── components/
│   ├── ui/                     # Shadcn UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── meeting/                # Meeting-specific components
│   │   ├── VideoCallManager.tsx
│   │   ├── ParticipantGrid.tsx
│   │   ├── ControlBar.tsx
│   │   └── ChatWindow.tsx
│   ├── collaboration/          # Real-time collaboration
│   │   ├── ReactionOverlay.tsx
│   │   ├── PollManager.tsx
│   │   └── FileUpload.tsx
│   ├── ai/                     # AI-powered features
│   │   ├── MeetingSummary.tsx
│   │   ├── TranslationPanel.tsx
│   │   └── LiveCaptions.tsx
│   └── common/                 # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── Toast.tsx
```

#### Component Template

```typescript
// Standard component template with TypeScript and error boundaries
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ComponentProps {
  meetingId: string;
  participantId: string;
  onStateChange?: (state: ComponentState) => void;
  className?: string;
}

export const TemplateComponent: React.FC<ComponentProps> = ({
  meetingId,
  participantId,
  onStateChange,
  className
}) => {
  const [state, setState] = useState<ComponentState>({ isLoading: true });

  // React Query for data fetching with error handling
  const { data, error, isLoading } = useQuery({
    queryKey: ['component-data', meetingId, participantId],
    queryFn: () => fetchComponentData(meetingId, participantId),
    onError: (error) => {
      setState(prev => ({ ...prev, error: error.message }));
      toast.error('Failed to load component data');
    }
  });

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* Component content */}
        <Button onClick={handleAction}>
          Action
        </Button>
      </div>
    </Card>
  );
};
```

### State Management Architecture

#### State Structure

```typescript
// Global application state structure using React Query + Context
interface AppState {
  // Authentication state (Clerk)
  auth: {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
  };

  // Current meeting state
  meeting: {
    current: Meeting | null;
    participants: Participant[];
    messages: Message[];
    reactions: Reaction[];
  };

  // Stream SDK state
  video: {
    localStream: MediaStream | null;
    remoteStreams: Map<string, MediaStream>;
    isAudioMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
  };
}
```

### Routing Architecture

#### Route Organization

```
app/
├── (auth)/                     # Authentication group
│   ├── sign-in/[[...sign-in]]/
│   └── sign-up/[[...sign-up]]/
├── (dashboard)/                # Protected dashboard group
│   ├── dashboard/
│   └── layout.tsx             # Dashboard layout
├── meeting/
│   └── [id]/                  # Dynamic meeting routes
│       ├── page.tsx           # Main meeting interface
│       └── waiting-room/
├── api/                       # API routes (Edge Functions)
│   ├── meetings/
│   ├── auth/
│   └── webhooks/
├── globals.css
├── layout.tsx                 # Root layout
└── page.tsx                   # Landing page
```

#### Protected Route Pattern

```typescript
// middleware.ts - Route protection with Clerk
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)"
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Frontend Services Layer

#### API Client Setup

```typescript
// lib/api-client.ts - Centralized API client with auth and error handling
import axios, { AxiosError } from 'axios';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-toastify';

class ApiClient {
  private baseURL: string;
  private getToken: () => Promise<string | null>;

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL;
    this.getToken = getToken;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const token = await this.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        data,
        headers,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError) {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please sign in again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission for this action.');
    } else {
      toast.error('An unexpected error occurred.');
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }
}

// Hook for using API client
export const useApiClient = () => {
  const { getToken } = useAuth();

  return new ApiClient(
    process.env.NEXT_PUBLIC_API_URL || '/api',
    getToken
  );
};
```
