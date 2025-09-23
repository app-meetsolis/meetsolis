# MeetSolis AI Frontend Generation Prompts

## Overview

This document contains comprehensive, production-ready prompts for generating MeetSolis frontend components using AI tools like Vercel v0, Lovable.ai, or similar code generation platforms. Each prompt follows a structured 4-part framework ensuring high-quality, consistent output aligned with the MeetSolis design system and technical requirements.

## Table of Contents

1. [Master Context Prompt](#master-context-prompt) - **Use This First**
2. [Epic 1: Dashboard Hub Component](#epic-1-dashboard-hub-component)
3. [Epic 2: Pre-Call Setup Component](#epic-2-pre-call-setup-component)
4. [Epic 2: In-Call Interface Component](#epic-2-in-call-interface-component)
5. [Implementation Guide](#implementation-guide)
6. [Troubleshooting](#troubleshooting)

---

## Master Context Prompt

**⚠️ CRITICAL: Copy this entire context block into your AI tool FIRST before using any component prompts.**

```
# MeetSolis - Premium Video Conferencing Platform for Freelancers

## Project Overview
MeetSolis is a Zoom alternative specifically designed for freelancers and small agencies (2-10 employees) who conduct frequent client video calls. The platform addresses critical pain points: unprofessional call experiences, scope creep, billing inefficiencies, and client trust issues through specialized tools and a single, affordable plan ($12-15/month).

## Tech Stack & Constraints
- **Framework**: Next.js 14+ with App Router and TypeScript
- **Styling**: Tailwind CSS with Shadcn UI components as foundation
- **State Management**: React Query (@tanstack/react-query) for data fetching
- **Icons**: Lucide React icons (24px standard, 16px inline)
- **Authentication**: Clerk integration
- **Database**: Supabase with real-time capabilities
- **Video**: WebRTC with simple-peer library

## Design System Foundation
- **Primary Color**: Deep Navy (#001F3F) - headers, CTAs, active states
- **Secondary**: Pure White (#FFFFFF) - backgrounds, cards
- **Accent**: Soft Teal (#00A0B0) - interactive elements, hover states
- **Success**: Emerald (#10B981) - positive feedback
- **Warning**: Amber (#F59E0B) - cautions, alerts
- **Error**: Red (#EF4444) - errors, destructive actions
- **Neutrals**: Gray scale (#6B7280, #F3F4F6, #374151)

## Typography
- **Font**: Inter with system font fallback
- **Scale**: H1: 32px/bold, H2: 24px/semibold, H3: 20px/semibold, Body: 16px/regular, Small: 14px/regular
- **Line Heights**: Headers 1.2-1.4, Body 1.5

## Spacing & Layout
- **Grid**: 12-column responsive (1200px max desktop, 24px gutters)
- **Spacing Scale**: 4px, 8px, 16px, 24px, 32px, 48px (8px baseline)
- **Component Padding**: Cards 24px, Buttons 12px vertical/24px horizontal
- **Touch Targets**: 48px minimum for mobile accessibility

## Brand Principles
1. **Minimalism-First, Premium Feel** - Sparse elegance, reduce cognitive load
2. **One-Click Professionalism** - Single interactions for quality checks/setup
3. **Contextual Tool Access** - Features appear when needed, no clutter
4. **Gentle Guidance** - Non-intrusive notifications and suggestions
5. **Adaptive Personalization** - Interface adapts to user role and usage

## Responsive Strategy
- **Mobile (320-767px)**: Single column, touch-first, essential features only
- **Tablet (768-1023px)**: Two-column grid, hybrid touch/cursor
- **Desktop (1024-1439px)**: Three-column, full feature set, keyboard shortcuts
- **Wide (1440px+)**: Enhanced productivity features, multi-panel workflows

CRITICAL: All components must be fully accessible (WCAG 2.1 AA), use semantic HTML, include proper ARIA labels, and support keyboard navigation. Use TypeScript for all props and state management.
```

---

## Epic 1: Dashboard Hub Component

**Purpose**: Central command center for freelancers with personalized meeting overview, quick actions, and productivity insights.

```
# Epic 1: Dashboard Hub Component

## High-Level Goal
Create a responsive dashboard hub component serving as the central command center for freelancers, featuring personalized meeting overview, quick actions, and productivity insights with professional, minimalist design.

## Detailed Step-by-Step Instructions

1. **Create the main Dashboard component** (`components/Dashboard.tsx`)
   - Use TypeScript with proper prop interfaces
   - Implement responsive 12-column CSS Grid layout
   - Include header bar with logo, search, notifications, and profile avatar

2. **Build Quick Actions Panel** (left section, 4 columns desktop)
   - Create large CTA buttons: "Start Instant Call" (primary navy), "Schedule Meeting" (secondary), "Join Meeting" (tertiary)
   - Add icons from Lucide React (Video, Calendar, Users)
   - Implement hover states with 1.02 scale and teal color transition (300ms ease)
   - Include recent participants dropdown for instant meetings

3. **Design Upcoming Calls Card** (center section, 4 columns desktop)
   - Display next 3 meetings with client names, timestamps, and countdown
   - Use relative time formatting ("in 15 minutes", "Tomorrow 2:30 PM")
   - Add one-click join buttons with loading states
   - Include meeting prep shortcuts (notes, agenda preview)

4. **Create Recent Activity Feed** (bottom left, 8 columns desktop)
   - Show call history, shared files, AI summaries in chronological order
   - Use card-based layout with subtle shadows (elevation 1dp)
   - Include interactive elements: file previews, summary expansion
   - Add search/filter functionality with debounced input

5. **Build Wellness Widget** (right sidebar, 4 columns desktop)
   - Display weekly call volume with traffic light indicators (green/yellow/red)
   - Show burnout risk assessment with gentle suggestions
   - Include break recommendations and fatigue alerts
   - Use soft animations for status changes (300ms ease-in-out)

6. **Implement Performance Glimpse** (bottom right, 4 columns desktop)
   - Show key metrics: conversion rate, average call duration
   - Add trend arrows and percentage changes
   - Use charts/mini-visualizations for data representation
   - Include links to detailed analytics (future Epic 4)

7. **Add Responsive Behavior**
   - Mobile: Single column stack, collapsible quick actions
   - Tablet: Two-column grid, condensed wellness widget
   - Desktop: Full three-column layout as specified
   - Implement smooth transitions between breakpoints

8. **Integrate Real-time Updates**
   - Use React Query for data fetching and caching
   - Connect to Supabase Realtime for meeting status updates
   - Implement optimistic updates for better UX
   - Add loading skeletons with shimmer effects

## Code Examples, Data Structures & Constraints

### Required Props Interface:
```typescript
interface DashboardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: 'freelancer' | 'agency_owner';
  };
  upcomingMeetings: Meeting[];
  recentActivity: ActivityItem[];
  wellnessData: WellnessMetrics;
  performanceData: PerformanceMetrics;
}

interface Meeting {
  id: string;
  clientName: string;
  scheduledTime: Date;
  duration: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  agenda?: string[];
}

interface WellnessMetrics {
  weeklyCallCount: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  suggestedBreaks: number;
  status: 'healthy' | 'warning' | 'critical';
}
```

### Styling Constraints:
- Use only Tailwind CSS classes, no custom CSS
- Primary buttons: `bg-[#001F3F] hover:bg-[#00A0B0] text-white transition-colors duration-300`
- Cards: `bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`
- Spacing: Use `space-y-6` for vertical stacking, `gap-6` for grid layouts
- Typography: `text-gray-900` for headers, `text-gray-600` for secondary text

### Component Structure:
```tsx
<div className="min-h-screen bg-gray-50 p-6">
  <Header />
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
    <QuickActionsPanel className="lg:col-span-4" />
    <UpcomingCallsCard className="lg:col-span-4" />
    <WellnessWidget className="lg:col-span-4 lg:row-span-2" />
    <RecentActivityFeed className="lg:col-span-8" />
    <PerformanceGlimpse className="lg:col-span-4" />
  </div>
</div>
```

### Quick Actions Example:
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
  <div className="space-y-3">
    <button className="w-full bg-[#001F3F] hover:bg-[#00A0B0] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
      <Video className="w-5 h-5" />
      <span>Start Instant Call</span>
    </button>
    <button className="w-full border-2 border-[#001F3F] text-[#001F3F] hover:bg-[#001F3F] hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2">
      <Calendar className="w-5 h-5" />
      <span>Schedule Meeting</span>
    </button>
    <button className="w-full text-[#00A0B0] hover:text-[#001F3F] px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2">
      <Users className="w-5 h-5" />
      <span>Join Meeting</span>
    </button>
  </div>
</div>
```

### DO NOT:
- Include any external dependencies beyond specified tech stack
- Use inline styles or styled-components
- Implement actual API calls (use mock data)
- Add complex state management (keep component-level state simple)

## Define Strict Scope
**Create these files ONLY:**
- `components/Dashboard.tsx` - Main dashboard component
- `components/dashboard/QuickActionsPanel.tsx` - Quick actions section
- `components/dashboard/UpcomingCallsCard.tsx` - Upcoming meetings display
- `components/dashboard/WellnessWidget.tsx` - Wellness tracking section
- `components/dashboard/RecentActivityFeed.tsx` - Activity history
- `components/dashboard/PerformanceGlimpse.tsx` - Performance metrics

**DO NOT modify:**
- Any existing layout or page files
- Authentication components
- Global styles or configuration files
- Package.json or dependencies

**Mock Data Requirements:**
Include realistic mock data for 3 upcoming meetings (Client A in 15 min, Client B tomorrow, Client C next week), 5 recent activities (completed calls, shared files, AI summaries), wellness metrics showing "healthy" status with 12 calls/week, and performance data showing 85% conversion rate with upward trend.
```

---

## Epic 2: Pre-Call Setup Component

**Purpose**: Comprehensive pre-call preparation interface ensuring professional quality and reducing setup time.

```
# Epic 2: Pre-Call Setup Component

## High-Level Goal
Create a comprehensive pre-call setup interface that ensures professional call quality through automated checks, agenda review, and tool configuration, reducing setup time by 20% while maintaining reliability standards.

## Detailed Step-by-Step Instructions

1. **Create PreCallSetup component** (`components/PreCallSetup.tsx`)
   - Accept meeting data via props (client info, scheduled time, duration)
   - Implement three-column grid layout for desktop (Quality Check, Agenda, Tools)
   - Include progress indicator showing setup completion status

2. **Build Meeting Info Header**
   - Display client name, meeting time, estimated duration prominently
   - Add "Edit Details" button with modal trigger
   - Include meeting type indicator (scheduled, instant, recurring)
   - Show time until meeting start with countdown for imminent calls

3. **Implement Quality Check Panel** (left column)
   - Create camera preview with live video feed simulation
   - Add audio test with microphone level indicator and test recording
   - Include background options: None, Blur (intensity slider), Custom upload
   - Show connection quality indicator with automatic optimization suggestions
   - Display pass/fail status with green checkmarks or red warning icons

4. **Design Agenda Review Section** (center column)
   - Show AI-generated or manual agenda items in reorderable list
   - Include time estimates for each agenda item with total duration
   - Add drag-and-drop functionality for agenda reordering
   - Provide "+ Add Item" button with inline editing
   - Display agenda item priorities and meeting objectives

5. **Create Tools Configuration Panel** (right column)
   - Timer setup: Session timer (billable hours), preparation countdown, break reminders
   - Recording settings: Auto-record toggle, local/cloud options, participant consent
   - Teleprompter upload area with script preview and formatting options
   - Integration status: Calendar sync, notification preferences, file sharing permissions

6. **Build Action Bar** (bottom of interface)
   - "Back to Dashboard" secondary button (left-aligned)
   - "START CALL" primary button (right-aligned, prominent when ready)
   - Show setup completion percentage and remaining required items
   - Include "Skip Setup" option for experienced users

7. **Add Interactive Features**
   - Background blur intensity slider with real-time preview
   - Audio test with playback of recorded sample
   - Agenda item time estimation with smart suggestions
   - Quality check auto-run on component mount with retry options

8. **Implement Responsive Design**
   - Mobile: Single column stack with tabbed interface for space efficiency
   - Tablet: Two-column layout with tools panel collapsible
   - Desktop: Full three-column layout as designed
   - Ensure all touch targets meet 48px minimum for accessibility

## Code Examples, Data Structures & Constraints

### Required Props Interface:
```typescript
interface PreCallSetupProps {
  meeting: {
    id: string;
    clientName: string;
    scheduledTime: Date;
    duration: number; // minutes
    agenda?: AgendaItem[];
    type: 'scheduled' | 'instant' | 'recurring';
  };
  onStartCall: () => void;
  onSaveSetup: (settings: SetupSettings) => void;
}

interface QualityCheckStatus {
  camera: 'good' | 'warning' | 'error';
  audio: 'good' | 'warning' | 'error';
  connection: 'excellent' | 'good' | 'poor';
  overall: boolean;
}

interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

interface SetupSettings {
  backgroundType: 'none' | 'blur' | 'custom';
  blurIntensity?: number;
  recordingEnabled: boolean;
  timerSettings: {
    sessionTimer: boolean;
    breakReminders: boolean;
    interval: number;
  };
}
```

### Layout Structure:
```tsx
<div className="min-h-screen bg-gray-50 p-6">
  <MeetingHeader meeting={meeting} />
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-6">
    <QualityCheckPanel
      className="bg-white rounded-lg shadow-sm p-6"
      onStatusChange={handleQualityCheck}
    />
    <AgendaReviewPanel
      className="bg-white rounded-lg shadow-sm p-6"
      agenda={meeting.agenda}
      onAgendaUpdate={handleAgendaUpdate}
    />
    <ToolsConfigPanel
      className="bg-white rounded-lg shadow-sm p-6"
      onSettingsChange={handleToolsConfig}
    />
  </div>
  <ActionBar
    isReady={allChecksPass}
    onStartCall={onStartCall}
    onBackToDashboard={onBackToDashboard}
  />
</div>
```

### Quality Check Component Example:
```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900">Quality Check</h3>
  <div className="space-y-3">
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Camera className="w-5 h-5 text-gray-600" />
        <span className="font-medium">Camera</span>
      </div>
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-600">Good</span>
      </div>
    </div>

    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Mic className="w-5 h-5 text-gray-600" />
        <span className="font-medium">Audio</span>
      </div>
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <button className="text-sm text-[#00A0B0] hover:text-[#001F3F]">Test</button>
      </div>
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Background</label>
      <div className="flex space-x-2">
        <button className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">None</button>
        <button className="px-3 py-2 text-sm border rounded-lg bg-[#001F3F] text-white">Blur</button>
        <button className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Custom</button>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={blurIntensity}
        className="w-full accent-[#00A0B0]"
      />
    </div>
  </div>
</div>
```

### Agenda Review Example:
```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-gray-900">Agenda</h3>
    <span className="text-sm text-gray-500">Total: 45 min</span>
  </div>

  <div className="space-y-2">
    {agenda.map((item, index) => (
      <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-move">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#001F3F] text-white text-xs flex items-center justify-center">
              {index + 1}
            </div>
            <span className="font-medium">{item.title}</span>
          </div>
          <span className="text-sm text-gray-500">{item.duration} min</span>
        </div>
        {item.description && (
          <p className="text-sm text-gray-600 mt-1 ml-9">{item.description}</p>
        )}
      </div>
    ))}

    <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#00A0B0] hover:text-[#00A0B0] transition-colors">
      + Add agenda item
    </button>
  </div>
</div>
```

### Styling Requirements:
- Quality indicators: Green checkmark `text-green-600`, warning `text-amber-500`, error `text-red-500`
- Progress completion: `bg-teal-100 text-teal-800` for completed items
- Timer displays: Monospace font `font-mono text-lg`
- Background blur slider: `accent-[#00A0B0]` with live preview overlay

### DO NOT:
- Implement actual WebRTC camera/microphone access (use placeholder/mock)
- Include real file upload functionality (simulate with local state)
- Connect to actual calendar APIs (use mock integration status)
- Add complex video processing (use CSS filters for background preview)

## Define Strict Scope
**Create these files ONLY:**
- `components/PreCallSetup.tsx` - Main setup component
- `components/precall/QualityCheckPanel.tsx` - Camera/audio testing
- `components/precall/AgendaReviewPanel.tsx` - Agenda management
- `components/precall/ToolsConfigPanel.tsx` - Timer and tool settings
- `components/precall/MeetingHeader.tsx` - Meeting information display
- `components/precall/ActionBar.tsx` - Bottom action buttons

**Mock Requirements:**
Include simulated quality check results (camera: good, audio: good, connection: excellent), sample agenda with 3 items totaling 45 minutes ("Project introduction - 15 min", "Scope review - 20 min", "Next steps - 10 min"), and tool settings showing timer configured for 60 minutes with recording enabled.
```

---

## Epic 2: In-Call Interface Component

**Purpose**: Full-screen video calling interface with professional controls and collaboration tools.

```
# Epic 2: In-Call Video Interface Component

## High-Level Goal
Create a full-screen video calling interface with floating controls, collapsible sidebar tools, and contextual productivity features that maintain professional focus while providing essential collaboration tools.

## Detailed Step-by-Step Instructions

1. **Create InCallInterface component** (`components/InCallInterface.tsx`)
   - Implement full-screen video layout with adaptive participant grid
   - Default to speaker view for 1-2 participants, gallery view for 3+
   - Include floating control dock at bottom center with auto-hide functionality
   - Add collapsible right sidebar for chat, participants, and tools (hidden by default)

2. **Build Video Grid System**
   - Create responsive video tile layout supporting 1-16 participants
   - Implement speaker view with large main video and thumbnail grid
   - Add gallery view with equal-sized participant tiles
   - Include picture-in-picture self-view (draggable, resizable, toggle-able)
   - Show participant names, mute status, and connection quality overlays

3. **Design Floating Control Dock**
   - Position at bottom center with 8 core controls: Mute, Video, Share Screen, Whiteboard, Timer, Chat, Settings, End Call
   - Use 48px circular buttons with Lucide React icons
   - Implement auto-hide after 3 seconds of inactivity with fade animation
   - Add keyboard shortcuts overlay (press ? to show/hide)
   - Include visual feedback for mute/unmute with pulse animation

4. **Create Collapsible Sidebar** (300px width when open)
   - Implement slide-in animation from right edge (300ms ease-in-out)
   - Include three tabs: Chat, Participants, Files/Tools
   - Chat: Real-time messaging with emoji reactions and file sharing
   - Participants: List with controls (mute, spotlight, remove, promote)
   - Tools: AI notes, whiteboard access, file management

5. **Add Status Overlays and Indicators**
   - Recording indicator: Red dot with "REC" label (top-left)
   - Connection quality: Colored bars (top-right of each video tile)
   - Timer widget: Draggable, collapsible, shows session time and billing hours
   - Participant count and meeting ID (subtle, top-center)

6. **Implement Contextual Menus and Controls**
   - Right-click participant videos for context menu (pin, spotlight, mute, remove)
   - Hover effects on video tiles revealing participant controls
   - Quick access to backgrounds, audio settings through floating menu
   - Emergency controls: Audio-only mode, connection troubleshooting

7. **Add Accessibility Features**
   - Full keyboard navigation with visible focus indicators
   - Screen reader announcements for participant join/leave events
   - High contrast mode support with enhanced borders and text
   - Live captions toggle (placeholder for future implementation)

8. **Handle Responsive Behavior**
   - Mobile: Simplified controls, swipe gestures for sidebar, single video focus
   - Tablet: Touch-optimized controls, two-column participant grid
   - Desktop: Full feature set with keyboard shortcuts and right-click menus
   - Auto-adapt video grid based on screen size and participant count

## Code Examples, Data Structures & Constraints

### Required Props Interface:
```typescript
interface InCallInterfaceProps {
  meetingId: string;
  participants: Participant[];
  currentUser: User;
  isHost: boolean;
  meetingSettings: {
    isRecording: boolean;
    timerActive: boolean;
    startTime: Date;
    sidebarOpen: boolean;
  };
  onEndCall: () => void;
  onMuteToggle: () => void;
  onVideoToggle: () => void;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  videoEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  isPinned?: boolean;
  isSpotlighted?: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  videoEnabled: boolean;
}
```

### Layout Structure:
```tsx
<div className="fixed inset-0 bg-black">
  {/* Main Video Area */}
  <div className="relative w-full h-full">
    <VideoGrid
      participants={participants}
      layout={videoLayout}
      currentUser={currentUser}
    />

    {/* Status Overlays */}
    <StatusOverlays
      isRecording={isRecording}
      connectionQuality={connectionQuality}
      participantCount={participants.length}
    />

    {/* Self View */}
    <SelfView
      className="absolute bottom-20 right-4"
      user={currentUser}
      isDraggable
    />

    {/* Timer Widget */}
    <TimerWidget
      className="absolute top-4 left-4"
      startTime={meetingSettings.startTime}
      isDraggable
    />
  </div>

  {/* Floating Controls */}
  <FloatingControls
    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
    onMute={onMuteToggle}
    onVideo={onVideoToggle}
    onEndCall={onEndCall}
    autoHide
  />

  {/* Collapsible Sidebar */}
  <Sidebar
    isOpen={sidebarOpen}
    onClose={() => setSidebarOpen(false)}
    participants={participants}
    isHost={isHost}
  />
</div>
```

### Video Tile Component:
```tsx
<div className="relative bg-gray-900 rounded-lg overflow-hidden group">
  {/* Video Element Placeholder */}
  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
    {participant.videoEnabled ? (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800" />
    ) : (
      <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
        <span className="text-white font-semibold text-xl">
          {participant.name.charAt(0)}
        </span>
      </div>
    )}
  </div>

  {/* Participant Info Overlay */}
  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
    <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
      {participant.name}
    </span>
    <div className="flex items-center space-x-1">
      {participant.isMuted && (
        <MicOff className="w-4 h-4 text-red-500" />
      )}
      <ConnectionIndicator quality={participant.connectionQuality} />
    </div>
  </div>

  {/* Hover Controls */}
  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
    <div className="flex space-x-2">
      {isHost && (
        <>
          <button className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
            <Pin className="w-4 h-4" />
          </button>
          <button className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
            <Spotlight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  </div>
</div>
```

### Floating Controls:
```tsx
<div className="flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2">
  <button
    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
      isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
    }`}
    onClick={onMuteToggle}
    title="Mute/Unmute (M)"
  >
    {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
  </button>

  <button
    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
      !videoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
    }`}
    onClick={onVideoToggle}
    title="Video On/Off (V)"
  >
    {videoEnabled ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
  </button>

  <button
    className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
    title="Share Screen (S)"
  >
    <Share className="w-5 h-5 text-white" />
  </button>

  <button
    className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
    title="Whiteboard (W)"
  >
    <PenTool className="w-5 h-5 text-white" />
  </button>

  <button
    className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
    title="Timer (T)"
  >
    <Clock className="w-5 h-5 text-white" />
  </button>

  <button
    className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
    title="Chat (C)"
  >
    <MessageCircle className="w-5 h-5 text-white" />
  </button>

  <button
    className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
    title="Settings"
  >
    <Settings className="w-5 h-5 text-white" />
  </button>

  <button
    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200"
    onClick={onEndCall}
    title="End Call (Ctrl+E)"
  >
    <PhoneOff className="w-5 h-5 text-white" />
  </button>
</div>
```

### Connection Quality Indicator:
```tsx
const ConnectionIndicator = ({ quality }: { quality: 'excellent' | 'good' | 'poor' }) => {
  const bars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : 1;
  const color = quality === 'excellent' ? 'bg-green-500' : quality === 'good' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-end space-x-0.5">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 ${bar <= bars ? color : 'bg-gray-400'}`}
          style={{ height: `${bar * 3}px` }}
        />
      ))}
    </div>
  );
};
```

### Status Overlays:
```tsx
<div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
  {/* Recording Indicator */}
  {isRecording && (
    <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <span className="text-sm font-medium">REC</span>
    </div>
  )}

  {/* Meeting Info */}
  <div className="text-center">
    <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
      Meeting ID: {meetingId} • {participants.length} participants
    </div>
  </div>

  {/* Connection Quality */}
  <div className="text-right">
    <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full flex items-center space-x-2">
      <span>Connection</span>
      <ConnectionIndicator quality="excellent" />
    </div>
  </div>
