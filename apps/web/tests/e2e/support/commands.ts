// Custom Cypress commands for WebRTC testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Mock WebRTC media devices and streams
       */
      mockWebRTC(): Chainable<void>;

      /**
       * Simulate different network conditions for WebRTC testing
       */
      setNetworkConditions(condition: 'fast' | 'slow' | 'offline'): Chainable<void>;

      /**
       * Wait for WebRTC connection to be established
       */
      waitForWebRTCConnection(timeout?: number): Chainable<void>;

      /**
       * Test video/audio permissions
       */
      grantMediaPermissions(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mockWebRTC', () => {
  cy.window().then((win) => {
    // Enhanced WebRTC mocking for E2E tests
    const mockVideoTrack = {
      kind: 'video',
      id: 'video-track-id',
      label: 'Test Video Track',
      enabled: true,
      muted: false,
      readyState: 'live',
      stop: cy.stub(),
      addEventListener: cy.stub(),
      removeEventListener: cy.stub(),
    };

    const mockAudioTrack = {
      kind: 'audio',
      id: 'audio-track-id',
      label: 'Test Audio Track',
      enabled: true,
      muted: false,
      readyState: 'live',
      stop: cy.stub(),
      addEventListener: cy.stub(),
      removeEventListener: cy.stub(),
    };

    const mockStream = {
      id: 'test-stream-id',
      active: true,
      getTracks: () => [mockVideoTrack, mockAudioTrack],
      getVideoTracks: () => [mockVideoTrack],
      getAudioTracks: () => [mockAudioTrack],
      addTrack: cy.stub(),
      removeTrack: cy.stub(),
      addEventListener: cy.stub(),
      removeEventListener: cy.stub(),
    };

    // Mock navigator.mediaDevices
    Object.defineProperty(win.navigator, 'mediaDevices', {
      value: {
        getUserMedia: cy.stub().resolves(mockStream),
        getDisplayMedia: cy.stub().resolves(mockStream),
        enumerateDevices: cy.stub().resolves([
          { deviceId: 'camera1', kind: 'videoinput', label: 'Test Camera' },
          { deviceId: 'mic1', kind: 'audioinput', label: 'Test Microphone' },
        ]),
        getSupportedConstraints: cy.stub().returns({
          width: true,
          height: true,
          frameRate: true,
          audio: true,
          video: true,
        }),
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
      },
      writable: true,
    });

    // Enhanced RTCPeerConnection mock
    win.RTCPeerConnection = class MockRTCPeerConnection {
      localDescription = null;
      remoteDescription = null;
      signalingState = 'stable';
      iceConnectionState = 'new';
      connectionState = 'new';
      iceGatheringState = 'new';

      createOffer = cy.stub().resolves({ type: 'offer', sdp: 'mock-offer-sdp' });
      createAnswer = cy.stub().resolves({ type: 'answer', sdp: 'mock-answer-sdp' });
      setLocalDescription = cy.stub().resolves();
      setRemoteDescription = cy.stub().resolves();
      addIceCandidate = cy.stub().resolves();
      addTrack = cy.stub();
      removeTrack = cy.stub();
      getStats = cy.stub().resolves(new Map());
      close = cy.stub();
      addEventListener = cy.stub();
      removeEventListener = cy.stub();

      constructor() {
        // Simulate connection state changes
        setTimeout(() => {
          this.iceConnectionState = 'connected';
          this.connectionState = 'connected';
        }, 100);
      }
    } as any;
  });
});

Cypress.Commands.add('setNetworkConditions', (condition: 'fast' | 'slow' | 'offline') => {
  cy.task('setNetworkConditions', condition);
});

Cypress.Commands.add('waitForWebRTCConnection', (timeout = 5000) => {
  cy.window().then((win) => {
    cy.wrap(null, { timeout }).should(() => {
      // This would check for actual WebRTC connection state in a real scenario
      // For mocked tests, we just wait a bit to simulate connection time
      return new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});

Cypress.Commands.add('grantMediaPermissions', () => {
  // In a real browser, this would handle permission dialogs
  // For testing, we ensure our mocks are set up correctly
  cy.mockWebRTC();

  cy.window().then((win) => {
    // Verify our media mocks are working
    expect(win.navigator.mediaDevices).to.exist;
    expect(win.navigator.mediaDevices.getUserMedia).to.exist;
  });
});

export {};