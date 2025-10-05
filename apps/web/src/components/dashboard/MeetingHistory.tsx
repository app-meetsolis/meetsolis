/**
 * MeetingHistory Component
 * Displays meeting list with search and filter capabilities
 */

'use client';

import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { format } from 'date-fns';
import { Search, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMeetings } from '@/hooks/useMeetings';
import { useMeetingRealtime } from '@/hooks/useMeetingRealtime';
import type { MeetingStatus } from '@meetsolis/shared';
import type { MeetingFilters } from '@/services/meetings';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  ended: 'bg-gray-100 text-gray-800',
};

export function MeetingHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'all'>(
    'all'
  );
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  // Setup realtime subscription
  const { isConnected } = useMeetingRealtime();

  // Build filters
  const filters: MeetingFilters = useMemo(() => {
    const f: MeetingFilters = {};
    if (debouncedSearch) f.search = debouncedSearch;
    if (statusFilter !== 'all') f.status = statusFilter as MeetingStatus;
    return f;
  }, [debouncedSearch, statusFilter]);

  const { data: meetings, isLoading, error } = useMeetings(filters);

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-center text-red-600">
          Failed to load meetings. Please try again.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Meeting History</h2>
          {isConnected && (
            <Badge
              variant="outline"
              className="border-green-500 text-green-600"
            >
              Live
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={value =>
              setStatusFilter(value as MeetingStatus | 'all')
            }
          >
            <SelectTrigger className="w-full md:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meeting List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : meetings && meetings.length > 0 ? (
        <div className="space-y-3">
          {meetings.map(meeting => (
            <Card
              key={meeting.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {meeting.title}
                    </h3>
                    {meeting.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {meeting.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(meeting.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {meeting.started_at && (
                        <span>
                          Started:{' '}
                          {format(new Date(meeting.started_at), 'hh:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[meeting.status]}>
                    {meeting.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No meetings found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first meeting'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
