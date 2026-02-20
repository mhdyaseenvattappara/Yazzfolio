
'use client';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { Testimonial } from '@/lib/data';
import { useEffect, useState } from "react";
import { Skeleton } from '../ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star } from 'lucide-react';

export function Testimonials() {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });
  const firestore = useFirestore();
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminId = async () => {
      if (firestore) {
        const adminUsersRef = collection(firestore, 'admin_users');
        const q = query(adminUsersRef, limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setAdminUserId(snapshot.docs[0].id);
        }
      }
    };
    fetchAdminId();
  }, [firestore]);

  const testimonialsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !adminUserId) return null;
    return query(collection(firestore, `admin_users/${adminUserId}/testimonials`), orderBy('createdAt', 'desc'));
  }, [firestore, adminUserId]);

  const { data: testimonialsData, isLoading } = useCollection<Testimonial>(testimonialsCollectionRef);

  return (
    <section id="testimonials" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center bg-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left: Narrative */}
                <div className={cn(
                    "lg:col-span-5 space-y-6 transition-all duration-1000",
                    isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                )}>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Social Proof</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
                        Client <br />Stories
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                        Collaborating with visionary brands and individuals to transform complex ideas into seamless digital experiences.
                    </p>
                </div>

                {/* Right: Carousel */}
                <div className={cn(
                    "lg:col-span-7 transition-all duration-1000 delay-300",
                    isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                )}>
                    {isLoading ? (
                        <div className="flex gap-6">
                            <Skeleton className="h-[400px] w-full rounded-[3rem]" />
                        </div>
                    ) : testimonialsData && testimonialsData.length > 0 ? (
                        <Carousel className="w-full">
                            <CarouselContent className="-ml-4">
                                {testimonialsData.map((testimonial) => (
                                    <CarouselItem key={testimonial.id} className="pl-4 md:basis-full lg:basis-full">
                                        <Card className="p-10 md:p-14 rounded-[3rem] bg-card/50 border-border/50 nav-liquid relative overflow-hidden flex flex-col h-full min-h-[400px]">
                                            <div className="flex gap-1 mb-8">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={cn(
                                                            "w-5 h-5",
                                                            i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"
                                                        )} 
                                                    />
                                                ))}
                                            </div>
                                            
                                            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed italic mb-12 flex-grow">
                                                "{testimonial.quote}"
                                            </blockquote>

                                            <div className="flex items-center gap-4 mt-auto">
                                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10">
                                                    <Image 
                                                        src={testimonial.imageUrl || '/my-photo.jpg'} 
                                                        alt={testimonial.name}
                                                        fill
                                                        className="object-cover grayscale"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg tracking-tight uppercase">{testimonial.name}</p>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{testimonial.title}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="flex justify-start gap-3 mt-8">
                                <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-full border-border/50 bg-background/50 backdrop-blur-sm" />
                                <CarouselNext className="static translate-y-0 h-14 w-14 rounded-full border-border/50 bg-background/50 backdrop-blur-sm" />
                            </div>
                        </Carousel>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground bg-accent/5 rounded-[3rem] border-2 border-dashed border-border/50">
                            Populate the admin dashboard to see client stories.
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>
  );
}
