/**
 * Adjust View Dialog
 * Modal for adjusting video layout settings (layout mode, tile count, etc.)
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LayoutMode } from '@/types/layout';
import {
  AutoLayoutIcon,
  TiledLayoutIcon,
  SpotlightLayoutIcon,
  SidebarLayoutIcon,
} from './LayoutPreviewIcons';

export interface AdjustViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutMode: LayoutMode;
  maxTilesVisible: number;
  hideNoVideo: boolean;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onMaxTilesChange: (count: number) => void;
  onHideNoVideoChange: (hide: boolean) => void;
}

interface LayoutOptionProps {
  value: LayoutMode;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
}

/**
 * Layout Option Component
 * Single layout mode option with icon and label
 */
function LayoutOption({
  value,
  label,
  icon,
  selected,
  onSelect,
  badge,
}: LayoutOptionProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50',
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      )}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <RadioGroupItem value={value} checked={selected} />

      <div className="flex-1 flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 text-gray-600">{icon}</div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {badge && (
              <span className="text-xs text-blue-600 font-medium mt-0.5">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Adjust View Dialog Component
 */
export function AdjustViewDialog({
  open,
  onOpenChange,
  layoutMode,
  maxTilesVisible,
  hideNoVideo,
  onLayoutModeChange,
  onMaxTilesChange,
  onHideNoVideoChange,
}: AdjustViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Adjust view</DialogTitle>
          <DialogDescription className="text-gray-600">
            Selection is saved for future meetings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Layout Mode Selection */}
          <RadioGroup
            value={layoutMode}
            onValueChange={value => onLayoutModeChange(value as LayoutMode)}
          >
            <div className="space-y-2">
              <LayoutOption
                value="auto"
                label="Auto (dynamic)"
                icon={<AutoLayoutIcon />}
                selected={layoutMode === 'auto'}
                onSelect={() => onLayoutModeChange('auto')}
                badge="Recommended"
              />

              <LayoutOption
                value="tiled"
                label="Tiled (legacy)"
                icon={<TiledLayoutIcon />}
                selected={layoutMode === 'tiled'}
                onSelect={() => onLayoutModeChange('tiled')}
              />

              <LayoutOption
                value="spotlight"
                label="Spotlight"
                icon={<SpotlightLayoutIcon />}
                selected={layoutMode === 'spotlight'}
                onSelect={() => onLayoutModeChange('spotlight')}
              />

              <LayoutOption
                value="sidebar"
                label="Sidebar"
                icon={<SidebarLayoutIcon />}
                selected={layoutMode === 'sidebar'}
                onSelect={() => onLayoutModeChange('sidebar')}
              />
            </div>
          </RadioGroup>

          <Separator />

          {/* Tile Count Slider */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-900">Tiles</Label>
              <p className="text-sm text-gray-500 mt-0.5">
                Maximum tiles to display, depending on window size.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <LayoutGrid className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Slider
                value={[maxTilesVisible]}
                onValueChange={([value]) => onMaxTilesChange(value)}
                min={1}
                max={25}
                step={1}
                className="flex-1"
              />
              <LayoutGrid className="w-5 h-5 text-gray-600 flex-shrink-0" />
            </div>

            <div className="text-center">
              <span className="text-sm font-medium text-gray-700">
                {maxTilesVisible} {maxTilesVisible === 1 ? 'tile' : 'tiles'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Hide Tiles Without Video Toggle */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor="hide-no-video"
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              Hide tiles without video
            </Label>
            <Switch
              id="hide-no-video"
              checked={hideNoVideo}
              onCheckedChange={onHideNoVideoChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
