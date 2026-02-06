
'use client';

import { useEffect, useState, useCallback } from 'react';
import { generateComedyTip } from '@/ai/flows/generate-comedy-tip-flow';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ComedyTip() {
  const [tip, setTip] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTip = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await generateComedyTip();
      if (result.tip) {
        setTip(result.tip);
        // Show with a slight delay for better feel
        if (!isVisible) {
            setTimeout(() => setIsVisible(true), 500);
        }
      }
    } catch (err) {
      console.error("Failed to load AI tip");
    } finally {
      setIsRefreshing(false);
    }
  }, [isVisible]);

  useEffect(() => {
    fetchTip();
  }, [fetchTip]);

  if (!tip) return null;

  return (
    <div 
      className={cn(
        "fixed top-6 right-6 z-[100] max-w-xs transition-all duration-1000 ease-out transform",
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-95 pointer-events-none"
      )}
    >
      <div 
        onClick={fetchTip}
        className="relative p-4 rounded-2xl bg-primary text-primary-foreground shadow-2xl border border-white/10 overflow-hidden group cursor-pointer active:scale-95 transition-transform"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="flex gap-3">
          <div className={cn(
              "shrink-0 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center transition-all",
              isRefreshing ? "animate-spin" : "animate-pulse"
          )}>
            {isRefreshing ? <RefreshCw className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4 text-white" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">AI Studio Assistant</p>
                {isRefreshing && <span className="text-[8px] animate-pulse text-white/70 font-bold">...</span>}
            </div>
            <p className="text-xs font-medium leading-relaxed italic">"{tip}"</p>
            <p className="text-[8px] font-bold text-white/20 uppercase mt-2 group-hover:text-white/40 transition-colors tracking-widest">Tap to update</p>
          </div>
        </div>
      </div>
    </div>
  );
}
