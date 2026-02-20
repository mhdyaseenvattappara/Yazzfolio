
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
  
  // Mosaic Pattern Logic: Tall, Small, Tall, Small... then flipped
  const getGridSpan = (index: number) => {
    const pattern = [
        "lg:row-span-2", // Col 1 top (Tall)
        "lg:row-span-1", // Col 2 top (Small)
        "lg:row-span-2", // Col 3 top (Tall)
        "lg:row-span-1", // Col 4 top (Small)
        "lg:row-span-1", // Col 1 bot (Small)
        "lg:row-span-2", // Col 2 bot (Tall)
        "lg:row-span-1", // Col 3 bot (Small)
        "lg:row-span-2", // Col 4 bot (Tall)
    ];
    return pattern[index % pattern.length];
  };

  const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial, index: number }) => {
    const isTall = getGridSpan(index).includes('row-span-2');
    const hasImage = !!testimonial.imageUrl && !testimonial.imageUrl.includes('placeholder');

    return (
        <Card className={cn(
            "group relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl transition-all duration-700 hover:-translate-y-2 nav-liquid",
            getGridSpan(index),
            hasImage ? "bg-black" : "bg-card/50 flex items-center justify-center p-8"
        )}>
            {hasImage ? (
                <>
                    {/* Background Image */}
                    <Image 
                        src={testimonial.imageUrl} 
                        alt={testimonial.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    {/* Scrim Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <blockquote className="text-white text-lg font-medium leading-tight mb-4 transform transition-transform duration-500 group-hover:-translate-y-1">
                            "{testimonial.quote}"
                        </blockquote>
                        <div className="space-y-0.5">
                            <p className="font-black text-sm text-white uppercase tracking-tighter">{testimonial.name}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{testimonial.title}</p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center space-y-4">
                    <p className="text-xl font-black italic tracking-tighter opacity-80">"{testimonial.quote.substring(0, 60)}..."</p>
                    <div className="pt-4 border-t border-border/50">
                         <p className="font-black text-xs uppercase tracking-widest">{testimonial.name}</p>
                         <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{testimonial.title}</p>
                    </div>
                </div>
            )}
        </Card>
    );
  };

  return (
    <section id="testimonials" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center bg-background">
        <div className="container mx-auto px-4 md:px-6">
            <div className={cn(
                "max-w-4xl mx-auto text-center mb-20 transition-all duration-1000",
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
                    Selected stories <br />
                    <span className="text-primary italic font-serif">from clients</span>
                </h2>
                <p className="text-muted-foreground text-lg uppercase font-black tracking-[0.3em] opacity-40">The new standard for visual excellence</p>
            </div>

            <div className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[220px] transition-all duration-1000 delay-300",
                isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
            )}>
                {isLoading && Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className={cn("rounded-[2.5rem]", getGridSpan(index))} />
                ))}
                
                {testimonialsData?.map((testimonial, index) => (
                    <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
                ))}

                {!isLoading && (!testimonialsData || testimonialsData.length === 0) && (
                    <div className="col-span-full py-32 text-center text-muted-foreground bg-accent/5 rounded-[3rem] border-2 border-dashed border-border/50">
                        Populate the admin dashboard to see client stories.
                    </div>
                )}
            </div>
        </div>
    </section>
  );
}
