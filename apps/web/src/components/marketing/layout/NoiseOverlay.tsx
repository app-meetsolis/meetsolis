'use client';

export function NoiseOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.035] mix-blend-overlay bg-noise" />
    );
}
