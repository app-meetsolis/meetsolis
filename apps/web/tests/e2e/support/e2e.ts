// Cypress E2E support file
import './commands';

// Global before hook for WebRTC setup
beforeEach(() => {
  // Mock WebRTC APIs for consistent testing
  cy.window().then((win) => {
    // Mock getUserMedia for consistent video/audio testing
    const mockStream = {
      getTracks: () => [
        { kind: 'video', stop: cy.stub(), enabled: true },
        { kind: 'audio', stop: cy.stub(), enabled: true },
      ],
      getVideoTracks: () => [{ kind: 'video', stop: cy.stub(), enabled: true }],
      getAudioTracks: () => [{ kind: 'audio', stop: cy.stub(), enabled: true }],
    };

    if (win.navigator.mediaDevices) {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves(mockStream);
      cy.stub(win.navigator.mediaDevices, 'getDisplayMedia').resolves(mockStream);
      cy.stub(win.navigator.mediaDevices, 'enumerateDevices').resolves([
        { deviceId: 'camera1', kind: 'videoinput', label: 'Test Camera' },
        { deviceId: 'mic1', kind: 'audioinput', label: 'Test Microphone' },
      ]);
    }

    // Mock RTCPeerConnection
    win.RTCPeerConnection = class MockRTCPeerConnection {
      localDescription = null;
      remoteDescription = null;
      signalingState = 'stable';
      iceConnectionState = 'new';
      connectionState = 'new';

      createOffer() {
        return Promise.resolve({ type: 'offer', sdp: 'mock-offer' });
      }

      createAnswer() {
        return Promise.resolve({ type: 'answer', sdp: 'mock-answer' });
      }

      setLocalDescription() {
        return Promise.resolve();
      }

      setRemoteDescription() {
        return Promise.resolve();
      }

      addIceCandidate() {
        return Promise.resolve();
      }

      addTrack() {}
      close() {}
      addEventListener() {}
      removeEventListener() {}
    } as any;
  });
});

// Suppress uncaught exceptions that might occur during WebRTC testing
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore WebRTC-related errors in test environment
  if (err.message.includes('WebRTC') ||
      err.message.includes('MediaStream') ||
      err.message.includes('RTCPeerConnection')) {
    return false;
  }
  return true;
});