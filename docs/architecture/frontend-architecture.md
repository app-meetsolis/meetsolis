# Frontend Architecture

**Version:** 2.0 (Updated for Client Memory Pivot)
**Last Updated:** January 6, 2026

## Component Architecture

### Component Organization

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── page.tsx           # Dashboard (client list)
│   │   ├── clients/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx   # Client detail view
│   │   ├── meetings/
│   │   │   ├── page.tsx       # All meetings list
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Meeting detail
│   │   ├── assistant/
│   │   │   └── page.tsx       # AI assistant chat
│   │   ├── action-items/
│   │   │   └── page.tsx       # Action items list
│   │   └── settings/
│   │       └── page.tsx       # User settings & billing
├── components/
│   ├── ui/                    # Shadcn UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── clients/               # Client management components
│   │   ├── ClientCard.tsx
│   │   ├── ClientList.tsx
│   │   ├── ClientModal.tsx    # Add/Edit client form
│   │   ├── ClientDetail.tsx
│   │   └── ClientSearch.tsx
│   ├── meetings/              # Meeting logging components
│   │   ├── MeetingCard.tsx
│   │   ├── MeetingList.tsx
│   │   ├── MeetingLogModal.tsx # Log meeting form
│   │   ├── FileUploader.tsx   # Recording/transcript upload
│   │   └── MeetingSummary.tsx # AI summary display
│   ├── action-items/          # Action item components
│   │   ├── ActionItemCard.tsx
│   │   ├── ActionItemList.tsx
│   │   └── ActionItemModal.tsx
│   ├── ai/                    # AI-powered features
│   │   ├── AssistantChat.tsx
│   │   ├── PrepBrief.tsx
│   │   ├── ResearchPanel.tsx
│   │   └── ProcessingStatus.tsx
│   └── common/                # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── Toast.tsx
│       └── EmptyState.tsx
```

---

## Page Layouts & User Flows

### 1. Dashboard (Client List)

**Route:** `/`

**Layout:**
- Header: Logo, search bar, "+ Add Client" button, user profile
- Main: 3-column grid of client cards
- Sidebar (optional): Quick filters (tags, status)

**Client Card:**
```tsx
<Card>
  <h3>{client.name}</h3>
  <p>{client.role} at {client.company}</p>
  <div>
    <span>Last Meeting: {formatDate(client.last_meeting_at)}</span>
    <span>Action Items: {client.open_action_items}</span>
  </div>
  <div>
    {client.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
  </div>
</Card>
```

**States:**
- Loading: Skeleton cards (shimmer effect)
- Empty: "No clients yet. Add your first client."
- Error: Error message + retry button

---

### 2. Client Detail View

**Route:** `/clients/[id]`

**Layout:**
- Header: Client name, company, edit button
- Tabs: Overview | Meetings | Notes | Action Items
- Sidebar: Quick info (contact, website, LinkedIn)

**Overview Tab:**
- AI-generated client summary
- "Research" button (trigger website scraping)
- Recent meetings timeline
- Open action items

**Meetings Tab:**
- Chronological list of meetings
- "+ Log Meeting" button
- Each meeting shows: date, title, summary preview

**Action Items Tab:**
- Filterable list (status, priority)
- "+ Add Action Item" button

---

### 3. Meeting Detail View

**Route:** `/meetings/[id]`

**Layout:**
- Header: Meeting title, date, client name (link)
- Main content:
  - Manual notes (editable)
  - AI summary (if available)
  - Action items extracted
  - Transcript (collapsible, if available)
- Sidebar:
  - Meeting metadata (platform, duration)
  - Files (recording, transcript) with download links
  - "Generate Summary" button (if transcript exists but no summary)

**Upload Flow:**
1. User clicks "Upload Recording"
2. File dropzone appears
3. User drags file or clicks to browse
4. Upload progress bar
5. Success: "Transcription in progress (~10 min)"
6. Email notification when summary ready

---

### 4. AI Assistant

**Route:** `/assistant`

**Layout:**
- ChatGPT-style interface
- Left sidebar: Conversation history
- Main: Chat window with messages
- Bottom: Input box + "Send" button

**Features:**
- Pre-built question templates (buttons)
- Source citations below AI responses (links to meetings)
- Scope to client (optional filter)

**Message Format:**
```tsx
// User message
<div className="flex justify-end">
  <div className="bg-blue-500 text-white p-3 rounded-lg">
    {message.content}
  </div>
</div>

// AI message
<div className="flex justify-start">
  <div className="bg-gray-100 p-3 rounded-lg">
    {message.content}
    <div className="mt-2 text-sm text-gray-600">
      Sources: <Link>Meeting with Client X</Link>
    </div>
  </div>
</div>
```

---

## State Management Architecture

### React Query for Data Fetching

```typescript
// hooks/useClients.ts
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// hooks/useCreateClient.ts
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientInput) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create client');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Client created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
```

### Global State (Minimal)

Use React Context only for:
- User preferences (theme, settings)
- UI state (sidebar open/closed, modals)

**Do NOT use global state for:**
- Clients, meetings, action items → use React Query
- Form state → use react-hook-form

---

## Component Templates

### Standard Component Template

```typescript
// components/clients/ClientCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Client } from '@/types';

