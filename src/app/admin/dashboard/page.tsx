
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
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'portfolio', label: 'Projects', icon: Briefcase },
  { id: 'testimonials', label: 'Reviews', icon: Star },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'timeline', label: 'Timeline', icon: Milestone },
  { id: 'tool-stack', label: 'Stack', icon: Code },
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
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-muted/40">
      {/* Sidebar - Adaptive: Vertical Dock on Desktop, Bottom Bar on Mobile */}
      <TooltipProvider delayDuration={0}>
        <nav className={cn(
          'z-50 flex transition-all duration-500 ease-in-out',
          // Desktop Styles
          'md:fixed md:left-4 md:top-1/2 md:-translate-y-1/2 md:flex-col md:p-2 md:rounded-full md:border md:bg-card/80 md:shadow-lg md:backdrop-blur-sm',
          // Mobile Styles
          'fixed bottom-4 left-4 right-4 h-16 flex-row items-center justify-around px-4 rounded-3xl border bg-card/90 shadow-2xl backdrop-blur-xl md:h-auto md:w-auto md:bottom-auto md:right-auto',
           isMounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 md:translate-y-0 md:-translate-x-full'
        )}>
          {/* Admin Avatar - Desktop Only */}
          <Link href="/" className="mb-2 hidden md:block transition-transform duration-300 hover:scale-110">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
              <Image src={profileData?.profileImageUrl || "/my-photo.jpg"} alt="Admin" fill className="object-cover" />
            </div>
          </Link>

          <div className="flex flex-row md:flex-col items-center gap-1 w-full justify-around md:justify-center">
            {dashboardTabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-10 h-10 items-center justify-center rounded-full transition-all duration-300 relative',
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground scale-110 shadow-lg' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <tab.icon className="h-5 w-5 flex-shrink-0" />
                    {activeTab === tab.id && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full md:hidden" />
                    )}
                  </button>
                </TooltipTrigger>
                 <TooltipContent side="right" className="hidden md:block">
                  <p>{tab.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          
            <div className="hidden md:block my-2 h-[1px] w-8 bg-border" />
          
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hidden md:flex" asChild>
                         <Link href="/" aria-label="Go to Homepage">
                            <Home className="h-5 w-5" />
                         </Link>
                    </Button>
                </TooltipTrigger>
                 <TooltipContent side="right">Go to Homepage</TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hidden md:flex" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
            <div className="hidden md:flex items-center justify-center h-10 w-10">
                 <ThemeToggle />
            </div>
          </div>
        </nav>
      </TooltipProvider>

      {/* Main Content Area - Locked to Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden md:pl-24">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-sm border-b shrink-0">
            <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-primary/10">
                    <Image src={profileData?.profileImageUrl || "/my-photo.jpg"} alt="Admin" fill className="object-cover" />
                </div>
                <h2 className="text-sm font-black tracking-tight uppercase">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 h-full flex flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-7xl h-full flex flex-col min-h-0">
            {activeTab === 'dashboard' && <DashboardHome profile={profileData} />}
            
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-24 md:pb-0">
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
         <footer className="hidden md:block border-t bg-transparent px-6 py-2 shrink-0">
            <p className="text-center text-[9px] uppercase font-black tracking-widest text-muted-foreground/40">
            &copy; {new Date().getFullYear()} {profileData?.name || 'Admin'}. Secure Studio Node v2.0
            </p>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;
