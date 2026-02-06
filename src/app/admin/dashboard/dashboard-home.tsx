
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { PortfolioItem, Testimonial, Service, ContactMessage } from '@/lib/data';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Star, Sparkles, MessagesSquare, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentMessagesChart } from './recent-messages-chart';
import { ContentBreakdownChart } from './content-breakdown-chart';
import { ComedyTip } from './comedy-tip';

const StatCard = ({ title, value, icon: Icon, isLoading, description, colorClass }: { title: string, value: number | string, icon: React.ElementType, isLoading: boolean, description?: string, colorClass?: string }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md border-border/50 shrink-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
            <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</CardTitle>
            <div className={`p-1.5 rounded-lg bg-muted/50`}>
                <Icon className={`h-3.5 w-3.5 ${colorClass || 'text-muted-foreground'}`} />
            </div>
        </CardHeader>
        <CardContent className="pb-3">
            {isLoading ? (
                <Skeleton className="h-6 w-12" />
            ) : (
                <>
                    <div className="text-xl md:text-2xl font-black tracking-tight leading-none">{value}</div>
                    {description && <p className="text-[8px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">{description}</p>}
                </>
            )}
        </CardContent>
    </Card>
);

export function DashboardHome({ profile }: { profile: { name?: string | null } | null }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const portfolioCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `admin_users/${user.uid}/portfolio_items`);
    }, [firestore, user]);
    const { data: portfolioItems, isLoading: isLoadingPortfolio } = useCollection<PortfolioItem>(portfolioCollectionRef);

    const testimonialsCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `admin_users/${user.uid}/testimonials`);
    }, [firestore, user]);
    const { data: testimonials, isLoading: isLoadingTestimonials } = useCollection<Testimonial>(testimonialsCollectionRef);
    
    const servicesCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `admin_users/${user.uid}/services`);
    }, [firestore, user]);
    const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesCollectionRef);

    const messagesCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `admin_users/${user.uid}/contact_messages`));
      }, [firestore, user]);
    const { data: messages, isLoading: isLoadingMessages } = useCollection<ContactMessage>(messagesCollectionRef);

    const unreadCount = messages?.filter(m => !m.isRead).length || 0;
    const totalLikes = portfolioItems?.reduce((acc, item) => acc + (item.likes || 0), 0) || 0;
    
    const isLoading = isLoadingPortfolio || isLoadingTestimonials || isLoadingServices || isLoadingMessages;

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-0 overflow-y-auto no-scrollbar relative pb-20">
            <ComedyTip />
            
            <div className="flex flex-col gap-1 shrink-0">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Welcome back, {profile?.name?.split(' ')[0] || 'Admin'}!</h1>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">Site activity overview for today.</p>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 shrink-0">
                <StatCard 
                    title="Inbox" 
                    value={unreadCount} 
                    icon={MessagesSquare} 
                    isLoading={isLoading} 
                    description={`${unreadCount} unread`}
                    colorClass="text-blue-500"
                />
                <StatCard 
                    title="Likes" 
                    value={totalLikes} 
                    icon={Heart} 
                    isLoading={isLoading} 
                    colorClass="text-red-500 fill-red-500/20"
                    description="Total appreciations"
                />
                <StatCard title="Projects" value={portfolioItems?.length ?? 0} icon={Briefcase} isLoading={isLoading} description="Live works" />
                <StatCard title="Reviews" value={testimonials?.length ?? 0} icon={Star} isLoading={isLoading} description="Client feedback" />
                <StatCard title="Services" value={services?.length ?? 0} icon={Sparkles} isLoading={isLoading} description="Offered skills" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
                <Card className="lg:col-span-4 border-border/50 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
                    <CardHeader className="py-4 px-6 shrink-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">Engagement Activity</CardTitle>
                        <CardDescription className="text-[10px]">Weekly message frequency.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 flex-1 pb-4 min-h-0">
                        <RecentMessagesChart messages={messages} isLoading={isLoading} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3 border-border/50 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
                    <CardHeader className="py-4 px-6 shrink-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">Content Distribution</CardTitle>
                        <CardDescription className="text-[10px]">Creative portfolio split.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center pb-4 min-h-0">
                        <ContentBreakdownChart
                            portfolioItems={portfolioItems}
                            testimonials={testimonials}
                            services={services}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
