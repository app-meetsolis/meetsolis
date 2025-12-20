/**
 * Meeting Components Module
 * Exports meeting-related components and hooks
 */

export { DeviceTestWizard } from './DeviceTestWizard';
export type { DeviceTestWizardProps } from './DeviceTestWizard';
export { StreamVideoTile } from './StreamVideoTile';
export type { StreamVideoTileProps } from './StreamVideoTile';
export { StreamVideoCallManagerV2 } from './StreamVideoCallManagerV2';
export { StreamVideoProvider } from './StreamVideoProvider';
export { StreamVideoWrapper } from './StreamVideoWrapper';
export { StreamControlBar } from './StreamControlBar';
export type { StreamVideoCallManagerV2Props } from './StreamVideoCallManagerV2';
export type { StreamVideoProviderProps } from './StreamVideoProvider';
export type { StreamVideoWrapperProps } from './StreamVideoWrapper';
export type { StreamControlBarProps } from './StreamControlBar';
export { useDevices } from './useDevices';
export type { UseDevicesResult } from './useDevices';
export { useAudioLevel } from './useAudioLevel';
export type {
  UseAudioLevelResult,
  UseAudioLevelOptions,
} from './useAudioLevel';
export type {
  MediaDeviceInfo,
  DevicePreferences,
  AudioLevel,
  TestStep,
  DeviceTestState,
  DeviceTestError,
  PermissionState,
} from './types';

// Story 2.3: Video Layout Components
export { GalleryView } from './GalleryView';
export type { GalleryViewProps } from './GalleryView';
export { SpeakerView } from './SpeakerView';
export type { SpeakerViewProps } from './SpeakerView';
export { TwoPersonView } from './TwoPersonView';
export type { TwoPersonViewProps } from './TwoPersonView';
export { SelfView } from './SelfView';
export type { SelfViewProps } from './SelfView';

// Story 2.3: Participant Management Components
export { ParticipantPanel } from './ParticipantPanel';
export type { ParticipantPanelProps } from './ParticipantPanel';
export { ParticipantListItem } from './ParticipantListItem';
export type { ParticipantListItemProps } from './ParticipantListItem';

// Story 2.3: Waiting Room Components
export { WaitingRoomView } from './WaitingRoomView';
export { WaitingRoomPanel } from './WaitingRoomPanel';

// Story 2.4: Chat and Messaging Components
export { ChatWindow } from './ChatWindow';
export type { ChatWindowProps } from './ChatWindow';
export { MessageBubble } from './MessageBubble';
export type { MessageBubbleProps } from './MessageBubble';
export { MessageInput } from './MessageInput';
export type { MessageInputProps } from './MessageInput';
export { EmojiPicker } from './EmojiPicker';
export type { EmojiPickerProps } from './EmojiPicker';
export { MeetingSettingsPanel } from './MeetingSettingsPanel';
export type {
  MeetingSettingsPanelProps,
  MeetingSettings,
} from './MeetingSettingsPanel';
