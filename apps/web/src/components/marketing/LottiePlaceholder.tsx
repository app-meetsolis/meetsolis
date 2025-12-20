import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface LottiePlaceholderProps {
  className?: string;
  label?: string;
}

export function LottiePlaceholder({
  className,
  label = 'Lottie Animation',
}: LottiePlaceholderProps) {
  return (
    <div
      className={cn(
        'w-full h-full min-h-[300px] bg-secondary/20 rounded-3xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 relative overflow-hidden group',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors duration-500" />

      {/* Animated Elements Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-32 h-32 rounded-full bg-primary blur-[50px] animate-pulse" />
        <div className="w-40 h-40 rounded-full bg-secondary blur-[60px] animate-pulse delay-75 absolute top-10 right-10" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
          <Play className="w-8 h-8 fill-current ml-1" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground/80">{label}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Animation Placeholder
          </p>
        </div>
      </div>
    </div>
  );
}
