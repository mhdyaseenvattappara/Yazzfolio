'use client';
import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { navLinks } from '@/lib/data';
import { ThemeToggle } from '../ui/theme-toggle';
import Image from 'next/image';

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="fixed top-6 left-0 right-0 z-[100] px-4 md:hidden pointer-events-none">
      <div className="mx-auto max-w-[400px] h-14 bg-[#0a0a0a] border border-white/10 rounded-full px-6 flex items-center justify-between shadow-2xl backdrop-blur-xl bg-opacity-90 pointer-events-auto">
        <Link 
          href="/" 
          className="flex items-center gap-0.5 font-black text-xl tracking-tighter text-white select-none active:scale-95 transition-transform"
          onClick={() => setIsOpen(false)}
        >
          Yazzfolio<span className="text-primary">.</span>
        </Link>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-10 w-10" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-[#0a0a0a] border-r-white/10 text-white p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Browse portfolio categories, about me, and contact information.
              </SheetDescription>
            </SheetHeader>
            <div className="flex h-full flex-col p-8">
              <Link 
                href="/" 
                className="mb-12 flex items-center gap-0.5 font-black text-2xl tracking-tighter text-white" 
                onClick={() => setIsOpen(false)}
              >
                Yazzfolio<span className="text-primary">.</span>
              </Link>
              <nav className="flex-1">
                <ul className="space-y-6">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-4 text-lg font-bold text-gray-400 transition-colors hover:text-white group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <link.icon className="h-5 w-5" />
                        </div>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Node v2.0</p>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
