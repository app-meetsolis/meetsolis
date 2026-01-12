/**
 * ClientOverview Component
 * Story 2.6: Client Detail View (Enhanced) - Task 5
 *
 * Overview tab displaying:
 * - Client information (2-column grid on desktop, stacked on mobile)
 * - AI-generated overview placeholder
 */

'use client';

import { ExternalLink, Mail, Phone, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Client } from '@meetsolis/shared';
import { format } from 'date-fns';

interface ClientOverviewProps {
  client: Client;
}

export function ClientOverview({ client }: ClientOverviewProps) {
  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'MMM dd, yyyy');
    } catch {
      return String(dateString);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Client Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm text-gray-900 mt-1">{client.name}</p>
            </div>

            {/* Company */}
            {client.company && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Company
                </label>
                <p className="text-sm text-gray-900 mt-1">{client.company}</p>
              </div>
            )}

            {/* Role */}
            {client.role && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Role
                </label>
                <p className="text-sm text-gray-900 mt-1">{client.role}</p>
              </div>
            )}

            {/* Email */}
            {client.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <a
                  href={`mailto:${client.email}`}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                >
                  <Mail className="h-3 w-3" />
                  {client.email}
                </a>
              </div>
            )}

            {/* Phone */}
            {client.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <a
                  href={`tel:${client.phone}`}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                >
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </a>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Website */}
            {client.website && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Website
                </label>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {client.website}
                </a>
              </div>
            )}

            {/* LinkedIn */}
            {client.linkedin_url && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  LinkedIn
                </label>
                <a
                  href={client.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {client.linkedin_url}
                </a>
              </div>
            )}

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {client.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Created Date */}
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {formatDate(client.created_at)}
              </p>
            </div>

            {/* Last Updated */}
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Updated
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {formatDate(client.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Overview Placeholder */}
      <Card className="p-6 bg-gray-50 border-dashed">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          AI Overview
        </h2>
        <p className="text-sm text-gray-500 italic">
          AI overview will be generated after your first meeting.
        </p>
      </Card>
    </div>
  );
}
