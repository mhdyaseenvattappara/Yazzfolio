'use client';

import Image from 'next/image';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import Link from 'next/link';
import { MoveRight, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { AdminProfile } from '@/lib/data';
import { collection, limit, query } from 'firebase/firestore';

export function About() {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });
  const firestore = useFirestore();

  const profileQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'admin_users'), limit(1));
  }, [firestore]);

  const { data: profiles, isLoading } = useCollection<AdminProfile>(profileQuery);
  const profile = profiles?.[0];

  return (
    <section id="about" ref={ref} className="pt-0 pb-24 sm:pb-32 md:py-0 md:min-h-screen md:flex md:items-center">
      <div className="container mx-auto px-4 md:px-6">
        {isLoading && (
          <div className="flex justify-start">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}
        {profile && (
          <div
            className={cn(
              'flex flex-col items-start text-left max-w-4xl',
              isInView ? 'animate-blur-reveal' : 'opacity-0'
            )}
          >
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl mb-8 group">
                <Image
                  src={profile.profileImageUrl || '/my-photo.jpg'}
                  alt={profile.name}
                  data-ai-hint="portrait person"
                  fill
                  className="object-cover transition-all duration-500 grayscale group-hover:grayscale-0"
                />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Hey, I'm {profile.name}</h2>
              </div>
              <div className="max-w-2xl text-muted-foreground text-base md:text-xl leading-relaxed" dangerouslySetInnerHTML={{ __html: profile.bio.replace(/\n/g, '<br />') }} />
               <div className="pt-6">
                  <Button asChild size="lg" className="group text-lg py-7 px-8">
                      <Link href="#contact">
                          Contact Me <MoveRight className="transition-transform group-hover:translate-x-1" />
                      </Link>
                  </Button>
              </div>
            </div>
          </div>
        )}
        {!isLoading && !profile && (
            <div className="text-left text-muted-foreground">Profile information not available. Please set it up in the admin dashboard.</div>
        )}
      </div>
    </section>
  );
}
