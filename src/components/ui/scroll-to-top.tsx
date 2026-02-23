'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @fileOverview A theme-aware floating button that appears after scrolling down.
 * It provides a smooth "back to top" experience with glassmorphism styling.
 */

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={cn(
        'fixed bottom-8 left-6 md:left-24 z-50 transition-all duration-500 ease-in-out pointer-events-none',
        isVisible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-75'
      )}
    >
      <Button
        onClick={scrollToTop}
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full bg-background/80 shadow-2xl border-border/50 backdrop-blur-xl nav-liquid group hover:bg-accent hover:border-primary/30 transition-all duration-300"
        aria-label="Scroll to top"
      >
        {/* Subtle theme-based glow on hover */}
        <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <ArrowUp className="h-6 w-6 text-foreground/80 group-hover:text-primary transition-all duration-300 transform group-hover:-translate-y-1" />
      </Button>
    </div>
  );
}
