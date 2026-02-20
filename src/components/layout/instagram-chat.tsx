'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function InstagramChat({ username }: { username: string }) {
    const [isAtBottom, setIsAtBottom] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollPos = window.innerHeight + window.scrollY;
            
            // Increased threshold to avoid overlapping simplified footer
            const footerThreshold = 180; 
            
            if (scrollHeight - scrollPos < footerThreshold) {
                setIsAtBottom(true);
            } else {
                setIsAtBottom(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className="fixed right-6 sm:right-8 z-50 transition-all duration-500 ease-in-out"
            style={{ 
                bottom: isAtBottom ? '140px' : '2rem' 
            }}
        >
            <Button asChild variant="outline" className="h-16 w-auto px-6 rounded-[2rem] bg-background/80 shadow-2xl hover:bg-accent flex items-center justify-center gap-3 group border-border/50 backdrop-blur-md nav-liquid">
                <Link href={`https://ig.me/m/${username}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on Instagram">
                    <span className="text-3xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125">✌️</span>
                    <span className="text-lg font-black tracking-tight">Say Hi!</span>
                </Link>
            </Button>
        </div>
    );
}
