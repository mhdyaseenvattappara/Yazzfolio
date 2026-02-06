'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const onMouseMove = (e: MouseEvent) => {
      window.requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;

        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        if (followerRef.current) {
          followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        const target = e.target as HTMLElement;
        const isPointer = 
          window.getComputedStyle(target).getPropertyValue('cursor') === 'pointer' ||
          target.closest('a, button, [role="button"], [role="link"]');

        if (isPointer) {
          document.body.classList.add('cursor-hover');
        } else {
          document.body.classList.remove('cursor-hover');
        }
      });
    };

    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.body.classList.remove('cursor-hover');
    };
  }, []);

  // Prevent hydration mismatch by only rendering on the client
  if (!mounted) return null;

  return (
    <>
      <div
        ref={followerRef}
        className={cn(
          'hidden md:block fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-300 ease-out',
          'h-8 w-8 -mt-4 -ml-4 rounded-full border-2 border-white will-change-transform mix-blend-difference',
          '[.cursor-hover_&]:scale-150'
        )}
      />
      <div
        ref={cursorRef}
        className={cn(
          'hidden md:block fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform',
          'h-2 w-2 -mt-1 -ml-1 rounded-full bg-white transition-opacity duration-300 mix-blend-difference',
          '[.cursor-hover_&]:opacity-0 [.cursor-hover_&]:scale-0'
        )}
      />
    </>
  );
}