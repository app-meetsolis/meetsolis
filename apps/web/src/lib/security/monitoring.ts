import * as Sentry from '@sentry/nextjs';

/**
 * Security Event Monitoring and Logging
 * Integrates with Sentry for security event tracking
 */

export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_INPUT = 'invalid_input',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  AUTHORIZATION_FAILURE = 'authorization_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  GDPR_REQUEST = 'gdpr_request',
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  details: Record<string, any>;
  timestamp: Date;
}

/**
 * Security event logger with Sentry integration
 */
export class SecurityMonitor {
  /**
   * Log a security event
   */
  static logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', fullEvent);
    }

    // Send to Sentry with appropriate level
    const sentryLevel = this.getSentryLevel(event.severity);

    Sentry.addBreadcrumb({
      message: `Security Event: ${event.type}`,
      category: 'security',
      level: sentryLevel,
      data: {
        ...event.details,
        userId: event.userId,
        ip: event.ip,
        userAgent: event.userAgent,
        url: event.url,
      },
    });

    // For high severity events, capture as exceptions
    if (event.severity === 'high' || event.severity === 'critical') {
      Sentry.captureException(new Error(`Security Event: ${event.type}`), {
        tags: {
          security_event: event.type,
          severity: event.severity,
        },
        extra: {
          ...event.details,
          userId: event.userId,
          ip: event.ip,
          userAgent: event.userAgent,
          url: event.url,
        },
        level: sentryLevel,
      });
    } else {
      // For lower severity, just capture a message
      Sentry.captureMessage(`Security Event: ${event.type}`, sentryLevel);
    }

    // Store in internal security audit log
    this.storeInAuditLog(fullEvent);
  }

  /**
   * Log rate limiting events
   */
  static logRateLimitExceeded(
    ip: string,
    userId?: string,
    endpoint?: string
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'medium',
      userId,
      ip,
      url: endpoint,
      details: {
        message: 'Rate limit exceeded',
        endpoint: endpoint || 'unknown',
      },
    });
  }

  /**
   * Log authentication failures
   */
  static logAuthenticationFailure(
    ip: string,
    userAgent?: string,
    reason?: string
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.AUTHENTICATION_FAILURE,
      severity: 'high',
      ip,
      userAgent,
      details: {
        reason: reason || 'unknown',
        message: 'Authentication attempt failed',
      },
    });
  }

  /**
   * Log input validation failures (potential attacks)
   */
  static logInvalidInput(
    input: string,
    userId?: string,
    ip?: string,
    userAgent?: string
  ): void {
    // Detect potential attack patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i,
      /SELECT.*FROM/i,
      /UNION.*SELECT/i,
      /DROP.*TABLE/i,
      /INSERT.*INTO/i,
    ];

    const isSuspicious = suspiciousPatterns.some(pattern =>
      pattern.test(input)
    );
    const eventType = isSuspicious
      ? SecurityEventType.SUSPICIOUS_ACTIVITY
      : SecurityEventType.INVALID_INPUT;
    const severity = isSuspicious ? 'high' : 'low';

    this.logSecurityEvent({
      type: eventType,
      severity,
      userId,
      ip,
      userAgent,
      details: {
        input: input.substring(0, 500), // Truncate for storage
        patterns_matched: suspiciousPatterns
          .filter(pattern => pattern.test(input))
          .map(p => p.toString()),
        message: isSuspicious
          ? 'Potential attack detected in user input'
          : 'Input validation failed',
      },
    });
  }

  /**
   * Log GDPR-related events
   */
  static logGdprEvent(
    eventType: 'export' | 'delete' | 'consent',
    userId: string,
    details?: Record<string, any>
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.GDPR_REQUEST,
      severity: 'low',
      userId,
      details: {
        gdpr_action: eventType,
        ...details,
        message: `GDPR ${eventType} request processed`,
      },
    });
  }

  /**
   * Convert severity to Sentry level
   */
  private static getSentryLevel(
    severity: SecurityEvent['severity']
  ): Sentry.SeverityLevel {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'fatal';
      default:
        return 'info';
    }
  }

  /**
   * Store event in internal audit log
   */
  private static storeInAuditLog(event: SecurityEvent): void {
    // This would integrate with your audit logging system
    // For now, just console.log in a structured format
    console.log(
      '[SECURITY_AUDIT]',
      JSON.stringify({
        timestamp: event.timestamp.toISOString(),
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        ip: event.ip,
        details: event.details,
      })
    );
  }

  /**
   * Initialize security monitoring
   */
  static initialize(): void {
    // Configure Sentry for security monitoring
    Sentry.setTag('monitoring_type', 'security');

    // Set up global error handler for security events
    if (typeof window !== 'undefined') {
      window.addEventListener('error', event => {
        // Check if error might be security-related
        if (this.isSecurityRelatedError(event.error)) {
          this.logSecurityEvent({
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: 'medium',
            details: {
              error_message: event.error?.message || 'Unknown error',
              error_stack: event.error?.stack?.substring(0, 1000),
              source: event.filename,
              line: event.lineno,
              column: event.colno,
            },
          });
        }
      });
    }

    console.log('Security monitoring initialized');
  }

  /**
   * Check if an error might be security-related
   */
  private static isSecurityRelatedError(error: Error): boolean {
    if (!error?.message) return false;

    const securityKeywords = [
      'csrf',
      'xss',
      'injection',
      'unauthorized',
      'forbidden',
      'content security policy',
      'mixed content',
      'cors',
    ];

    return securityKeywords.some(keyword =>
      error.message.toLowerCase().includes(keyword)
    );
  }
}

/**
 * Middleware for automatic security event logging
 */
export function withSecurityMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  eventType: SecurityEventType,
  severity: SecurityEvent['severity'] = 'low'
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // If it's a Promise, handle async errors
      if (result instanceof Promise) {
        return result.catch(error => {
          SecurityMonitor.logSecurityEvent({
            type: eventType,
            severity: 'high',
            details: {
              error_message: error.message,
              function_name: fn.name,
              arguments: JSON.stringify(args).substring(0, 500),
            },
          });
          throw error;
        });
      }

      return result;
    } catch (error) {
      SecurityMonitor.logSecurityEvent({
        type: eventType,
        severity: 'high',
        details: {
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
          function_name: fn.name,
          arguments: JSON.stringify(args).substring(0, 500),
        },
      });
      throw error;
    }
  }) as T;
}
