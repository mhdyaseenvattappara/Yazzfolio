'use client';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { Tool } from '@/lib/data';
import { toolIconMap } from '@/components/tool-icons';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from "react";
import { Code } from "lucide-react";
import Image from 'next/image';

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
        <section id="tool-stack" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center">
            <div className="container mx-auto px-4 md:px-6">
                <div
                className={cn(
                    'max-w-3xl mx-auto text-center mb-16',
                    isInView ? 'animate-blur-reveal' : 'opacity-0'
                )}
                >
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">My Arsenal</p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Software Stack</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                        A curated collection of specialized tools and technologies I use to bring complex creative visions to life.
                    </p>
                </div>
                <div
                className={cn(
                    'flex flex-wrap gap-4 justify-center max-w-5xl mx-auto transition-all duration-1000 delay-300',
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                >
                {(isLoading || !adminUserId) && Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-20 w-48 rounded-2xl" />)}
                {toolsData && toolsData.map((tool) => {
                    const isCustom = tool.icon.startsWith('http') || tool.icon.startsWith('data:');
                    const Icon = !isCustom ? (toolIconMap[tool.icon] || Code) : null;
                    
                    return (
                        <Card
                            key={tool.id}
                            className="bg-card/50 border-border/50 hover:border-primary/20 hover:bg-accent/50 transition-all duration-500 rounded-2xl group cursor-default nav-liquid"
                        >
                            <CardHeader className="p-5 flex flex-row items-center gap-4 relative z-10">
                                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                                    {isCustom ? (
                                        <Image 
                                            src={tool.icon} 
                                            alt={tool.name} 
                                            fill 
                                            className="object-contain transition-transform duration-500 group-hover:scale-110" 
                                        />
                                    ) : Icon ? (
                                        <Icon className="h-full w-full text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                                    ) : null}
                                </div>
                                <CardTitle className="text-base font-black tracking-tight group-hover:text-foreground transition-colors">{tool.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    );
                })}
                 {!isLoading && toolsData?.length === 0 && (
                    <div className="w-full text-center text-muted-foreground py-20 border-2 border-dashed rounded-[2.5rem]">
                        Tools not available. Connect with the admin node to populate the stack.
                    </div>
                 )}
                </div>
            </div>
        </section>
    );
}