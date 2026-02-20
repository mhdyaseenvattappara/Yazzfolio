
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
    <header className="fixed top-0 left-0 right-0 z-[100] md:hidden bg-[#0a0a0a] border-b border-white/5 h-16 flex items-center px-6 justify-between backdrop-blur-xl bg-opacity-95">
      <Link 
        href="/" 
        className="flex items-center gap-3 active:scale-95 transition-transform"
        onClick={() => setIsOpen(false)}
      >
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/20">
            <Image 
                src="/my-photo.jpg" 
                alt="Mhd Yaseen V" 
                fill 
                className="object-cover" 
                priority
            />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Mhd Yaseen V</span>
      </Link>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/5 rounded-full h-10 w-10 p-0" aria-label="Open menu">
            <Menu className="h-6 w-6" strokeWidth={2} />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-[3rem] bg-[#0a0a0a] border-t-white/10 text-white p-0 overflow-hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Explore portfolio categories and contact information.
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col p-10 pt-16">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-primary/20">
                    <Image src="/my-photo.jpg" alt="Mhd Yaseen V" fill className="object-cover" />
                </div>
                <span className="text-white font-black text-2xl tracking-tighter">Yazzfolio<span className="text-primary">.</span></span>
              </div>
              <ThemeToggle />
            </div>
            
            <nav className="flex-1">
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-6 text-2xl font-black text-gray-500 transition-all hover:text-white group py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 rotate-3 group-hover:rotate-0">
                          <link.icon className="h-6 w-6" />
                      </div>
                      <span className="tracking-tighter">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="mt-auto flex items-center justify-center pt-8 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Secure Node v2.0 // Port 9002</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
