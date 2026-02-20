
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
    <section id="testimonials" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center bg-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                
                {/* Left: Carousel (Larger col-span for impact) */}
                <div className={cn(
                    "lg:col-span-7 order-2 lg:order-1 transition-all duration-1000 delay-300",
                    isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                )}>
                    {isLoading ? (
                        <Skeleton className="h-[450px] w-full rounded-[3.5rem]" />
                    ) : testimonialsData && testimonialsData.length > 0 ? (
                        <Carousel className="w-full">
                            <CarouselContent className="-ml-4">
                                {testimonialsData.map((testimonial) => (
                                    <CarouselItem key={testimonial.id} className="pl-4">
                                        <Card className="p-10 md:p-16 rounded-[3.5rem] bg-card/40 border-border/40 nav-liquid relative overflow-hidden flex flex-col h-full min-h-[420px] shadow-2xl">
                                            {/* Stylistic Quote Mark */}
                                            <Quote className="absolute top-10 right-10 w-24 h-24 text-primary/5 -rotate-12 pointer-events-none" />
                                            
                                            <div className="flex gap-1.5 mb-10 relative z-10">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={cn(
                                                            "w-4 h-4",
                                                            i < testimonial.rating ? "text-primary fill-primary" : "text-primary/10"
                                                        )} 
                                                    />
                                                ))}
                                            </div>
                                            
                                            <blockquote className="text-2xl md:text-3xl font-medium leading-tight tracking-tight italic mb-12 flex-grow relative z-10 text-foreground/90">
                                                “{testimonial.quote}”
                                            </blockquote>

                                            <div className="flex items-center gap-5 mt-auto relative z-10">
                                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/5 shadow-lg">
                                                    <Image 
                                                        src={testimonial.imageUrl || '/my-photo.jpg'} 
                                                        alt={testimonial.name}
                                                        fill
                                                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                                    />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-xl tracking-tighter uppercase">{testimonial.name}</p>
                                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">{testimonial.title}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="flex justify-start gap-4 mt-10">
                                <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-full border-border/50 bg-card/50 backdrop-blur-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-xl" />
                                <CarouselNext className="static translate-y-0 h-14 w-14 rounded-full border-border/50 bg-card/50 backdrop-blur-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-xl" />
                            </div>
                        </Carousel>
                    ) : (
                        <div className="py-24 text-center text-muted-foreground bg-accent/5 rounded-[3.5rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4">
                            <Quote className="w-12 h-12 opacity-10" />
                            <p className="font-bold tracking-tight">Your client success stories will appear here.</p>
                        </div>
                    )}
                </div>

                {/* Right: Narrative (Editorial Right Align) */}
                <div className={cn(
                    "lg:col-span-5 order-1 lg:order-2 flex flex-col items-end text-right space-y-8 transition-all duration-1000",
                    isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                )}>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 w-fit ml-auto">
                            Endorsements
                        </p>
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                            Client <br /> Stories
                        </h2>
                    </div>
                    <div className="w-24 h-1 bg-primary/20 rounded-full ml-auto" />
                    <p className="text-muted-foreground text-xl leading-relaxed max-w-sm font-medium">
                        Crafting digital excellence through meaningful partnerships and visionary design thinking.
                    </p>
                </div>

            </div>
        </div>
    </section>
  );
}
