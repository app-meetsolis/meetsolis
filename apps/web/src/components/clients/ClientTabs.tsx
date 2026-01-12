/**
 * ClientTabs Component
 * Story 2.6: Client Detail View (Enhanced) - Task 4
 *
 * Tabbed interface for client detail page:
 * - Overview
 * - Meeting History
 * - Notes & Decisions
 *
 * Active tab synced with URL query params
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Client, ClientActionItem } from '@meetsolis/shared';

interface ClientTabsProps {
  client: Client;
  actionItems: ClientActionItem[];
  overviewTab: React.ReactNode;
  meetingHistoryTab: React.ReactNode;
  notesTab: React.ReactNode;
}

export function ClientTabs({
  client,
  actionItems,
  overviewTab,
  meetingHistoryTab,
  notesTab,
}: ClientTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    // Update URL with new tab
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    router.push(url.pathname + url.search);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="meetings">Meeting History</TabsTrigger>
        <TabsTrigger value="notes">Notes & Decisions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {overviewTab}
      </TabsContent>

      <TabsContent value="meetings" className="space-y-4">
        {meetingHistoryTab}
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        {notesTab}
      </TabsContent>
    </Tabs>
  );
}
