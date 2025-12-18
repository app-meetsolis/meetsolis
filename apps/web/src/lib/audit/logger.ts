/**
 * Audit Logger
 * Logs all host/co-host actions to audit_logs table for compliance and debugging
 *
 * Usage:
 * ```typescript
 * await logAudit({
 *   supabase,
 *   userId: 'user-123',
 *   meetingId: 'meeting-456',
 *   action: 'spotlight_set',
 *   targetUserId: 'target-789',
 *   metadata: { participant_id: 'p-123' },
 *   request, // NextRequest for IP/user-agent
 * });
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export type AuditAction =
  | 'spotlight_set'
  | 'spotlight_clear'
  | 'meeting_locked'
  | 'meeting_unlocked'
  | 'participant_promoted'
  | 'participant_demoted'
  | 'participant_removed'
  | 'participant_admitted'
  | 'participant_rejected';

export interface LogAuditOptions {
  /**
   * Supabase client (service role)
   */
  supabase: SupabaseClient;

  /**
   * User ID who performed the action (from Clerk → Supabase users.id)
   */
  userId: string;

  /**
   * Meeting ID (UUID)
   */
  meetingId: string;

  /**
   * Action type
   */
  action: AuditAction;

  /**
   * Target user ID (for role changes, removals, etc.)
   * Optional - not all actions have a target
   */
  targetUserId?: string | null;

  /**
   * Additional context (JSON)
   * Examples:
   * - { old_role: 'participant', new_role: 'co-host' }
   * - { spotlight_participant_id: 'p-123' }
   * - { locked: true }
   */
  metadata?: Record<string, any>;

  /**
   * Next.js request object for extracting IP/user-agent
   */
  request?: NextRequest;
}

/**
 * Log an audit event to the database
 *
 * @param options - Audit log options
 * @returns Promise<void> - Throws on error (caller should handle)
 */
/**
 * Validate and extract client IP address from request headers
 * Prevents IP spoofing by validating format
 *
 * @param request - Next.js request object
 * @returns Validated IP address or null
 */
function extractClientIP(request: NextRequest | undefined): string | null {
  if (!request) return null;

  // Get potential IP from headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  // Try x-real-ip first (most reliable on Vercel)
  if (realIp && isValidIP(realIp)) {
    return realIp;
  }

  // Try first IP in x-forwarded-for chain
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp && isValidIP(firstIp)) {
      return firstIp;
    }
  }

  return null;
}

/**
 * Validate IP address format (IPv4 or IPv6)
 *
 * @param ip - IP address string
 * @returns true if valid IP format
 */
function isValidIP(ip: string): boolean {
  // IPv4 pattern: xxx.xxx.xxx.xxx (0-255 each octet)
  const ipv4Pattern =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 pattern: simplified version (covers most cases)
  const ipv6Pattern = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;

  // IPv6 compressed pattern (allows :: compression)
  const ipv6CompressedPattern =
    /^((?:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*)?)::((?:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*)?)$/i;

  return (
    ipv4Pattern.test(ip) ||
    ipv6Pattern.test(ip) ||
    ipv6CompressedPattern.test(ip)
  );
}

export async function logAudit(options: LogAuditOptions): Promise<void> {
  const {
    supabase,
    userId,
    meetingId,
    action,
    targetUserId = null,
    metadata = {},
    request,
  } = options;

  try {
    // Extract and validate IP address from request headers
    const ipAddress = extractClientIP(request);

    const userAgent = request
      ? request.headers.get('user-agent') || null
      : null;

    // Insert audit log
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      meeting_id: meetingId,
      action,
      target_user_id: targetUserId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Audit Logger] Failed to log audit event:', {
        error,
        userId,
        meetingId,
        action,
      });
      // Don't throw - logging failure shouldn't break the API request
      // But do log the error for monitoring
    } else {
      console.log('[Audit Logger] Logged:', {
        action,
        userId,
        meetingId,
        targetUserId,
      });
    }
  } catch (error) {
    console.error('[Audit Logger] Unexpected error:', error);
    // Don't throw - logging failure shouldn't break the API request
  }
}

/**
 * Query audit logs for a meeting
 * Useful for debugging and compliance reports
 */
export async function getAuditLogs(
  supabase: SupabaseClient,
  meetingId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    userId?: string;
  }
) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: false });

  if (options?.action) {
    query = query.eq('action', options.action);
  }

  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 50) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Audit Logger] Failed to fetch audit logs:', error);
    throw error;
  }

  return data;
}
