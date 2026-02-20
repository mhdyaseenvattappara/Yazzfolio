
'use client';
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { Testimonial } from '@/lib/data';
import { useEffect, useState, useRef } from "react";
import { Skeleton } from '../ui/skeleton';
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function Testimonials() {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });
  const firestore = useFirestore();
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

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
  
  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="h-full rounded-[3rem] flex flex-col p-8 sm:p-10 bg-[#0f1115] border-white/5 hover:border-primary/20 transition-all duration-700 group select-none cursor-grab active:cursor-grabbing relative overflow-hidden nav-liquid shadow-2xl">
        {/* Top: Stars */}
        <div className="flex items-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
                <Star
                key={i}
                className={cn(
                    "h-4 w-4 transition-all duration-500",
                    i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"
                )}
                />
            ))}
        </div>

        {/* Middle: Quote */}
        <div className="flex-grow">
            <blockquote className="text-white/90 text-lg sm:text-xl font-medium leading-relaxed tracking-tight">
                "{testimonial.quote}"
            </blockquote>
        </div>

        {/* Bottom: Identity */}
        <div className="flex items-center gap-4 mt-10 pt-8 border-t border-white/5">
            <div className="relative h-12 w-12 flex-shrink-0">
                <Image 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name}
                    fill
                    className="object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700 ring-2 ring-white/5"
                />
            </div>
            <div className="text-left">
                <p className="font-black text-base text-white tracking-tight leading-none mb-1">
                    {testimonial.name}
                </p>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                    {testimonial.title}
                </p>
            </div>
        </div>
    </Card>
  );

  return (
    <section id="testimonials" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center bg-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                
                {/* Left Side: Brand Narrative */}
                <div className={cn(
                    "lg:col-span-4 space-y-6 lg:space-y-8 text-center lg:text-left transition-all duration-1000",
                    isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                )}>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Social Proof</p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
                            Client Stories
                        </h2>
                    </div>
                    <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
                        Collaborating with industry leaders to turn visionary ideas into reality.
                    </p>
                    
                    {/* Navigation Buttons for Desktop */}
                    <div className="hidden lg:flex items-center gap-3 pt-4">
                        <div className="flex items-center gap-2">
                            {/* These are placeholders to show intent, the actual CarouselNext/Prev will be used inside the carousel */}
                        </div>
                    </div>
                </div>

                {/* Right Side: Carousel of Stories */}
                <div className={cn(
                    "lg:col-span-8 w-full transition-all duration-1000 delay-300",
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}>
                    {isLoading && (
                        <div className="flex gap-6 overflow-hidden">
                            {Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="w-[400px] h-[450px] rounded-[3rem] shrink-0" />)}
                        </div>
                    )}
                    
                    {testimonialsData && testimonialsData.length > 0 && (
                        <Carousel
                            plugins={[plugin.current]}
                            onMouseEnter={plugin.current.stop}
                            onMouseLeave={plugin.current.reset}
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full overflow-visible"
                        >
                            <CarouselContent className="-ml-6">
                                {testimonialsData.map((testimonial) => (
                                    <CarouselItem key={testimonial.id} className="pl-6 md:basis-1/2 lg:basis-1/2 xl:basis-1/2">
                                        <TestimonialCard testimonial={testimonial} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            
                            {/* Subtle Navigation Overlay */}
                            <div className="absolute -bottom-16 left-0 flex gap-2 lg:hidden w-full justify-center">
                                <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-full border-white/10 bg-white/5" />
                                <CarouselNext className="static translate-y-0 h-12 w-12 rounded-full border-white/10 bg-white/5" />
                            </div>
                            
                            <div className="hidden lg:block">
                                <CarouselPrevious className="-left-12 h-12 w-12 rounded-full border-white/10 bg-background/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CarouselNext className="-right-12 h-12 w-12 rounded-full border-white/10 bg-background/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Carousel>
                    )}

                    {!isLoading && (!testimonialsData || testimonialsData.length === 0) && (
                        <div className="text-center text-muted-foreground bg-accent/5 p-20 rounded-[3rem] border border-dashed border-white/10">
                            No stories yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>
  );
}
