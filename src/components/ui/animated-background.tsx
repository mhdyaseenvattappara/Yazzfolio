'use client';
import { useEffect, useState, useMemo } from 'react';

// Generates a random number within a given range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export function AnimatedBackground() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize orbs to prevent hydration mismatch and unnecessary jumps on re-render
  const orbs = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const size = random(50, 200); 
      const left = random(0, 100); 
      const animationDuration = random(20, 50); 
      const animationDelay = random(0, 30); 

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}vw`,
          animationDuration: `${animationDuration}s`,
          animationDelay: `-${animationDelay}s`,
        },
      };
    });
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="background-orbs fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {orbs.map(orb => (
        <div 
          key={orb.id} 
          className="orb absolute rounded-full bg-primary/5 blur-[80px] animate-float opacity-50" 
          style={orb.style}
        ></div>
      ))}
    </div>
  );
}
