
'use client';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { Service } from '@/lib/data';
import { iconMap } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from "react";
import { Code } from "lucide-react";

export function Services() {
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

    const servicesCollectionRef = useMemoFirebase(() => {
        if (!firestore || !adminUserId) return null;
        return query(collection(firestore, `admin_users/${adminUserId}/services`), orderBy('createdAt', 'asc'));
    }, [firestore, adminUserId]);

    const { data: servicesData, isLoading } = useCollection<Service>(servicesCollectionRef);
    
    return (
        <section id="services" ref={ref} className="py-24 sm:py-32 bg-card/50">
            <div className="container mx-auto px-4 md:px-6">
                <div
                className={cn(
                    'max-w-3xl mx-auto text-center mb-16',
                    isInView ? 'animate-blur-reveal' : 'opacity-0'
                )}
                >
                    <p className="text-muted-foreground font-semibold">My Services</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">What I Can Do For You</h2>
                    <p className="text-muted-foreground text-base md:text-lg">
                        From concept to launch, I provide a range of design services to bring your vision to life.
                    </p>
                </div>
                <div
                className={cn(
                    'grid grid-cols-1 md:grid-cols-2 gap-8 justify-center max-w-4xl mx-auto',
                    isInView ? 'animate-blur-reveal style-[]' : 'opacity-0'
                )}
                style={{animationDelay: '200ms'}}
                >
                {(isLoading || !adminUserId) && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-3xl" />)}
                {servicesData && servicesData.map((service, index) => {
                    const Icon = iconMap[service.icon] || Code;
                    return (
                        <Card
                            key={service.id}
                            className="bg-background/50 border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-300"
                        >
                            <CardHeader className="p-6 flex flex-row items-center gap-4">
                                <div className="h-12 w-12 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                                    <CardDescription>{service.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
                 {!isLoading && servicesData?.length === 0 && (
                    <div className="md:col-span-2 text-center text-muted-foreground">
                        Services not available. Please add them in the admin dashboard.
                    </div>
                 )}
                </div>
            </div>
        </section>
    );
}
