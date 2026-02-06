import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Compass } from 'lucide-react';
import { PreloaderWrapper } from '@/components/layout/preloader-wrapper';

export default function NotFound() {
  return (
    <PreloaderWrapper>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-background py-20">
            <div className="relative mb-8 flex items-center justify-center">
                <h1 className="text-[10rem] md:text-[15rem] font-black leading-none text-primary/10 select-none">404</h1>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Compass className="h-16 w-16 md:h-24 md:w-24 text-primary animate-pulse" />
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight mt-4">Lost in the Cosmos</h2>
                </div>
            </div>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
                It seems you've drifted into uncharted territory. Let's get you back to familiar ground.
            </p>
            <div className="mt-12">
                <Button asChild size="lg" className="group text-lg py-7 px-8">
                    <Link href="/">
                        <Home className="mr-2 h-5 w-5" />
                        Return to Home
                    </Link>
                </Button>
            </div>
        </div>
    </PreloaderWrapper>
  );
}
