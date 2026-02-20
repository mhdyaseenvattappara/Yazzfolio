
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
      
      {/* Liquid Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-liquid-1" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] animate-liquid-2" />
      <div className="absolute top-[20%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] animate-liquid-3" />
    </div>
  );
}
