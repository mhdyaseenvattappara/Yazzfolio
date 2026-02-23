'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import type { Video } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Play, MoveRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';

export function FeaturedVideo() {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });
  const firestore = useFirestore();
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminId = async () => {
      if (firestore) {
        const adminUsersRef = collection(firestore, 'admin_users');
        const q = query(adminUsersRef, limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setAdminUserId(snapshot.docs[0].id);
      }
    };
    fetchAdminId();
  }, [firestore]);

  const featuredVideoQuery = useMemoFirebase(() => {
    if (!firestore || !adminUserId) return null;
    return query(
      collection(firestore, `admin_users/${adminUserId}/videos`),
      where('isFeatured', '==', true),
      limit(1)
    );
  }, [firestore, adminUserId]);

  const { data: videos, isLoading } = useCollection<Video>(featuredVideoQuery);
  const featured = videos?.[0];

  if (!isLoading && !featured) return null;

  return (
    <section ref={ref} className="py-24 sm:py-32 overflow-hidden bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className={cn(
            "max-w-6xl mx-auto rounded-[3rem] overflow-hidden border border-border/50 shadow-2xl relative transition-all duration-1000",
            isInView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
        )}>
          {isLoading ? (
            <Skeleton className="w-full aspect-video md:h-[600px]" />
          ) : (
            <div className="relative aspect-video md:h-[600px] group">
              {/* Background Cover */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
                style={{ backgroundImage: `url(${featured.thumbnailUrl})` }}
              />
              
              {/* Cinematic Gradient Overlays */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              {/* Content Core */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="space-y-6 max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-2">Featured Showreel</p>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tightest text-white leading-none">
                        {featured.title}
                    </h2>
                    <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
                        {featured.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Button asChild size="lg" className="h-16 px-10 rounded-full bg-white text-black hover:bg-white/90 font-black shadow-2xl transition-all hover:scale-105">
                            <a href={featured.videoUrl} target="_blank" rel="noopener noreferrer">
                                <Play className="mr-3 h-5 w-5 fill-current" />
                                Play Work
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-bold transition-all">
                            <Link href="/videos">
                                Enter Motion Archive <MoveRight className="ml-3 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
              </div>

              {/* Reel Marker Overlay */}
              <div className="absolute bottom-10 right-10 flex items-center gap-4 text-white/20 select-none">
                  <div className="h-px w-12 bg-white/20" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em]">Visual Artifact v2.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
