'use client';

export function GridSeparator() {
    return (
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
    );
}

export function VerticalGridLine() {
    return (
        <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-black/5 pointer-events-none z-0" />
    );
}