</div>
```

### DO NOT:
- Implement actual WebRTC video streaming (use colored divs/placeholders)
- Include real-time messaging functionality (simulate with local state)
- Add actual screen sharing capabilities (show placeholder modal)
- Connect to external APIs or services

## Define Strict Scope
**Create these files ONLY:**
- `components/InCallInterface.tsx` - Main calling interface
- `components/incall/VideoGrid.tsx` - Participant video layout
- `components/incall/FloatingControls.tsx` - Bottom control dock
- `components/incall/Sidebar.tsx` - Collapsible tools panel
- `components/incall/VideoTile.tsx` - Individual participant video
- `components/incall/StatusOverlays.tsx` - Recording, timer, connection indicators
- `components/incall/SelfView.tsx` - User's own video display

**Mock Data:**
Include 3-4 mock participants with varying mute/video states, connection qualities, and one host. Show recording active, timer at 23:45, and good connection quality for all participants. Participants: "You" (host, unmuted, video on), "Jane Smith" (muted, video on, excellent connection), "Mike Chen" (unmuted, video off, good connection), "Sarah Johnson" (muted, video on, poor connection).
```

---

## Implementation Guide

### Step-by-Step Usage Instructions

#### 1. **Initial Setup**
```bash
# Ensure you have the required dependencies
npm install @tanstack/react-query lucide-react
# Note: Shadcn UI components should already be configured
```

