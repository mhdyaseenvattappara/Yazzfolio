
'use client';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { Tool } from '@/lib/data';
import { toolIconMap } from '@/components/tool-icons';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from "react";
import { Code } from "lucide-react";

export function ToolStack() {
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

    const toolsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !adminUserId) return null;
        return query(collection(firestore, `admin_users/${adminUserId}/tools`), orderBy('createdAt', 'asc'));
    }, [firestore, adminUserId]);

    const { data: toolsData, isLoading } = useCollection<Tool>(toolsCollectionRef);
    
    return (
        <section id="tool-stack" ref={ref} className="py-24 sm:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div
                className={cn(
                    'max-w-3xl mx-auto text-center mb-16',
                    isInView ? 'animate-blur-reveal' : 'opacity-0'
                )}
                >
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Tool Stack</h2>
                    <p className="text-muted-foreground text-base md:text-lg">
                        A collection of tools and technologies I use to bring ideas to life.
                    </p>
                </div>
                <div
                className={cn(
                    'flex flex-wrap gap-4 justify-center max-w-4xl mx-auto',
                    isInView ? 'animate-blur-reveal style-[]' : 'opacity-0'
                )}
                style={{animationDelay: '200ms'}}
                >
                {(isLoading || !adminUserId) && Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 w-full rounded-2xl" />)}
                {toolsData && toolsData.map((tool) => {
                    const Icon = toolIconMap[tool.icon] || Code;
                    return (
                        <Card
                            key={tool.id}
                            className="bg-card/50 border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-300 rounded-2xl"
                        >
                            <CardHeader className="p-4 flex flex-row items-center gap-4">
                                <div className="h-8 w-8 flex-shrink-0 text-muted-foreground">
                                    <Icon className="h-full w-full" />
                                </div>
                                <CardTitle className="text-base font-semibold">{tool.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    );
                })}
                 {!isLoading && toolsData?.length === 0 && (
                    <div className="col-span-2 md:col-span-3 text-center text-muted-foreground">
                        Tools not available. Please add them in the admin dashboard.
                    </div>
                 )}
                </div>
            </div>
        </section>
    );
}
