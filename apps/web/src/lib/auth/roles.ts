/**
 * Role-Based Access Control Utilities
 * Functions for validating and managing user roles
 */

import { UserRole } from '@meetsolis/shared/types';

/**
 * Role hierarchy levels for permission comparison
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  host: 3,
  'co-host': 2,
  participant: 1,
};

/**
 * Check if a role has sufficient permissions
 * @param userRole - The role to check
 * @param requiredRole - The minimum required role
 * @returns True if user role has sufficient permissions
 */
export function hasRolePermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Validate if a string is a valid UserRole
 * @param role - The role string to validate
 * @returns True if the role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return ['host', 'co-host', 'participant'].includes(role);
}

/**
 * Get default role for new users
 * @returns Default user role
 */
export function getDefaultRole(): UserRole {
  return 'participant';
}

/**
 * Check if user is a host
 * @param role - User role to check
 * @returns True if user is a host
 */
export function isHost(role: UserRole): boolean {
  return role === 'host';
}

/**
 * Check if user is a co-host or higher
 * @param role - User role to check
 * @returns True if user is co-host or host
 */
export function isCoHostOrHigher(role: UserRole): boolean {
  return hasRolePermission(role, 'co-host');
}

/**
 * Get role display name
 * @param role - User role
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    host: 'Host',
    'co-host': 'Co-Host',
    participant: 'Participant',
  };
  return displayNames[role];
}
