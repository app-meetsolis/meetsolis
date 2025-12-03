/**
 * Debug logger for capturing WebRTC connection diagnostics
 * Usage: In browser console, type: window.getWebRTCLogs()
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  source: string;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private enabled = true;

  log(
    source: string,
    message: string,
    data?: any,
    level: 'info' | 'warn' | 'error' = 'info'
  ) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console with color coding
    const color =
      level === 'error' ? 'red' : level === 'warn' ? 'orange' : 'blue';
    console.log(`%c[${source}] ${message}`, `color: ${color}`, data || '');
  }

  getLogs(filter?: string): LogEntry[] {
    if (!filter) return this.logs;

    const lowerFilter = filter.toLowerCase();
    return this.logs.filter(
      log =>
        log.source.toLowerCase().includes(lowerFilter) ||
        log.message.toLowerCase().includes(lowerFilter)
    );
  }

  getLogsAsText(filter?: string): string {
    const logs = this.getLogs(filter);
    return logs
      .map(log => {
        const data = log.data ? ` | ${JSON.stringify(log.data)}` : '';
        return `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}${data}`;
      })
      .join('\n');
  }

  clear() {
    this.logs = [];
    console.log(
      '%c[DebugLogger] Logs cleared',
      'color: green; font-weight: bold'
    );
  }

  disable() {
    this.enabled = false;
    console.log('%c[DebugLogger] Logging disabled', 'color: gray');
  }

  enable() {
    this.enabled = true;
    console.log(
      '%c[DebugLogger] Logging enabled',
      'color: green; font-weight: bold'
    );
  }

  getConnectionSummary(): string {
    const errors = this.logs.filter(log => log.level === 'error');
    const collisions = this.logs.filter(log =>
      log.message.includes('collision')
    );
    const offers = this.logs.filter(log => log.message.includes('offer'));
    const answers = this.logs.filter(log => log.message.includes('answer'));

    return `
=== WebRTC Connection Summary ===
Total Logs: ${this.logs.length}
Errors: ${errors.length}
Offer Collisions: ${collisions.length}
Offers Sent/Received: ${offers.length}
Answers Sent/Received: ${answers.length}

Recent Errors:
${errors
  .slice(-5)
  .map(e => `  - ${e.timestamp}: ${e.message}`)
  .join('\n')}

Recent Collisions:
${collisions
  .slice(-5)
  .map(c => `  - ${c.timestamp}: ${c.message}`)
  .join('\n')}
    `.trim();
  }
}

// Create singleton instance
const debugLogger = new DebugLogger();

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugLogger = debugLogger;
  (window as any).getWebRTCLogs = () => {
    console.log(debugLogger.getConnectionSummary());
    return debugLogger.getLogsAsText();
  };
  (window as any).clearWebRTCLogs = () => debugLogger.clear();

  console.log(
    '%c🔍 WebRTC Debug Logger Ready',
    'color: green; font-weight: bold; font-size: 14px'
  );
  console.log(
    '%cUsage:\n  window.getWebRTCLogs() - Get all logs as text\n  window.clearWebRTCLogs() - Clear logs\n  window.debugLogger.getConnectionSummary() - Get summary',
    'color: gray'
  );
}

export default debugLogger;
