'use client';
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { Testimonial } from '@/lib/data';
import { useEffect, useState } from "react";
import { Skeleton } from '../ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Quote } from 'lucide-react';

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
    <section id="testimonials" ref={ref} className="py-20 sm:py-24 md:py-0 md:min-h-screen md:flex md:items-center bg-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
                
                {/* Left: Narrative (Top Aligned) */}
                <div className={cn(
                    "lg:col-span-4 flex flex-col items-start text-left space-y-6 transition-all duration-1000",
                    isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                )}>
                    <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 w-fit">
                            Endorsements
                        </p>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                            Client <br /> Stories
                        </h2>
                    </div>
                    <div className="w-16 h-1 bg-primary/20 rounded-full" />
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-xs font-medium opacity-80">
                        Crafting digital excellence through meaningful partnerships and visionary design thinking.
                    </p>
                </div>

                {/* Right: Carousel */}
                <div className={cn(
                    "lg:col-span-8 transition-all duration-1000 delay-300",
                    isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                )}>
                    {isLoading ? (
                        <Skeleton className="h-[350px] w-full rounded-[2.5rem]" />
                    ) : testimonialsData && testimonialsData.length > 0 ? (
                        <Carousel className="w-full">
                            <CarouselContent className="-ml-4">
                                {testimonialsData.map((testimonial) => (
                                    <CarouselItem key={testimonial.id} className="pl-4 md:basis-full lg:basis-full">
                                        <Card className="p-8 md:p-12 rounded-[2.5rem] bg-card/40 border-border/40 nav-liquid relative overflow-hidden flex flex-col h-full min-h-[350px] shadow-2xl">
                                            {/* Stylistic Quote Mark */}
                                            <Quote className="absolute top-8 right-8 w-16 h-16 text-primary/5 -rotate-12 pointer-events-none" />
                                            
                                            <div className="flex gap-1 mb-8 relative z-10">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={cn(
                                                            "w-3.5 h-3.5",
                                                            i < testimonial.rating ? "text-primary fill-primary" : "text-primary/10"
                                                        )} 
                                                    />
                                                ))}
                                            </div>
                                            
                                            <blockquote className="text-xl md:text-2xl font-medium leading-tight tracking-tight italic mb-10 flex-grow relative z-10 text-foreground/90">
                                                “{testimonial.quote}”
                                            </blockquote>

                                            <div className="flex items-center gap-4 mt-auto relative z-10">
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary/10 shadow-lg">
                                                    <Image 
                                                        src={testimonial.imageUrl || '/my-photo.jpg'} 
                                                        alt={testimonial.name}
                                                        fill
                                                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                                    />
                                                </div>
                                                <div className="space-y-0">
                                                    <p className="font-black text-lg tracking-tighter uppercase">{testimonial.name}</p>
                                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">{testimonial.title}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="flex justify-center gap-4 mt-8">
                                <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-full border-border/50 bg-card/50 backdrop-blur-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-xl" />
                                <CarouselNext className="static translate-y-0 h-12 w-12 rounded-full border-border/50 bg-card/50 backdrop-blur-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-xl" />
                            </div>
                        </Carousel>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground bg-accent/5 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4">
                            <Quote className="w-10 h-10 opacity-10" />
                            <p className="font-bold tracking-tight">Your client success stories will appear here.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    </section>
  );
}
