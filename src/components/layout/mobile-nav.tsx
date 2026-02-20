'use client';
import * as React from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { navLinks } from '@/lib/data';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering the dynamic UI on the client
  if (!mounted) return null;

  return (
    <div className="fixed top-6 left-0 right-0 z-[100] md:hidden px-6">
      {/* Floating Capsule Header - Hidden when menu is open */}
      <header 
        className={cn(
          "mx-auto max-w-md bg-background/80 backdrop-blur-2xl border border-border/50 h-14 rounded-full flex items-center px-6 justify-between shadow-2xl transition-all duration-300",
          isOpen ? "opacity-0 pointer-events-none translate-y-[-10px]" : "opacity-100 translate-y-0"
        )}
      >
        <Link 
          href="/" 
          className="flex items-center active:scale-95 transition-transform"
          onClick={() => setIsOpen(false)}
        >
          <span className="font-black text-xl tracking-tighter">
            Yazzfolio<span className="text-primary">.</span>
          </span>
        </Link>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0" aria-label="Open menu">
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-fit w-[95vw] sm:w-full max-w-md mx-auto mb-6 rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] text-white p-6 shadow-2xl outline-none overflow-hidden flex flex-col gap-6 bottom-0"
          >
            <SheetHeader className="relative flex items-center justify-center pb-2">
              <SheetTitle className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigation and primary actions.</SheetDescription>
              <SheetClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 rounded-full h-8 w-8 bg-white/5 hover:bg-white/10 text-white/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetHeader>

            {/* Navigation List - Optimized spacing */}
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between group py-3 px-2 rounded-2xl transition-all active:bg-white/5"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center transition-colors group-active:bg-white/10">
                      <link.icon className="h-5 w-5 text-white/80" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white/90">
                        {link.name}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/20 group-active:text-white/40 transition-all" />
                </Link>
              ))}
            </nav>
            
            {/* Primary Action Button */}
            <div className="pt-2">
              <Button 
                asChild 
                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-lg shadow-xl flex items-center justify-between px-6 transition-all active:scale-[0.98]"
              >
                <Link href="/#contact" onClick={() => setIsOpen(false)}>
                    <span>Let's Collaborate</span>
                    <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <div className="pt-6 flex justify-center">
                <Link 
                  href="/admin/login" 
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Secure Admin Node v2.0
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </div>
  );
}
