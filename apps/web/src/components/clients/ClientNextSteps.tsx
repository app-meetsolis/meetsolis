/**
 * ClientNextSteps Component
 * Story 2.6: Client Detail View (Enhanced) - Tasks 11 & 12
 *
 * Displays and manages next steps for a client:
 * - Bulleted list of steps
 * - Inline editing (click to edit)
 * - Add new steps
 * - Delete steps (X icon on hover)
 * - Debounced save to API
 * - Empty state placeholder
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface ClientNextStepsProps {
  clientId: string;
  nextSteps: string[];
  onNextStepsChange: (steps: string[]) => Promise<void>;
}

export function ClientNextSteps({
  clientId,
  nextSteps: initialNextSteps,
  onNextStepsChange,
}: ClientNextStepsProps) {
  const [nextSteps, setNextSteps] = useState<string[]>(initialNextSteps || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addValue, setAddValue] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce next steps changes
  const debouncedNextSteps = useDebounce(nextSteps, 500);

  // Save to API when debounced value changes
  useEffect(() => {
    if (debouncedNextSteps !== initialNextSteps) {
      setIsSaving(true);
      onNextStepsChange(debouncedNextSteps).finally(() => {
        setIsSaving(false);
      });
    }
  }, [debouncedNextSteps]);

  // Focus input when editing starts
  useEffect(() => {
    if ((editingIndex !== null || isAdding) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex, isAdding]);

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(nextSteps[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newSteps = [...nextSteps];
      newSteps[editingIndex] = editValue.trim();
      setNextSteps(newSteps);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleStartAdd = () => {
    if (nextSteps.length >= 10) {
      alert('Maximum 10 next steps allowed');
      return;
    }
    setIsAdding(true);
    setAddValue('');
  };

  const handleSaveAdd = () => {
    if (addValue.trim()) {
      setNextSteps([...nextSteps, addValue.trim()]);
    }
    setIsAdding(false);
    setAddValue('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setAddValue('');
  };

  const handleDelete = (index: number) => {
    const newSteps = nextSteps.filter((_, i) => i !== index);
    setNextSteps(newSteps);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    action: 'edit' | 'add' | 'delete',
    index?: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'edit') handleSaveEdit();
      else if (action === 'add') handleSaveAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (action === 'edit') handleCancelEdit();
      else if (action === 'add') handleCancelAdd();
    } else if (
      e.key === 'Delete' &&
      action === 'delete' &&
      index !== undefined
    ) {
      e.preventDefault();
      handleDelete(index);
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Next Steps</h2>
        {isSaving && <span className="text-xs text-gray-500">Saving...</span>}
      </div>

      {/* Next Steps List */}
      {nextSteps.length > 0 ? (
        <ul
          className="space-y-2 mb-4"
          role="list"
          aria-label="Next steps for this client"
        >
          {nextSteps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-2 group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Bullet */}
              <span className="text-gray-400 mt-1 flex-shrink-0">•</span>

              {/* Step Content */}
              {editingIndex === index ? (
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={e => handleKeyDown(e, 'edit')}
                  maxLength={200}
                  className="flex-1"
                />
              ) : (
                <button
                  onClick={() => handleStartEdit(index)}
                  className="flex-1 text-left text-sm text-gray-900 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-950 rounded px-1 -ml-1"
                  onKeyDown={e => handleKeyDown(e, 'delete', index)}
                  tabIndex={0}
                >
                  {step}
                </button>
              )}

              {/* Delete Button */}
              {hoveredIndex === index && editingIndex !== index && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(index)}
                  aria-label="Delete next step"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic mb-4">
          Next steps will appear after logging meetings
        </p>
      )}

      {/* Add New Step */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">•</span>
          <Input
            ref={inputRef}
            value={addValue}
            onChange={e => setAddValue(e.target.value)}
            onBlur={handleSaveAdd}
            onKeyDown={e => handleKeyDown(e, 'add')}
            placeholder="Enter next step..."
            maxLength={200}
            className="flex-1"
          />
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartAdd}
          disabled={nextSteps.length >= 10}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Next Step
        </Button>
      )}

      {/* Validation Message */}
      {nextSteps.length >= 10 && (
        <p className="text-xs text-gray-500 mt-2">
          Maximum 10 next steps reached
        </p>
      )}
    </Card>
  );
}
