'use client';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function LiquidBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Only active for high-end themes
  const isActive = theme === 'ios-dark' || theme === 'cosmic';

  return (
    <div 
      className={cn(
        "fixed inset-0 -z-[100] overflow-hidden pointer-events-none transition-opacity duration-1000",
        isActive ? "opacity-100" : "opacity-0"
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-background" />
      
      {/* Liquid Blobs - Repositioned away from the dock (left side) and color-neutralized */}
      {/* Centered Large Orb */}
      <div className="absolute top-[10%] left-[20%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[160px] animate-liquid-1" />
      
      {/* Bottom Right Deep Orb */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[180px] animate-liquid-2" />
      
      {/* Top Right Subtle Orb */}
      <div className="absolute top-[5%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-liquid-3" />
    </div>
  );
}
