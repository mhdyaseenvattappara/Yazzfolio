
'use client';

import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { TimelineEvent } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';


export function Timeline() {
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

  const timelineCollectionRef = useMemoFirebase(() => {
    if (!firestore || !adminUserId) return null;
    return query(collection(firestore, `admin_users/${adminUserId}/timeline_events`), orderBy('year', 'asc'));
  }, [firestore, adminUserId]);

  const { data: timelineData, isLoading } = useCollection<TimelineEvent>(timelineCollectionRef);

  return (
    <section id="timeline" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center bg-card/50">
      <div className="container mx-auto px-4 md:px-6">
        <div
          className={cn(
            'transition-all duration-1000 ease-out',
            isInView ? 'animate-blur-reveal' : 'opacity-0'
          )}
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">My Journey</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter">Career Milestones</h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Main Axis Line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 h-full w-0.5 bg-border" aria-hidden="true" />
            
            {(isLoading || !adminUserId) && Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="relative flex items-start mb-12 md:mb-16">
                    <Skeleton className="w-full h-20 md:h-24 rounded-2xl" />
                </div>
            ))}

            {timelineData && timelineData.map((item, index) => (
              <div key={item.id} className={cn(
                  "relative flex items-center mb-12 md:mb-20"
              )}>
                {/* Content Container */}
                <div className={cn(
                    "w-full pl-12 md:pl-0 md:w-1/2 flex flex-col",
                    index % 2 === 0 ? 'md:text-right md:pr-16 md:items-end' : 'md:text-left md:pl-16 md:ml-auto md:items-start'
                )}>
                  <span className="inline-block px-4 py-1 rounded-full bg-primary/5 text-primary text-sm font-black tracking-widest uppercase mb-3 md:mb-4 border border-primary/10">
                    {item.year}
                  </span>
                  <p className="text-foreground font-bold text-lg md:text-xl leading-snug">{item.event}</p>
                </div>

                {/* Status Node */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center ring-8 ring-card shadow-xl z-10">
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>
            ))}
            
            {!isLoading && timelineData?.length === 0 && (
                <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-3xl">
                    Timeline not available. Please add events in the admin dashboard.
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
