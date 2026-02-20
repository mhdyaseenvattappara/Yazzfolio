
'use client';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed top-6 left-0 right-0 z-[100] md:hidden px-6">
      <header className="mx-auto max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 h-14 rounded-full flex items-center px-6 justify-between shadow-2xl">
        <Link 
          href="/" 
          className="flex items-center active:scale-95 transition-transform"
          onClick={() => setIsOpen(false)}
        >
          <span className="text-white font-black text-xl tracking-tighter">
            Yazzfolio<span className="text-primary">.</span>
          </span>
        </Link>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/5 rounded-full h-10 w-10 p-0" aria-label="Open menu">
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-[3rem] bg-[#0a0a0a] border-t-white/10 text-white p-0 overflow-hidden outline-none">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Explore portfolio categories and contact information.
              </SheetDescription>
            </SheetHeader>
            <div className="flex h-full flex-col p-8 pt-12">
              {/* Branding Section */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-primary/20">
                      <Image src="/my-photo.jpg" alt="Mhd Yaseen V" fill className="object-cover" />
                  </div>
                  <span className="text-white font-black text-2xl tracking-tighter">
                    Yazzfolio<span className="text-primary">.</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
              </div>
              
              {/* Navigation Links */}
              <nav className="flex-1">
                <ul className="space-y-6">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-6 group py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 transform group-hover:scale-110">
                            <link.icon className="h-7 w-7" strokeWidth={2.5} />
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-gray-500 group-hover:text-white transition-colors duration-300">
                            {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              {/* Bottom Footer */}
              <div className="mt-auto flex flex-col items-center gap-4 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Secure Studio Node v2.0</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </div>
  );
}
