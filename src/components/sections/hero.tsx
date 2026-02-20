
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown, MoveRight } from 'lucide-react';

export function Hero() {
  return (
    <>
    <section
      id="hero"
      className="relative w-full min-h-[80vh] flex items-center justify-center text-center overflow-hidden py-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div
          className='flex flex-col items-center max-w-4xl mx-auto'
        >
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 font-headline leading-[1.1] animate-blur-reveal" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
              Crafting visual narratives 
              <br />
              <span className="text-foreground/80">
                through design
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-sm md:text-lg text-muted-foreground px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              A UI/UX and graphic designer dedicated to building beautiful, intuitive, and impactful digital solutions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            <Button asChild size="lg" className="group text-base md:text-lg py-6 md:py-7 px-8 w-full sm:w-auto">
              <Link href="#contact">
                Let's Collaborate <MoveRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
             <Button asChild size="lg" variant="outline" className="group text-base md:text-lg py-6 md:py-7 px-8 w-full sm:w-auto">
              <Link href="#projects">
                View My Work
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-in fade-in duration-1000 delay-1000">
        <Link href="#about" aria-label="Scroll to about section">
          <div className="h-10 w-6 border-2 border-muted-foreground/30 rounded-full flex items-center justify-center">
            <ArrowDown className="h-3 w-3 text-muted-foreground/50 animate-bounce" />
          </div>
        </Link>
      </div>

    </section>
    </>
  );
}
