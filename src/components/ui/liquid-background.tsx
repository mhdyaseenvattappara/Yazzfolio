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
      
      {/* Liquid Blobs - Higher blur and lower opacity for better blending */}
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[150px] animate-liquid-1" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[180px] animate-liquid-2" />
      <div className="absolute top-[20%] right-[-5%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[130px] animate-liquid-3" />
    </div>
  );
}