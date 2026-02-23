'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Video } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Video as VideoIcon, Play, Home, LayoutGrid, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

export default function VideoGalleryPage() {
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

  const videosQuery = useMemoFirebase(() => {
    if (!firestore || !adminUserId) return null;
    return query(
      collection(firestore, `admin_users/${adminUserId}/videos`),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, adminUserId]);

  const { data: videos, isLoading } = useCollection<Video>(videosQuery);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 py-12 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-6 py-2 rounded-full border border-primary/10 mb-6">
                <VideoIcon className="w-3 h-3" />
                Motion Reels
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Visual Artifacts</h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              A comprehensive archive of motion graphics, promotional content, and creative direction in cinema and web.
            </p>
          </div>

          {/* Video Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-[2.5rem]" />
              ))
            ) : videos && videos.length > 0 ? (
              videos.map((video) => (
                <div key={video.id} className="group relative aspect-video rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl bg-[#111]">
                    {video.thumbnailUrl && (
                        <Image 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            fill 
                            className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">{video.title}</h3>
                            <p className="text-white/60 text-sm line-clamp-2 max-w-md font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                {video.description}
                            </p>
                            <div className="pt-4">
                                <Button asChild size="sm" className="rounded-full bg-white text-black hover:bg-white/90 font-black h-10 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                                        <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                                        Launch Reel
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 py-32 text-center text-muted-foreground bg-accent/10 rounded-[3rem] border-2 border-dashed border-border/50">
                <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold">The motion archive is currently empty.</p>
                <p className="mt-2">Check back later for new reels and motion projects.</p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-center gap-4">
              <Button asChild variant="outline" className="h-14 px-8 rounded-full border-border/50 font-bold gap-3 hover:bg-card">
                  <Link href="/portfolio">
                      <LayoutGrid className="h-5 w-5" />
                      Static Projects
                  </Link>
              </Button>
              <Button asChild variant="ghost" className="h-14 px-8 rounded-full font-bold gap-3">
                  <Link href="/">
                      <Home className="h-5 w-5" />
                      Back Home
                  </Link>
              </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
