
'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed it this session
    const dismissed = sessionStorage.getItem('pwa-dismissed');
    if (dismissed) {
        setIsDismissed(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Only show if not dismissed in this session
      if (!sessionStorage.getItem('pwa-dismissed')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // If accepted, hide the popup
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
      setIsVisible(false);
      setIsDismissed(true);
      sessionStorage.setItem('pwa-dismissed', 'true');
  }

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-md animate-in fade-in slide-in-from-bottom-10 duration-700">
        <Card className="bg-card/95 backdrop-blur-2xl border-primary/20 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <CardContent className="p-5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Add to Home Screen</h3>
                        <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-wider opacity-60">Install Yazzfolio for native feel</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={handleInstallClick}
                            size="sm"
                            className="rounded-full bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6 h-9 shadow-lg active:scale-95 transition-all"
                        >
                            Install
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={dismiss}
                            className="rounded-full h-8 w-8 hover:bg-muted text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
