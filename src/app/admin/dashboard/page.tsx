
'use client';

import { useUser, useAuth, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Home, FileText, LayoutDashboard, Inbox, Briefcase, Star, Sparkles, Milestone, Code, User as UserIcon } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { PortfolioManager } from './portfolio-manager';
import { TestimonialsManager } from './testimonials-manager';
import { ServicesManager } from './services-manager';
import { TimelineManager } from './timeline-manager';
import { ProfileManager } from './profile-manager';
import { InboxManager } from './inbox-manager';
import { ToolStackManager } from './tool-stack-manager';
import { InvoiceManager } from './invoice-manager';
import type { AdminProfile } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DashboardHome } from './dashboard-home';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const dashboardTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'testimonials', label: 'Testimonials', icon: Star },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'timeline', label: 'Timeline', icon: Milestone },
  { id: 'tool-stack', label: 'Tool Stack', icon: Code },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/admin/login');
  };

  const profileDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `admin_users/${user.uid}`);
  }, [firestore, user]);

  const { data: profileData } = useDoc<AdminProfile>(profileDocRef);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/40">
      {/* Sidebar */}
      <TooltipProvider delayDuration={0}>
        <nav className={cn(
          'group fixed left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center justify-center p-2 transition-all duration-300 ease-in-out',
          'bg-card/80 shadow-lg border backdrop-blur-sm rounded-full',
           isMounted ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex flex-col items-center gap-1">
            <Link href="/" className="mb-2 transition-transform duration-300 group-hover:scale-110">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image src={profileData?.profileImageUrl || "/my-photo.jpg"} alt="Admin" fill className="object-cover" />
              </div>
            </Link>

            {dashboardTabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-10 h-10 items-center justify-center gap-4 rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                      activeTab === tab.id && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <tab.icon className="h-5 w-5 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                 <TooltipContent side="right">
                  <p>{tab.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          
            <div className="my-2 h-[1px] w-8 bg-border" />
          
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-10 h-10" asChild>
                         <Link href="/" aria-label="Go to Homepage">
                            <Home className="h-5 w-5" />
                         </Link>
                    </Button>
                </TooltipTrigger>
                 <TooltipContent side="right">Go to Homepage</TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-10 h-10" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
            <div className="flex items-center justify-center h-10 w-10">
                 <ThemeToggle />
            </div>
          </div>
        </nav>
      </TooltipProvider>

      {/* Main Content Area - Locked to Viewport */}
      <div className="flex-1 flex flex-col pl-24 h-screen overflow-hidden">
        <main className="flex-1 p-4 md:p-6 lg:p-8 h-full flex flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-7xl h-full flex flex-col min-h-0">
            {activeTab === 'dashboard' && <DashboardHome profile={profileData} />}
            
            {/* Scrollable containers for manager tabs only */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                {activeTab === 'inbox' && <InboxManager />}
                {activeTab === 'invoices' && <InvoiceManager />}
                {activeTab === 'portfolio' && <PortfolioManager />}
                {activeTab === 'testimonials' && <TestimonialsManager />}
                {activeTab === 'services' && <ServicesManager />}
                {activeTab === 'timeline' && <TimelineManager />}
                {activeTab === 'tool-stack' && <ToolStackManager />}
                {activeTab === 'profile' && <ProfileManager profile={profileData} />}
            </div>
          </div>
        </main>
         <footer className="border-t bg-transparent px-6 py-2 shrink-0">
            <p className="text-center text-[9px] uppercase font-black tracking-widest text-muted-foreground/40">
            &copy; {new Date().getFullYear()} {profileData?.name || 'Admin'}. Secure Studio Node v2.0
            </p>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;
