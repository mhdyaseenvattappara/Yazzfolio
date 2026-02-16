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
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg md:hidden">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
           <Image
              src="/my-photo.jpg"
              alt="logo"
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          <span>Mhd Yaseen V</span>
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              {isOpen ? <X /> : <Menu />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Browse portfolio categories, about me, and contact information.
              </SheetDescription>
            </SheetHeader>
            <div className="flex h-full flex-col p-6">
              <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-lg" onClick={() => setIsOpen(false)}>
                 <Image
                    src="/my-photo.jpg"
                    alt="logo"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    />
                <span>Mhd Yaseen V</span>
              </Link>
              <nav className="flex-1">
                <ul className="space-y-4">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 text-lg text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto">
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
