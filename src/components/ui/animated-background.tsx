'use client';
import { useEffect, useState } from 'react';

// Generates a random number within a given range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export function AnimatedBackground() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const orbs = Array.from({ length: 15 }).map((_, i) => {
    const size = random(50, 200); // Orb size
    const left = random(0, 100); // Horizontal position in vw
    const animationDuration = random(20, 50); // Duration in seconds
    const animationDelay = random(0, 30); // Delay in seconds

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

  return (
    <div className="background-orbs" aria-hidden="true">
      {orbs.map(orb => (
        <div key={orb.id} className="orb" style={orb.style}></div>
      ))}
    </div>
  );
}