interface ClientCardProps {
  client: Client;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-600">
              {client.role} {client.company && `at ${client.company}`}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {client.last_meeting_at ? (
              <span>Last meeting: {formatDistanceToNow(new Date(client.last_meeting_at))} ago</span>
            ) : (
              <span>No meetings yet</span>
            )}
          </div>

          {client.tags && client.tags.length > 0 && (
            <div className="flex gap-2">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
```

### Modal/Dialog Template

```typescript
// components/clients/ClientModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateClient } from '@/hooks/useCreateClient';

const clientSchema = z.object({
  name: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ open, onClose }) => {
  const { mutate: createClient, isLoading } = useCreateClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const onSubmit = (data: ClientFormData) => {
    createClient(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input {...register('name')} placeholder="John Doe" />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <Input {...register('company')} placeholder="Acme Corp" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input {...register('email')} type="email" placeholder="john@acme.com" />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

---

## File Upload Component

**Meeting recording/transcript upload:**

```typescript
// components/meetings/FileUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FileUploaderProps {
  meetingId: string;
  type: 'recording' | 'transcript';
  onUploadComplete: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  meetingId,
  type,
  onUploadComplete,
}) => {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/upload-${type}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [meetingId, type, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'recording'
      ? { 'audio/*': ['.mp3', '.m4a', '.wav'], 'video/*': ['.mp4'] }
      : { 'text/*': ['.txt', '.srt', '.vtt'] },
    maxFiles: 1,
    maxSize: type === 'recording' ? 2 * 1024 * 1024 * 1024 : 10 * 1024 * 1024, // 2GB or 10MB
  });

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {type === 'recording' ? <FileAudio size={48} /> : <FileText size={48} />}
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop file here' : `Upload ${type}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {type === 'recording'
                ? 'MP3, MP4, M4A, WAV (max 2GB)'
                : 'TXT, SRT, VTT (max 10MB)'}
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">Uploading... {progress}%</p>
        </div>
      )}
    </Card>
  );
};
```

---

## Routing & Navigation

### App Router Structure

```
app/
├── layout.tsx               # Root layout (Clerk provider)
├── page.tsx                 # Redirect to /dashboard
├── (auth)/
│   ├── layout.tsx           # Auth layout (centered form)
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
└── (dashboard)/
    ├── layout.tsx           # Dashboard layout (sidebar, header)
    ├── page.tsx             # Client list (dashboard)
    ├── clients/[id]/page.tsx
    ├── meetings/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── assistant/page.tsx
    ├── action-items/page.tsx
    └── settings/page.tsx
```

### Protected Routes (Middleware)

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/sign-in', '/sign-up'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## Design System

### Color Palette

```css
/* Inspired by PRD reference design */
:root {
  --background: #E8E4DD;      /* Light beige background */
  --card: #FFFFFF;            /* White cards */
  --foreground: #1A1A1A;      /* Dark text */
  --muted: #6B7280;           /* Gray text */
  --primary: #2563EB;         /* Blue accent */
  --success: #10B981;         /* Green */
  --warning: #F59E0B;         /* Orange */
  --error: #EF4444;           /* Red */
}
```

### Typography

```css
/* Based on PRD specs */
.client-name {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
}

.client-role {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
}

.badge {
  font-size: 11px;
  text-transform: uppercase;
  background: #F3F4F6;
}
```

---

## Performance Optimization

### Code Splitting
- Lazy load heavy components (AI assistant, file uploader)
- Use Next.js dynamic imports

```typescript
import dynamic from 'next/dynamic';

const AssistantChat = dynamic(() => import('@/components/ai/AssistantChat'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

### Image Optimization
- Use Next.js `<Image>` component for client profile photos (future feature)
- Lazy load images below fold

### Bundle Size
- Target: Initial bundle <300KB
- Use tree-shaking for unused Shadcn components
- Avoid heavy dependencies

---

## Error Handling

### Error Boundary

```typescript
// components/common/ErrorBoundary.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Testing Strategy

### Component Testing

```typescript
// components/clients/ClientCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ClientCard } from './ClientCard';

describe('ClientCard', () => {
  const mockClient = {
    id: '123',
    name: 'John Doe',
    company: 'Acme Corp',
    role: 'CEO',
    tags: ['important', 'active'],
    last_meeting_at: '2026-01-01',
  };

  it('renders client name', () => {
    render(<ClientCard client={mockClient} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<ClientCard client={mockClient} />);
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});
```

### E2E Testing (Cypress)

```typescript
// cypress/e2e/client-flow.cy.ts
describe('Client Management Flow', () => {
  beforeEach(() => {
    cy.login(); // Custom command using Clerk
  });

  it('creates a new client', () => {
    cy.visit('/');
    cy.contains('Add Client').click();
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="company"]').type('Acme Corp');
    cy.contains('Save').click();
    cy.contains('Client created successfully');
    cy.contains('John Doe');
  });
});
```

---

## Accessibility

- Semantic HTML everywhere
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader testing

```tsx
<button
  aria-label="Add new client"
  className="focus:ring-2 focus:ring-blue-500"
>
  <Plus aria-hidden="true" />
</button>
```
