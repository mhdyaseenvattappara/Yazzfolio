'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Preloader } from '@/components/ui/preloader';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';
import { Dock } from './dock';
import { InstagramChat } from './instagram-chat';
import { CustomCursor } from '../ui/custom-cursor';
import { InstallPWA } from './install-pwa';
import { LiquidBackground } from '../ui/liquid-background';
import { ThemeToggle } from '../ui/theme-toggle';

export function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin') ?? false;
  const isPortfolioPage = pathname === '/portfolio';

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPreloaderUnmounted, setIsPreloaderUnmounted] = useState(false);

  useEffect(() => {
    // Add custom cursor class to html element
    document.body.parentElement?.classList.add('cursor-none-forced');

    if (isAdminPage || isPortfolioPage) {
        setIsLoaded(true);
        setIsPreloaderUnmounted(true);
    } else {
        const loadTimer = setTimeout(() => setIsLoaded(true), 1500);
        const unmountTimer = setTimeout(() => setIsPreloaderUnmounted(true), 2000);

        return () => {
          clearTimeout(loadTimer);
          clearTimeout(unmountTimer);
        };
    }

    return () => {
        document.body.parentElement?.classList.remove('cursor-none-forced');
    }
  }, [isAdminPage, isPortfolioPage, pathname]);

  const showPreloader = !isPreloaderUnmounted;

  return (
    <>
      <CustomCursor />
      {showPreloader && <Preloader isLoaded={isLoaded} />}
      
      {/* Fluid Liquid Background Layer */}
      {!isAdminPage && <LiquidBackground />}

      {/* Global Absolute Theme Toggle for Desktop */}
      {!isAdminPage && (
        <div className="fixed top-6 right-6 z-[110] hidden md:block animate-in fade-in duration-1000 delay-500">
          <ThemeToggle />
        </div>
      )}

      <div
        className={cn(
          'transition-opacity duration-500 min-h-screen flex flex-col',
           isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden={!isLoaded}
      >
        {isAdminPage ? (
          children
        ) : (
          <>
            <Dock />
            <MobileNav />
            {children}
            <InstagramChat username="_hey_yasii_" />
            <InstallPWA />
          </>
        )}
      </div>
    </>
  );
}