#### 2. **Context Application**
1. **Always start with the Master Context Prompt**
2. Copy the entire context block into your AI tool
3. Wait for confirmation that the AI understands the setup

#### 3. **Component Generation Workflow**
1. **Dashboard First**: Use the Dashboard Hub prompt to create the foundation
2. **Pre-Call Setup**: Generate the setup interface for meeting preparation
3. **In-Call Interface**: Create the main video calling experience
4. **Integration**: Connect components with proper routing and state management

#### 4. **Quality Assurance Checklist**
- [ ] **Responsive Design**: Test all breakpoints (mobile, tablet, desktop, wide)
- [ ] **Accessibility**: Verify keyboard navigation and screen reader compatibility
- [ ] **TypeScript**: Ensure all props and interfaces are properly typed
- [ ] **Performance**: Check for unnecessary re-renders and optimize heavy components
- [ ] **Brand Consistency**: Validate colors, typography, and spacing match specifications

### Customization Guidelines

#### **Adapting for Different AI Tools**

**For Vercel v0:**
- Include the full context in the initial prompt
- Request TypeScript and Tailwind CSS specifically
- Ask for Shadcn UI components when available

**For Lovable.ai:**
- Emphasize the component structure and file organization
- Request proper prop interfaces and TypeScript typing
- Specify responsive behavior clearly

