'use client';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';
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
import { ThemeToggle } from '../ui/theme-toggle';

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed top-6 left-0 right-0 z-[100] md:hidden px-6">
      <header className="mx-auto max-w-md bg-background/80 backdrop-blur-2xl border border-border/50 h-14 rounded-full flex items-center px-6 justify-between shadow-2xl">
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
          <SheetContent side="bottom" className="h-full sm:h-full w-full rounded-none border-none bg-background text-foreground p-0 overflow-hidden outline-none flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Explore portfolio categories and contact information.
              </SheetDescription>
            </SheetHeader>

            {/* Finch-style Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <span className="font-black text-2xl tracking-tighter">
                  Yazzfolio<span className="text-primary">.</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-accent">
                    <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
              </div>
            </div>
            
            {/* Main Navigation - Large Text Links */}
            <nav className="flex-1 px-8 pt-12 overflow-y-auto no-scrollbar">
              <ul className="space-y-8">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-2 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-3xl font-bold tracking-tight text-foreground/70 group-hover:text-foreground group-active:scale-95 transition-all">
                          {link.name}
                      </span>
                      <ArrowRight className="h-6 w-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </Link>
                  </li>
                ))}
                {/* Extra Links for visual weight like in Finch */}
                <li>
                    <Link 
                        href="/portfolio" 
                        className="group flex items-center justify-between py-2 transition-all"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="text-3xl font-bold tracking-tight text-foreground/70 group-hover:text-foreground">Visual Archive</span>
                        <ArrowRight className="h-6 w-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </Link>
                </li>
              </ul>
            </nav>
            
            {/* Finch-style Bottom Actions */}
            <div className="mt-auto p-8 space-y-4 bg-gradient-to-t from-background via-background to-transparent pt-12">
              <Button 
                asChild 
                variant="outline" 
                className="w-full h-14 rounded-xl border-2 font-bold text-lg hover:bg-accent transition-all active:scale-[0.98]"
              >
                <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                    Admin Access
                </Link>
              </Button>
              <Button 
                asChild 
                className="w-full h-14 rounded-xl font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <Link href="/#contact" onClick={() => setIsOpen(false)}>
                    Let's Collaborate
                </Link>
              </Button>
              <div className="pt-4 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Secure Node v2.0</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </div>
  );
}
