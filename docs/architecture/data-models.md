# Data Models

### User

**Purpose:** Central user entity with authentication and role management for meetings

**Key Attributes:**
- id: string (UUID) - Unique identifier synced with Clerk
- email: string - Primary contact and authentication
- name: string - Display name for meetings
- role: 'host' | 'co-host' | 'participant' - Meeting permission level
- verified_badge: boolean - Future Upwork integration placeholder
- preferences: UserPreferences - UI and meeting preferences
- created_at: timestamp - Account creation
- updated_at: timestamp - Last profile update

#### TypeScript Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'co-host' | 'participant';
  verified_badge: boolean;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  auto_mute_on_join: boolean;
  default_video_off: boolean;
  preferred_view: 'gallery' | 'speaker';
  theme: 'light' | 'dark';
}
```

#### Relationships
- One-to-many with Meetings (as host)
- Many-to-many with Meetings (as participant)
- One-to-many with Messages
- One-to-many with Reactions

### Meeting

**Purpose:** Core meeting entity that orchestrates all video conferencing functionality

**Key Attributes:**
- id: string (UUID) - Unique meeting identifier
- host_id: string - References User.id
- title: string - Meeting name/purpose
- description: string - Optional meeting details
- status: 'scheduled' | 'active' | 'ended' - Current state
- scheduled_start: timestamp - Planned start time
- actual_start: timestamp - When meeting actually began
- actual_end: timestamp - When meeting concluded
- settings: MeetingSettings - Configuration options
- invite_link: string - Shareable meeting URL
- waiting_room_enabled: boolean - Entry control
- locked: boolean - Prevent new participants
- max_participants: number - Capacity limit

#### TypeScript Interface
```typescript
interface Meeting {
  id: string;
  host_id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'active' | 'ended';
  scheduled_start?: string;
  actual_start?: string;
  actual_end?: string;
  settings: MeetingSettings;
  invite_link: string;
  waiting_room_enabled: boolean;
  locked: boolean;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

interface MeetingSettings {
  allow_screen_share: boolean;
  allow_whiteboard: boolean;
  allow_file_upload: boolean;
  auto_record: boolean;
  enable_reactions: boolean;
  enable_polls: boolean;
  background_blur_default: boolean;
}
```

#### Relationships
- Many-to-one with User (host)
- One-to-many with Participants
- One-to-many with Messages
- One-to-many with Files
- One-to-many with Polls
- One-to-many with Recordings

### Participant

**Purpose:** Junction entity managing user participation in specific meetings with role-based permissions

**Key Attributes:**
- id: string (UUID) - Unique participation record
- meeting_id: string - References Meeting.id
- user_id: string - References User.id
- role: 'host' | 'co-host' | 'participant' - Meeting-specific role
- join_time: timestamp - When participant joined
- leave_time: timestamp - When participant left (nullable)
- is_muted: boolean - Current audio state
- is_video_off: boolean - Current video state
- permissions: ParticipantPermissions - Granular controls
- connection_quality: 'excellent' | 'good' | 'poor' - Network status

#### TypeScript Interface
```typescript
interface Participant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: 'host' | 'co-host' | 'participant';
  join_time: string;
  leave_time?: string;
  is_muted: boolean;
  is_video_off: boolean;
  permissions: ParticipantPermissions;
  connection_quality: 'excellent' | 'good' | 'poor';
}

interface ParticipantPermissions {
  can_share_screen: boolean;
  can_use_whiteboard: boolean;
  can_upload_files: boolean;
  can_send_messages: boolean;
  can_create_polls: boolean;
  can_use_reactions: boolean;
}
```

#### Relationships
- Many-to-one with Meeting
- Many-to-one with User
- One-to-many with Messages
- One-to-many with Reactions

### Message

**Purpose:** Real-time messaging system supporting public/private communication and chat history

**Key Attributes:**
- id: string (UUID) - Unique message identifier
- meeting_id: string - References Meeting.id
- sender_id: string - References User.id
- content: string - Message text (sanitized)
- type: 'public' | 'private' | 'system' - Message visibility
- recipient_id: string - For private messages (nullable)
- timestamp: timestamp - When message was sent
- edited_at: timestamp - Last edit time (nullable)
- is_deleted: boolean - Soft delete flag

#### TypeScript Interface
```typescript
interface Message {
  id: string;
  meeting_id: string;
  sender_id: string;
  content: string;
  type: 'public' | 'private' | 'system';
  recipient_id?: string;
  timestamp: string;
  edited_at?: string;
  is_deleted: boolean;
}
```

#### Relationships
- Many-to-one with Meeting
- Many-to-one with User (sender)
- Many-to-one with User (recipient, optional)
