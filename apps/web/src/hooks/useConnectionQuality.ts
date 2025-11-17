/**
 * useConnectionQuality Hook
 * Monitors WebRTC connection quality using RTCPeerConnection.getStats()
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConnectionQuality } from '../../../../packages/shared/types/webrtc';

export interface ConnectionStats {
  rtt: number; // Round-trip time in ms
  packetLoss: number; // Packet loss percentage
  jitter: number; // Jitter in ms
  bytesReceived: number;
  bytesSent: number;
}

export interface UseConnectionQualityOptions {
  peerConnection: RTCPeerConnection | null;
  interval?: number; // Monitoring interval in ms
}

export interface UseConnectionQualityResult {
  quality: ConnectionQuality;
  stats: ConnectionStats | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * Get connection quality from stats
 */
function calculateQuality(stats: ConnectionStats): ConnectionQuality {
  const { rtt, packetLoss } = stats;

  // Excellent: <100ms RTT, <1% loss
  if (rtt < 100 && packetLoss < 1) {
    return 'excellent';
  }

  // Good: <300ms RTT, <5% loss
  if (rtt < 300 && packetLoss < 5) {
    return 'good';
  }

  // Poor: everything else
  return 'poor';
}

/**
 * Hook for monitoring connection quality
 */
export function useConnectionQuality({
  peerConnection,
  interval = 2000,
}: UseConnectionQualityOptions): UseConnectionQualityResult {
  const [quality, setQuality] = useState<ConnectionQuality>('good');
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get connection stats from peer connection
   */
  const getStats = useCallback(async () => {
    if (!peerConnection) return null;

    try {
      const statsReport = await peerConnection.getStats();
      let rtt = 0;
      let packetLoss = 0;
      let jitter = 0;
      let bytesReceived = 0;
      let bytesSent = 0;

      statsReport.forEach(report => {
        // Inbound RTP stats
        if (report.type === 'inbound-rtp') {
          bytesReceived += report.bytesReceived || 0;
          jitter += report.jitter || 0;
          const packetsLost = report.packetsLost || 0;
          const packetsReceived = report.packetsReceived || 0;
          if (packetsReceived > 0) {
            packetLoss = (packetsLost / (packetsLost + packetsReceived)) * 100;
          }
        }

        // Outbound RTP stats
        if (report.type === 'outbound-rtp') {
          bytesSent += report.bytesSent || 0;
        }

        // Candidate pair stats (for RTT)
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          rtt = report.currentRoundTripTime * 1000 || 0; // Convert to ms
        }
      });

      return {
        rtt,
        packetLoss,
        jitter: jitter * 1000, // Convert to ms
        bytesReceived,
        bytesSent,
      };
    } catch (error) {
      console.error('Failed to get connection stats:', error);
      return null;
    }
  }, [peerConnection]);

  /**
   * Monitor connection quality
   */
  const monitorQuality = useCallback(async () => {
    const connectionStats = await getStats();

    if (connectionStats) {
      setStats(connectionStats);
      const newQuality = calculateQuality(connectionStats);
      setQuality(newQuality);
    }
  }, [getStats]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring || !peerConnection) return;

    setIsMonitoring(true);

    // Initial check
    monitorQuality();

    // Set up interval
    intervalRef.current = setInterval(monitorQuality, interval);
  }, [isMonitoring, peerConnection, monitorQuality, interval]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsMonitoring(false);
  }, []);

  /**
   * Start/stop monitoring based on peer connection
   */
  useEffect(() => {
    if (peerConnection) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [peerConnection, startMonitoring, stopMonitoring]);

  return {
    quality,
    stats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
}
