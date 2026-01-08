import '@testing-library/jest-dom';

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
    };
  },
}));

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
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables for tests
process.env.USE_MOCK_SERVICES = 'true';
process.env.NODE_ENV = 'test';
process.env.SERVICE_TIMEOUT_MS = '1000';
process.env.CIRCUIT_BREAKER_THRESHOLD = '3';
process.env.RETRY_ATTEMPTS = '2';

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
};

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
};

// Mock WebRTC APIs
global.MediaStream = jest.fn(() => mockMediaStream);
global.MediaStreamTrack = jest.fn(() => mockMediaStreamTrack);

global.RTCPeerConnection = jest.fn(() => ({
  localDescription: null,
  remoteDescription: null,
  signalingState: 'stable',
  iceConnectionState: 'new',
  connectionState: 'new',
  iceGatheringState: 'new',
  createOffer: jest
    .fn()
    .mockResolvedValue({ type: 'offer', sdp: 'mock-offer' }),
  createAnswer: jest
    .fn()
    .mockResolvedValue({ type: 'answer', sdp: 'mock-answer' }),
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
}));

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
};

// Mock screen wake lock API
global.navigator.wakeLock = {
  request: jest.fn().mockResolvedValue({
    release: jest.fn().mockResolvedValue(),
    released: false,
    type: 'screen',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
};

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Reset environment to known state
  process.env.USE_MOCK_SERVICES = 'true';
});

// Suppress console warnings in tests unless debugging
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    if (
      args[0]?.includes &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: act') ||
        args[0].includes('Warning: useLayoutEffect'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  console.error = (...args) => {
    if (
      args[0]?.includes &&
      (args[0].includes('Warning:') ||
        args[0].includes('Error: Not implemented'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock Next.js Edge Runtime Request/Response for API route tests
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      // Use defineProperty for immutable properties (Next.js 14 compatibility)
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';
      const headers = new Headers(init?.headers || {});

      Object.defineProperty(this, 'url', { value: url, enumerable: true });
      Object.defineProperty(this, 'method', {
        value: method,
        enumerable: true,
      });
      Object.defineProperty(this, 'headers', {
        value: headers,
        enumerable: true,
      });

      this.body = init?.body;
      this.cache = init?.cache || 'default';
      this.credentials = init?.credentials || 'same-origin';
      this.destination = '';
      this.integrity = init?.integrity || '';
      this.mode = init?.mode || 'cors';
      this.redirect = init?.redirect || 'follow';
      this.referrer = init?.referrer || 'about:client';
      this.referrerPolicy = init?.referrerPolicy || '';
    }

    async json() {
      if (!this.body) return {};
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }

    async text() {
      if (!this.body) return '';
      return typeof this.body === 'string'
        ? this.body
        : JSON.stringify(this.body);
    }

    async arrayBuffer() {
      const str = await this.text();
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    async blob() {
      return new Blob([await this.text()]);
    }

    async formData() {
      // Simplified FormData mock
      const fd = new FormData();
      return fd;
    }

    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        mode: this.mode,
        credentials: this.credentials,
        cache: this.cache,
        redirect: this.redirect,
        referrer: this.referrer,
        integrity: this.integrity,
      });
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers || {});
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
      this.type = 'basic';
      this.url = '';
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }

    async text() {
      return typeof this.body === 'string'
        ? this.body
        : JSON.stringify(this.body);
    }

    async arrayBuffer() {
      const str = await this.text();
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    async blob() {
      return new Blob([await this.text()]);
    }

    clone() {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }

    // Static method for creating JSON responses (most commonly used in Next.js)
    static json(data, init) {
      const body = JSON.stringify(data);
      const headers = new Headers(init?.headers || {});
      headers.set('content-type', 'application/json');

      return new Response(body, {
        ...init,
        headers: headers,
      });
    }

    // Static method for redirects
    static redirect(url, status = 302) {
      return new Response(null, {
        status,
        headers: { Location: url },
      });
    }
  };
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.map = new Map(Object.entries(init || {}));
    }

    get(name) {
      return this.map.get(name.toLowerCase());
    }

    set(name, value) {
      this.map.set(name.toLowerCase(), value);
    }

    has(name) {
      return this.map.has(name.toLowerCase());
    }

    delete(name) {
      this.map.delete(name.toLowerCase());
    }

    entries() {
      return this.map.entries();
    }
  };
}

// Mock Next.js specific NextRequest and NextResponse (must come after base classes)
if (typeof NextRequest === 'undefined') {
  global.NextRequest = class NextRequest extends global.Request {
    constructor(input, init) {
      super(input, init);

      // Define NextRequest-specific properties
      const url = typeof input === 'string' ? input : input.url;
      Object.defineProperty(this, 'nextUrl', {
        value: new URL(url),
        writable: true,
        enumerable: true,
      });

      this.cookies = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        clear: jest.fn(),
        getAll: jest.fn(() => []),
      };
      this.geo = {
        city: 'Test City',
        country: 'US',
        region: 'CA',
        latitude: '37.7749',
        longitude: '-122.4194',
      };
      this.ip = '127.0.0.1';
    }
  };
}

