import * as React from 'react';

export function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
