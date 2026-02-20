'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ProjectCard } from '../ui/project-card';
import type { PortfolioItem } from '@/lib/data';
import { projectsData as fallbackProjects, projectCategories } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { MoveRight, Filter, ChevronDown } from 'lucide-react';
import { ImagePreview } from '../ui/image-preview';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOption = 'newest' | 'likes' | 'alphabetical';

export function Projects() {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });
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
        if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        return 0;
    });

    return items.slice(0, 6);
  }, [projectsFromDb, fallbackProjects, isLoading, activeCategory, sortBy]);

  const handlePreviewClick = (event: React.MouseEvent, project: PortfolioItem) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedProject(project);
  };

  const categories = ['All', ...projectCategories];

  return (
    <>
      <section id="projects" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className={cn(
              'max-w-3xl text-left mb-16',
              isInView ? 'animate-blur-reveal' : 'opacity-0'
            )}
          >
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Curated Portfolio</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Selected Works</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
              Explore a collection of high-impact designs categorized by industry and impact.
            </p>
          </div>

          {/* Left-Aligned Control Bar */}
          <div className={cn(
              "max-w-fit flex flex-col items-start gap-4 mb-20 bg-card/80 backdrop-blur-3xl border border-white/10 p-6 rounded-[3rem] sticky top-24 md:top-12 lg:relative z-30 shadow-2xl transition-all duration-700",
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
              {/* Row 1: Categories */}
              <div className="w-full overflow-x-auto no-scrollbar py-1">
                  <div className="flex flex-nowrap items-center justify-start gap-2 min-w-max px-2">
                      {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ease-out active:scale-95 whitespace-nowrap border",
                                activeCategory === cat 
                                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-105" 
                                    : "bg-white/5 text-foreground/60 border-white/5 hover:text-foreground hover:border-white/20 hover:bg-white/10"
                            )}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Row 2: Sort */}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="rounded-full px-8 h-12 border-white/10 bg-white/5 backdrop-blur-md gap-4 font-black text-[10px] uppercase tracking-widest text-foreground transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95 shadow-lg shrink-0">
                          <Filter className="h-4 w-4" />
                          SORT: {sortBy}
                          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                      <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                          <DropdownMenuRadioItem value="newest" className="rounded-xl py-3 cursor-pointer">Latest Releases</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="likes" className="rounded-xl py-3 cursor-pointer">Most Appreciated</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="alphabetical" className="rounded-xl py-3 cursor-pointer">Alphabetical (A-Z)</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>

          <div className={cn("max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ease-out delay-300", isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
            {isLoading && Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[450px] w-full rounded-[2.5rem]" />)}
            
            {!isLoading && displayProjects.map((project, index) => (
                <ProjectCard 
                  key={project.id}
                  project={project as PortfolioItem} 
                  index={index} 
                  onPreview={(e) => handlePreviewClick(e, project as PortfolioItem)}
                />
            ))}
            
            {!isLoading && displayProjects.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-left text-muted-foreground bg-accent/10 p-20 rounded-[2.5rem] border border-dashed border-border/50">
                  No projects found in the "{activeCategory}" category.
              </div>
            )}
          </div>

          <div className="mt-20 text-left">
              <Button asChild size="lg" variant="outline" className="group text-lg py-8 px-12 rounded-full border-border/50 hover:bg-card transition-all text-foreground/80 hover:text-foreground">
                  <Link href="/portfolio">
                      Enter Full Gallery <MoveRight className="transition-transform group-hover:translate-x-2 ml-3 w-5 h-5"/>
                  </Link>
              </Button>
          </div>
        </div>
      </section>
      <ImagePreview project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
