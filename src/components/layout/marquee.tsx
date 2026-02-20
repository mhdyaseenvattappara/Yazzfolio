'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const marqueeItems = [
  'UI/UX Design',
  'Graphic Design',
  'Branding & Identity',
  'Visual Storytelling',
  'Figma',
  'Adobe Creative Suite',
  'Web Design',
  'Mobile App Design',
  'Illustration',
];

export function Marquee({ className }: { className?: string }) {
  return (
    <div className={cn(
      "marquee-container relative flex overflow-x-hidden border-b bg-background/60 backdrop-blur-md text-muted-foreground group",
      className
    )}>
      <div className="flex min-w-full shrink-0 items-center justify-around whitespace-nowrap py-3 animate-marquee group-hover:[animation-play-state:paused]">
        {marqueeItems.map((item, index) => (
          <div key={`set1-${index}`} className="flex items-center">
            <span className="mx-6 text-[10px] font-black uppercase tracking-[0.2em]">{item}</span>
            <Star className="h-2.5 w-2.5 text-primary/40 fill-primary/10" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="flex min-w-full shrink-0 items-center justify-around whitespace-nowrap py-3 animate-marquee group-hover:[animation-play-state:paused]">
        {marqueeItems.map((item, index) => (
          <div key={`set2-${index}`} className="flex items-center">
            <span className="mx-6 text-[10px] font-black uppercase tracking-[0.2em]">{item}</span>
            <Star className="h-2.5 w-2.5 text-primary/40 fill-primary/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
