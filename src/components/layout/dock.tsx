
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { navLinks } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ui/theme-toggle';
import { usePathname, useRouter } from 'next/navigation';

export function Dock() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const sections = navLinks.map((link) => {
        try {
          if (link.href.startsWith('/#')) {
            const id = link.href.substring(2);
            return document.getElementById(id);
          }
          return null;
        } catch (e) {
          return null;
        }
      });
      
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        if (section) {
          const sectionTop = (section as HTMLElement).offsetTop;
          const sectionHeight = section.clientHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            const sectionId = section.id ? `/#${section.id}` : null;
            if (sectionId) {
                setActiveSection(sectionId);
                return;
            }
          }
        }
      }

      const heroSection = document.getElementById('hero');
      if (heroSection && window.scrollY < (heroSection as HTMLElement).offsetTop + (heroSection as HTMLElement).clientHeight - window.innerHeight / 2) {
        setActiveSection('/#hero');
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (isHomePage) {
          e.preventDefault();
          const targetId = href.substring(2);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
          }
      } else {
          // If on another page, just let the standard Link navigation handle it.
          // The browser will navigate to the homepage and jump to the hash.
      }
  };


  return (
    <nav className={cn(
      'hidden md:flex flex-col items-center justify-center fixed top-1/2 -translate-y-1/2 left-0 z-50 p-2 transition-transform duration-700 ease-out',
      isMounted ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="flex flex-col items-center gap-1 p-1 rounded-full bg-card/80 shadow-lg border backdrop-blur-sm">
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            aria-label={link.name} 
            onClick={(e) => handleLinkClick(e, link.href)}
            className={cn(
                'group flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition-all duration-300',
                activeSection === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            )}
          >
            <link.icon className={cn(
                "h-5 w-5 transition-transform duration-300",
                activeSection === link.href ? 'scale-110' : 'group-hover:scale-125'
            )} />
          </Link>
        ))}
      </div>
      <div className="mt-2">
        <ThemeToggle />
      </div>
    </nav>
  );
}