**For Claude/ChatGPT:**
- Break down complex components into smaller chunks
- Request step-by-step implementation with explanations
- Ask for code review and optimization suggestions

#### **Extending the Prompts**

**Adding New Components:**
1. Follow the 4-part framework structure
2. Reference the Master Context for consistency
3. Include specific TypeScript interfaces
4. Define clear scope boundaries

**Modifying Existing Components:**
1. Start with the base prompt
2. Add specific modification requests
3. Maintain existing design system constraints
4. Test integration with other components

### Common Pitfalls and Solutions

#### **Issue**: AI generates components with inconsistent styling
**Solution**: Always include the Master Context first and reference specific Tailwind classes

#### **Issue**: TypeScript errors in generated code
**Solution**: Provide explicit interface definitions and ask for strict typing

#### **Issue**: Components don't match wireframes
**Solution**: Include detailed layout specifications and visual references

#### **Issue**: Missing accessibility features
**Solution**: Emphasize WCAG 2.1 AA compliance in every prompt

#### **Issue**: Performance problems with complex components
**Solution**: Request optimization suggestions and implement lazy loading

---

## Troubleshooting

### Frequent Issues and Resolutions

#### **Styling Inconsistencies**
- **Problem**: Generated components use different colors or spacing
- **Solution**: Reference the exact Tailwind classes from the Master Context
- **Prevention**: Always include color hex codes and spacing scale in prompts