if (typeof NextResponse === 'undefined') {
  global.NextResponse = class NextResponse extends global.Response {
    constructor(body, init) {
      super(body, init);
      this.cookies = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        clear: jest.fn(),
        getAll: jest.fn(() => []),
      };
    }

    static json(data, init) {
      const body = JSON.stringify(data);
      const headers = new global.Headers(init?.headers || {});
      headers.set('content-type', 'application/json');

      return new NextResponse(body, {
        ...init,
        headers: headers,
      });
    }

    static redirect(url, status = 307) {
      return new NextResponse(null, {
        status,
        headers: { Location: url },
      });
    }

    static rewrite(url) {
      return new NextResponse(null, {
        headers: { 'x-middleware-rewrite': url },
      });
    }

    static next(init) {
      return new NextResponse(null, init);
    }
  };
}

// JSDOM Polyfills for Radix UI
if (typeof Element !== 'undefined') {
  // Polyfill hasPointerCapture for Radix UI Select
  Element.prototype.hasPointerCapture =
    Element.prototype.hasPointerCapture ||
    function () {
      return false;
    };

  Element.prototype.setPointerCapture =
    Element.prototype.setPointerCapture || function () {};
  Element.prototype.releasePointerCapture =
    Element.prototype.releasePointerCapture || function () {};

  // Polyfill scrollIntoView
  Element.prototype.scrollIntoView =
    Element.prototype.scrollIntoView || function () {};
}

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock Vercel Analytics
jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
  Analytics: jest.fn(() => null),
}));

// Enhanced Web Audio API Mocks
// These mocks provide a more complete implementation of Web Audio API for testing
if (typeof window !== 'undefined') {
  // Mock AudioContext with all required properties and methods
  class MockAudioContext {
    constructor() {
      this.state = 'running';
      this.sampleRate = 48000;
      this.currentTime = 0;
      this.destination = {
        channelCount: 2,
        maxChannelCount: 2,
      };
      this._closed = false;
    }

    createAnalyser() {
      const analyser = {
        fftSize: 2048,
        frequencyBinCount: 1024,
        minDecibels: -100,
        maxDecibels: -30,
        smoothingTimeConstant: 0.8,
        connect: jest.fn(),
        disconnect: jest.fn(),
        getByteFrequencyData: jest.fn(array => {
          // Fill with mock frequency data (simulate audio)
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 128);
          }
        }),
        getByteTimeDomainData: jest.fn(array => {
          for (let i = 0; i < array.length; i++) {
            array[i] = 128 + Math.floor(Math.random() * 20) - 10;
          }
        }),
        getFloatFrequencyData: jest.fn(),
        getFloatTimeDomainData: jest.fn(),
      };
      return analyser;
    }

    createMediaStreamSource(stream) {
      return {
        mediaStream: stream,
        connect: jest.fn(),
        disconnect: jest.fn(),
      };
    }

    createMediaStreamDestination() {
      return {
        stream: new MediaStream(),
        connect: jest.fn(),
        disconnect: jest.fn(),
      };
    }

    createGain() {
      return {
        gain: {
          value: 1,
          setValueAtTime: jest.fn(),
          linearRampToValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: jest.fn(),
      };
    }

    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          value: 440,
          setValueAtTime: jest.fn(),
        },
        start: jest.fn(),
        stop: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
      };
    }

    createBiquadFilter() {
      return {
        type: 'lowpass',
        frequency: { value: 350 },
        Q: { value: 1 },
        gain: { value: 0 },
        connect: jest.fn(),
        disconnect: jest.fn(),
      };
    }

    async close() {
      if (this._closed) {
        throw new Error('AudioContext is already closed');
      }
      this._closed = true;
      this.state = 'closed';
    }

    async resume() {
      if (this._closed) {
        throw new Error('Cannot resume a closed AudioContext');
      }
      this.state = 'running';
    }

    async suspend() {
      if (this._closed) {
        throw new Error('Cannot suspend a closed AudioContext');
      }
      this.state = 'suspended';
    }

    decodeAudioData(audioData) {
      return Promise.resolve({
        duration: 1,
        length: 48000,
        numberOfChannels: 2,
        sampleRate: 48000,
        getChannelData: jest.fn(() => new Float32Array(48000)),
      });
    }
  }

  // Set up AudioContext globally
  global.AudioContext = MockAudioContext;
  global.webkitAudioContext = MockAudioContext;

  // Mock performance.now() for animation frames
  if (!global.performance) {
    global.performance = {};
  }
  if (!global.performance.now) {
    const startTime = Date.now();
    global.performance.now = () => Date.now() - startTime;
  }

  // Enhanced requestAnimationFrame / cancelAnimationFrame
  if (!global.requestAnimationFrame) {
    let frameId = 0;
    const frameCallbacks = new Map();

    global.requestAnimationFrame = callback => {
      const id = ++frameId;
      frameCallbacks.set(id, callback);
      // Execute callback asynchronously to simulate browser behavior
      setTimeout(() => {
        if (frameCallbacks.has(id)) {
          const cb = frameCallbacks.get(id);
          frameCallbacks.delete(id);
          cb(performance.now());
        }
      }, 16); // ~60fps
      return id;
    };

    global.cancelAnimationFrame = id => {
      frameCallbacks.delete(id);
    };
  }
}
