/**
 * Contextual Help Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useState } from 'react';
import { HelpCircle, X, Search, Book, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with MeetSolis',
    description: 'Learn the basics of setting up and hosting your first meeting',
    category: 'Getting Started'
  },
  {
    id: '2',
    title: 'Camera and Microphone Setup',
    description: 'Troubleshoot device permissions and quality issues',
    category: 'Technical'
  },
  {
    id: '3',
    title: 'Inviting Participants',
    description: 'How to share meeting links and manage attendees',
    category: 'Meetings'
  },
  {
    id: '4',
    title: 'Using the Whiteboard',
    description: 'Collaborate with your team using the built-in whiteboard',
    category: 'Features'
  }
];

export function ContextualHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = HELP_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Help Center</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Articles */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <button
                  key={article.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <Book className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {article.description}
                      </p>
                      <span className="text-xs text-primary-600 mt-1 inline-block">
                        {article.category}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No articles found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                // Open support chat
                if ((window as any).Intercom) {
                  (window as any).Intercom('show');
                }
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
