/**
 * ClientGrid Component
 * Story 2.2: Client Dashboard UI - Task 3: ClientGrid Component
 *
 * Displays clients in a responsive grid layout:
 * - 3 columns (desktop lg: 1024px+)
 * - 2 columns (tablet md: 768px-1023px)
 * - 1 column (mobile <768px)
 */

import { Client } from '@meetsolis/shared';
import { ClientCard } from './ClientCard';

interface ClientGridProps {
  clients: Client[];
}

export function ClientGrid({ clients }: ClientGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {clients.map(client => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
