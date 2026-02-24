
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import type { Video } from '@/lib/data';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';

export function FeaturedVideo() {
  const { ref, isInView } = useInView({ threshold: 0.2, once: false });
  const firestore = useFirestore();
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

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

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  if (!isLoading && !featured) return null;

  const isDirectVideo = featured?.videoUrl?.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i) || 
                        featured?.videoUrl?.includes('cloudinary.com') ||
                        featured?.videoUrl?.includes('video/upload');

  return (
    <section id="videos" ref={ref} className="w-full py-12 md:py-20 overflow-hidden bg-background">
      <div className={cn(
          "w-full h-[60vh] sm:h-[70vh] md:h-[80vh] relative transition-all duration-1000",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}>
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <div className="relative w-full h-full group bg-[#0a0a0a] overflow-hidden">
            
            {isDirectVideo ? (
              <video
                ref={videoRef}
                src={featured.videoUrl}
                muted={isMuted}
                loop
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
            ) : (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
                style={{ backgroundImage: `url(${featured.thumbnailUrl || ''})` }}
              />
            )}
            
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />
            
            <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20 flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-black/20 backdrop-blur-xl border-white/10 text-white hover:bg-white/10 h-10 w-10 md:h-12 md:w-12"
                  onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                  }}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 md:h-5 md:w-5" /> : <Volume2 className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12 z-10">
              <div className="space-y-4 md:space-y-8 max-w-4xl">
                  <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/60 mb-2">Visual Artifact</p>
                  <h2 className="text-3xl md:text-8xl font-black tracking-tightest text-white leading-[0.9] drop-shadow-2xl">
                      {featured.title}
                  </h2>
                  <p className="text-white/70 text-sm md:text-xl font-medium leading-relaxed max-w-2xl mx-auto line-clamp-2 md:line-clamp-none">
                      {featured.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 pt-4 md:pt-10">
                      <Button asChild size="lg" className="h-14 md:h-16 px-8 md:px-12 rounded-full bg-white text-black hover:bg-white/90 font-black shadow-2xl transition-all hover:scale-105">
                          <a href={featured.videoUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="mr-3 h-4 w-4 md:h-5 md:w-5 fill-current" />
                              View Reel
                          </a>
                      </Button>
                  </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 hidden sm:flex items-center gap-4 text-white/20 select-none z-10">
                <div className="h-px w-16 bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cinematic Feed Node</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