#### **TypeScript Compilation Errors**
- **Problem**: Missing interfaces or incorrect prop types
- **Solution**: Provide complete interface definitions in each prompt
- **Prevention**: Request explicit TypeScript typing for all components

#### **Responsive Layout Breaks**
- **Problem**: Components don't adapt properly to different screen sizes
- **Solution**: Test generated code across all breakpoints and request fixes
- **Prevention**: Include specific responsive behavior in component instructions

#### **Accessibility Violations**
- **Problem**: Missing ARIA labels or keyboard navigation
- **Solution**: Audit generated components with accessibility tools
- **Prevention**: Emphasize accessibility requirements in every prompt

#### **Performance Issues**
- **Problem**: Slow rendering or memory leaks
- **Solution**: Review component lifecycle and optimize re-renders
- **Prevention**: Request performance considerations in complex components

### Debugging Generated Code

#### **Component Testing Strategy**
1. **Isolation Testing**: Test each component independently
2. **Integration Testing**: Verify components work together
3. **User Testing**: Validate with actual user workflows
4. **Performance Testing**: Monitor rendering and memory usage

#### **Code Review Checklist**
- [ ] **Functionality**: All features work as specified
- [ ] **Design**: Matches wireframes and design system
- [ ] **Performance**: No unnecessary re-renders or memory leaks
- [ ] **Accessibility**: Meets WCAG 2.1 AA standards
- [ ] **TypeScript**: No compilation errors or type warnings
- [ ] **Responsive**: Works across all specified breakpoints

