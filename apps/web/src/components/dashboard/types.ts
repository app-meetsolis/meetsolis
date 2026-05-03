import type { Session, ClientActionItem } from '@meetsolis/shared';

export type SessionWithClient = Session & { client_name: string };
export type ActionItemWithClient = ClientActionItem & { client_name: string };

export function clientColor(_name: string, _overdue: boolean): string {
  return 'var(--primary)';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
