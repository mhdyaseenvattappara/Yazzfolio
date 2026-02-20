
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { PortfolioItem } from '@/lib/data';
import { projectsData as fallbackProjects, projectCategories } from '@/lib/data';
import { ProjectCard } from '@/components/ui/project-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Filter, ChevronDown, LayoutGrid } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { ImagePreview } from '@/components/ui/image-preview';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'likes';

export default function PortfolioPage() {
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const firestore = useFirestore();

  useEffect(() => {
    const fetchAdminId = async () => {
      if (firestore) {
        const adminUsersRef = collection(firestore, 'admin_users');
        const q = query(adminUsersRef, limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setAdminUserId(snapshot.docs[0].id);
        } else {
            setAdminUserId('fallback');
        }
      }
    };
    fetchAdminId();
  }, [firestore]);

  const projectsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !adminUserId || adminUserId === 'fallback') return null;
    return query(collection(firestore, `admin_users/${adminUserId}/portfolio_items`), orderBy('createdAt', 'desc'));
  }, [firestore, adminUserId]);

  const { data: projectsFromDb, isLoading } = useCollection<PortfolioItem>(projectsCollectionRef);

  const displayProjects = useMemo(() => {
    let items = (!isLoading && projectsFromDb && projectsFromDb.length > 0) 
        ? [...projectsFromDb] 
        : [...fallbackProjects] as PortfolioItem[];

    // Filtering
    if (activeCategory !== 'All') {
        items = items.filter(item => item.category === activeCategory);
    }

    // Sorting
    items.sort((a, b) => {
        if (sortBy === 'newest') return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        if (sortBy === 'oldest') return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
        return 0;
    });

    return items;
  }, [projectsFromDb, fallbackProjects, isLoading, activeCategory, sortBy]);

  const handlePreviewClick = (event: React.MouseEvent, project: PortfolioItem) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedProject(project);
  };

  const categories = ['All', ...projectCategories];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 py-12 sm:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-6 py-2 rounded-full border border-primary/10 mb-6">
                <LayoutGrid className="w-3 h-3" />
                Master Catalog
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Visual Archive</h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              A comprehensive showcase of specialized design projects ranging from early prototypes to global launches.
            </p>
          </div>

          {/* Persistent Control Bar - Optimized for Mobile Sticky */}
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 mb-16 bg-card/40 backdrop-blur-2xl border border-border/30 py-3 px-4 sm:px-6 rounded-full sticky top-8 md:top-12 z-30 shadow-2xl transition-all duration-500">
              
              {/* Category Area: Horizontal Scroll on Mobile */}
              <div className="w-full lg:w-auto overflow-x-auto no-scrollbar py-1">
                  <div className="flex flex-nowrap lg:flex-wrap items-center justify-start lg:justify-start gap-2 min-w-max px-2">
                      {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ease-out active:scale-95 whitespace-nowrap border",
                                activeCategory === cat 
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                                    : "bg-background/20 text-foreground/60 border-border/50 hover:text-foreground hover:border-foreground/30 hover:bg-background/40"
                            )}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="rounded-full px-6 h-11 border-border/50 bg-background/20 backdrop-blur-md gap-3 font-black text-[10px] uppercase tracking-widest text-foreground/80 transition-all duration-300 hover:scale-105 hover:bg-background/40 active:scale-95">
                              <Filter className="h-3.5 w-3.5" />
                              SORT: {sortBy}
                              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                          <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                              <DropdownMenuRadioItem value="newest" className="rounded-xl py-3 cursor-pointer">Most Recent</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="oldest" className="rounded-xl py-3 cursor-pointer">Oldest Archive</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="alphabetical" className="rounded-xl py-3 cursor-pointer">Alphabetical (A-Z)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="likes" className="rounded-xl py-3 cursor-pointer">Most Appreciated</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                  </DropdownMenu>

                  <Button asChild variant="ghost" size="icon" className="h-11 w-11 rounded-full border border-border/50 text-foreground/60 hover:text-foreground hover:scale-110 transition-all duration-300 bg-background/20">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                    </Link>
                  </Button>
              </div>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(isLoading && adminUserId !== 'fallback') && Array.from({ length: 9 }).map((_, index) => <Skeleton key={index} className="h-[450px] w-full rounded-[2.5rem]" />)}
            
            {!isLoading && displayProjects.map((project, index) => (
              <ProjectCard 
                key={project.id}
                project={project as PortfolioItem} 
                index={index} 
                onPreview={(e) => handlePreviewClick(e, project as PortfolioItem)}
              />
            ))}
            
            {!isLoading && displayProjects.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground bg-accent/10 py-32 rounded-[3rem] border border-dashed border-border/50">
                <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold">No matches found</p>
                <p className="mt-2">Try selecting a different category or clearing your filters.</p>
                <Button onClick={() => { setActiveCategory('All'); setSortBy('newest'); }} variant="link" className="mt-4">Reset Archive View</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ImagePreview project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
