'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-background py-20">
      <div className="relative mb-8 flex items-center justify-center">
        <h1 className="text-[10rem] md:text-[15rem] font-black leading-none text-destructive/10 select-none">ERR</h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 md:h-24 md:w-24 text-destructive animate-pulse" />
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mt-4">Something went wrong</h2>
        </div>
      </div>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        An unexpected error occurred in the studio nodes. We've been notified and are working to restore visual harmony.
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Button onClick={() => reset()} size="lg" className="group text-lg py-7 px-8">
          <RefreshCcw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
          Try Again
        </Button>
        <Button asChild variant="outline" size="lg" className="text-lg py-7 px-8">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
