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
        "fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-opacity duration-1000",
        isActive ? "opacity-100" : "opacity-0"
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-background" />
      
      {/* Liquid Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-liquid-1" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] animate-liquid-2" />
      <div className="absolute top-[20%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] animate-liquid-3" />
      
      {/* Noise Texture Overlay for grain/premium feel */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
}