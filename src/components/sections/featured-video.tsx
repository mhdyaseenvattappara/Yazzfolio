
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import type { Video } from '@/lib/data';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Volume2, VolumeX, Video as VideoIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';

export function FeaturedVideo() {
  const { ref, isInView } = useInView({ threshold: 0.1, once: false });
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
    <section id="videos" ref={ref} className="w-full overflow-hidden bg-background">
      <div className={cn(
          "w-full h-[70vh] md:h-[85vh] relative transition-all duration-1000 ease-out",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}>
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <div className="relative w-full h-full bg-[#0a0a0a] group">
            
            {isDirectVideo ? (
              <video
                ref={videoRef}
                src={featured.videoUrl}
                muted={isMuted}
                loop
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-accent/5 p-12 text-center">
                  <VideoIcon className="h-16 w-16 text-primary/20 mb-6" />
                  <h3 className="text-2xl font-black mb-2">Unsupported Video Format</h3>
                  <p className="text-muted-foreground">Please use a direct Cloudinary video link for auto-play.</p>
                  <Button asChild variant="outline" className="mt-6 rounded-full">
                      <a href={featured.videoUrl} target="_blank" rel="noopener noreferrer">View Original Source</a>
                  </Button>
              </div>
            )}
            
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            
            {/* Audio Control */}
            <div className="absolute top-8 right-8 z-20">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-black/20 backdrop-blur-2xl border-white/10 text-white hover:bg-white/10 h-12 w-12 shadow-2xl"
                  onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                  }}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
            </div>

            {/* Visual Narrative Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 md:p-20 z-10">
              <div className="space-y-6 md:space-y-10 max-w-5xl">
                  <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] text-white/50 mb-2 animate-pulse">Motion Exhibit 01</p>
                  <h2 className="text-4xl md:text-9xl font-black tracking-tightest text-white leading-[0.85] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      {featured.title}
                  </h2>
                  <p className="text-white/80 text-base md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto line-clamp-3 md:line-clamp-none drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300">
                      {featured.description}
                  </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-12 right-12 hidden sm:flex items-center gap-6 text-white/30 select-none z-10 font-mono">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Stream</span>
                </div>
                <div className="h-px w-20 bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cinematic Node v2.0</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