### Getting Better Results

#### **Prompt Optimization Tips**
1. **Be Specific**: Include exact requirements and constraints
2. **Provide Context**: Always use the Master Context first
3. **Include Examples**: Show desired code structure and patterns
4. **Set Boundaries**: Clearly define what should and shouldn't be done
5. **Iterate**: Refine prompts based on generated results

#### **AI Tool Best Practices**
1. **Single Responsibility**: Generate one component at a time
2. **Progressive Complexity**: Start simple, add features iteratively
3. **Consistent Feedback**: Provide clear feedback on generated code
4. **Version Control**: Save working versions before making changes
5. **Human Review**: Always review and test generated code thoroughly

---

## Conclusion

These prompts provide a comprehensive foundation for generating MeetSolis Epic 1-2 components using AI tools. The structured approach ensures consistency, quality, and alignment with the project's design system and technical requirements.

**Remember**: AI-generated code is a starting point that requires human review, testing, and refinement to be production-ready. Use these prompts as a foundation to accelerate development while maintaining high quality standards.

For additional support or prompt customization needs, refer to the MeetSolis UI/UX Specification document and technical architecture documentation.

---

**Last Updated**: January 20, 2025
**Version**: 1.0
**Author**: UX Expert (Sally)
**Related Documents**:
- `docs/front-end-spec.md` - Complete UI/UX Specification
- `docs/prd.md` - Product Requirements Document
- `docs/architecture.md` - Technical Architecture (when available)