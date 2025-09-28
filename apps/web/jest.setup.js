import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables for tests
process.env.USE_MOCK_SERVICES = 'true'
process.env.NODE_ENV = 'test'
process.env.SERVICE_TIMEOUT_MS = '1000'
process.env.CIRCUIT_BREAKER_THRESHOLD = '3'
process.env.RETRY_ATTEMPTS = '2'

// WebRTC Mocks
const mockMediaStreamTrack = {
  kind: 'video',
  id: 'mock-track-id',
  label: 'mock-track',
  enabled: true,
  muted: false,
  readonly: false,
  readyState: 'live',
  stop: jest.fn(),
  clone: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}

const mockMediaStream = {
  id: 'mock-stream-id',
  active: true,
  getTracks: jest.fn(() => [mockMediaStreamTrack]),
  getVideoTracks: jest.fn(() => [mockMediaStreamTrack]),
  getAudioTracks: jest.fn(() => [mockMediaStreamTrack]),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  clone: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}

// Mock WebRTC APIs
global.MediaStream = jest.fn(() => mockMediaStream)
global.MediaStreamTrack = jest.fn(() => mockMediaStreamTrack)

global.RTCPeerConnection = jest.fn(() => ({
  localDescription: null,
  remoteDescription: null,
  signalingState: 'stable',
  iceConnectionState: 'new',
  connectionState: 'new',
  iceGatheringState: 'new',
  createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-offer' }),
  createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-answer' }),
  setLocalDescription: jest.fn().mockResolvedValue(),
  setRemoteDescription: jest.fn().mockResolvedValue(),
  addIceCandidate: jest.fn().mockResolvedValue(),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  getStats: jest.fn().mockResolvedValue(new Map()),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}))

global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue(mockMediaStream),
  getDisplayMedia: jest.fn().mockResolvedValue(mockMediaStream),
  enumerateDevices: jest.fn().mockResolvedValue([
    { deviceId: 'camera1', kind: 'videoinput', label: 'Mock Camera' },
    { deviceId: 'mic1', kind: 'audioinput', label: 'Mock Microphone' },
  ]),
  getSupportedConstraints: jest.fn(() => ({
    width: true,
    height: true,
    frameRate: true,
    facingMode: true,
    audio: true,
    video: true,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

// Mock screen wake lock API
global.navigator.wakeLock = {
  request: jest.fn().mockResolvedValue({
    release: jest.fn().mockResolvedValue(),
    released: false,
    type: 'screen',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
}

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()

  // Reset environment to known state
  process.env.USE_MOCK_SERVICES = 'true'
})

// Suppress console warnings in tests unless debugging
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = (...args) => {
    if (args[0]?.includes && (
      args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: act') ||
      args[0].includes('Warning: useLayoutEffect')
    )) {
      return
    }
    originalWarn.call(console, ...args)
  }

  console.error = (...args) => {
    if (args[0]?.includes && (
      args[0].includes('Warning:') ||
      args[0].includes('Error: Not implemented')
    )) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})