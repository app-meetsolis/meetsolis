/**
 * Browser Compatibility Detection
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { BrowserCapabilities, UpgradeGuidance } from '@/types/onboarding';

export class BrowserCompatibility {
  /**
   * Detect browser capabilities
   */
  static detect(): BrowserCapabilities {
    return {
      webrtc: this.checkWebRTC(),
      mediaDevices: this.checkMediaDevices(),
      screenShare: this.checkScreenShare(),
      notifications: this.checkNotifications(),
      websockets: this.checkWebSockets(),
      modernFeatures: this.checkModernFeatures()
    };
  }

  /**
   * Check WebRTC support
   */
  private static checkWebRTC(): boolean {
    return !!(
      window.RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection ||
      (window as any).mozRTCPeerConnection
    );
  }

  /**
   * Check MediaDevices API support
   */
  private static checkMediaDevices(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Check Screen Share support
   */
  private static checkScreenShare(): boolean {
    return !!(
      navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
    );
  }

  /**
   * Check Notifications API support
   */
  private static checkNotifications(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check WebSocket support
   */
  private static checkWebSockets(): boolean {
    return 'WebSocket' in window;
  }

  /**
   * Check modern JavaScript features
   */
  private static checkModernFeatures(): boolean {
    try {
      // Check for modern features
      return !!(
        typeof Promise !== 'undefined' &&
        typeof window.fetch !== 'undefined' &&
        typeof window.localStorage !== 'undefined' &&
        typeof Array.prototype.includes !== 'undefined' &&
        typeof Object.assign !== 'undefined'
      );
    } catch {
      return false;
    }
  }

  /**
   * Detect browser name and version
   */
  static detectBrowser(): { name: string; version: string } {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';

    // Chrome
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Edge
    else if (ua.includes('Edg')) {
      name = 'Edge';
      const match = ua.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Firefox
    else if (ua.includes('Firefox')) {
      name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Safari
    else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Opera
    else if (ua.includes('OPR') || ua.includes('Opera')) {
      name = 'Opera';
      const match = ua.match(/(?:OPR|Opera)\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return { name, version };
  }

  /**
   * Get upgrade guidance for current browser
   */
  static getUpgradeGuidance(): UpgradeGuidance | null {
    const browser = this.detectBrowser();
    const capabilities = this.detect();

    // Check if browser needs upgrade
    const needsUpgrade = !capabilities.webrtc || !capabilities.mediaDevices || !capabilities.modernFeatures;

    if (!needsUpgrade) {
      return null;
    }

    const upgradeGuides: Record<string, UpgradeGuidance> = {
      Chrome: {
        browserName: 'Google Chrome',
        currentVersion: browser.version,
        recommendedVersion: '90+',
        downloadUrl: 'https://www.google.com/chrome/',
        urgency: parseInt(browser.version) < 80 ? 'high' : 'medium'
      },
      Firefox: {
        browserName: 'Mozilla Firefox',
        currentVersion: browser.version,
        recommendedVersion: '88+',
        downloadUrl: 'https://www.mozilla.org/firefox/',
        urgency: parseInt(browser.version) < 78 ? 'high' : 'medium'
      },
      Safari: {
        browserName: 'Apple Safari',
        currentVersion: browser.version,
        recommendedVersion: '14+',
        downloadUrl: 'https://support.apple.com/downloads/safari',
        urgency: parseInt(browser.version) < 13 ? 'high' : 'medium'
      },
      Edge: {
        browserName: 'Microsoft Edge',
        currentVersion: browser.version,
        recommendedVersion: '90+',
        downloadUrl: 'https://www.microsoft.com/edge',
        urgency: parseInt(browser.version) < 80 ? 'high' : 'medium'
      },
      Opera: {
        browserName: 'Opera',
        currentVersion: browser.version,
        recommendedVersion: '76+',
        downloadUrl: 'https://www.opera.com/',
        urgency: parseInt(browser.version) < 70 ? 'high' : 'medium'
      }
    };

    return upgradeGuides[browser.name] || {
      browserName: browser.name,
      currentVersion: browser.version,
      recommendedVersion: 'Latest',
      downloadUrl: 'https://www.google.com/chrome/',
      urgency: 'high'
    };
  }

  /**
   * Get browser-specific troubleshooting tips
   */
  static getTroubleshootingTips(): string[] {
    const browser = this.detectBrowser();
    const tips: Record<string, string[]> = {
      Chrome: [
        'Ensure Chrome is updated to the latest version',
        'Check camera/microphone permissions in chrome://settings/content',
        'Clear browser cache and cookies',
        'Disable conflicting extensions',
        'Try using an incognito window'
      ],
      Firefox: [
        'Update Firefox to the latest version',
        'Check permissions in about:preferences#privacy',
        'Clear browser cache and cookies',
        'Disable conflicting add-ons',
        'Try using a private window'
      ],
      Safari: [
        'Update Safari through System Preferences > Software Update',
        'Check permissions in Safari > Preferences > Websites',
        'Clear website data from Safari > Preferences > Privacy',
        'Disable Safari extensions',
        'Try using a private window'
      ],
      Edge: [
        'Update Edge to the latest version',
        'Check permissions in edge://settings/content',
        'Clear browsing data',
        'Disable extensions',
        'Try using an InPrivate window'
      ]
    };

    return tips[browser.name] || [
      'Update your browser to the latest version',
      'Check browser permissions for camera and microphone',
      'Clear browser cache and cookies',
      'Try using a different browser (Chrome or Firefox recommended)'
    ];
  }

  /**
   * Check if graceful fallback is needed
   */
  static needsFallback(): { audioOnly: boolean; reason: string } | null {
    const capabilities = this.detect();

    if (!capabilities.webrtc) {
      return {
        audioOnly: false,
        reason: 'WebRTC not supported. Please upgrade your browser.'
      };
    }

    if (!capabilities.mediaDevices) {
      return {
        audioOnly: true,
        reason: 'Camera access not available. Audio-only mode enabled.'
      };
    }

    return null;
  }
}
