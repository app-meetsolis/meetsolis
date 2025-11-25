import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
  > {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value = [0],
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange?.([newValue]);
    };

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className={cn(
          'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
          'slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:bg-blue-600',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600',
          '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0',
          className
        )}
        {...props}
      />
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
