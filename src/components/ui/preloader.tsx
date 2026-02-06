'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type PreloaderProps = {
  isLoaded: boolean;
};

export function Preloader({ isLoaded }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoaded) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isLoaded]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-all duration-1000 ease-in-out',
        isLoaded ? 'opacity-0 pointer-events-none scale-110 blur-2xl' : 'opacity-100 scale-100'
      )}
      aria-hidden={isLoaded}
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative flex items-center justify-center">
        {/* Outer Spinning Rings */}
        <div className="absolute h-56 w-56 rounded-full border-t-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute h-52 w-52 rounded-full border-r-2 border-accent/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute h-48 w-48 rounded-full border-b-2 border-primary/50 animate-spin" style={{ animationDuration: '1.5s' }} />
        
        {/* Inner Pulsing Image Core */}
        <div className="relative h-36 w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-[0_0_30px_rgba(var(--primary),0.2)] z-10">
          <Image
            src="/my-photo.jpg"
            alt="Mhd Yaseen V"
            fill
            className="object-cover grayscale"
            priority
          />
          {/* Overlay to keep it dark/themed */}
          <div className="absolute inset-0 bg-primary/10 mix-blend-color" />
        </div>
        
        {/* Pulsing Ring behind image */}
        <div className="absolute h-32 w-32 rounded-full bg-primary/20 animate-ping opacity-20" />
      </div>

      {/* Loading Information */}
      <div className="mt-16 space-y-4 text-center z-10">
        <div className="space-y-1">
          <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-primary animate-pulse">
            Initializing Cosmos
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
            <span>SYS_READY:</span>
            <span className="w-8 text-left">{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="w-48 h-[2px] bg-muted overflow-hidden rounded-full mx-auto">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest italic">
          Crafting visual narratives...
        </p>
      </div>
    </div>
  );
}
