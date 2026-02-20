
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
import { Star, Quote } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function Testimonials() {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });
  const firestore = useFirestore();
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  
  // Configure autoplay for smooth transitions
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
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
    <Card className="h-full rounded-[2.5rem] flex flex-col justify-between p-10 bg-card/50 border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all duration-500 group select-none cursor-grab active:cursor-grabbing relative overflow-hidden">
        <Quote className="absolute top-8 right-10 w-12 h-12 text-primary/5 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        
        <div>
            <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                    <Star
                    key={i}
                    className={cn(
                        "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                    )}
                    />
                ))}
            </div>
            <blockquote className="text-foreground text-lg md:text-xl leading-relaxed mb-10 font-medium">
                "{testimonial.quote}"
            </blockquote>
        </div>

        <div className="flex items-center gap-4 mt-auto">
            <div className="relative h-14 w-14 flex-shrink-0">
                <Image 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name}
                    fill
                    className="object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-primary/20 ring-4 ring-background shadow-lg"
                />
            </div>
            <div className="text-left">
                <p className="font-black text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {testimonial.name}
                </p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                    {testimonial.title}
                </p>
            </div>
        </div>
    </Card>
  );

  return (
    <section id="testimonials" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center bg-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
             <div
                className={cn(
                    'max-w-3xl mx-auto text-center mb-20',
                    isInView ? 'animate-blur-reveal' : 'opacity-0'
                )}
                >
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Social Proof</p>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Client Stories</h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Collaborating with industry leaders to turn visionary ideas into reality.
                </p>
            </div>
        </div>

        <div className={cn("container mx-auto px-4 md:px-6 transition-all duration-1000 delay-300", isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
            {isLoading && (
                <div className="flex justify-center gap-6">
                    {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="w-full h-[400px] rounded-[2.5rem]" />)}
                </div>
            )}
            
            {testimonialsData && testimonialsData.length > 0 && (
              <div className="relative max-w-7xl mx-auto">
                <Carousel
                  plugins={[plugin.current]}
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                  opts={{
                    align: "start",
                    loop: true,
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-6">
                    {testimonialsData.map((testimonial) => (
                      <CarouselItem key={testimonial.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                        <TestimonialCard testimonial={testimonial} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="hidden xl:flex">
                    <CarouselPrevious className="-left-20 h-14 w-14 bg-background border-border shadow-xl hover:bg-primary hover:text-primary-foreground transition-all" />
                    <CarouselNext className="-right-20 h-14 w-14 bg-background border-border shadow-xl hover:bg-primary hover:text-primary-foreground transition-all" />
                  </div>
                </Carousel>
              </div>
            )}

            {!isLoading && (!testimonialsData || testimonialsData.length === 0) && (
                <div className="text-center text-muted-foreground bg-accent/10 p-20 rounded-[2.5rem] border border-dashed border-border/50">
                    No testimonials yet. Connect with the admin to share your experience.
                </div>
            )}
        </div>
    </section>
  );
}
