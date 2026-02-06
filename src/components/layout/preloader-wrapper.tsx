'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Preloader } from '@/components/ui/preloader';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';
import { Dock } from './dock';
import { InstagramChat } from './instagram-chat';
import { CustomCursor } from '../ui/custom-cursor';

export function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin') ?? false;
  const isPortfolioPage = pathname === '/portfolio';

  // Initialize state based on path to prevent preloader showing on pages where it's not wanted
  const [isLoaded, setIsLoaded] = useState(isAdminPage || isPortfolioPage);
  const [isPreloaderUnmounted, setIsPreloaderUnmounted] = useState(isAdminPage || isPortfolioPage);

  useEffect(() => {
    // Add custom cursor class to html element
    document.body.parentElement?.classList.add('cursor-none-forced');

    if (!isAdminPage && !isPortfolioPage) {
        // Start timers for standard preloader on the home page
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
  }, [isAdminPage, isPortfolioPage]);

  const showPreloader = !isPreloaderUnmounted;

  return (
    <>
      <CustomCursor />
      {showPreloader && <Preloader isLoaded={isLoaded} />}
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
          </>
        )}
      </div>
    </>
  );
}